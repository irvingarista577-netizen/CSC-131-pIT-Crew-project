// @Author Ethan McDonald
// @Version 1.0 5/3/26
// This simple function sends a payment confirmation email to the Owner email. This will need to be paired with a trigger
// for when a payment is made, which will likely be if a user is added, and they are marked as 'unpaid' in 
// the spreadsheet.
function main(){
  //NEED TRIGGER
  PayConfirmEmail("2egmcd2@gmail.com")
}

function PayConfirmEmail(email) {
  var recipient = email;
  var count = 1;
  var phone;
  var name;
  var date;
  var course;
  var location;
  var address;
  var range;
  allData.slice(1, allData.length).forEach(function (userArr) {
    // first line = email on spreadsheet
    count += 1;
    if(userArr[0] == recipient) {
      phone = userArr[PHONE_NUMBER];
      name = userArr[FIRST_NAME] + " " + userArr[LAST_NAME];
      date = userArr[CLASS_DATE];
      course = userArr[COURSE_NAME];
      location = userArr[LOCATION];
      address = "123 4th st, zip code etc."
      range = reminderSheet.getRange("I" + count);
      if(range == "PAID") {
        Logger.log("This User has already paid");

      } else {
       var htmlTemplate = HtmlService.createTemplateFromFile('PayRecievedEmail');
       htmlTemplate.phone = phone;
       htmlTemplate.name = name;
       htmlTemplate.date = date;
       htmlTemplate.course = course;
       htmlTemplate.location = location;
       htmlTemplate.email = recipient;
       htmlTemplate.price = "unknown";
       var htmlForEmail = htmlTemplate.evaluate().getContent();

      GmailApp.sendEmail(mainEmail,'New Appointment: ' + name + ", " + date + " " + course + " ", 'this email contains html',
    {htmlBody: htmlForEmail});
        range.setValue("PAID"); //Sets hasSent to true on sheet
        Logger.log("Email sent to " + mainEmail);
    }
    }
  })

// @ts-ignore
}

function getAddress (location) {
  var address = " ";
  return address;
}
