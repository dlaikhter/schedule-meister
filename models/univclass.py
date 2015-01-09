from google.appengine.ext import db

class UnivClass(db.Model):
        term = db.StringProperty()
        subj_code = db.StringProperty()
        course_no = db.StringProperty()
        class_type = db.StringProperty()
        sec = db.StringProperty()
        title = db.ListProperty(str)
        day_times = db.StringProperty(str)
        instructor = db.StringProperty()
