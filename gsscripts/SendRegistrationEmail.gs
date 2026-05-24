// @Author Ethan McDonald
// @Version 1.0 5/16/2026
// @Parameter user email
// This method sends a reminder email to pay for classes, including instructions to follow link to complete class registration.

function sendCompleteRegistrationEmail(email) {
  var htmlTemplate = HtmlService.createTemplateFromFile('RegistrationEmail');
  var htmlForEmail = htmlTemplate.evaluate().getContent();
  GmailApp.sendEmail(email,'Finish your course registration here!', 'this email contains html',
  {htmlBody: htmlForEmail});
}
