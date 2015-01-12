from google.appengine.ext import ndb


class UnivClass(ndb.Model):
        term = ndb.StringProperty()
        subj_code = ndb.StringProperty()
        course_no = ndb.StringProperty()
        class_type = ndb.StringProperty()
        sec = ndb.StringProperty()
        title = ndb.StringProperty(repeated=True)
        day_times = ndb.StringProperty()
        instructor = ndb.StringProperty()
        status = ndb.StringProperty()
