import base64
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email
from bs4 import BeautifulSoup
import newStudents
import datascraper_urlconvert as urlconvert
import time
import tkinter as tk
from tkinter import messagebox

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument("-profile")
options.add_argument("C:/Users/Ryan/OneDrive/Documents/GitHub/CSC-131-pIT-Crew-project/38LpQTRD.Profile 1")
options.add_argument("--headless")

logops = Options()
logops.add_argument("-profile")
logops.add_argument("C:/Users/Ryan/OneDrive/Documents/GitHub/CSC-131-pIT-Crew-project/38LpQTRD.Profile 1")


global_acuity_msgs = []
global_aha_dates = []


def acuity_parse(subject, body):
    coursestr = ""
    namestr = ""
    phonestr = ""
    emailstr = ""
    datestr = ""
    locstr = ""
    if "BLS" in subject:
        coursestr = "BLS"
    elif "ACLS" in subject:
        coursestr = "ACLS"
    elif "PALS" in subject:
        coursestr = "PALS"
    d = subject.find(",")
    dend = subject[d + 1:].find(",")
    dend += d + 7
    datestr = subject[d + 2:dend]

    ns = 6 + body.find("Name: ")
    nf = body.find('\r\n', ns)
    namestr = body[ns:nf]

    ns = 8 + body.find("Phone: ")
    nf = body.find('\r\n', ns)
    phonestr = body[ns:nf]

    ns = 7 + body.find("Email: ")
    nf = body.find('\r\n', ns)
    emailstr = body[ns:nf]

    ns = 5 + body.find("===\r\n")
    nf = body.find('\r\n', ns)
    locstr = body[ns:nf]

    print(f'New Aquity student: {namestr}\nUploading info to Combined AHA sheet...')
    newStudents.acuity_new_student(coursestr, namestr, phonestr, emailstr, datestr, locstr)
    print('Done.\n')
    return


def AHA_parse(subject, body):
    driver = webdriver.Firefox(options=options)
    driver.get("https://ahasso.heart.org/Login/index")
    time.sleep(1.5)
    if len(driver.find_elements(By.ID, "Email")) > 0:
        driver.quit()
        driver = webdriver.Firefox(options=logops)
        driver.get("https://ahasso.heart.org/Login/index")

        messagebox.showinfo(title='Sign in to AHA Dashboard',
                            message='Finish signing in to AHA Dashboard, then click OK.')
        driver.get("https://atlas.heart.org/organisation/classes-i-teach?orgSwitch=true")
        messagebox.showinfo(title="Change Organization",
                            message='Ensure the right Organization is selected, then click OK (you won\'t have to do '
                                    'this until you log in again!).')


    dt = 3 + body.find("on ")
    dend = body.find(".")
    datestr = body[dt:dend]
    date = urlconvert.dateparser(datestr)
    mm = date[0]
    dd = date[1]
    yy = date[2]
    newurl = urlconvert.urlmaker(mm, dd, yy)
    driver.get(newurl)
    time.sleep(1.5)

    # okay it actually works without any tricks or secrets now

    tabledata = driver.find_elements(By.TAG_NAME, "td")
    idx = 3
    for i in range(3, len(tabledata) - 1, 6):
        d = tabledata[i]
        if f'0{mm}-{dd}-{yy}' in d.text:
            newbutton = tabledata[i + 2].find_element(By.TAG_NAME, "a")
            newbutton.click()
            time.sleep(0.3)
            dropdown = tabledata[i + 2].find_element(By.TAG_NAME, "ul")
            view = dropdown.find_element(By.CSS_SELECTOR, "[aria-label='View']")
            view.click()
            break
    time.sleep(2)
    buttons = driver.find_elements(By.CSS_SELECTOR, "[title='Accept']")
    for idx in buttons:
        idx.click()
        time.sleep(0.1)
        popup = driver.find_element(By.ID, "InviteItem")
        accept = popup.find_element(By.CSS_SELECTOR, "[aria-label='Accept']")
        accept.click()

    tabledata = ""
    tabledata = driver.find_elements(By.TAG_NAME, "td")
    if tabledata:
        print(f'New AHA site students found.\nUploading info to Combined AHA Sheet...')
        newStudents.aha_new_student(tablecells=tabledata, class_date=datestr, webd=driver)
    driver.quit()
    return


def mailbag_unread():
    scope = ["https://www.googleapis.com/auth/gmail.readonly",
             "https://www.googleapis.com/auth/gmail.modify"
    ]
    creds = None

    if os.path.exists("../token.json"):
        creds = Credentials.from_authorized_user_file("token.json", scope)
    # If there are no valid credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("email_credentials.json", scope)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("../token.json", "w") as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build("gmail", "v1", credentials=creds)
        results = service.users().messages().list(userId="me", labelIds=["UNREAD"]).execute()
        msglist = results.get("messages")

        if not msglist:
            print("No messages found.")
            return


        print("Messages:")
        for message in msglist:
            print(f'Message ID: {message["id"]}')
            service.users().messages().modify(userId='me', id=message['id'], body={
                'removeLabelIds': ['UNREAD']
            }).execute()

            msg = service.users().messages().get(userId="me", id=message["id"]).execute()
            payload = msg['payload']
            headers = payload['headers']

            # Look for Subject and Sender Email in the headers
            for d in headers:
                if d['name'] == 'Subject':
                    subject = d['value']
                if d['name'] == 'From':
                    sender = d['value']

            parts = payload.get('parts')[0]
            data = parts['body']['data']
            data = data.replace("-", "+").replace("_", "/")
            decoded_data = base64.b64decode(data)
            soup = BeautifulSoup(decoded_data, "lxml")
            body = soup.prettify()
            if "==============" in body:
                acuity_parse(subject, body)
            elif "You have one or more incoming class enrollment requests" in body:
                AHA_parse(subject, body)

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f"An error occurred: {error}")

    return


mailbag_unread()
