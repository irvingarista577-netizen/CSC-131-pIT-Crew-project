var rootSheet = SpreadsheetApp.getActive();
var reminderSheet = rootSheet.getSheetByName('Email List');
var allData = reminderSheet.getDataRange().getValues();
var errorEmail = "2egmcd2@gmail.com";
var mainEmail = "team7csc131@gmail.com";

// Variables—convert horizontal vars into numbers to be used by userArr search
// Currently not used. Will be if change sheet design.
var EMAIL_ADDRESS = 0; //email
var LAST_NAME = 1; //last name
var FIRST_NAME = 2; //first name
var CLASS_DATE = 3;
var EXPIRATION_DATE = 4;
var REMINDER_DATE = 5;
var REMINDER_SENT = 6;
var PAYMENT_STATUS = 7;
var LOCATION = 8; //Location name
var COURSE_NAME = 9;
