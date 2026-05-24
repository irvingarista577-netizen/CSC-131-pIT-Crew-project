import { useApp } from "../../context/AppContext";

export function SftpSettingsTab() {
  const { settings, setSettings } = useApp();
  const s = settings.sftp;

//updates one SFTP field without replacing the whole settings object
  const patch = (p: Partial<typeof s>) => setSettings({ sftp: { ...s, ...p } });

  return (
    <div className="field-grid">
      <div className="field">
        <label>Host name</label>
        <input className="input" value={s.host} onChange={(e) => patch({ host: e.target.value })} />
      </div>
      <div className="field">
        <label>Port</label>
        <input className="input" value={s.port} onChange={(e) => patch({ port: e.target.value })} />
      </div>
      <div className="field">
        <label>Username</label>
        <input
          className="input"
          value={s.username}
          onChange={(e) => patch({ username: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Password</label>
        <input
          className="input"
          type="password"
          autoComplete="new-password"
          value={s.password}
          onChange={(e) => patch({ password: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Remote file path</label>
        <input
          className="input"
          value={s.remoteFilePath}
          onChange={(e) => patch({ remoteFilePath: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Remote file name</label>
        <input
          className="input"
          value={s.remoteFileName}
          onChange={(e) => patch({ remoteFileName: e.target.value })}
        />
      </div>
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label>Remote file type</label>
        <input
          className="input"
          value={s.remoteFileType}
          onChange={(e) => patch({ remoteFileType: e.target.value })}
          placeholder="csv, txt, …"
        />
      </div>
    </div>
  );
}
