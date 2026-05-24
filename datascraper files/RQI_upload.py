# Datascraper RQI spreadsheet .csv grabber and SFTP upload functions
# By Rhianna Nichols Thomae, 4/23/2026
# CSC 131 Software Engineering Project - Team 7: the pIT Crew

import paramiko
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import sys
from csv import DictWriter
import os


"""
sftp_upload: takes a .csv spreadsheet file containing student info passed by value, opens a ssh client session and
            connects to the RQI SFTP server. Once connected, uploads the .csv file and closes the ssh connection.
"""
def sftp_upload(outputfile):

    with paramiko.SSHClient() as ssh:
        ssh.load_system_host_keys()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname="rqi1stop-sftp-preprod.rqi1stop.com",
                    port=6239,
                    username="116286",
                    password="bEtR0X6@O$")

        sftp = ssh.open_sftp()
        sftp.chdir('uploads/116286')
        sftp.put('../datascraper files/' + outputfile,
                 'CPRlifeline_demo_team07.csv')

        ssh.close()

    return

"""
sheetgrab: Connects to an RQI google sheet or a sheet matching RQI's expected formatting, then downloads all
            sheet data and saves it to a csv file "output.csv", located in this program's enclosing folder.
            Calls sftp_upload() and passes the new output.csv to it before returning
"""
def sheetgrab():
    scope = ['https://www.googleapis.com/auth/spreadsheets',
             'https://www.googleapis.com/auth/drive'
             ]

    credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
    client = gspread.authorize(credentials)

    outDir = '../datascraper files'
    outFile = 'output.csv'

    # sheet = client.open('AHA Registration TEST COPY').sheet1
    sheetkey = "1k309GvE7FI9pdAJVmhrE3ha1-LFuFB96fRA2P78HOJU"
    full = client.open_by_key(sheetkey)
    sheet = full.worksheet("AHA Registration")
    url = f'https://docs.google.com/spreadsheets/d/{sheetkey}/gviz/tq?tqx=out:csv&gid=' + str(sheet.id)
    alldata = sheet.get_all_records(
        expected_headers=["", "Location Name", "EMAIL", 'First Name', 'M', 'Last Name', 'Status', 'Group', 'Phone',
                          'Course', 'Date', 'Acuity Regist.', 'AHA Regist.', 'Reminder Email Sent'])
    if not alldata:
        print('No new Data in Sheet! Exiting...')
        return
    filepath = os.path.join(outDir, outFile)
    with open(filepath, 'w', newline='') as newf:
        dict = DictWriter(newf, alldata[0].keys())
        dict.writeheader()
        for data in alldata:
            dict.writerow(data)

        newf.close()
    print(f'Wrote new output.csv to {filepath}\n')
    print('Uploading to RQI Server...\n')

    sftp_upload(outFile)
    print('Done!\n')
    return
