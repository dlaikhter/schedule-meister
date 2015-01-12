import sys
from google.appengine.ext import ndb
sys.path.insert(0, 'models')
from univclass import UnivClass


ndb.delete_multi(
    UnivClass.query().fetch(keys_only=True)
    )
