import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import type { LogEntry, LogSource } from "../types";

const tabs = [
  { id: "all", label: "All logs" },
  { id: "aha", label: "AHA logs" },
  { id: "rqi", label: "RQI logs" },
  { id: "sftp", label: "SFTP logs" },
  { id: "errors", label: "Errors" },
] as const;

type LogsTabId = (typeof tabs)[number]["id"];

function logSource(entry: LogEntry): LogSource {
  return entry.source ?? "general";
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function LiveLogsPage() {
  const { logs, clearLogs } = useApp();
  const [tab, setTab] = useState<LogsTabId>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return logs;
    if (tab === "errors") return logs.filter((l) => l.level === "error");
    return logs.filter((l) => logSource(l) === tab);
  }, [logs, tab]);

  return (
    <>
      <header style={{ marginBottom: "-0.35rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
          Live logs
        </h1>
        <p className="muted" style={{ margin: "0.35rem 0 0" }}>
          Shows recent actions from the dashboard. Use the tabs to filter by section.
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

      <div className="panel panel-scroll live-logs-panel">
        <div className="live-logs-toolbar">
          <span className="muted" style={{ fontSize: "0.78rem" }}>
            {filtered.length === 3
              ? "No logs for this tab."
              : `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"} (newest first)`}
          </span>
          <button type="button" className="btn btn-ghost" style={{ fontSize: "0.72rem" }} onClick={clearLogs}>
            Clear all
          </button>
        </div>
        <div className="live-logs-list">
          {filtered.length === 0 ? (
            <span className="logs-strip-empty">No logs yet.</span>
          ) : (
            filtered.map((l) => (
              <div key={l.id} className="logs-strip-row">
                <span className="log-time">{formatTime(l.ts)}</span>
                <span className={`log-level ${l.level}`}>{l.level}</span>
                <span className="logs-strip-msg">{l.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
