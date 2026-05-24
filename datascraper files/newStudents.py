# Datascraper new-student spreadsheet update functions
# By Rhianna Nichols Thomae, 5/12/2026
# CSC 131 Software Engineering Project - Team 7: the pIT Crew


import gspread
from oauth2client.service_account import ServiceAccountCredentials
from selenium.webdriver.common.by import By

from selenium import webdriver

"""
aha_new_student: takes a list of table elements from AHA class webpage, sorts through them and parses them as
                individual student details. Operates the webdriver to read the specific course title,
                then uploads the new student info to the AHA and RQI google spreadsheets
"""
def aha_new_student(tablecells, class_date, webd):
    sheetline = []
    course_name = ""
    group_name = ""
    fulltitle = webd.find_element(By.CLASS_NAME, "viewClass_classTitle__kzdvA").text
    if "BLS" in fulltitle:
        course_name = "BLS"
        group_name = "HeartCode BLS Online - 2025"
    elif "ACLS" in fulltitle:
        course_name = "ACLS"
        group_name = "HeartCode ACLS Online - 2025"
    elif "PALS" in fulltitle:
        course_name = "PALS"
        group_name = "HeartCode PALS Online - 2025"

    scope = ['https://www.googleapis.com/auth/spreadsheets',
             'https://www.googleapis.com/auth/drive'
             ]

    credentials = ServiceAccountCredentials.from_json_keyfile_name('./credentials.json', scope)
    client = gspread.authorize(credentials)

    # sheet = client.open('AHA Registration TEST COPY').sheet1
    full = client.open_by_key('1k309GvE7FI9pdAJVmhrE3ha1-LFuFB96fRA2P78HOJU')
    sheet = full.worksheet("AHA Registration")
    ahaSh = client.open_by_key('1XLuhTpv9_MjRogQ9645tJFkrprn9zSxCoaq5tlJbmCA')
    ahaReg = ahaSh.sheet1
    phone = ""
    row = 2
    for i in range(0, len(tablecells) - 1, 5):

        email = tablecells[i].text
        nameplusnumber = tablecells[i + 1].text

        registered = tablecells[i + 2].text
        enrolled_by = tablecells[i + 3].text

        # Theoretically: "John May Dwyer\n(245) 306-2845"
        a = nameplusnumber.find(" ")
        fname = nameplusnumber[0:a]
        c = nameplusnumber.find("\n")
        if c != -1:
            phone = nameplusnumber[c + 4:]
        b = nameplusnumber[a + 1:c].find(" ")
        mname = ""
        if b != -1:
            mname = nameplusnumber[a + 1:b]
            lname = nameplusnumber[b + 1:c]
        else:
            lname = nameplusnumber[a + 1:c]

        studentinfo = ["", "", email, fname, mname, lname, email, "", "", "", "", "", "", "", "", "", "", "", phone,
                       course_name, class_date, "", "YES"]
        sheet.insert_row(studentinfo, row)
        ahainfo = [email, fname, mname, lname, phone, course_name, class_date, "", "YES"]
        ahaReg.insert_row(ahainfo,row)
        rqi = client.open_by_key('1Ra1vIWksLaQ1SAH0Uoc6Zp1_NTBMbtjiBfrryksn0ng')
        rqisheet = rqi.sheet1
        rqiinfo = ["", "", email, fname, mname, lname, email, "", "", "", "", "", "", "", "", "", group_name]
        rqisheet.insert_row(rqiinfo, row)
        row += 1
    return


"""
acuity_new_student: Reads pre-processed new student info from Acuity email, including full name, course name,
                    phone number, email, class date, and location. Uploads the acuity info
                    to the AHA and RQI spreadsheets and specifies that it came, prepaid, from acuity rather than AHA                    
"""
def acuity_new_student(course_name, fullname, phone, email, classdate, location):
    a = fullname.find(" ")
    fname = fullname[0:a]
    mname = ""
    b = fullname[a + 1:].find(" ")
    if b != -1:
        mname = fullname[a + 1:b]
        lname = fullname[b + 1:]
    else:
        lname = fullname[a + 1:]

    if "BLS" in course_name:
        group_name = "HeartCode BLS Online - 2025"
    elif "ACLS" in course_name:
        group_name = "HeartCode ACLS Online - 2025"
    elif "PALS" in course_name:
        group_name = "HeartCode PALS Online - 2025"

    lc = location.rfind(",")
    lnd = location.rfind(" ")
    ts = 1 + location.rfind(",", 0, lc)
    locformat = location[lc + 2:lnd] + location[ts:lc]

    scopes = ['https://www.googleapis.com/auth/spreadsheets',
             'https://www.googleapis.com/auth/drive'
             ]

    sheetcreds = ServiceAccountCredentials.from_json_keyfile_name('./credentials.json', scopes)
    client = gspread.authorize(sheetcreds)


    # sheet = client.open('AHA Registration TEST COPY').sheet1
    full = client.open_by_key('1k309GvE7FI9pdAJVmhrE3ha1-LFuFB96fRA2P78HOJU')
    sheet = full.worksheet("AHA Registration")
    ahaSh = client.open_by_key('1XLuhTpv9_MjRogQ9645tJFkrprn9zSxCoaq5tlJbmCA')
    ahaReg = ahaSh.sheet1
    ahainfo = [email, fname, mname, lname, phone, course_name, classdate, "YES", ""]
    ahaReg.insert_row(ahainfo, 2)

    studentinfo = ["", locformat, email, fname, mname, lname, email, "", "", "", "", "", "", "", "", "", "", "", phone,
                   course_name, classdate, "YES", ""]
    sheet.insert_row(studentinfo, 2)

    rqi = client.open_by_key('1Ra1vIWksLaQ1SAH0Uoc6Zp1_NTBMbtjiBfrryksn0ng')
    rqiinfo = ["", locformat, email, fname, mname, lname, email, "", "", "", "", "", "", "", "", "", group_name]
    rqisheet = rqi.sheet1
    rqisheet.insert_row(rqiinfo, 2)

    return
