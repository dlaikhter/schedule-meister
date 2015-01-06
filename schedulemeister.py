#!/usr/bin/python2.7
import sys
sys.path.insert(0, 'py_files')
from meister_page import MainPage, Fetcher
import webapp2

application = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/fetcher/', Fetcher)
], debug=True)
