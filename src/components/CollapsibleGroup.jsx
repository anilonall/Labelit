export function CollapsibleGroup({ title, subtitle = "", defaultOpen = false, children, compact = false }) {
  return (
    <details className={`collapsible-group ${compact ? "compact" : ""}`} open={defaultOpen}>
      <summary className="collapsible-summary">
        <div>
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        <span className="collapsible-caret" aria-hidden="true">▾</span>
      </summary>
      <div className="collapsible-body">{children}</div>
    </details>
  );
}
