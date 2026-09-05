// Stacked column chart, 6 months. Pending/Approved/Rejected are status
// semantics (waiting / good / bad), not arbitrary categories, so they use
// the same status colors as the LeaveRequest badges elsewhere in the app
// (components/admin/leave-decision-buttons.jsx's Badge variants) rather
// than a generic categorical palette. A legend is always present for 2+
// series per the dataviz skill.
const STATUS_META = {
  APPROVED: { label: "Approved", color: "hsl(var(--chart-2))" },
  PENDING: { label: "Pending", color: "hsl(var(--muted-foreground))" },
  REJECTED: { label: "Rejected", color: "hsl(var(--destructive))" },
};
const STATUS_ORDER = ["APPROVED", "PENDING", "REJECTED"];
const CHART_HEIGHT = 140;

export function LeaveTrendChart({ months }) {
  const max = Math.max(1, ...months.map((m) => m.APPROVED + m.PENDING + m.REJECTED));

  return (
    <div>
      <div className="flex items-end gap-3" style={{ height: CHART_HEIGHT }}>
        {months.map((month) => {
          const total = month.APPROVED + month.PENDING + month.REJECTED;
          const barHeight = total === 0 ? 0 : Math.max(4, (total / max) * CHART_HEIGHT);
          return (
            <div key={month.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                style={{ height: barHeight }}
                title={`${month.label}: ${total} request${total === 1 ? "" : "s"}`}
              >
                {STATUS_ORDER.filter((status) => month[status] > 0).map((status, i) => (
                  <div
                    key={status}
                    style={{
                      height: `${(month[status] / total) * 100}%`,
                      background: STATUS_META[status].color,
                      borderTop: i === 0 ? undefined : "2px solid hsl(var(--card))",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{month.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: STATUS_META[status].color }} />
            {STATUS_META[status].label}
          </div>
        ))}
      </div>
    </div>
  );
}
