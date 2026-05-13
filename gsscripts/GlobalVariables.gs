// @Author Ethan McDonald
// @Version 1.3 5/12/2026
var rootSheet = SpreadsheetApp.getActive();
var reminderSheet = rootSheet.getSheetByName('Email List');
var allData = reminderSheet.getDataRange().getValues();
var classSheet = rootSheet.getSheetByName('Enrollments');
var classData = classSheet.getDataRange().getValues();
var classSearch = classSheet.getRange(1, 1, classSheet.getLastRow(), classSheet.getLastColumn()).getDisplayValues();
var userSearch = reminderSheet.getRange(1, 1, reminderSheet.getLastRow(), reminderSheet.getLastColumn()).getDisplayValues();
var errorEmail = "2egmcd2@gmail.com";
var mainEmail = "team7csc131@gmail.com";

// Variables—convert horizontal vars into numbers to be used by userArr search
// Currently not used. Will be if change sheet design.
var EMAIL_ADDRESS = 0; //email
var LAST_NAME = 1; //last name
var FIRST_NAME = 2; //first name
var CLASS_DATE = 4;
var PHONE_NUMBER = 3;
var EXPIRATION_DATE = 5;
var REMINDER_DATE = 6;
var REMINDER_SENT = 7;
var PAYMENT_STATUS = 8;
var LOCATION = 9; //Location name
var COURSE_NAME = 10;
var ADDRESS = 11;

// Enrollment sheet
var CLASS_ID = 0;
var FULL_NAME = 1;
var CLASS_FIRST_NAME = 2;
var CLASS_LAST_NAME = 3;
var CLASS_NAME = 4;
var CLASS_DATE_2 = 5;
var INSTRUCTOR_NAME = 6;


function findIndex(email){
  for(let i = 1; i < reminderSheet.getLastRow(); i++) {
    if (email == userSearch[i][EMAIL_ADDRESS]){
      return i;
    }
  }
}

function findClassIndex(userID){
  for(let i = 1; i < classSheet.getLastRow(); i++) {
    if (userID == classSearch[i][0]){
      return i;
    }
  }
}
function getLastName(index) {

  return userSearch[index][LAST_NAME];
}

function getFirstName(index){

  return userSearch[index][FIRST_NAME];
}

function getEmail(index) {
  return userSearch[index][EMAIL_ADDRESS];
}

function getPhoneNumber(index){
  return userSearch[index][PHONE_NUMBER];
}

function getLocation(index) {
  return userSearch[index][LOCATION];
}
function getCourse(index) {
  return userSearch[index][COURSE_NAME];
}
function getClassDate(index){
  return userSearch[index][CLASS_DATE];
}
function getInstructor(index){
  return classSearch[index][INSTRUCTOR_NAME];
}
function getClassID(index){
  return classSearch[index][0];
}
function getClass(index){
  return classSearch[index][CLASS_NAME];
}

