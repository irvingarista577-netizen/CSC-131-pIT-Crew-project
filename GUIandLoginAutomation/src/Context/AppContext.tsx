import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type LogEntry,
  type LogLevel,
  type LogSource,
  type StatusCardData,
  type UploadStatus,
} from "../types";

const STORAGE_KEY = "automation-dashboard-settings-v1";

function isProbablyDomEvent(x: unknown): boolean {
  return typeof x === "object" && x !== null && "nativeEvent" in x;
}

//loads saved settings from localStorage or uses default settings if nothing is saved
function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      sftp: { ...DEFAULT_SETTINGS.sftp, ...parsed.sftp },
      reminderEmails: {
        ...DEFAULT_SETTINGS.reminderEmails,
        ...(parsed.reminderEmails ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

//formats the current CSV batch time window for the dashboard
function formatBatchWindow(batchMinutes: number, anchor: number): string {
  const start = new Date(anchor);
  const end = new Date(anchor + batchMinutes * 60_000);
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(start)} → ${fmt(end)}`;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

//temporary numbers for the dashboard
//i used these so the status cards can show changing values without the backend connected
function mockAhaNewStudents(sheetKey: string, pollTick: number): number {
  const h = hashString(`aha:${sheetKey}:${pollTick}`);
  return (h % 220) + 1;
}

function mockRqiEnrolled(sheetKey: string, pollTick: number): number {
  const h = hashString(`rqi:${sheetKey}:${pollTick}`);
  return (h % 480) + 12;
}

function mockQueue(pollTick: number): number {
  return ((pollTick * 7 + 11) % 14) + (pollTick % 2);
}

interface AppContextValue {
  settings: AppSettings;
  setSettings: (patch: Partial<AppSettings>) => void;
  replaceSettings: (next: AppSettings) => void;
  saveSettings: (patch?: Partial<AppSettings> | unknown) => void;
  uploadStatus: UploadStatus;
  setUploadStatus: (patch: Partial<UploadStatus>) => void;
  refreshUploadWindow: () => void;
  logs: LogEntry[];
  pushLog: (message: string, level?: LogLevel, source?: LogSource) => void;
  clearLogs: () => void;
  statusCards: StatusCardData[];
  bumpStatusSample: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let logSeq = 0;
function nextLogId() {
  logSeq += 1;
  return `log-${logSeq}-${Date.now()}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());
  const [uploadStatus, setUploadStatusState] = useState<UploadStatus>(() => {
    const s = loadSettings();
    const now = Date.now();
    const batchMs = s.batchMinutes * 60_000;
    return {
      currentBatchWindow: formatBatchWindow(s.batchMinutes, now),
      currentCsvFile: s.csvFileName,
      lastUploadTime: null,
      nextBatchAt: now + batchMs,
      lastUploadError: null,
    };
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pollTick, setPollTick] = useState(0);
  const batchAnchorRef = useRef(Date.now());
  const bootRef = useRef(false);

  const pushLog = useCallback((message: string, level: LogLevel = "info", source: LogSource = "general") => {
    setLogs((prev) => {
      const entry: LogEntry = {
        id: nextLogId(),
        ts: Date.now(),
        level,
        message,
        source,
      };
      const next = [entry, ...prev].slice(0, 500);
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

//updates only the settings that get changed instead of replacing everything
  const setSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const { sftp: patchSftp, reminderEmails: patchRem, ...rest } = patch;
      return {
        ...prev,
        ...rest,
        sftp: { ...prev.sftp, ...(patchSftp ?? {}) },
        reminderEmails: patchRem ? { ...prev.reminderEmails, ...patchRem } : prev.reminderEmails,
      };
    });
  }, []);

  const replaceSettings = useCallback((next: AppSettings) => {
    setSettingsState(next);
  }, []);

  const saveSettings = useCallback(
    (maybePatch?: Partial<AppSettings> | unknown) => {
      const patch =
        maybePatch !== undefined && !isProbablyDomEvent(maybePatch)
          ? (maybePatch as Partial<AppSettings>)
          : undefined;
      if (patch) {
        setSettingsState((prev) => {
          const { sftp: patchSftp, reminderEmails: patchRem, ...rest } = patch;
          const merged: AppSettings = {
            ...prev,
            ...rest,
            sftp: { ...prev.sftp, ...(patchSftp ?? {}) },
            reminderEmails: patchRem ? { ...prev.reminderEmails, ...patchRem } : prev.reminderEmails,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          pushLog("Settings saved to browser storage.", "success", "general");
          return merged;
        });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        pushLog("Settings saved to browser storage.", "success", "general");
      }
    },
    [settings, pushLog],
  );

  const setUploadStatus = useCallback((patch: Partial<UploadStatus>) => {
    setUploadStatusState((prev) => ({ ...prev, ...patch }));
  }, []);

  const refreshUploadWindow = useCallback(() => {
    const now = Date.now();
    batchAnchorRef.current = now;
    setUploadStatusState((prev) => ({
      ...prev,
      currentBatchWindow: formatBatchWindow(settings.batchMinutes, now),
      nextBatchAt: now + settings.batchMinutes * 60_000,
    }));
    pushLog("Upload batch window refreshed.", "info", "rqi");
  }, [settings.batchMinutes, pushLog]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setUploadStatusState((prev) => ({
        ...prev,
        currentBatchWindow: formatBatchWindow(settings.batchMinutes, batchAnchorRef.current),
        currentCsvFile: settings.csvFileName,
      }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [settings.batchMinutes, settings.csvFileName]);

  useEffect(() => {
    setUploadStatusState((prev) => ({
      ...prev,
      currentBatchWindow: formatBatchWindow(settings.batchMinutes, batchAnchorRef.current),
      nextBatchAt: Date.now() + settings.batchMinutes * 60_000,
    }));
  }, [settings.batchMinutes]);

  useEffect(() => {
    const id = window.setInterval(() => setPollTick((t) => t + 1), 120_000);
    return () => window.clearInterval(id);
  }, []);

  const bumpStatusSample = useCallback(() => setPollTick((t) => t + 1), []);

  const statusCards = useMemo<StatusCardData[]>(() => {
    const aha = settings.ahaSpreadsheetUrl.trim();
    const rqi = settings.rqiSpreadsheetUrl.trim();
    const errorCount = logs.filter((l) => l.level === "error").length;

    return [
      {
        id: "aha-new",
        label: "New students (AHA)",
        value: aha ? String(mockAhaNewStudents(aha, pollTick)) : "—",
        hint: aha
          ? "Sample AHA count until the sheet reader is added"
          : "Add the AHA spreadsheet link in Credentials",
        trend: "neutral",
      },
      {
        id: "rqi-enrolled",
        label: "Enrolled (RQI sheet)",
        value: rqi ? String(mockRqiEnrolled(rqi, pollTick)) : "—",
        hint: rqi
          ? "Sample RQI count until the sheet reader is added"
          : "Add the RQI spreadsheet link in Credentials",
        trend: "neutral",
      },
      {
        id: "queue",
        label: "Queue",
        value: String(mockQueue(pollTick)),
        hint: "Sample queue count for testing the dashboard",
        trend: "neutral",
      },
      {
        id: "errors",
        label: "Errors",
        value: String(errorCount),
        hint: "Session log entries at error level",
        trend: errorCount > 0 ? "down" : "neutral",
      },
    ];
  }, [pollTick, settings.ahaSpreadsheetUrl, settings.rqiSpreadsheetUrl, logs]);

  const value = useMemo<AppContextValue>(
    () => ({
      settings,
      setSettings,
      replaceSettings,
      saveSettings,
      uploadStatus,
      setUploadStatus,
      refreshUploadWindow,
      logs,
      pushLog,
      clearLogs,
      statusCards,
      bumpStatusSample,
    }),
    [
      settings,
      setSettings,
      replaceSettings,
      saveSettings,
      uploadStatus,
      setUploadStatus,
      refreshUploadWindow,
      logs,
      pushLog,
      clearLogs,
      statusCards,
      bumpStatusSample,
    ],
  );

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    pushLog("Dashboard opened.", "info", "general");
  }, [pushLog]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
