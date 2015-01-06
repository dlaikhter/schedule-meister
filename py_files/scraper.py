import sys
import urllib2
sys.path.insert(0, 'libs')
from BeautifulSoup import BeautifulSoup
sys.path.insert(0, 'models')
from univclass import UnivClass
from Queue import Queue
from threading import Thread
from google.appengine.ext import db


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
                course["days_time"] = items[7].text
                course["instructor"] = items[len(items)-1].text

                new_class = UnivClass(key_name=course["CRN"],
                                      term=term,
                                      subj_code=course["subj_code"],
                                      course_no=course["course_no"],
                                      class_type=course["type"],
                                      sec=course["sec"],
                                      title=course["title"],
                                      days=[],
                                      time=[],
                                      instructor=course["instructor"])
                
                temp_dict = {}
                for day in course["day_times"].findAll("tr"): 
                    temp_dict = dict(temp_dict.items() + create_dict(day).items())
                else:
                    for key, value in temp_dict.iteritems():
                        new_class.days.append(key)
                        new_class.time.append(value)
                
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
