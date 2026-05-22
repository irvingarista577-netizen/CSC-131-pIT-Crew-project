// @Author Ethan McDonald
// @Version 1.2 5/11/2026
// This method needs to be run everyday @ 5pm (Arbitrary time), it checks each User to see if todays date is the reminder date, then sends reminder email.
// After sending the email, it updates the sheet to confirm a reminder has been sent, and prevents daily reminder emails

function sendReminder() {
  var name = '';
  var sendDate = ''; //Send date currently = 20 month after Add date
  var emailAddress = '';
  var eDate; //Expiration date
  var hasSent = false;
  var count = 1;
  var todayDate = new Date();
//forEach all users.
  allData.slice(1, allData.length).forEach(function (userInfoArr) {
    count +=1;
    sendDate = new Date(userInfoArr[REMINDER_DATE]);
    hasSent = userInfoArr[REMINDER_SENT];
    name = userInfoArr[LAST_NAME];
    emailAddress = userInfoArr[EMAIL_ADDRESS];
    eDate = userInfoArr[EXPIRATION_DATE];
    range = reminderSheet.getRange("H" + count);
    //Checks values in console;
    //Checks if date matches (currently doesn't care about day just year/month)
    if (sendDate.getFullYear() == todayDate.getFullYear() && sendDate.getMonth() == todayDate.getMonth() && hasSent != true) {

      try {
          var htmlTemplate = HtmlService.createTemplateFromFile('RemEmail');
          htmlTemplate.name = name;
          htmlTemplate.edate = eDate;
           var htmlForEmail = htmlTemplate.evaluate().getContent();
      GmailApp.sendEmail(emailAddress, name + ', your CPR certification is expiring soon', 'this email contains html',
      {htmlBody: htmlForEmail});
        range.setValue(true); //Sets hasSent to true on sheet
        Logger.log("Email sent to " + emailAddress);

      }
        catch (e) {
          Logger.log("Failed to send email for " + name + " to " + emailAddress + ". Make sure the data in the sheet is valid (valid email address). If it is, is the API down?");
        }
      }
  })
}
