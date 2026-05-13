import gspread
from oauth2client.service_account import ServiceAccountCredentials
from selenium.webdriver.common.by import By

from selenium import webdriver


def aha_new_student(tablecells, class_date, webd):
    sheetline = []
    course_name = ""
    fulltitle = webd.find_element(By.CLASS_NAME, "viewClass_classTitle__kzdvA").text
    if "BLS" in fulltitle:
        course_name = "BLS"
    elif "ACLS" in fulltitle:
        course_name = "ACLS"
    elif "PALS" in fulltitle:
        course_name = "PALS"

    scope = ['https://www.googleapis.com/auth/spreadsheets',
             'https://www.googleapis.com/auth/drive'
             ]

    credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    client = gspread.authorize(credentials)

    # sheet = client.open('AHA Registration TEST COPY').sheet1
    full = client.open_by_key('1k309GvE7FI9pdAJVmhrE3ha1-LFuFB96fRA2P78HOJU')
    sheet = full.worksheet("AHA Registration")
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
        row += 1
    return


def acuity_new_student(course_name, fullname, phone, email, classdate, location):
    a = fullname.find(" ")
    fname = fullname[0:a]
    lname = fullname[a + 1:]

    lc = location.rfind(",")
    lnd = location.rfind(" ")
    ts = 1 + location.rfind(",", 0, lc)
    locformat = location[lc + 2:lnd] + location[ts:lc]

    scopes = ['https://www.googleapis.com/auth/spreadsheets',
             'https://www.googleapis.com/auth/drive'
             ]

    sheetcreds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scopes)
    client = gspread.authorize(sheetcreds)

    # sheet = client.open('AHA Registration TEST COPY').sheet1
    full = client.open_by_key('1k309GvE7FI9pdAJVmhrE3ha1-LFuFB96fRA2P78HOJU')
    sheet = full.worksheet("AHA Registration")

    studentinfo = ["", locformat, email, fname, "", lname, email, "", "", "", "", "", "", "", "", "", "", "", phone,
                   course_name, classdate, "YES", ""]
    sheet.insert_row(studentinfo, 2)

    return
