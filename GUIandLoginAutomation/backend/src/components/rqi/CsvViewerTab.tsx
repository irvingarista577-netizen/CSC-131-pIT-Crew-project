import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useApp } from "../../context/AppContext";

export interface LoadedCsv {
  id: string;
  name: string;
  headers: string[];
  rows: Record<string, string>[];
}

//converts a selected CSV file into headers and rows for the preview table
function parseFile(file: File): Promise<LoadedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields?.filter(Boolean) as string[];
        const rows = (res.data as Record<string, string>[]).map((row) => {
          const o: Record<string, string> = {};
          for (const h of headers) o[h] = row[h] ?? "";
          return o;
        });
        resolve({
          id: `${file.name}-${file.lastModified}`,
          name: file.name,
          headers,
          rows,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export function CsvViewerTab() {
  const { pushLog } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
//keeps the original file objects so you can refresh the preview
  const sourcesRef = useRef<Map<string, File>>(new Map());
  const [list, setList] = useState<LoadedCsv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [sortCol, setSortCol] = useState<string>("");
  const [search, setSearch] = useState("");

  const active = list.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (!active) return;
    const next: Record<string, boolean> = {};
    for (const h of active.headers) next[h] = true;
    setVisible(next);
    setSortCol(active.headers[0] ?? "");
    setSearch("");
  }, [active?.id]);

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const parsed: LoadedCsv[] = [];
    for (const f of Array.from(files)) {
      if (!f.name.toLowerCase().endsWith(".csv")) {
        pushLog(`Skipped non-CSV file: ${f.name}`, "warn", "rqi");
        continue;
      }
      try {
        const loaded = await parseFile(f);
        sourcesRef.current.set(loaded.id, f);
        parsed.push(loaded);
      } catch (err) {
        pushLog(`Failed to parse ${f.name}: ${String(err)}`, "error", "rqi");
      }
    }
    if (parsed.length) {
      setList((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        for (const p of parsed) map.set(p.id, p);
        return Array.from(map.values());
      });
      setActiveId(parsed[parsed.length - 1].id);
      pushLog(`Loaded ${parsed.length} CSV file(s).`, "success", "rqi");
    }
    e.target.value = "";
  };

  const refreshList = useCallback(async () => {
    const entries = Array.from(sourcesRef.current.entries());
    if (!entries.length) {
      pushLog("No CSV files in session to refresh.", "warn", "rqi");
      return;
    }
    const byId = new Map<string, LoadedCsv>();
    for (const [, file] of entries) {
      try {
        const loaded = await parseFile(file);
        sourcesRef.current.set(loaded.id, file);
        byId.set(loaded.id, loaded);
      } catch (err) {
        pushLog(`Refresh failed for ${file.name}: ${String(err)}`, "error", "rqi");
      }
    }
    setList((prev) => prev.map((p) => byId.get(p.id) ?? p));
    pushLog("CSV list refreshed from disk picks.", "info", "rqi");
  }, [pushLog]);

  const toggleCol = (h: string) => {
    setVisible((v) => ({ ...v, [h]: !v[h] }));
  };

  const columns = useMemo(() => {
    if (!active) return [];
    return active.headers.filter((h) => visible[h] !== false);
  }, [active, visible]);

  const sortedRows = useMemo(() => {
    if (!active) return [];
    const q = search.trim().toLowerCase();
    let rows = active.rows;
    if (q) {
      rows = rows.filter((r) =>
        Object.values(r).some((cell) => cell.toLowerCase().includes(q)),
      );
    }
    if (sortCol && columns.includes(sortCol)) {
      rows = [...rows].sort((a, b) => String(a[sortCol]).localeCompare(String(b[sortCol]), undefined, {
        numeric: true,
        sensitivity: "base",
      }));
    }
    return rows;
  }, [active, search, sortCol, columns]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", minHeight: 0 }}>
      <div className="btn-row">
        <input ref={fileRef} type="file" accept=".csv" multiple hidden onChange={onPickFiles} />
        <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
          Browse CSV…
        </button>
        <button type="button" className="btn" onClick={refreshList}>
          Refresh CSV list
        </button>
      </div>

      {list.length > 0 ? (
        <div className="field">
          <label>Active file</label>
          <select
            className="select"
            value={activeId ?? ""}
            onChange={(e) => {
              setActiveId(e.target.value);
              setVisible({});
            }}
          >
            {list.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.rows.length} rows)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className="muted">Choose a CSV file to preview it here.</p>
      )}

      {active ? (
        <>
          <div>
            <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
              Visible columns
            </div>
            <div className="checkbox-grid">
              {active.headers.map((h) => (
                <label key={h} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={visible[h] !== false}
                    onChange={() => toggleCol(h)}
                  />
                  <span>{h || "(empty)"}</span>
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.75rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div className="field">
              <label>Sort by column</label>
              <select className="select" value={sortCol} onChange={(e) => setSortCol(e.target.value)}>
                {active.headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Search rows (any column)</label>
              <input
                className="input"
                placeholder="Type a word…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrap panel-scroll">
            <table className="data">
              <thead>
                <tr>
                  {columns.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((h) => (
                      <td key={h}>{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="muted">
            Showing {sortedRows.length} of {active.rows.length} rows
          </div>
        </>
      ) : null}
    </div>
  );
}
