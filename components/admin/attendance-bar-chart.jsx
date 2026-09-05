// Sequential single-hue horizontal bar chart (magnitude comparison across
// subjects) — one hue, more-is-darker isn't needed at this length scale, so
// a flat primary fill is used. Track (muted) + fill (primary) rather than
// numeric axis ticks, since this is a short, self-contained list, not a
// dense plot. Direct-labeled per dataviz skill's "label selectively" rule —
// there's only one value per row, so labeling every row is the right call.
export function AttendanceBarChart({ data }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.label} title={`${row.label}: ${row.value}% (${row.count} records)`}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium">{row.label}</span>
            <span className="text-muted-foreground">{row.value}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${row.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
