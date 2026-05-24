# Datascraper website URL conversion functions
# By Rhianna Nichols Thomae, 4/8/2026
# CSC 131 Software Engineering Project - Team 7: the pIT Crew

from datetime import datetime, timezone

"""
dateparser: takes a passed string containing a date, and creates integers containing the separate month, day, and year.
            Returns a list containing the date integers in month/day/year order.
"""
def dateparser(datestr):
    mm = int(datestr[:2])
    dd = int(datestr[3:5])
    yy = int(datestr[6:10])
    return [mm, dd, yy]


"""
urlmaker: Using a date passed as separate integers, converts the exact date to a pair of UNIX Epoch timestamps.
          (The AHA atlas website uses UNIX Epoch Timestamps formatted in milliseconds to filter class searches by date)
          Formats a new URL to the AHA dashboard "classes I teach" page using those timestamps and the date integers.
          Returns a new url for classes taking place on the specified month, day, and year.
"""
def urlmaker(mm, dd, yy):

    start = datetime(yy, mm, dd, 8, tzinfo=timezone.utc)
    end = datetime(yy, mm, dd, 20, tzinfo=timezone.utc)
    start_ms = int(start.timestamp()) * 1000
    end_ms = int(end.timestamp()) * 1000
    # print(end_ms, "\n")
    url = f"https://atlas.heart.org/organisation/classes-i-teach?orgSwitch=true&applyTsFilter=true&isFirstTsSelected=false&instructorIds=26027755195&classStartDate={start_ms}&classEndDate={end_ms}&fromDate={yy}-0{mm}-{dd}&toDate={yy}-0{mm}-{dd+1}&sortBy=startDateTime&sortDir=desc&pageSize=10&classTeachTrainingCenter=false"
    return url



"""
Test and reference urls for specific dates guaranteed to have classes with student info to read
https://atlas.heart.org/organisation/classes-i-teach?orgSwitch=true&applyTsFilter=true&isFirstTsSelected=false&instructorIds=26027755195&classStartDate=1771833600000&classEndDate=1772006340000&fromDate=2026-02-23&toDate=2026-02-24&sortBy=startDateTime&sortDir=desc&pageSize=10&classTeachTrainingCenter=false
https://atlas.heart.org/organisation/classes-i-teach?orgSwitch=true&applyTsFilter=true&isFirstTsSelected=false&instructorIds=26027755195&classStartDate=1771833600000&classEndDate=1772006340000&fromDate=2026-02-23&toDate=2026-02-24&sortBy=startDateTime&sortDir=desc&pageSize=10&classTeachTrainingCenter=false
"""
