import sys
import os
import webapp2
import jinja2
import json
sys.path.insert(0, 'models')
from univclass import UnivClass
sys.path.insert(0, 'py_files')
from utilities_meister import get_term_select, get_classes


def class_to_json(course):
    return {"subj_code": course.subj_code,
            "CRN": course.key.id(),
            "course_no": course.course_no,
            "class_type": course.class_type,
            "sec": course.sec,
            "title": course.title,
            "day_times": json.loads(course.day_times),
            "instructor": course.instructor,
            "term": course.term}


def query_classes(fetch_request):
    if "crn" in fetch_request:
        course = UnivClass.get_by_id(fetch_request["crn"])
        course_json = class_to_json(course)
        return json.dumps(course_json)

    elif "title" in fetch_request:
        courses_json_list = []
        title_parts = fetch_request('title').split()
        gql_string = "SELECT * FROM title WHERE term={term}".format(term=fetch_request['term'])
        for title in title_parts:
            gql_string += ' AND title={title}'.format(title=title)
        courses = UnivClass.gql(gql_string)

        for course in courses:
            course_json = class_to_json(course)
            courses_json_list.append(course_json)

        return json.dumps([dict(mpn=pn) for pn in courses_json_list])

    elif 'subject' in fetch_request or 'subject_number' in fetch_request:
        courses_json_list = []
        gql_string = "SELECT * FROM title WHERE term={term}".format(term=fetch_request('term'))
        if 'subject' in fetch_request:
            gql_string = gql_string + ' AND {subj_code}'.format(subj_code=fetch_request['subject'])
        if 'subject_number' in fetch_request:
            gql_string = gql_string + ' AND {subj_num}'.format(subj_code=fetch_request['subject_number'])

        courses = UnivClass.gql(gql_string)

        for course in courses:
            course_json = class_to_json(course)
            courses_json_list.append(course_json)

        return json.dumps([dict(mpn=pn) for pn in courses_json_list])


class MainPage(webapp2.RequestHandler):
    def get(self):
        jinja_environment = self.jinja_environment
        template = jinja_environment.get_template('/index.html')
        self.response.write(template.render())

    @property
    def jinja_environment(self):
        jinja_environment = jinja2.Environment(
            loader=jinja2.FileSystemLoader(
                os.path.join(os.path.dirname(__file__),
                             '../views'
        )))
        return jinja_environment


#deprecated
class Fetcher(webapp2.RequestHandler):
    def post(self):
        req = self.request.POST.items()
        req_dict = dict(req)
        self.response.out.write(query_classes(req_dict))


class ClassQuery(webapp2.RequestHandler):
    def post(self):
        req = self.request.POST.items()
        req_dict = dict(req)
        self.response.out.write(json.dumps(get_classes(req_dict)))


class TermGetter(webapp2.RequestHandler):
    def get(self):
        self.response.out.write(json.dumps(get_term_select()))
