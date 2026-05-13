// @author Ethan McDonald
// @Version 1.1 5/12/2026
var rootSheet = SpreadsheetApp.getActive();
var reminderSheet = rootSheet.getSheetByName('Email List');
var allData = reminderSheet.getDataRange().getValues();
var errorEmail = "2egmcd2@gmail.com";
var mainEmail = "team7csc131@gmail.com";

// Variables—convert horizontal vars into numbers to be used by userArr search
// THESE MAY CHANGE IF ORDER OF SHEET IS CHANGED
var EMAIL_ADDRESS = 0; //email
var LAST_NAME = 1; //last name
var FIRST_NAME = 2; //first name
var CLASS_DATE = 3;
var PHONE_NUMBER = 4;
var EXPIRATION_DATE = 5;
var REMINDER_DATE = 6;
var REMINDER_SENT = 7;
var PAYMENT_STATUS = 8;
var LOCATION = 9; //Location name
var COURSE_NAME = 10;
var ADDRESS = 11;
