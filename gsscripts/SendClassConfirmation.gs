// @Author Ethan McDonald
// @Version 1.2 5/12/2026
// Input Email and sends a class confirmation to user.
// THIS IS NOT FINISHED, NEEDS TO BE SYNCED WITH THE CLASS SPREADSHEET, NEED FURTHER INFORMATION

//function thirdMain(){
//SendClassConfirmation("2egmcd2@gmail.com", '19ec38eb-218a-4435-83a7-596a852024ea');
//}

function SendClassConfirmation(email, userID) {
  var index = findIndex(email);
  Logger.log(index);
  var classIndex = findClassIndex(userID)
  Logger.log(classIndex);
  var htmlTemplate = HtmlService.createTemplateFromFile('ClassReminderEmail');
  var name = getFirstName(index) + " " + getLastName(index);
  var date = getClassDate(index);
  var course = getCourse(index);
  var location = getLocation(index);
  var instructor = getInstructor(classIndex);
  var className = getClass(classIndex);
  var email = email;

  Logger.log(index);
  Logger.log(name);
  Logger.log(date);
  Logger.log(course);
  Logger.log(location);

    htmlTemplate.name = name;
    htmlTemplate.date = date;
    htmlTemplate.course = course;
    htmlTemplate.location = location;
    htmlTemplate.email = email;
    htmlTemplate.instructor = instructor;
    htmlTemplate.className = className
     htmlTemplate.edate = email;
    var htmlForEmail2 = htmlTemplate.evaluate().getContent();

    GmailApp.sendEmail(email,'New Appointment: ' + className + " class (" + name + ") with instructor: " + instructor + "on " + date, 'this email contains html',
    {htmlBody: htmlForEmail2});
      Logger.log("Email sent to " + email);
}
