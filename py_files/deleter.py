from google.appengine.ext import db
class UnivClass(db.Model):
	class_info = db.StringProperty()
query = UnivClass.all(keys_only=True)
entries =query.fetch(1000)
db.delete(entries)
