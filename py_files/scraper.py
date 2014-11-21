import sys
import urllib2
sys.path.insert(0, 'libs')
from BeautifulSoup import BeautifulSoup
from Queue import Queue
from threading import Thread
from models import UnivClass
from google.appengine.ext import db


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
        subject_page = BeautifulSoup(html)
        term = subject_page.find("td", {"class": "title"}).text.split(' for ')[1]
        classes = subject_page.find("table", {"bgcolor": "#cccccc"})
        classes = classes.findAll("tr")
        for uni_class in classes:
            if uni_class.find("a"):
                course = {}
                items = uni_class.findAll("td")
                course["subj_code"] = items[0].text
                course["course_no"] = items[1].text
                course["type"] = items[2].text.replace('&amp;', '&')
                course["sec"] = items[4].text
                course["CRN"] = items[5].text
                course["title"] = items[6].text.lower().replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"') .replace('&#39;', "'").split(" ")
                course["days"] = items[8].text
                course["time"] = items[9].text
                course["instructor"] = items[len(items)-1].text

                new_class = UnivClass(key_name=course["CRN"],
                                      term=term,
                                      subj_code=course["subj_code"],
                                      course_no=course["course_no"],
                                      class_type=course["type"],
                                      sec=course["sec"],
                                      title=course["title"],
                                      days=course["days"],
                                      time=course["time"],
                                      instructor=course["instructor"])
                courses.append(new_class)

        db.put(courses)
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

for tag in home_page.findAll("div", {"class": "term"}):
    semesters.append(tag.a["href"])

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
