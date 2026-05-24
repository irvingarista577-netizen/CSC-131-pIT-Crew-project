export interface SftpSettings {
  host: string;
  port: string;
  username: string;
  remoteFilePath: string;
  remoteFileName: string;
  remoteFileType: string;
  password: string;
}

//settings for the two reminder email templates
export interface ReminderEmailSettings {
  registrationAutoEnabled: boolean;
  registrationSubject: string;
  registrationBody: string;

  expirationAutoEnabled: boolean;
  expirationMonthsAfter: number;
  expirationSubject: string;
  expirationBody: string;
}

export interface AppSettings {
  //sheet links used by the dashboard
  ahaSpreadsheetUrl: string;
  rqiSpreadsheetUrl: string;

  //local display status for AHA login section
  ahaLoginStatus: string;
  ahaUsername: string;
  ahaPassword: string;
  senderEmail: string;
  emailForAhaParsing: string;
  emailForRqiParsing: string;
  csvExportFolder: string;
  csvExportFolderDisplay: string;
  csvFileName: string;
  batchMinutes: number;
  sftp: SftpSettings;
  reminderEmails: ReminderEmailSettings;
}

export interface UploadStatus {
  currentBatchWindow: string;
  currentCsvFile: string;
  lastUploadTime: string | null;
  nextBatchAt: number | null;
  lastUploadError: string | null;
}

export interface StatusCardData {
  id: string;
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
}

export type LogLevel = "info" | "warn" | "error" | "success";

//this one here separates filter logs by section
export type LogSource = "aha" | "rqi" | "sftp" | "general";

export interface LogEntry {
  id: string;
  ts: number;
  level: LogLevel;
  message: string;
  source?: LogSource;
}

export const DEFAULT_REMINDER_EMAILS: ReminderEmailSettings = {
  registrationAutoEnabled: true,
  registrationSubject: "Welcome — course registration",
  registrationBody:
    "Hello {FirstName},\n\nWelcome to {Course}. Your group is {Group}. We have you enrolled as of {EnrollmentDate}.\n\nIf anything looks wrong, reply to this email.\n\nThank you",
  expirationAutoEnabled: true,
  expirationMonthsAfter: 12,
  expirationSubject: "Certification / course renewal reminder",
  expirationBody:
    "Hello {FirstName},\n\nThis is a reminder related to {Course} ({Group}). Your certification date on file is {CertificationDate}. A follow-up is scheduled based on your program rules.\n\nThank you",
};

export const DEFAULT_SETTINGS: AppSettings = {
  ahaSpreadsheetUrl: "",
  rqiSpreadsheetUrl: "",
  ahaLoginStatus: "Signed out",
  ahaUsername: "",
  ahaPassword: "",
  senderEmail: "",
  emailForAhaParsing: "",
  emailForRqiParsing: "",
  csvExportFolder: "",
  csvExportFolderDisplay: "Not set",
  csvFileName: "rqi_export.csv",
  batchMinutes: 15,
  sftp: {
    host: "",
    port: "22",
    username: "",
    remoteFilePath: "/incoming",
    remoteFileName: "rqi_export.csv",
    remoteFileType: "csv",
    password: "",
  },
  reminderEmails: { ...DEFAULT_REMINDER_EMAILS },
};
