import { useState } from 'react';

type EvidencePackItem = {
  id: string;
  period: string;
  status: 'queued' | 'ready';
};

const initialPacks: EvidencePackItem[] = [
  { id: 'evp-1104', period: '2026-02-01..2026-02-07', status: 'ready' },
  { id: 'evp-1105', period: '2026-02-08..2026-02-14', status: 'ready' },
];

export function EvidencePacksPage() {
  const [packs, setPacks] = useState(initialPacks);
  const [siteId, setSiteId] = useState('site-london-west');
  const [startDate, setStartDate] = useState('2026-02-15');
  const [endDate, setEndDate] = useState('2026-02-22');

  function createPack() {
    setPacks((prev) => [
      {
        id: `evp-${1100 + prev.length + 1}`,
        period: `${startDate}..${endDate}`,
        status: 'queued',
      },
      ...prev,
    ]);
  }

  return (
    <section className="card">
      <h2>Evidence Packs</h2>
      <p className="text-muted">
        Export bundles include manifest index, asset registry snapshot, config snapshots, overrides log, fault summary, and KPI outputs.
      </p>

      <div className="grid-3">
        <label className="field">
          Site
          <input value={siteId} onChange={(event) => setSiteId(event.target.value)} />
        </label>
        <label className="field">
          Start
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label className="field">
          End
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
      </div>

      <button className="btn-primary" onClick={createPack}>
        Generate Evidence Pack
      </button>

      <table className="table">
        <thead>
          <tr>
            <th>Pack ID</th>
            <th>Site</th>
            <th>Period</th>
            <th>Status</th>
            <th>Artifact</th>
          </tr>
        </thead>
        <tbody>
          {packs.map((pack) => (
            <tr key={pack.id}>
              <td>{pack.id}</td>
              <td>{siteId}</td>
              <td>{pack.period}</td>
              <td>{pack.status}</td>
              <td>{pack.status === 'ready' ? 'Download ZIP' : 'Building...'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
