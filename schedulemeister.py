#!/usr/bin/python2.7
import sys
sys.path.insert(0, 'py_files')
from page_meister import MainPage, ClassQuery, TermGetter
import webapp2

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/get_class/', ClassQuery),
    ('/term/', TermGetter)
], debug=True)
