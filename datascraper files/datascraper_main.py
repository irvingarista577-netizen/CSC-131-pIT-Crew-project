# Email/Website Datascraper
# By Rhianna Nichols Thomae, 2/11/2026
# CSC 131 Software Engineering Project - Team 7: the pIT Crew

import datascraper_mailbag as mailbag
import RQI_upload
from fastapi import FastAPI

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By

import gspread
from oauth2client.service_account import ServiceAccountCredentials

"""
get_unread: Function call method for datascraper_mailbag.mailbag_unread()
"""
def get_unread():
    mailbag.mailbag_unread()
    return

"""
rqi_sheet_grab: Function call method for RQI_upload.sheetgrab(), which also calls sftp_upload()
"""
def rqi_sheet_grab():
    RQI_upload.sheetgrab()
    return

"""
Main function: Calls get_unread to start reading emails from the gmail inbox,
                and then calls rqi_sheet_grab() uploads to all the appropriate google sheets,
                then finally updates the RQI SFTP server.
"""
def main():
    # mailbag.mailbag_unread()
    get_unread()

    # RQI_upload.sheetgrab()
    rqi_sheet_grab()

    return

main()

# Selenium Login Test
"""
url = f"https://ahasso.heart.org/login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fscope%3Dopenid%2520profile%2520email%26response_type%3Dcode%26code_challenge_method%3DS256%26redirect_uri%3Dhttps%253A%252F%252Fatlas.heart.org%252Flocation%26state%3D2afa29aa-0747-46e9-afed-a17e6056e106%26client_id%3DAHA-ATLAS-PROD%26code_challenge%3DF04-q4p2L15wYutR8OKGPdXmOTlYP6Ik_rBtJ8VnepU"
driver.get(url)
time.sleep(2)
email = driver.find_element(By.ID, "Email")
email.send_keys("Sacstatecpr@outlook.com")
passw = driver.find_element(By.ID, "Password")
passw.send_keys("ssCPR123*")
signin = driver.find_element(By.ID, "btnSignIn")
signin.click()
time.sleep(5)
signin = driver.find_element(By.CLASS_NAME, "")
signin.click()
"""

# Playwright Login Test
"""
Just Kidding, I never got playwright to work because it wouldn't install right until the last week of class!
"""
