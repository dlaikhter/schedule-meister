#!/usr/bin/python2.7
import sys
sys.path.insert(0, 'py_files')
from page_meister import MainPage, Fetcher, TermGetter
import webapp2

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/fetcher/', Fetcher)
    ('/term/', TermGetter)
], debug=True)
