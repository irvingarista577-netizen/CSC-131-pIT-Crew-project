import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import type { LogLevel, LogSource, ReminderEmailSettings } from "../types";

const tabs = [
  { id: "registration", label: "Registration reminder" },
  { id: "expiration", label: "Expiration reminder" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const REGISTRATION_TAGS = [
  "{FirstName}",
  "{LastName}",
  "{Group}",
  "{Course}",
  "{Email}",
  "{EnrollmentDate}",
] as const;

const EXPIRATION_TAGS = [
  "{FirstName}",
  "{LastName}",
  "{Group}",
  "{Course}",
  "{Email}",
  "{CertificationDate}",
  "{EnrollmentDate}",
] as const;

type FieldKey = "registrationSubject" | "registrationBody" | "expirationSubject" | "expirationBody";

interface SampleStudent {
  id: string;
  firstName: string;
  lastName: string;
  group: string;
  course: string;
  email: string;
  enrollmentDate: string;
  certificationDate: string;
}

//sample students used only for testing email preview
const SAMPLE_STUDENTS: SampleStudent[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Rivera",
    group: "xx",
    course: "BLS Provider",
    email: "alex.rivera@example.edu",
    enrollmentDate: "2025-01-14",
    certificationDate: "2024-06-01",
  },
  {
    id: "2",
    firstName: "Jordan",
    lastName: "Lee",
    group: "xxx",
    course: "ACLS",
    email: "jordan.lee@example.edu",
    enrollmentDate: "2025-02-03",
    certificationDate: "2023-11-20",
  },
  {
    id: "3",
    firstName: "Sam",
    lastName: "Nguyen",
    group: "xx",
    course: "PALS",
    email: "sam.nguyen@example.edu",
    enrollmentDate: "2025-02-18",
    certificationDate: "2022-08-15",
  },
];

//replaces tags with the selected student's information
function applyStudentTags(template: string, s: SampleStudent): string {
  return template
    .replaceAll("{FirstName}", s.firstName)
    .replaceAll("{LastName}", s.lastName)
    .replaceAll("{Group}", s.group)
    .replaceAll("{Course}", s.course)
    .replaceAll("{Email}", s.email)
    .replaceAll("{EnrollmentDate}", s.enrollmentDate)
    .replaceAll("{CertificationDate}", s.certificationDate);
}

function getFieldValue(r: ReminderEmailSettings, field: FieldKey): string {
  switch (field) {
    case "registrationSubject":
      return r.registrationSubject;
    case "registrationBody":
      return r.registrationBody;
    case "expirationSubject":
      return r.expirationSubject;
    case "expirationBody":
      return r.expirationBody;
  }
}

function fieldPatch(field: FieldKey, value: string): Partial<ReminderEmailSettings> {
  switch (field) {
    case "registrationSubject":
      return { registrationSubject: value };
    case "registrationBody":
      return { registrationBody: value };
    case "expirationSubject":
      return { expirationSubject: value };
    case "expirationBody":
      return { expirationBody: value };
  }
}

export function ReminderEmailsPage() {
  const { settings, setSettings, saveSettings, pushLog } = useApp();
  const [tab, setTab] = useState<TabId>("registration");
  const caret = useRef<Partial<Record<FieldKey, { start: number; end: number }>>>({});

  const r = settings.reminderEmails;

  const patchReminder = useCallback(
    (patch: Partial<ReminderEmailSettings>) => {
      setSettings({ reminderEmails: { ...settings.reminderEmails, ...patch } });
    },
    [setSettings, settings.reminderEmails],
  );

//saves the cursor position so tags can be added in the right spot
  const trackCaret = (field: FieldKey) => {
    return (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const t = e.currentTarget;
      caret.current[field] = {
        start: t.selectionStart ?? t.value.length,
        end: t.selectionEnd ?? t.selectionStart ?? t.value.length,
      };
    };
  };

  const insertTag = (field: FieldKey, tag: string) => {
    const value = getFieldValue(r, field);
    const pos = caret.current[field] ?? { start: value.length, end: value.length };
    const next = value.slice(0, pos.start) + tag + value.slice(pos.end);
    caret.current[field] = { start: pos.start + tag.length, end: pos.start + tag.length };
    patchReminder(fieldPatch(field, next));
  };

  const senderOk = settings.senderEmail.trim().length > 0;

  return (
    <>
      <header style={{ marginBottom: "-0.35rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Reminder emails
        </h1>
        <p className="muted" style={{ margin: "0.35rem 0 0" }}>
          Create and test the registration and expiration reminder email templates.
        </p>
      </header>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel panel-scroll">
        {tab === "registration" ? (
          <RegistrationTabContent
            r={r}
            patchReminder={patchReminder}
            trackCaret={trackCaret}
            insertTag={insertTag}
            senderOk={senderOk}
            senderEmail={settings.senderEmail}
            pushLog={pushLog}
          />
        ) : (
          <ExpirationTabContent
            r={r}
            patchReminder={patchReminder}
            trackCaret={trackCaret}
            insertTag={insertTag}
            senderOk={senderOk}
            senderEmail={settings.senderEmail}
            pushLog={pushLog}
          />
        )}
      </div>

      <div className="page-actions" style={{ borderTop: "none", paddingTop: "0.5rem" }}>
        <button type="button" className="btn btn-primary" onClick={() => saveSettings()}>
          Save reminder settings
        </button>
      </div>
    </>
  );
}

function TagBar({
  label,
  tags,
  field,
  onInsert,
}: {
  label: string;
  tags: readonly string[];
  field: FieldKey;
  onInsert: (field: FieldKey, tag: string) => void;
}) {
  return (
    <div className="reminder-tag-block">
      <div className="muted" style={{ fontSize: "0.75rem", marginBottom: "0.35rem" }}>
        {label}
      </div>
      <div className="tag-row" role="group">
        {tags.map((tag) => (
          <button
            key={`${field}-${tag}`}
            type="button"
            className="tag-chip"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onInsert(field, tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function ManualStudentSection(props: {
  kind: "registration" | "expiration";
  subject: string;
  body: string;
  senderOk: boolean;
  senderEmail: string;
  pushLog: (message: string, level?: LogLevel, source?: LogSource) => void;
}) {
  const { kind, subject, body, senderOk, senderEmail, pushLog } = props;
  const [nameQuery, setNameQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualBody, setManualBody] = useState("");

  const filtered = useMemo(() => {
    const nq = nameQuery.trim().toLowerCase();
    const cq = courseQuery.trim().toLowerCase();
    const dq = dateQuery.trim().toLowerCase();
    return SAMPLE_STUDENTS.filter((s) => {
      const full = `${s.firstName} ${s.lastName}`;
      if (nq) {
        const hit =
          full.toLowerCase().includes(nq) ||
          s.firstName.toLowerCase().includes(nq) ||
          s.lastName.toLowerCase().includes(nq);
        if (!hit) return false;
      }
      if (cq && !s.course.toLowerCase().includes(cq)) return false;
      const d = kind === "registration" ? s.enrollmentDate : s.certificationDate;
      if (dq && !d.toLowerCase().includes(dq)) return false;
      return true;
    });
  }, [nameQuery, courseQuery, dateQuery, kind]);

  const onlyId = filtered.length === 1 ? filtered[0].id : null;

  useEffect(() => {
    if (!onlyId) {
      setManualSubject("");
      setManualBody("");
      return;
    }
    const s = SAMPLE_STUDENTS.find((x) => x.id === onlyId);
    if (!s) return;
    setManualSubject(applyStudentTags(subject, s));
    setManualBody(applyStudentTags(body, s));
  }, [onlyId, subject, body]);

  const sendOne = () => {
    if (!senderOk) {
      pushLog("Set sender email under Credentials → Email before sending reminders.", "warn", "general");
      return;
    }
    if (filtered.length === 0) {
      pushLog("No students match the current filters — adjust name, course, or date.", "warn", "general");
      return;
    }
    if (filtered.length > 1) {
      pushLog(
        `${filtered.length} students match — narrow the filters until exactly one student remains, then try again.`,
        "warn",
        "general",
      );
      return;
    }
    const s = filtered[0];
    const subj = manualSubject.trim();
    const bod = manualBody;
    if (!subj) {
      pushLog("Add a subject in the manual preview below before sending.", "warn", "general");
      return;
    }
    const preview = subj.length > 48 ? `${subj.slice(0, 48)}…` : subj;
    pushLog(
      `${kind === "registration" ? "Registration" : "Expiration"} reminder preview created for ${s.email}. 
      Subject: "${preview}". Body length ${bod.length} chars. Mailer not connected; from ${senderEmail.trim()}.`,
      "info",
      "general",
    );
  };

  return (
    <section className="reminder-section">
      <h2 className="reminder-section-title">Send once</h2>
      <p className="muted" style={{ margin: "0 0 0.65rem" }}>
        Type to narrow by name, course, or date.
      </p>
      <div className="field-grid">
        <div className="field">
          <label>Filter by student name</label>
          <input
            className="input"
            type="text"
            autoComplete="off"
            placeholder="e.g. Jordan or Lee"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Filter by course</label>
          <input
            className="input"
            type="text"
            autoComplete="off"
            placeholder="e.g. ACLS or BLS"
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label>{kind === "registration" ? "Filter by enrollment date" : "Filter by certification date"}</label>
          <input
            className="input"
            type="text"
            autoComplete="off"
            placeholder={kind === "registration" ? "e.g. 2025-02" : "e.g. 2024-06"}
            value={dateQuery}
            onChange={(e) => setDateQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="reminder-manual-preview" style={{ marginTop: "0.85rem" }}>
        <h3 className="reminder-manual-preview-title">Outgoing message (filled)</h3>
        {onlyId ? (
          <p className="muted" style={{ margin: "0 0 0.65rem", fontSize: "0.82rem" }}>
            Tags from the template are replaced for{" "}
            <strong style={{ color: "var(--text)" }}>
              {filtered[0].firstName} {filtered[0].lastName}
            </strong>{" "}
            ({filtered[0].email}). You can change the text before sending.
          </p>
        ) : (
          <p className="muted" style={{ margin: "0 0 0.65rem", fontSize: "0.82rem" }}>
            Narrow filters until exactly one student matches to preview subject and body with names,
            course, dates, and other column values filled in.
          </p>
        )}
        <div className="field" style={{ marginBottom: "0.35rem" }}>
          <label>Subject</label>
          <input
            className="input"
            type="text"
            autoComplete="off"
            placeholder={onlyId ? "" : "—"}
            value={manualSubject}
            disabled={!onlyId}
            onChange={(e) => setManualSubject(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Body</label>
          <textarea
            className="input reminder-textarea"
            rows={8}
            placeholder={onlyId ? "" : "—"}
            value={manualBody}
            disabled={!onlyId}
            onChange={(e) => setManualBody(e.target.value)}
          />
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: "0.65rem" }}>
        <button type="button" className="btn btn-primary" onClick={sendOne}>
          Preview email
        </button>
      </div>
    </section>
  );
}

function RegistrationTabContent({
  r,
  patchReminder,
  trackCaret,
  insertTag,
  senderOk,
  senderEmail,
  pushLog,
}: {
  r: ReminderEmailSettings;
  patchReminder: (p: Partial<ReminderEmailSettings>) => void;
  trackCaret: (field: FieldKey) => (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  insertTag: (field: FieldKey, tag: string) => void;
  senderOk: boolean;
  senderEmail: string;
  pushLog: (message: string, level?: LogLevel, source?: LogSource) => void;
}) {
  return (
    <>
      <div className="reminder-callout">
        <strong style={{ color: "var(--text)" }}>Automatic sending:</strong> uses your sender address
        from Credentials. The trigger is a <strong style={{ color: "var(--text)" }}>new row</strong>{" "}
        detected on the <strong style={{ color: "var(--text)" }}>AHA spreadsheet</strong>.
      </div>

      <div className="checkbox-item" style={{ marginTop: "0.15rem" }}>
        <input
          id="reg-auto"
          type="checkbox"
          checked={r.registrationAutoEnabled}
          onChange={(e) => patchReminder({ registrationAutoEnabled: e.target.checked })}
        />
        <label htmlFor="reg-auto">Enable automatic registration reminders</label>
      </div>

      <section className="reminder-section">
        <h2 className="reminder-section-title">Email template</h2>
        <p className="muted" style={{ margin: "0 0 0.65rem" }}>
          These tags should match the columns in the AHA sheet. Click a tag to insert it at the cursor, or type tags such as{" "}
          <code className="reminder-code">{"{FirstName}"}</code> or <code className="reminder-code">{"{Group}"}</code>.
        </p>
        <div className="field" style={{ marginBottom: "0.35rem" }}>
          <label>Subject</label>
          <input
            className="input"
            value={r.registrationSubject}
            onChange={(e) => patchReminder({ registrationSubject: e.target.value })}
            onSelect={trackCaret("registrationSubject")}
            onKeyUp={trackCaret("registrationSubject")}
            onClick={trackCaret("registrationSubject")}
          />
        </div>
        <TagBar label="Insert into subject" tags={REGISTRATION_TAGS} field="registrationSubject" onInsert={insertTag} />
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label>Body</label>
          <textarea
            className="input reminder-textarea"
            rows={8}
            value={r.registrationBody}
            onChange={(e) => patchReminder({ registrationBody: e.target.value })}
            onSelect={trackCaret("registrationBody")}
            onKeyUp={trackCaret("registrationBody")}
            onClick={trackCaret("registrationBody")}
          />
        </div>
        <TagBar label="Insert into body" tags={REGISTRATION_TAGS} field="registrationBody" onInsert={insertTag} />
      </section>

      <ManualStudentSection
        kind="registration"
        subject={r.registrationSubject}
        body={r.registrationBody}
        senderOk={senderOk}
        senderEmail={senderEmail}
        pushLog={pushLog}
      />
    </>
  );
}

function ExpirationTabContent({
  r,
  patchReminder,
  trackCaret,
  insertTag,
  senderOk,
  senderEmail,
  pushLog,
}: {
  r: ReminderEmailSettings;
  patchReminder: (p: Partial<ReminderEmailSettings>) => void;
  trackCaret: (field: FieldKey) => (e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  insertTag: (field: FieldKey, tag: string) => void;
  senderOk: boolean;
  senderEmail: string;
  pushLog: (message: string, level?: LogLevel, source?: LogSource) => void;
}) {
  const months = r.expirationMonthsAfter; //keeps the expiration reminder month between 1 and 60
  const clampMonths = (n: number) => Math.min(60, Math.max(1, Math.round(n) || 1));

  return (
    <>
      <div className="reminder-callout">
        <strong style={{ color: "var(--text)" }}>Automatic sending:</strong> uses your sender address
        from Credentials. Set how many months after the relevant{" "}
        <strong style={{ color: "var(--text)" }}>date column in the RQI spreadsheet</strong> (for
        example <code className="reminder-code">{"{CertificationDate}"}</code>) each reminder should
        go out.
      </div>

      <div className="checkbox-item" style={{ marginTop: "0.15rem" }}>
        <input
          id="exp-auto"
          type="checkbox"
          checked={r.expirationAutoEnabled}
          onChange={(e) => patchReminder({ expirationAutoEnabled: e.target.checked })}
        />
        <label htmlFor="exp-auto">Enable automatic expiration reminders</label>
      </div>

      <div className="field-grid" style={{ marginTop: "0.35rem" }}>
        <div className="field">
          <label>Months after RQI sheet date to send</label>
          <input
            className="input"
            type="number"
            min={1}
            max={60}
            step={1}
            value={months}
            onChange={(e) => patchReminder({ expirationMonthsAfter: clampMonths(Number(e.target.value)) })}
          />
          <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.78rem" }}>
            Example: with <strong style={{ color: "var(--text)" }}>12</strong> months, a row whose
            anchor date is 2024-01-10 would target a send window around 2025-01-10.
          </p>
        </div>
      </div>

      <section className="reminder-section">
        <h2 className="reminder-section-title">Email template</h2>
        <p className="muted" style={{ margin: "0 0 0.65rem" }}>
          Use tags for column values from the RQI sheet.{" "}
        </p>
        <div className="field" style={{ marginBottom: "0.35rem" }}>
          <label>Subject</label>
          <input
            className="input"
            value={r.expirationSubject}
            onChange={(e) => patchReminder({ expirationSubject: e.target.value })}
            onSelect={trackCaret("expirationSubject")}
            onKeyUp={trackCaret("expirationSubject")}
            onClick={trackCaret("expirationSubject")}
          />
        </div>
        <TagBar label="Insert into subject" tags={EXPIRATION_TAGS} field="expirationSubject" onInsert={insertTag} />
        <div className="field" style={{ marginTop: "0.85rem" }}>
          <label>Body</label>
          <textarea
            className="input reminder-textarea"
            rows={8}
            value={r.expirationBody}
            onChange={(e) => patchReminder({ expirationBody: e.target.value })}
            onSelect={trackCaret("expirationBody")}
            onKeyUp={trackCaret("expirationBody")}
            onClick={trackCaret("expirationBody")}
          />
        </div>
        <TagBar label="Insert into body" tags={EXPIRATION_TAGS} field="expirationBody" onInsert={insertTag} />
      </section>

      <ManualStudentSection
        kind="expiration"
        subject={r.expirationSubject}
        body={r.expirationBody}
        senderOk={senderOk}
        senderEmail={senderEmail}
        pushLog={pushLog}
      />
    </>
  );
}
