# CSC 131, Spring 2026 Team 7: pIT Crew Project

## *Contributors:*
  Ethan McDonald,
  Rhianna Nichols Thomae,
  Ramsha Tasneem,
  Ethan Wilform,
  Irving Arista


## Datascraper Files - Rhianna Nichols Thomae

This folder contains all the datascraper program code which runs using shell commands.

### Datascraper Installation:

This program requires Python to already be installed on your system.

1. Make sure pip is installed:  
`py -m ensurepip --default-pip`

2. Using pip, install the required packages for datascraper using this console command:  
`pip install -r requirements.txt`

To run correctly, datascraper relies on an existing firefox profile being present in the directory. Since the profile files are too large to upload to github,
you will have to create a new firefox profile, then store the profile folder in the same "datascraper files" folder, and then make sure the folder is called "38LpQTRD.Profile 1"

OR you can just download it and unzip it from this drive link: https://drive.google.com/file/d/1gAUILhoJYuGSfJbA8qC1e1UHN7CwPHTf/view?usp=sharing


### Running Datascraper:

Once all requirements are installed and the profile folder is placed in the datascraper folder, you can run the datascraper using the included batch file:  
`run_scraper.bat`

or open a powershell/terminal window in that directory and enter this command:
`py datascraper_main.py`

### Datascraper Features/Methods:

**datascraper_main.py:**  
  `get_unread()`: calls datascraper_mailbag to open an authorized gmail inbox and read through unread emails to find new AHA and Acuity notifications from which student info can be pulled.

  `rqi_sheet_grab()`: calls RQI_upload to pull a spreadsheet in .csv format from the RQI and AHA google sheets, and uploads it to the RQI SFTP server.

**datascraper_mailbag.py:**  
  `mailbag_unread()`: Connects to a specified gmail account (prompting first-time login/authentication if needed), and reads all unread emails in the Inbox. When it finds emails matching the expected formatting of AHA or Acuity notifications, the email's subject & body are sent to either `acuity_parse()` or `AHA_parse()`.

  `acuity_parse(subject, body)`: reads through a passed email string to find all the new student info, then passes it the info to `acuity_new_student()` in newStudents.

  `AHA_parse(subject, body)`: Takes the date from an email string, checks if the browser session is logged in to the AHA Dashboard, then uses `urlconvert` to create url to the AHA website's "Classes I Teach" page, to look for the class on that date. After that, it accepts any students applying to that class and then automatically reads all student data from the page, and then passes it to `aha_new_student()` in newStudents.

**newStudents.py:**  
  `aha_new_student(tablecells, class_date, webd)`: takes a list of table elements from AHA class webpage, sorts through them and parses them as individual student details. Operates the webdriver to read the specific course title, then uploads the new student info to the AHA and RQI google spreadsheets.

  `acuity_new_student(course_name, fullname, phone, email, classdate, location)`: Reads pre-processed new student info from Acuity email, including full name, course name, phone number, email, class date, and location. Uploads the acuity info to the AHA and RQI spreadsheets.

**datascraper_urlconvert.py:**  
  `dateparser(datestr)`: Takes a passed string containing a date, and creates integers containing the separate month, day, and year. Returns a list containing the date integers in month/day/year order.

  `urlmaker(mm, dd, yy)`: Using a date passed as separate integers, converts the exact date to a pair of UNIX Epoch timestamps (The AHA atlas website uses UNIX Epoch Timestamps formatted in milliseconds to filter class searches by date). Formats a new URL to the AHA dashboard "classes I teach" page using those timestamps and the date integers. Returns a new url for classes taking place on the specified month, day, and year.

**RQI_upload:**  
  `sheetgrab()`: Connects to an RQI google sheet or a sheet matching RQI's expected formatting, then downloads all sheet data and saves it to a csv file "output.csv", located in this program's enclosing folder. Calls `sftp_upload()` and passes the new output.csv to it before returning.

  `sftp_upload(outputfile):` Takes a .csv spreadsheet file containing student info passed by value, opens a ssh client session and connects to the RQI SFTP server. Once connected, uploads the .csv file, then closes the ssh connection.

