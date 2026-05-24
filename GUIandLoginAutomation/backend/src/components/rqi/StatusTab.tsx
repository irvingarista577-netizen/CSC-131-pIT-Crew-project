import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";

//shows the countdown until next batch starts
function formatRemain(nextBatchAt: number | null) {
  if (nextBatchAt == null) return "—";
  const now = Date.now();
  const sec = Math.max(0, Math.floor((nextBatchAt - now) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function StatusTab() {
  const { uploadStatus, settings } = useApp();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="stat-grid">
      <div className="stat">
        <div className="stat-label">Current batch window</div>
        <div className="stat-value">{uploadStatus.currentBatchWindow}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Current CSV file</div>
        <div className="stat-value">{uploadStatus.currentCsvFile || settings.csvFileName}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Last upload time</div>
        <div className="stat-value">
          {uploadStatus.lastUploadTime
            ? new Date(uploadStatus.lastUploadTime).toLocaleString()
            : "—"}
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">Time remaining until next batch</div>
        <div className="stat-value">{formatRemain(uploadStatus.nextBatchAt)}</div>
      </div>
      <div className="stat" style={{ gridColumn: "1 / -1" }}>
        <div className="stat-label">Last upload error</div>
        <div
          className="stat-value"
          style={{ color: uploadStatus.lastUploadError ? "var(--error)" : undefined }}
        >
          {uploadStatus.lastUploadError ?? "None"}
        </div>
      </div>
    </div>
  );
}
