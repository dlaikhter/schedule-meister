from google.appengine.ext import db

class UnivClass(db.Model):
        term = db.StringProperty()
        subj_code = db.StringProperty()
        course_no = db.StringProperty()
        class_type = db.StringProperty()
        sec = db.StringProperty()
        title = db.listproperty(str)
        days = db.listproperty(str)
        time = db.listproperty(str)
        instructor = db.StringProperty()
