// @Author Ethan McDonald
// @Version 1.1 5/12/26
// Sends a payment confirmation email to the Owner email for when a payment is made, which 
// will likely be if a user is added, and they are marked as 'unpaid' in the spreadsheet.
// @Param email of user

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
      address = "123 4th st, zip code etc." //Location address are currently not in sheet, placeholder
      range = reminderSheet.getRange("I" + count);
  // Assumes email is incorrect if user has already been noted as paid
      if(range == "PAID") {
        Logger.log("This User has already paid");
        } else {

       var htmlTemplate = HtmlService.createTemplateFromFile('PayRecievedEmail'); // see PayRecievedEmail.html template
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

