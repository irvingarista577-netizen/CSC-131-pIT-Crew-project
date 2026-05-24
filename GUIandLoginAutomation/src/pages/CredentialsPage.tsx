import { useState } from "react";
import { AHA_ATLAS_URL } from "../constants/aha";
import { useApp } from "../context/AppContext";

const SIGNED_IN_LOCAL = "Signed in (saved locally)";

const tabs = [
  { id: "aha", label: "AHA login" },
  { id: "email", label: "Email" },
  { id: "spreadsheets", label: "Spreadsheets" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function CredentialsPage() {
  const { settings, setSettings, saveSettings, pushLog } = useApp();
  const [tab, setTab] = useState<TabId>("aha");

//sends saved AHA login credentials to the backend
//the backend runs the playwright automation script
  const signInAha = async () => {
  const username = settings.ahaUsername.trim();
  const password = settings.ahaPassword;

  if (!username || !password) {
    saveSettings({ ahaLoginStatus: "Missing username or password" });
    pushLog("AHA username or password is missing.", "error", "aha");
    return;
  }

  saveSettings({ ahaLoginStatus: "Signing in..." });
  pushLog("Starting AHA login automation.", "info", "aha");

  try {
    const response = await fetch("http://localhost:5000/api/aha/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    saveSettings({
      ahaLoginStatus: data.signedIn ? "Signed in" : "Login failed",
    });

    pushLog(data.message, data.signedIn ? "success" : "error", "aha");
  } catch (error) {
    saveSettings({ ahaLoginStatus: "Login error" });
    pushLog("Could not connect to AHA backend.", "error", "aha");
  }
};

  const signOutAha = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/aha/signout", {
      method: "POST",
    });

    const data = await response.json();

    saveSettings({
      ahaUsername: "",
      ahaPassword: "",
      ahaLoginStatus: data.message || "Signed out",
    });

      pushLog("Signed out of AHA and cleared saved session.", "info", "aha");
    } catch (error) {
      saveSettings({ ahaLoginStatus: "Sign out error" });
      pushLog("Could not connect to AHA backend for sign out.", "error", "aha");
    }
  };

  return (
    <>
      <header style={{ marginBottom: "-0.35rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Credentials
        </h1>
        <p className="muted" style={{ margin: "0.35rem 0 0" }}>
          Add the AHA login info, email addresses, and spreadsheet links used by the dashboard.
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
        {tab === "aha" ? (
          <div className="field-grid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>AHA login status</label>
              <input className="input" readOnly value={settings.ahaLoginStatus} aria-live="polite" />
            </div>
            <div className="field">
              <label>AHA username</label>
              <input
                className="input"
                autoComplete="username"
                value={settings.ahaUsername}
                onChange={(e) => setSettings({ ahaUsername: e.target.value })}
              />
            </div>
            <div className="field">
              <label>AHA password</label>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={settings.ahaPassword}
                onChange={(e) => setSettings({ ahaPassword: e.target.value })}
              />
            </div>
            <p className="muted" style={{ gridColumn: "1 / -1", margin: 0 }}>
              Use this section to save the AHA credentials{" "}
              <a href={AHA_ATLAS_URL} target="_blank" rel="noopener noreferrer">
                AHA Atlas
              </a>{" "}
              The sign out button clears the saved values in this dashboard.
            </p>
            <div className="field btn-row" style={{ gridColumn: "1 / -1" }}>
              <button type="button" className="btn btn-primary" onClick={() => signInAha()}>
                Sign in
              </button>
              <button type="button" className="btn" onClick={signOutAha}>
                Sign out
              </button>
            </div>
          </div>
        ) : null}

        {tab === "email" ? (
          <div className="field-grid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Sender email address</label>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="noreply@example.com"
                value={settings.senderEmail}
                onChange={(e) => setSettings({ senderEmail: e.target.value })}
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Email for AHA parsing</label>
              <input
                className="input"
                type="email"
                placeholder="inbox used to receive AHA notifications"
                value={settings.emailForAhaParsing}
                onChange={(e) => setSettings({ emailForAhaParsing: e.target.value })}
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>Email for RQI parsing</label>
              <input
                className="input"
                type="email"
                placeholder="inbox used to receive RQI notifications"
                value={settings.emailForRqiParsing}
                onChange={(e) => setSettings({ emailForRqiParsing: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        {tab === "spreadsheets" ? (
          <div className="field-grid">
            <p className="muted" style={{ gridColumn: "1 / -1", margin: "0 0 0.5rem" }}>
              Paste the Google Sheet links here. For now, the cards use sample counts until the
              sheet connection is finished.
            </p>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>AHA spreadsheet (new students)</label>
              <input
                className="input"
                placeholder="https://docs.google.com/spreadsheets/d/… or spreadsheet ID"
                value={settings.ahaSpreadsheetUrl}
                onChange={(e) => setSettings({ ahaSpreadsheetUrl: e.target.value })}
              />
            </div>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label>RQI spreadsheet (enrolled / new student rows)</label>
              <input
                className="input"
                placeholder="https://docs.google.com/spreadsheets/d/… or spreadsheet ID"
                value={settings.rqiSpreadsheetUrl}
                onChange={(e) => setSettings({ rqiSpreadsheetUrl: e.target.value })}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="page-actions" style={{ borderTop: "none", paddingTop: "0.5rem" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            const u = settings.ahaUsername.trim();
            const p = settings.ahaPassword;
            const nextStatus = !u ? "Signed out" : p ? SIGNED_IN_LOCAL : "Signed out";
            const firstTimeSignedIn =
              Boolean(u && p && nextStatus === SIGNED_IN_LOCAL && settings.ahaLoginStatus !== SIGNED_IN_LOCAL);
            saveSettings({ ahaLoginStatus: nextStatus });
            if (firstTimeSignedIn) {
              signInAha();
              pushLog(
                "Opened AHA Atlas in a new tab.",
                "info",
                "aha",
              );
            }
          }}
        >
          Save settings
        </button>
      </div>
    </>
  );
}
