from datetime import date
import urllib
import urllib2
import sys
sys.path.insert(0, 'libs')
from BeautifulSoup import BeautifulSoup


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


def scrape_classes(html):
    courses = []
    subject_page = BeautifulSoup(html)
    classes = subject_page.find("table", {"bgcolor": "cccccc"})
    classes = classes.findAll("tr")
    for uni_class in classes:
        if uni_class.find("a"):
            course = {}
            items = uni_class.findAll("td")
            course["subj_code"] = items[0].text
            course["course_no"] = items[1].text
            course["type"] = items[2].text.replace('&amp;', '&')
            course["sec"] = items[3].text
            course["CRN"] = items[4].text
            course["class_page"] = items[4].find('a')["href"]
            course["status"] = items[4].find('p')["title"]
            course["title"] = items[5].text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")
            course["day_times"] = items[6]
            course["instructor"] = items[len(items)-1].text

            temp_dict = {}
            for day in course["day_times"].findAll("tr"):
                temp_dict = dict(temp_dict.items() + create_dict(day).items())
            course["day_times"] = temp_dict

            courses.append(course)

    return courses


def get_classes(req_dict):
    params = {'component': 'searchForm',
              'courseName': req_dict["title"],
              'crn': req_dict["crn"],
              'crseNumb': req_dict["crs_num"],
              'formids': 'term,courseName,crseNumb,crn',
              'page': 'Home',
              'service': 'direct',
              'submitmode': 'submit',
              'submitname': '',
              'term': req_dict["term"],
              }
    url = "https://duapp2.drexel.edu/webtms_du/app"
    html = urllib2.urlopen(url, urllib.urlencode(params))
    return scrape_classes(html)


def get_term_select():
    html = urllib2.urlopen("https://duapp2.drexel.edu/webtms_du/app").read()
    bs = BeautifulSoup(html)
    select = bs.find('select', id="term")
    terms = {}
    for term in select.findAll('option'):
        terms[term.text] = term["value"]

    returning_terms = []
    term_values = terms.keys()
    for semester in  approximate_semester():
        if semester in term_values:
            term = {'val':terms[semester],'term':semester}
            returning_terms.append(term)

    return returning_terms


def approximate_semester():
    approximation = []

    semester = "{season} Semester {start}-{end}"
    quarter = "{season} Quarter {start}-{end}"

    today = date.today()
    year = today.year
    full_seasons = ['Summer', 'Fall', 'Winter', 'Spring', 'Summer', 'Fall']
    seasons = ['Fall', 'Winter', 'Spring', 'Summer']
    semester_dates = {'Fall': [date(year, 9, 20), date(year, 12, 31)],
                      'Winter': [date(year, 1, 1), date(year, 3, 20)],
                      'Spring': [date(year, 3, 20), date(year, 6, 20)],
                      'Summer': [date(year, 6, 20), date(year, 9, 20)]}

    for season, dates in semester_dates.iteritems():
        if dates[0] < today < dates[1]:
            break

    index = seasons.index(season)
    prev_season = full_seasons[index]
    next_season = full_seasons[index+2]

    if season == 'Fall':
        #next quarter
        approximation.append(quarter.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]))
        #current quarter
        approximation.append(quarter.format(season=season, start=str(year)[2:], end=str(year+1)[2:]))
        #previous quarter
        approximation.append(quarter.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]))
        #next semester
        approximation.append(semester.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]))
        #current semester
        approximation.append(semester.format(season=season, start=str(year)[2:], end=str(year+1)[2:]))
        #previous semester
        approximation.append(semester.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]))
    else:
        #next quarter
        if season == 'Summer':
            approximation.append(quarter.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]))
        else:
            approximation.append(quarter.format(season=next_season, start=str(year-1)[2:], end=str(year)[2:]))

        #current quarter
        approximation.append(quarter.format(season=season, start=str(year-1)[2:], end=str(year)[2:]))
        #previous quarter
        approximation.append(quarter.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]))


        #next semester
        approximation.append(semester.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]))
        if season == 'Summer':
            approximation.append(semester.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]))
        else:
            approximation.append(semester.format(season=next_season, start=str(year-1)[2:], end=str(year)[2:]))

        #current semester
        approximation.append(semester.format(season=season, start=str(year-1)[2:], end=str(year)[2:]))
        #previous semester
        approximation.append(semester.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]))

    return approximation


if __name__ == '__main__':
    req_dict = {'crn':'',
                'title':'',
                'term':5,
                'crs_num':101}
    print get_classes(req_dict)
