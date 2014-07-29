import os, urllib, webapp2, jinja2, json
from google.appengine.ext import db
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

class UnivClass(db.Model):
	created = db.DateTimeProperty(auto_now_add=True)
	subj_code = db.StringProperty()
	course_no = db.StringProperty()
	class_type = db.StringProperty()
	method = db.StringProperty()
	sec = db.StringProperty()
	title = db.StringProperty()
	days = db.StringProperty()
	time = db.StringProperty()
	instructor = db.StringProperty()

def fetch_class(crn):
	course = UnivClass.get_by_key_name(str(crn))
	returned_json = {"subj_code":course.subj_code, "CRN":crn,
			"course_no":course.course_no, "class_type":course.class_type,
			"method":course.method, "sec":course.sec, "title":course.title,
			"days":course.days, "time":course.time, "instructor":course.instructor}
	return json.dumps(returned_json)

class MainPage(webapp2.RequestHandler):

    def get(self):
	if self.request.get('id'):
		crn = self.request.get('id')
		self.response.out.write(fetch_class(crn))
	else:
		template = JINJA_ENVIRONMENT.get_template('index.html')
		self.response.write(template.render())

application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)

