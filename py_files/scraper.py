#deprecated

import sys
import json
import urllib2
sys.path.insert(0, 'libs')
from BeautifulSoup import BeautifulSoup
sys.path.insert(0, 'models')
from univclass import UnivClass
from Queue import Queue
from threading import Thread
from google.appengine.ext import ndb
sys.path.insert(0, 'py_files')
from utilities_meister import approximate_semester, scrape_classes


def create_dict(day):
        days_of_week = ['M', 'T', 'W', 'R', 'F', 'S']
        temp_dict = {}
        pair = day.findAll("td")
        for day in list(pair[0].text):
            try:
                days_of_week.index(day)
                temp_dict[day] = pair[1].text
            except:
                return {}
        return temp_dict


def get_subjects():
    while True:
        url = url_queue.get()
        while True:
            try:
                html = urllib2.urlopen("https://duapp2.drexel.edu"+url, timeout=10).read()
                break
            except:
                pass
        college_page = BeautifulSoup(html)
        classes_panel = college_page.find("table", {"class": "collegePanel"})
        subjects = classes_panel.findAll("a")
        links.append(subjects)
        url_queue.task_done()


def get_classes():
    while True:
        url = url_queue2.get()
        while True:
            try:
                html = urllib2.urlopen("https://duapp2.drexel.edu"+url, timeout=10).read()
                break
            except:
                pass
        courses = []
        term = subject_page.find("td", {"class": "title"}).text.split(' for ')[1]
        for course in scrape_classes(html):
            new_class = UnivClass(id=course["CRN"],
                                  term=term,
                                  subj_code=course["subj_code"],
                                  course_no=course["course_no"],
                                  class_type=course["type"],
                                  sec=course["sec"],
                                  title=course["title"],
                                  day_times="",
                                  status=course["status"],
                                  day_times=course["day_times"],
                                  instructor=course["instructor"])

            courses.append(new_class)

        ndb.put_multi(courses)
        url_queue2.task_done()


url_queue = Queue(5)
url_queue2 = Queue(10)
links = []
semesters = []
colleges = []
while True:
    try:
        html = urllib2.urlopen("https://duapp2.drexel.edu/webtms_du/app", timeout=10).read()
        break
    except:
        pass
home_page = BeautifulSoup(html)


terms = [term for key, term in approximate_semester().iteritems()]

for tag in home_page.findAll("div", {"class": "term"}):
    link = tag.a
    if link.text in terms:
        semesters.append(link["href"])

for semester in semesters:
    while True:
        try:
            html = urllib2.urlopen("https://duapp2.drexel.edu"+semester, timeout=10).read()
            break
        except:
            pass
    semester_page = BeautifulSoup(html)
    sidebar = semester_page.find("div", {"id": "sideLeft"})
    if sidebar:
        colleges += sidebar.findAll("a")


for i in range(5):
    t = Thread(target=get_subjects)
    t.daemon = True
    t.start()

for college in colleges:
    url_queue.put(college["href"])

url_queue.join()

for i in range(10):
    t = Thread(target=get_classes)
    t.daemon = True
    t.start()

for list_links in links:
    for link in list_links:
        url_queue2.put(link["href"])

url_queue2.join()
