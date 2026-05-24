import { useApp } from "../context/AppContext";

export function StatusCards() {
  const { statusCards } = useApp();
  return (
    <div className="status-strip status-strip--compact" role="region" aria-label="Status summary">
      {statusCards.map((c) => (
        <div key={c.id} className="status-card" title={c.hint}>
          <div className="status-card-label">{c.label}</div>
          <div className={`status-card-value trend-${c.trend ?? "neutral"}`}>{c.value}</div>
          {c.hint ? <div className="status-card-hint">{c.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}
