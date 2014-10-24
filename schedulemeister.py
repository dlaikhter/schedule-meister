import os, urllib, webapp2, jinja2, json
from models import UnivClass

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def class_to_json(course):
	return {"subj_code":course.subj_code,
                "CRN":crn,
                "course_no":course.course_no,
                "class_type":course.class_type,
                "sec":course.sec,
                "title":course.title,
                "days":course.days,
                "time":course.time,
                "instructor":course.instructor,
                "term":course.term}

def query_classes(fetch_request):
	query_by = fetch_request["by"]
	
	if query_by == "crn":
		course = UnivClass.get_by_key_name(str(fetch_request["crn"]))
		course = class_to_json(course)
		return json.dumps(course)
	else:
		courses_json_list = []
		courses = UnivClass.gql("SELECT * FROM title WHERE term IN :term", term=quarter)
	
		for course in courses:	
			course_json = class_to_json(course)
			courses_json_list.append(course_json)

		return json.dumps([dict(mpn=pn) for pn in courses_json_list])

class MainPage(webapp2.RequestHandler):
    def get(self):
	if self.request.get('fetch_request'):
		request = self.request.get('fetch_request')
		self.response.out.write(query_classes(crn))
	else:
		template = JINJA_ENVIRONMENT.get_template('index.html')
		self.response.write(template.render())

application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)

