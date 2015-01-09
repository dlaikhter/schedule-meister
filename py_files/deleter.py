import sys
from google.appengine.ext import db
sys.path.insert(0, 'models')
from univclass import UnivClass

query = UnivClass.all(keys_only=True)
entries = query.fetch(1000)
db.delete(entries)
