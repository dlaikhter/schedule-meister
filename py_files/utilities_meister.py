from datetime import date


def approximate_semester():
    approximation = {}

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
        approximation['current_quarter'] = quarter.format(season=season, start=str(year)[2:], end=str(year+1)[2:]) 
        approximation['current_semester'] = semester.format(season=season, start=str(year)[2:], end=str(year+1)[2:])
        approximation['previous_quarter'] = quarter.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]) 
        approximation['previous_semester'] = semester.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:])
        approximation['next_quarter'] = quarter.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]) 
        approximation['next_semester'] = semester.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]) 
    else:
        approximation['current_quarter'] = quarter.format(season=season, start=str(year-1)[2:], end=str(year)[2:]) 
        approximation['current_semester'] = semester.format(season=season, start=str(year-1)[2:], end=str(year)[2:])
        approximation['previous_quarter'] = quarter.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:]) 
        approximation['previous_semester'] = semester.format(season=prev_season, start=str(year-1)[2:], end=str(year)[2:])

        if season == 'Summer':
            approximation['next_quarter'] = quarter.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]) 
            approximation['next_semester'] = semester.format(season=next_season, start=str(year)[2:], end=str(year+1)[2:]) 
        else:
            approximation['next_quarter'] = quarter.format(season=next_season, start=str(year-1)[2:], end=str(year)[2:]) 
            approximation['next_semester'] = semester.format(season=next_season, start=str(year-1)[2:], end=str(year)[2:])
    
    return approximation


if __name__ == '__main__':
    print approximate_semester() 
