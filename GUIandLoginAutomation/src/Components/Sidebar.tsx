export type PageId = "rqi" | "credentials" | "liveLogs" | "reminders";

interface SidebarProps {
  current: PageId;
  onSelect: (id: PageId) => void;
}

//sidebar pages used by the dashboard
const items: { id: PageId; label: string }[] = [
  { id: "rqi", label: "RQI Upload Management" },
  { id: "credentials", label: "Credentials" },
  { id: "liveLogs", label: "Live logs" },
  { id: "reminders", label: "Reminder emails" },
];

export function Sidebar({ current, onSelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Automation</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${current === item.id ? " active" : ""}`}
            onClick={() => onSelect(item.id)} //changes page when a sidebar button is clicked
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
