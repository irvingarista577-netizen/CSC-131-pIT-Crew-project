import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { Sidebar, type PageId } from "./components/Sidebar";
import { StatusCards } from "./components/StatusCards";
import { LiveLogsStrip } from "./components/LiveLogsStrip";
import { RQIUploadPage } from "./pages/RQIUploadPage";
import { CredentialsPage } from "./pages/CredentialsPage";
import { LiveLogsPage } from "./pages/LiveLogsPage";
import { ReminderEmailsPage } from "./pages/ReminderEmailsPage";

//main layout for the dashboard pages
function Shell() {
  const [page, setPage] = useState<PageId>("rqi");

  return (
    <div className="app-shell">
      <div className="main-column">
        <div className="main-top-bar">
          <div className="main-top-bar-status">
            <StatusCards />
          </div>
          <div className="main-top-bar-logs">
            <LiveLogsStrip />
          </div>
        </div>
        <div className="main-body">
          <Sidebar current={page} onSelect={setPage} />
          <div className="page-wrap">
            {page === "rqi" ? <RQIUploadPage /> : null}
            {page === "credentials" ? <CredentialsPage /> : null}
            {page === "liveLogs" ? <LiveLogsPage /> : null}
            {page === "reminders" ? <ReminderEmailsPage /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
