// @Author Ethan McDonald
// @Version 1.2 5/12/2026
// Sends class confirmation email to student with attached class information
// @Param email of student, userID of class

function SendClassConfirmation(email, userID) {
  var index = findIndex(email);
  Logger.log(index);
  var classIndex = findClassIndex(userID)
  Logger.log(classIndex);
  var htmlTemplate = HtmlService.createTemplateFromFile('ClassReminderEmail'); //see ClassReminderEmail.html for template
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
