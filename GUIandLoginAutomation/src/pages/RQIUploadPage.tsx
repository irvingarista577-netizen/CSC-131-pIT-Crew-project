import { useState } from "react";
import { StatusTab } from "../components/rqi/StatusTab";
import { CsvViewerTab } from "../components/rqi/CsvViewerTab";
import { CsvSettingsTab } from "../components/rqi/CsvSettingsTab";
import { SftpSettingsTab } from "../components/rqi/SftpSettingsTab";
import { PageActions } from "../components/rqi/PageActions";

const tabs = [
  { id: "status", label: "Status" },
  { id: "csv", label: "CSV viewer" },
  { id: "csvset", label: "CSV settings" },
  { id: "sftp", label: "SFTP settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function RQIUploadPage() {
  const [tab, setTab] = useState<TabId>("status");

  return (
    <>
      <header style={{ marginBottom: "-0.35rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          RQI upload management
        </h1>
        <p className="muted" style={{ margin: "0.35rem 0 0" }}>
          View upload status, check CSV files, and update the SFTP settings.
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
        {tab === "status" ? <StatusTab /> : null}
        {tab === "csv" ? <CsvViewerTab /> : null}
        {tab === "csvset" ? <CsvSettingsTab /> : null}
        {tab === "sftp" ? <SftpSettingsTab /> : null}
      </div>

      <PageActions />
    </>
  );
}
