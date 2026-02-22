export function ReportsPage() {
  return (
    <section className="card">
      <h2>Reports</h2>
      <p className="text-muted">Baseline reporting: energy, cost, carbon estimate, SLA summary, and availability by site/zone.</p>
      <div className="grid-3">
        <article className="kpi">
          <span className="text-muted">Energy (30d)</span>
          <strong>182 MWh</strong>
        </article>
        <article className="kpi">
          <span className="text-muted">Estimated Cost</span>
          <strong>£38,420</strong>
        </article>
        <article className="kpi">
          <span className="text-muted">Availability</span>
          <strong>98.1%</strong>
        </article>
      </div>
    </section>
  );
}
