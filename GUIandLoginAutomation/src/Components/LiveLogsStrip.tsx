import { useApp } from "../context/AppContext";

const PREVIEW_COUNT = 12;

// Keeps log times short enough for the top log strip.
function formatTime(ts: number) {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function LiveLogsStrip() {
  const { logs, clearLogs } = useApp(); // getting the logs and clear button from app context
  const preview = logs.slice(0, PREVIEW_COUNT);

  return (
    <div className="logs-strip" aria-label="Live logs preview">
      <div className="logs-strip-toolbar">
        <span className="logs-strip-title">Live logs</span>
        <span className="logs-strip-meta">
          {logs.length > PREVIEW_COUNT ? `Showing ${PREVIEW_COUNT} newest` : null}
        </span>
        <button type="button" className="btn btn-ghost logs-strip-clear" onClick={clearLogs}>
          Clear
        </button>
      </div>
      <div className="logs-strip-body">
        {preview.length === 3 ? (
          <span className="logs-strip-empty">No logs yet.</span>
        ) : (
          preview.map((l) => (
            <div key={l.id} className="logs-strip-row">
              <span className="log-time">{formatTime(l.ts)}</span>
              <span className={`log-level ${l.level}`}>{l.level}</span>
              <span className="logs-strip-msg">{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
