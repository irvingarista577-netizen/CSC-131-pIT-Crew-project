import { useState } from "react";
import { useApp } from "../../context/AppContext";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PageActions() {
  const {
    settings,
    saveSettings,
    refreshUploadWindow,
    pushLog,
    setUploadStatus,
    bumpStatusSample,
  } = useApp();
  const [busy, setBusy] = useState<null | "csv" | "sftp">(null);

//demo export for now
  const generateCsv = () => {
    setBusy("csv");
    window.setTimeout(() => {
      const name = settings.csvFileName || "export.csv";
      const header = ["id", "record_type", "status", "updated_at"];
      const rows = [
        ["1", "RQI", "pending", new Date().toISOString()],
        ["2", "RQI", "ready", new Date().toISOString()],
      ];
      const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
      downloadText(name, csv);
      pushLog(`Generated CSV “${name}” (${rows.length} rows).`, "success", "rqi");
      setUploadStatus({ currentCsvFile: name, lastUploadError: null });
      bumpStatusSample();
      setBusy(null);
    }, 400);
  };

//just a simulation because the backend is not working
  const uploadSftp = () => {
    if (!settings.sftp.host) {
      pushLog("SFTP host is not set.", "error", "sftp");
      return;
    }
    setBusy("sftp");
    window.setTimeout(() => {
      const ok = Math.random() > 0.15;
      const ts = new Date().toISOString();
      if (ok) {
        setUploadStatus({
          lastUploadTime: ts,
          lastUploadError: null,
        });
        pushLog(
          `Uploaded “${settings.sftp.remoteFileName}” to ${settings.sftp.host}:${settings.sftp.port}.`,
          "success",
          "sftp",
        );
      } else {
        const err = "Test SFTP error: permission denied on remote path.";
        setUploadStatus({ lastUploadError: err });
        pushLog(err, "error", "sftp");
      }
      bumpStatusSample();
      setBusy(null);
    }, 900);
  };

  return (
    <div className="page-actions">
      <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={generateCsv}>
        {busy === "csv" ? "Generating…" : "Generate CSV now"}
      </button>
      <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={uploadSftp}>
        {busy === "sftp" ? "Uploading…" : "Upload to SFTP now"}
      </button>
      <button type="button" className="btn" disabled={busy !== null} onClick={refreshUploadWindow}>
        Refresh upload window
      </button>
      <button type="button" className="btn" disabled={busy !== null} onClick={saveSettings}>
        Save settings
      </button>
    </div>
  );
}
