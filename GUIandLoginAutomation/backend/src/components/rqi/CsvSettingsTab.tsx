import { useApp } from "../../context/AppContext";

export function CsvSettingsTab() {
  const { settings, setSettings, pushLog } = useApp();

  const pickFolder = async () => {
    const picker = window.showDirectoryPicker;
    if (!picker) {
      pushLog("Folder picker not supported in this browser. Enter path manually.", "warn", "rqi");
      return;
    }
    try {
      const handle = await picker();
      setSettings({
        csvExportFolderDisplay: handle.name,
        csvExportFolder: handle.name,
      });
      pushLog(`Export folder set to “${handle.name}”.`, "success", "rqi");
    } catch {
    }
  };

  return (
    <div className="field-grid">
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label>CSV export folder</label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="e.g. D:\\exports\\rqi or browse"
            value={settings.csvExportFolder}
            onChange={(e) =>
              setSettings({
                csvExportFolder: e.target.value,
                csvExportFolderDisplay: e.target.value || "Not set",
              })
            }
          />
          <button type="button" className="btn" onClick={pickFolder}>
            Browse…
          </button>
        </div>
        <div className="muted" style={{ marginTop: "0.35rem" }}>
          Display: {settings.csvExportFolderDisplay}
        </div>
      </div>
      <div className="field">
        <label>CSV file name</label>
        <input
          className="input"
          value={settings.csvFileName}
          onChange={(e) => setSettings({ csvFileName: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Batch minutes</label>
        <input
          className="input"
          type="number"
          min={1}
          max={24 * 60}
          value={settings.batchMinutes}
          onChange={(e) => setSettings({ batchMinutes: Number(e.target.value) || 1 })}
        />
        <div className="muted" style={{ marginTop: "0.35rem" }}>
          How often a new upload batch should start.
        </div>
      </div>
    </div>
  );
}
