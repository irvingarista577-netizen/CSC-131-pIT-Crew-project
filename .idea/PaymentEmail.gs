// @Author Ethan McDonald
// @Version 1.0 5/3/26
// This simple function sends a payment email to the addressed email. This will need to be paired with a trigger
// for when a payment is needed, which will likely be if a user is added, and they are marked as 'unpaid' in 
// the spreadsheet.

function PayConfirmEmail(email) {
  var recipient = email;
  var count = 1;
  allData.slice(1, allData.length).forEach(function (userArr) {
    // first line = email on spreadsheet
    count += 1;
    if(userArr[0] = recipient) {
      range = reminderSheet.getRange("H" + count);
      if(range = "Paid") {
        Logger.log("This User has already paid");

      } else {
       var htmlTemplate = HtmlService.createTemplateFromFile('PaymentRecievedEmail');
       var htmlForEmail = htmlTemplate.evaluate().getContent();
      GmailApp.sendEmail(emailAddress,'Payment for class is confirmed', 'this email contains html',
    {htmlBody: htmlForEmail});
        range.setValue("Pending"); //Sets hasSent to true on sheet
        Logger.log("Email sent to " + emailAddress);
    }
    }
  })

// @ts-ignore
}
