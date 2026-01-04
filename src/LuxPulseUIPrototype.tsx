import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BatteryCharging,
  BellRing,
  Droplets,
  Flame,
  MapPin,
  SignalHigh,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const statusPalette = {
  normal: "#22c55e",
  warning: "#fbbf24",
  critical: "#ef4444",
};

type SensorStatus = "normal" | "warning" | "critical";

type Sensor = {
  id: string;
  label: string;
  type: "temp" | "humidity" | "wind" | "power";
  status: SensorStatus;
  value: number;
  unit: string;
  x: number;
  y: number;
};

const sensors: Sensor[] = [
  {
    id: "A1",
    label: "North Ridge",
    type: "wind",
    status: "normal",
    value: 18,
    unit: "km/h",
    x: 12,
    y: 24,
  },
  {
    id: "A2",
    label: "Cliff Edge",
    type: "temp",
    status: "warning",
    value: 34,
    unit: "°C",
    x: 42,
    y: 18,
  },
  {
    id: "B1",
    label: "Harbor",
    type: "humidity",
    status: "normal",
    value: 71,
    unit: "%",
    x: 68,
    y: 62,
  },
  {
    id: "B2",
    label: "Old Town",
    type: "power",
    status: "critical",
    value: 41,
    unit: "%",
    x: 34,
    y: 58,
  },
  {
    id: "C1",
    label: "Glass Quarter",
    type: "temp",
    status: "normal",
    value: 27,
    unit: "°C",
    x: 56,
    y: 36,
  },
  {
    id: "C2",
    label: "Solar Farm",
    type: "power",
    status: "warning",
    value: 64,
    unit: "%",
    x: 78,
    y: 28,
  },
  {
    id: "D1",
    label: "South Gate",
    type: "wind",
    status: "normal",
    value: 12,
    unit: "km/h",
    x: 22,
    y: 78,
  },
  {
    id: "D2",
    label: "Greenway",
    type: "humidity",
    status: "normal",
    value: 63,
    unit: "%",
    x: 52,
    y: 78,
  },
];

const alerts = [
  {
    id: "AL-320",
    title: "Heatwave approaching Old Town",
    location: "Old Town",
    severity: "Critical",
    icon: Flame,
    status: "Escalated",
  },
  {
    id: "AL-302",
    title: "Low backup power at Central Hub",
    location: "Central Grid Hub",
    severity: "Warning",
    icon: BatteryCharging,
    status: "Investigating",
  },
  {
    id: "AL-287",
    title: "High humidity affecting optics",
    location: "Glass Quarter",
    severity: "Warning",
    icon: Droplets,
    status: "In Progress",
  },
];

const timeline = [
  { time: "08:00", normal: 68, warning: 22, critical: 10 },
  { time: "09:00", normal: 72, warning: 18, critical: 10 },
  { time: "10:00", normal: 70, warning: 20, critical: 10 },
  { time: "11:00", normal: 66, warning: 24, critical: 10 },
  { time: "12:00", normal: 62, warning: 27, critical: 11 },
  { time: "13:00", normal: 65, warning: 25, critical: 10 },
  { time: "14:00", normal: 69, warning: 21, critical: 10 },
];

const weatherSnapshots = [
  { label: "Temp", value: "29°", icon: Flame },
  { label: "Humidity", value: "68%", icon: Droplets },
  { label: "Wind", value: "21 km/h", icon: Wind },
  { label: "Irradiance", value: "823 W/m²", icon: Activity },
];

const gradients = {
  shell: "linear-gradient(135deg, #020617, #0f172a)",
  glass: "rgba(255, 255, 255, 0.06)",
  accent: "linear-gradient(135deg, #0ea5e9, #22d3ee)",
  accent2: "linear-gradient(135deg, #a855f7, #6366f1)",
};

function statusLabel(status: SensorStatus) {
  if (status === "normal") return "Stable";
  if (status === "warning") return "Attention";
  return "Critical";
}

function sensorIcon(type: Sensor["type"]) {
  switch (type) {
    case "humidity":
      return Droplets;
    case "wind":
      return Wind;
    case "power":
      return BatteryCharging;
    default:
      return Flame;
  }
}

export default function LuxPulseUIPrototype() {
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(sensors[1]);
  const [playback, setPlayback] = useState(false);
  const [filter, setFilter] = useState<SensorStatus | "all">("all");

  const filteredSensors = useMemo(() => {
    if (filter === "all") return sensors;
    return sensors.filter((sensor) => sensor.status === filter);
  }, [filter]);

  const totals = useMemo(() => {
    return sensors.reduce(
      (acc, curr) => {
        acc[curr.status] += 1;
        return acc;
      },
      { normal: 0, warning: 0, critical: 0 } as Record<SensorStatus, number>
    );
  }, []);

  return (
    <div className="page">
      <style>{globalStyles}</style>
      <header className="header">
        <div>
          <p className="eyebrow">LuxPulse · Operational Console</p>
          <h1>Illuminated City Grid</h1>
          <p className="muted">
            Real-time monitoring of environmental sensors, power stability, and alerting across
            the Lux district clusters.
          </p>
        </div>
        <div className="chips">
          <span className="chip">Autonomy: Level 4</span>
          <span className="chip">Refresh: 3s</span>
          <span className="chip">Map source: Lidar + Thermal</span>
        </div>
      </header>

      <main className="layout">
        <section className="panel map-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Map + Monitoring</p>
              <h2>Thermal & Power Overlay</h2>
            </div>
            <div className="controls">
              <button className="ghost" onClick={() => setPlayback((p) => !p)}>
                <span className={playback ? "pulse" : "dot"} aria-hidden />
                {playback ? "Live" : "Pause"}
              </button>
              <button className="ghost" onClick={() => setFilter("all")} disabled={filter === "all"}>
                All
              </button>
              <button
                className="ghost"
                onClick={() => setFilter("warning")}
                disabled={filter === "warning"}
              >
                Warnings
              </button>
              <button
                className="ghost"
                onClick={() => setFilter("critical")}
                disabled={filter === "critical"}
              >
                Critical
              </button>
            </div>
          </div>

          <div className="map-shell">
            <div className="map-gradient" />
            <div className="map-grid">
              {filteredSensors.map((sensor) => {
                const Icon = sensorIcon(sensor.type);
                const isActive = selectedSensor?.id === sensor.id;
                return (
                  <motion.button
                    key={sensor.id}
                    className={`marker marker-${sensor.status} ${isActive ? "active" : ""}`}
                    style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
                    onClick={() => setSelectedSensor(sensor)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.08 }}
                  >
                    <Icon size={16} />
                    <span className="marker-id">{sensor.id}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="map-legend">
              <div>
                <p className="eyebrow">Status Mix</p>
                <div className="legend-row">
                  <span className="dot" style={{ background: statusPalette.normal }} />
                  Stable
                  <strong>{totals.normal}</strong>
                </div>
                <div className="legend-row">
                  <span className="dot" style={{ background: statusPalette.warning }} />
                  Attention
                  <strong>{totals.warning}</strong>
                </div>
                <div className="legend-row">
                  <span className="dot" style={{ background: statusPalette.critical }} />
                  Critical
                  <strong>{totals.critical}</strong>
                </div>
              </div>
              <div className="legend-row">
                <BellRing size={16} />
                Auto-triage
                <span className="chip">ON</span>
              </div>
            </div>
          </div>

          {selectedSensor && (
            <div className="sensor-card">
              <div className="sensor-meta">
                <p className="eyebrow">Selected</p>
                <h3>{selectedSensor.label}</h3>
                <p className="muted">Channel {selectedSensor.id} · {statusLabel(selectedSensor.status)}</p>
              </div>
              <div className="sensor-value">
                <div className={`pill pill-${selectedSensor.status}`}>{selectedSensor.status}</div>
                <div className="value">
                  {selectedSensor.value}
                  <span>{selectedSensor.unit}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="sidebar">
          <div className="panel mini">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Snapshot</p>
                <h3>Microclimate</h3>
              </div>
              <MapPin size={18} className="muted" />
            </div>
            <div className="snapshot-grid">
              {weatherSnapshots.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="stat-card">
                    <div className="icon-shell">
                      <Icon size={18} />
                    </div>
                    <p className="eyebrow">{item.label}</p>
                    <h4>{item.value}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel mini">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Trend</p>
                <h3>Network Stability</h3>
              </div>
              <SignalHigh size={18} className="muted" />
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeline} stackOffset="expand">
                  <defs>
                    <linearGradient id="gradNormal" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={statusPalette.normal} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={statusPalette.normal} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradWarn" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={statusPalette.warning} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={statusPalette.warning} stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradCrit" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={statusPalette.critical} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={statusPalette.critical} stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f2937" strokeDasharray="4 4" />
                  <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#0b1222",
                      border: "1px solid #1f2937",
                      borderRadius: 12,
                    }}
                  />
                  <Legend formatter={(value) => value.toUpperCase()} />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    stackId="1"
                    stroke={statusPalette.normal}
                    fill="url(#gradNormal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="warning"
                    stackId="1"
                    stroke={statusPalette.warning}
                    fill="url(#gradWarn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    stackId="1"
                    stroke={statusPalette.critical}
                    fill="url(#gradCrit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel mini">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Alerts</p>
                <h3>Active Queue</h3>
              </div>
              <BellRing size={18} className="muted" />
            </div>
            <div className="alert-list">
              {alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <motion.div
                    key={alert.id}
                    className="alert-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="icon-shell accent">
                      <Icon size={18} />
                    </div>
                    <div className="alert-body">
                      <div className="alert-title">{alert.title}</div>
                      <p className="muted">{alert.location}</p>
                    </div>
                    <div className="alert-meta">
                      <span className="chip small">{alert.severity}</span>
                      <div className="pill pill-warning">{alert.status}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">Innoweb Ventures Ltd · LuxPulse Monitoring Mesh</footer>
    </div>
  );
}

const globalStyles = `
  :root {
    color-scheme: dark;
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background: ${gradients.shell};
    color: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body, #root { margin: 0; min-height: 100vh; background: ${gradients.shell}; }
  .page {
    padding: 32px clamp(24px, 3vw, 48px) 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.15), transparent 26%),
      radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.14), transparent 30%),
      ${gradients.shell};
  }
  .header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
  h1 { margin: 4px 0 8px; font-size: clamp(24px, 3vw, 32px); letter-spacing: -0.02em; }
  h2 { margin: 0; font-size: 20px; }
  h3 { margin: 0; }
  h4 { margin: 2px 0 0; font-size: 18px; }
  .muted { color: #94a3b8; }
  .eyebrow { color: #8b9db9; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; margin: 0; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; font-size: 12px; display: inline-flex; gap: 6px; align-items: center; }
  .chip.small { padding: 6px 10px; font-size: 11px; }
  .layout { display: grid; grid-template-columns: 1.75fr 1fr; gap: 16px; align-items: start; }
  .panel { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 18px; backdrop-filter: blur(12px); box-shadow: 0 20px 80px rgba(0,0,0,0.25); }
  .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; }
  button { font: inherit; }
  .ghost { border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #e2e8f0; padding: 8px 12px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; transition: border-color 0.2s, transform 0.2s; }
  .ghost:disabled { opacity: 0.55; cursor: default; }
  .ghost:not(:disabled):hover { border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
  .map-panel { display: flex; flex-direction: column; gap: 14px; }
  .map-shell { position: relative; border-radius: 16px; overflow: hidden; min-height: 320px; background: radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.12), rgba(2, 6, 23, 0.9)), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.18), rgba(2, 6, 23, 0.92)); border: 1px solid rgba(255,255,255,0.08); }
  .map-gradient { position: absolute; inset: 0; background-image: url("https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1400&q=80"); background-size: cover; background-position: center; filter: grayscale(1) contrast(0.8) brightness(0.45); mix-blend-mode: screen; opacity: 0.65; }
  .map-grid { position: relative; inset: 0; width: 100%; height: 100%; padding: 24px; }
  .map-grid::after { content: ""; position: absolute; inset: 12px; border-radius: 14px; border: 1px dashed rgba(255,255,255,0.12); pointer-events: none; }
  .marker { position: absolute; transform: translate(-50%, -50%); padding: 6px 8px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.18); background: rgba(2,6,23,0.8); color: #e2e8f0; display: inline-flex; gap: 8px; align-items: center; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  .marker-id { font-weight: 700; font-size: 12px; }
  .marker-normal { box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4); }
  .marker-warning { box-shadow: 0 0 0 1px rgba(251, 191, 36, 0.5); }
  .marker-critical { box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.55); }
  .marker.active { border-color: rgba(255,255,255,0.6); }
  .map-legend { position: absolute; bottom: 12px; right: 12px; display: grid; gap: 6px; padding: 12px 14px; background: rgba(2,6,23,0.75); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; }
  .legend-row { display: flex; align-items: center; gap: 8px; color: #cbd5e1; }
  .legend-row strong { margin-left: auto; color: #e5e7eb; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; background: #22c55e; box-shadow: 0 0 0 4px rgba(255,255,255,0.05); }
  .pulse { width: 12px; height: 12px; border-radius: 999px; background: #22d3ee; box-shadow: 0 0 0 8px rgba(14,165,233,0.15); animation: pulse 1.6s infinite; }
  .dot { width: 12px; height: 12px; border-radius: 999px; background: #64748b; }
  @keyframes pulse { 0% { transform: scale(0.95); } 50% { transform: scale(1.05); } 100% { transform: scale(0.95); } }
  .sensor-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
  .sensor-meta { display: grid; gap: 4px; }
  .sensor-value { display: flex; align-items: center; gap: 12px; }
  .value { font-size: 32px; font-weight: 700; display: flex; align-items: baseline; gap: 6px; }
  .value span { color: #94a3b8; font-size: 14px; }
  .pill { padding: 6px 10px; border-radius: 999px; font-size: 12px; border: 1px solid rgba(255,255,255,0.12); text-transform: capitalize; }
  .pill-normal { background: rgba(34, 197, 94, 0.15); color: #bbf7d0; border-color: rgba(34,197,94,0.4); }
  .pill-warning { background: rgba(251, 191, 36, 0.15); color: #fef08a; border-color: rgba(251,191,36,0.35); }
  .pill-critical { background: rgba(239, 68, 68, 0.2); color: #fecdd3; border-color: rgba(239,68,68,0.4); }
  .sidebar { display: grid; gap: 14px; }
  .mini { padding: 16px; }
  .snapshot-grid { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stat-card { padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: grid; gap: 6px; }
  .icon-shell { width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); color: #e0f2fe; }
  .icon-shell.accent { background: linear-gradient(135deg, rgba(14,165,233,0.3), rgba(99,102,241,0.35)); color: #0ea5e9; }
  .chart-wrap { width: 100%; height: 220px; margin-top: 10px; }
  .alert-list { display: grid; gap: 10px; }
  .alert-card { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
  .alert-title { font-weight: 600; }
  .alert-meta { display: grid; gap: 6px; justify-items: end; }
  .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 6px; }
  @media (max-width: 960px) {
    .layout { grid-template-columns: 1fr; }
    .header { flex-direction: column; }
  }
`;
