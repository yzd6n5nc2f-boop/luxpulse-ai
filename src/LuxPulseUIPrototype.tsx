import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  LineChart as LineChartIcon,
  FileText,
  Activity,
  Search,
  Menu,
  X,
  Bell,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  SlidersHorizontal,
  Zap,
  Leaf,
  Clock,
  Filter,
  Download,
  Power,
  Thermometer,
  Wifi,
  Signal,
  Layers,
  ArrowRight,
  Play
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";

type Tenant = { id: string; name: string };
type Site = { id: string; name: string; address?: string; lat: number; lng: number };
type Zone = { id: string; siteId: string; name: string; kind?: string };
type Asset = {
  id: string;
  assetTag: string;
  name?: string;
  siteId: string;
  zoneId: string;
  type: string;
  make: string;
  model: string;
  dimmable: boolean;
  powerRatingW: number;
  protocol: "DALI-2" | "Zhaga-D4i" | "BACnet" | "Modbus" | "Zigbee" | "LoRaWAN" | "VendorAPI";
  installDateISO: string;
};
type Telemetry = {
  assetId: string;
  tsISO: string;
  powerW: number;
  energyTodayKWh: number;
  dimLevelPct: number;
  tempC: number;
  rssi: number;
  lastSeenISO: string;
};
type Event = {
  id: string;
  assetId: string;
  tsISO: string;
  severity: "OK" | "WARN" | "CRITICAL" | "OFFLINE";
  code: string;
  message: string;
  cleared?: boolean;
};
type ControlAction = {
  id: string;
  tsISO: string;
  actor: string;
  siteId: string;
  zoneId?: string;
  assetId?: string;
  actionType: "SET_DIM" | "APPLY_SCHEDULE" | "OVERRIDE" | "CLEAR_FAULT";
  before: any;
  after: any;
  justification: string;
  correlationId?: string;
};

type DailyStat = { date: string; siteId: string; energy: number; faults: number; availability: number };

const theme = {
  colors: {
    bg: "#0f172a",
    surface: "#111827",
    surfaceAlt: "#1f2937",
    border: "#1f2937",
    text: "#e5e7eb",
    muted: "#9ca3af",
    accent: "#7c3aed",
    accent2: "#22d3ee",
    ok: "#22c55e",
    warn: "#f59e0b",
    critical: "#ef4444",
    offline: "#64748b"
  },
  radius: 12,
  spacing: (n: number) => `${n * 8}px`
};

const schedules = [
  { id: "eco", name: "Eco Dimming", description: "50% after midnight", levels: [100, 80, 50] },
  { id: "event", name: "Event Boost", description: "120% for events", levels: [120, 100, 80] },
  { id: "night", name: "Night Safety", description: "70% through night", levels: [90, 70, 70] }
];

const formatNumber = (num: number, digits = 1) => num.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
const formatDate = (iso: string) => (iso ? new Date(iso).toLocaleString() : "-");
const severityColor = (severity: Event["severity"]) => {
  switch (severity) {
    case "CRITICAL":
      return theme.colors.critical;
    case "WARN":
      return theme.colors.warn;
    case "OFFLINE":
      return theme.colors.offline;
    default:
      return theme.colors.ok;
  }
};

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
const generateData = () => {
  const tenant: Tenant = { id: "t1", name: "LuxPulse Estates" };
  const sites: Site[] = [
    { id: "s1", name: "Canal Wharf", address: "Leeds, UK", lat: 53.79, lng: -1.55 },
    { id: "s2", name: "Harbour Point", address: "Bristol, UK", lat: 51.45, lng: -2.6 },
    { id: "s3", name: "Innovation Park", address: "Cambridge, UK", lat: 52.2, lng: 0.12 }
  ];
  const zoneKinds = ["Car Park", "Warehouse", "Street", "Office", "Perimeter", "Tower"];
  const assetTypes = ["Streetlight", "Highbay", "Panel", "Flood", "Bollard"];
  const protocols: Asset["protocol"][] = ["DALI-2", "Zhaga-D4i", "BACnet", "Modbus", "Zigbee", "LoRaWAN", "VendorAPI"];
  const makes = ["Philips", "Signify", "Thorn", "GE", "Zumtobel", "Dialight"];
  const zones: Zone[] = [];
  const assets: Asset[] = [];
  const telemetry: Telemetry[] = [];
  const events: Event[] = [];
  const auditLog: ControlAction[] = [];

  sites.forEach((site) => {
    const zoneCount = Math.floor(randomBetween(3, 7));
    for (let i = 0; i < zoneCount; i++) {
      const zone: Zone = {
        id: `${site.id}-z${i + 1}`,
        siteId: site.id,
        name: `${randomItem(zoneKinds)} ${i + 1}`,
        kind: randomItem(zoneKinds)
      };
      zones.push(zone);
      const assetCount = Math.floor(randomBetween(10, 25));
      for (let j = 0; j < assetCount; j++) {
        const type = randomItem(assetTypes);
        const dimmable = Math.random() > 0.3;
        const asset: Asset = {
          id: `${zone.id}-a${j + 1}`,
          assetTag: `LP-${site.id}-${i + 1}-${j + 1}`,
          name: `${type} ${j + 1}`,
          siteId: site.id,
          zoneId: zone.id,
          type,
          make: randomItem(makes),
          model: `M${Math.floor(randomBetween(100, 999))}`,
          dimmable,
          powerRatingW: Math.floor(randomBetween(40, 240)),
          protocol: randomItem(protocols),
          installDateISO: new Date(Date.now() - randomBetween(50, 800) * 86400000).toISOString()
        };
        assets.push(asset);
        const now = Date.now();
        const lastSeen = new Date(now - randomBetween(1, 120) * 60000);
        const dimLevel = dimmable ? Math.floor(randomBetween(30, 100)) : 100;
        const tel: Telemetry = {
          assetId: asset.id,
          tsISO: new Date(now - 60000).toISOString(),
          powerW: Math.floor((asset.powerRatingW * dimLevel) / 100),
          energyTodayKWh: parseFloat(randomBetween(0.2, 6).toFixed(2)),
          dimLevelPct: dimLevel,
          tempC: parseFloat(randomBetween(25, 70).toFixed(1)),
          rssi: Math.floor(randomBetween(-90, -45)),
          lastSeenISO: lastSeen.toISOString()
        };
        telemetry.push(tel);
        if (Math.random() < 0.28) {
          const severity: Event["severity"] = randomItem(["WARN", "CRITICAL", "OFFLINE"]);
          events.push({
            id: `ev-${asset.id}-${j}`,
            assetId: asset.id,
            tsISO: new Date(now - randomBetween(10, 2000) * 60000).toISOString(),
            severity,
            code: severity === "OFFLINE" ? "COMMS" : severity === "CRITICAL" ? "OVERCURR" : "TEMP_HIGH",
            message: severity === "OFFLINE" ? "No comms" : severity === "CRITICAL" ? "Over current draw" : "Temperature high",
            cleared: Math.random() > 0.7
          });
        }
      }
    }
  });

  const dailyStats: DailyStat[] = [];
  const today = new Date();
  for (let d = 0; d < 30; d++) {
    const date = new Date(today.getTime() - d * 86400000);
    sites.forEach((site) => {
      dailyStats.push({
        date: date.toISOString().slice(0, 10),
        siteId: site.id,
        energy: parseFloat(randomBetween(120, 280).toFixed(1)),
        faults: Math.floor(randomBetween(0, 8)),
        availability: parseFloat(randomBetween(97, 99.8).toFixed(2))
      });
    });
  }

  return { tenant, sites, zones, assets, telemetry, events, auditLog, dailyStats };
};

const statusOrder: Record<Event["severity"], number> = {
  CRITICAL: 3,
  OFFLINE: 2,
  WARN: 1,
  OK: 0
};

const getAssetStatus = (events: Event[], assetId: string): Event["severity"] => {
  const assetEvents = events.filter((e) => e.assetId === assetId && !e.cleared);
  if (!assetEvents.length) return "OK";
  return assetEvents.sort((a, b) => statusOrder[b.severity] - statusOrder[a.severity])[0].severity;
};
const Pill: React.FC<{ label: string; color: string; icon?: React.ReactNode }> = ({ label, color, icon }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      background: `${color}22`,
      color,
      fontSize: 12,
      border: `1px solid ${color}44`
    }}
  >
    {icon}
    <span>{label}</span>
  </div>
);
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "soft" };
const Button: React.FC<ButtonProps> = ({ variant = "primary", style, children, ...rest }) => {
  const base: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: theme.radius,
    border: "1px solid transparent",
    background: theme.colors.accent,
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s ease"
  };
  if (variant === "ghost") {
    base.background = "transparent";
    base.border = `1px solid ${theme.colors.border}`;
    base.color = theme.colors.text;
  }
  if (variant === "soft") {
    base.background = `${theme.colors.accent}22`;
    base.color = theme.colors.text;
    base.border = `1px solid ${theme.colors.border}`;
  }
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} style={{ ...base, ...style }} {...(rest as any)}>
      {children}
    </motion.button>
  );
};
type CardProps = { title?: string; actions?: React.ReactNode; style?: React.CSSProperties; children?: React.ReactNode };
const Card: React.FC<CardProps> = ({ title, actions, children, style }) => (
  <div
    style={{
      background: theme.colors.surface,
      borderRadius: theme.radius,
      border: `1px solid ${theme.colors.border}`,
      padding: theme.spacing(2),
      color: theme.colors.text,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      ...style
    }}
  >
    {(title || actions) && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        {title && <div style={{ fontWeight: 700 }}>{title}</div>}
        {actions}
      </div>
    )}
    {children}
  </div>
);
const KPICard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend?: string; color?: string }> = ({ label, value, icon, trend, color }) => (
  <Card
    style={{
      flex: 1,
      minWidth: 150,
      background: theme.colors.surfaceAlt,
      border: `1px solid ${theme.colors.border}`
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color || theme.colors.accent}33`,
          color: color || theme.colors.accent,
          display: "grid",
          placeItems: "center"
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: theme.colors.muted }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      </div>
      {trend && <div style={{ color: theme.colors.muted, fontSize: 12 }}>{trend}</div>}
    </div>
  </Card>
);
const Sidebar: React.FC<{ view: string; onViewChange: (v: string) => void; collapsed: boolean; onToggle: () => void }> = ({ view, onViewChange, collapsed, onToggle }) => (
  <div
    style={{
      width: collapsed ? 64 : 220,
      background: theme.colors.surface,
      borderRight: `1px solid ${theme.colors.border}`,
      color: theme.colors.text,
      position: "sticky",
      top: 0,
      height: "100vh",
      transition: "width 0.2s ease",
      zIndex: 5
    }}
  >
    <div style={{ padding: theme.spacing(2), display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
      {!collapsed && <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>LuxPulse</div>}
      <Button aria-label="Toggle menu" variant="ghost" style={{ padding: 8, width: 36, height: 36, justifyContent: "center" }} onClick={onToggle}>
        {collapsed ? <Menu size={18} /> : <X size={18} />}
      </Button>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: theme.spacing(2) }}>
      {[
        { key: "map", label: "Map & Monitoring", icon: <MapPin size={18} /> },
        { key: "analytics", label: "Analytics", icon: <LineChartIcon size={18} /> },
        { key: "evidence", label: "Evidence", icon: <FileText size={18} /> }
      ].map((item) => (
        <Button
          key={item.key}
          aria-label={item.label}
          variant={view === item.key ? "primary" : "soft"}
          style={{ justifyContent: collapsed ? "center" : "flex-start", gap: 10 }}
          onClick={() => onViewChange(item.key)}
        >
          {item.icon}
          {!collapsed && item.label}
        </Button>
      ))}
    </div>
  </div>
);

const TopBar: React.FC<{
  tenant: Tenant;
  siteId: string;
  sites: Site[];
  onSiteChange: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
  range: number;
  onRangeChange: (n: number) => void;
  statusCounts: Record<Event["severity"], number>;
  showAffectedOnly: boolean;
  onToggleAffected: () => void;
}> = ({ tenant, siteId, sites, onSiteChange, search, onSearch, range, onRangeChange, statusCounts, showAffectedOnly, onToggleAffected }) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 4,
      background: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: theme.spacing(2),
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap"
    }}
  >
    <Pill label={tenant.name} color={theme.colors.accent} icon={<Layers size={14} />} />
    <select
      aria-label="Select site"
      value={siteId}
      onChange={(e) => onSiteChange(e.target.value)}
      style={{ background: theme.colors.surfaceAlt, color: theme.colors.text, borderRadius: theme.radius, border: `1px solid ${theme.colors.border}`, padding: "10px 12px" }}
    >
      <option value="all">All Sites</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
    <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
      <Search size={16} style={{ position: "absolute", top: 12, left: 10, color: theme.colors.muted }} />
      <input
        aria-label="Search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search asset tag, zone, make, model"
        style={{
          width: "100%",
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
          padding: "10px 36px",
          borderRadius: theme.radius
        }}
      />
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      {[7, 14, 30].map((r) => (
        <Button key={r} variant={range === r ? "primary" : "soft"} onClick={() => onRangeChange(r)}>
          {r}d
        </Button>
      ))}
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Pill label={`OK ${statusCounts.OK}`} color={theme.colors.ok} icon={<CheckCircle2 size={14} />} />
      <Pill label={`WARN ${statusCounts.WARN}`} color={theme.colors.warn} icon={<AlertTriangle size={14} />} />
      <Pill label={`CRIT ${statusCounts.CRITICAL}`} color={theme.colors.critical} icon={<Bell size={14} />} />
      <Pill label={`OFF ${statusCounts.OFFLINE}`} color={theme.colors.offline} icon={<WifiOff size={14} />} />
    </div>
    <Button variant={showAffectedOnly ? "primary" : "soft"} onClick={onToggleAffected}>
      <Filter size={16} /> {showAffectedOnly ? "Affected" : "All"}
    </Button>
  </div>
);
const FauxMap: React.FC<{
  sites: Site[];
  events: Event[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
}> = ({ sites, events, selectedSiteId, onSelectSite }) => {
  const lats = sites.map((s) => s.lat);
  const lngs = sites.map((s) => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const normalize = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng || 1)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100
  });
  const siteStatus = (siteId: string) => {
    const siteEvents = events.filter((e) => !e.cleared && e.assetId.startsWith(`${siteId}-`));
    if (siteEvents.find((e) => e.severity === "CRITICAL")) return "CRITICAL";
    if (siteEvents.find((e) => e.severity === "OFFLINE")) return "OFFLINE";
    if (siteEvents.find((e) => e.severity === "WARN")) return "WARN";
    return "OK" as Event["severity"];
  };
  return (
    <Card title="Estate Map" style={{ height: 320, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 12,
          borderRadius: theme.radius,
          background: `linear-gradient(135deg, ${theme.colors.surfaceAlt}, ${theme.colors.surface})`,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden"
        }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${i * 10}%`, left: 0, right: 0, height: 1, background: `${theme.colors.border}55` }} />
        ))}
        {[...Array(10)].map((_, i) => (
          <div key={`v-${i}`} style={{ position: "absolute", left: `${i * 10}%`, top: 0, bottom: 0, width: 1, background: `${theme.colors.border}55` }} />
        ))}
        {sites.map((site) => {
          const pos = normalize(site.lat, site.lng);
          const sev = siteStatus(site.id);
          const active = selectedSiteId === site.id;
          return (
            <motion.div
              key={site.id}
              style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSite(site.id)}
                style={{
                  background: active ? theme.colors.accent : theme.colors.surfaceAlt,
                  color: theme.colors.text,
                  border: `2px solid ${severityColor(sev)}`,
                  borderRadius: 12,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.3)"
                }}
              >
                <MapPin size={16} color={severityColor(sev)} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700 }}>{site.name}</div>
                  <div style={{ fontSize: 12, color: theme.colors.muted }}>{site.address}</div>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Pill label="OK" color={theme.colors.ok} icon={<CheckCircle2 size={14} />} />
        <Pill label="Warn" color={theme.colors.warn} icon={<AlertTriangle size={14} />} />
        <Pill label="Critical" color={theme.colors.critical} icon={<Bell size={14} />} />
        <Pill label="Offline" color={theme.colors.offline} icon={<WifiOff size={14} />} />
      </div>
    </Card>
  );
};
const AssetTable: React.FC<{
  assets: Asset[];
  zones: Zone[];
  telemetry: Telemetry[];
  events: Event[];
  onSelect: (asset: Asset) => void;
  sort: string;
  onSort: (s: string) => void;
}> = ({ assets, zones, telemetry, events, onSelect, sort, onSort }) => {
  const zoneMap = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);
  const telemetryMap = useMemo(() => Object.fromEntries(telemetry.map((t) => [t.assetId, t])), [telemetry]);
  const eventMap = useMemo(
    () =>
      assets.reduce<Record<string, Event[]>>((acc, a) => {
        acc[a.id] = events.filter((e) => e.assetId === a.id && !e.cleared);
        return acc;
      }, {}),
    [assets, events]
  );
  const sorted = useMemo(() => {
    const copy = [...assets];
    copy.sort((a, b) => {
      if (sort === "status") return statusOrder[getAssetStatus(events, b.id)] - statusOrder[getAssetStatus(events, a.id)];
      if (sort === "lastSeen") return new Date(telemetryMap[b.id]?.lastSeenISO || 0).getTime() - new Date(telemetryMap[a.id]?.lastSeenISO || 0).getTime();
      if (sort === "energy") return (telemetryMap[b.id]?.energyTodayKWh || 0) - (telemetryMap[a.id]?.energyTodayKWh || 0);
      return 0;
    });
    return copy;
  }, [assets, sort, telemetryMap, events]);
  return (
    <Card
      title={`Assets (${assets.length})`}
      actions={
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "status", label: "Severity" },
            { key: "lastSeen", label: "Last Seen" },
            { key: "energy", label: "Energy" }
          ].map((s) => (
            <Button key={s.key} variant={sort === s.key ? "primary" : "soft"} onClick={() => onSort(s.key)}>
              {s.label}
            </Button>
          ))}
        </div>
      }
    >
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: "left", color: theme.colors.muted }}>
              {["Status", "Asset Tag", "Zone", "Type", "Last Seen", "Power", "Dim %", "RSSI", "Energy Today", "Open Events"].map((h) => (
                <th key={h} style={{ padding: "8px 6px", borderBottom: `1px solid ${theme.colors.border}`, fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => {
              const tel = telemetryMap[asset.id];
              const sev = getAssetStatus(events, asset.id);
              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelect(asset)}
                  style={{ cursor: "pointer", borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  <td style={{ padding: "10px 6px" }}>
                    <Pill label={sev} color={severityColor(sev)} />
                  </td>
                  <td style={{ padding: "10px 6px", fontWeight: 600 }}>{asset.assetTag}</td>
                  <td style={{ padding: "10px 6px" }}>{zoneMap[asset.zoneId]?.name}</td>
                  <td style={{ padding: "10px 6px" }}>{asset.type}</td>
                  <td style={{ padding: "10px 6px", color: theme.colors.muted }}>{formatDate(tel?.lastSeenISO || "-")}</td>
                  <td style={{ padding: "10px 6px" }}>{tel?.powerW ?? "-"} W</td>
                  <td style={{ padding: "10px 6px" }}>{tel?.dimLevelPct ?? "-"}%</td>
                  <td style={{ padding: "10px 6px" }}>{tel?.rssi ?? "-"} dBm</td>
                  <td style={{ padding: "10px 6px" }}>{tel?.energyTodayKWh ?? "-"} kWh</td>
                  <td style={{ padding: "10px 6px" }}>{eventMap[asset.id]?.length || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
const Drawer: React.FC<{
  asset?: Asset;
  onClose: () => void;
  telemetry: Telemetry[];
  events: Event[];
  zones: Zone[];
  site?: Site;
  onAction: (action: ControlAction, updates?: { telemetry?: Telemetry; events?: Event[] }) => void;
  auditLog: ControlAction[];
}> = ({ asset, onClose, telemetry, events, zones, site, onAction, auditLog }) => {
  const [justification, setJustification] = useState("");
  const [dimTarget, setDimTarget] = useState(50);
  const [selectedSchedule, setSelectedSchedule] = useState(schedules[0].id);
  const [overrideMode, setOverrideMode] = useState("Off");
  const tel = telemetry.find((t) => t.assetId === asset?.id);
  const assetEvents = events
    .filter((e) => e.assetId === asset?.id)
    .sort((a, b) => new Date(b.tsISO).getTime() - new Date(a.tsISO).getTime());
  const assetLog = auditLog.filter((a) => a.assetId === asset?.id).slice(-10).reverse();

  const submit = (actionType: ControlAction["actionType"], after: any) => {
    if (!asset) return;
    if (!justification.trim()) {
      alert("Justification is required for audited actions.");
      return;
    }
    const action: ControlAction = {
      id: `act-${Date.now()}`,
      tsISO: new Date().toISOString(),
      actor: "ops@luxpulse",
      siteId: asset.siteId,
      zoneId: asset.zoneId,
      assetId: asset.id,
      actionType,
      before: tel,
      after,
      justification
    };
    onAction(action, actionType === "SET_DIM" ? { telemetry: { ...tel!, dimLevelPct: after.dimLevelPct, powerW: Math.floor((after.dimLevelPct / 100) * (tel?.powerW || 0) || 0) } } : undefined);
    setJustification("");
  };

  const clearFault = (event: Event) => {
    if (!asset) return;
    if (!justification.trim()) {
      alert("Justification is required to clear faults.");
      return;
    }
    const updatedEvent = { ...event, cleared: true };
    const action: ControlAction = {
      id: `act-${Date.now()}`,
      tsISO: new Date().toISOString(),
      actor: "ops@luxpulse",
      siteId: asset.siteId,
      zoneId: asset.zoneId,
      assetId: asset.id,
      actionType: "CLEAR_FAULT",
      before: event,
      after: updatedEvent,
      justification
    };
    onAction(action, { events: [updatedEvent] });
    setJustification("");
  };

  return (
    <AnimatePresence>
      {asset && (
        <motion.div
          key="drawer"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: 420,
            height: "100vh",
            background: theme.colors.surface,
            borderLeft: `1px solid ${theme.colors.border}`,
            overflowY: "auto",
            zIndex: 10,
            boxShadow: "-10px 0 30px rgba(0,0,0,0.3)",
            padding: theme.spacing(2)
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{asset.assetTag}</div>
              <div style={{ color: theme.colors.muted }}>{asset.type}</div>
            </div>
            <Button aria-label="Close drawer" variant="ghost" style={{ padding: 8 }} onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Site</div>
              <div style={{ fontWeight: 700 }}>{site?.name}</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Zone</div>
              <div style={{ fontWeight: 700 }}>{zones.find((z) => z.id === asset.zoneId)?.name}</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Protocol</div>
              <div style={{ fontWeight: 700 }}>{asset.protocol}</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Installed</div>
              <div style={{ fontWeight: 700 }}>{asset.installDateISO.slice(0, 10)}</div>
            </Card>
          </div>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Power</div>
              <div style={{ fontWeight: 800 }}>{tel?.powerW ?? "-"} W</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Dim</div>
              <div style={{ fontWeight: 800 }}>{tel?.dimLevelPct ?? "-"}%</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>Temp</div>
              <div style={{ fontWeight: 800 }}>{tel?.tempC ?? "-"} °C</div>
            </Card>
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: theme.colors.muted }}>RSSI</div>
              <div style={{ fontWeight: 800 }}>{tel?.rssi ?? "-"} dBm</div>
            </Card>
          </div>
          <Card title="Recent events" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assetEvents.slice(0, 6).map((ev) => (
                <div key={ev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: `${severityColor(ev.severity)}11`, padding: 10, borderRadius: theme.radius }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      <span style={{ color: severityColor(ev.severity), marginRight: 8 }}>{ev.severity}</span>
                      {ev.code}
                    </div>
                    <div style={{ color: theme.colors.muted, fontSize: 12 }}>{formatDate(ev.tsISO)}</div>
                    <div>{ev.message}</div>
                  </div>
                  {!ev.cleared && (
                    <Button variant="soft" onClick={() => clearFault(ev)}>
                      <CheckCircle2 size={14} /> Clear
                    </Button>
                  )}
                </div>
              ))}
              {!assetEvents.length && <div style={{ color: theme.colors.muted }}>No events.</div>}
            </div>
          </Card>
          <Card title="Control actions" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {asset?.dimmable && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700 }}>Set dim level</div>
                    <div>{dimTarget}%</div>
                  </div>
                  <input type="range" min={0} max={100} value={dimTarget} onChange={(e) => setDimTarget(parseInt(e.target.value, 10))} style={{ width: "100%" }} />
                  <Button style={{ marginTop: 6 }} onClick={() => submit("SET_DIM", { dimLevelPct: dimTarget })}>
                    <SlidersHorizontal size={16} /> Apply dimming
                  </Button>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700 }}>Apply schedule</div>
                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.description}
                    </option>
                  ))}
                </select>
                <Button style={{ marginTop: 6 }} onClick={() => submit("APPLY_SCHEDULE", schedules.find((s) => s.id === selectedSchedule))}>
                  <Play size={16} /> Apply schedule
                </Button>
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>Manual override</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {["Off", "On", "Force 80%"].map((mode) => (
                    <Button key={mode} variant={overrideMode === mode ? "primary" : "soft"} onClick={() => setOverrideMode(mode)}>
                      {mode}
                    </Button>
                  ))}
                </div>
                <Button style={{ marginTop: 6 }} onClick={() => submit("OVERRIDE", { mode: overrideMode })}>
                  <Power size={16} /> Apply override
                </Button>
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Justification (required)</div>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Document why this change is needed"
                  style={{ width: "100%", minHeight: 70, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text, padding: 10 }}
                />
              </div>
            </div>
          </Card>
          <Card title="Audit trail" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assetLog.map((log) => (
                <div key={log.id} style={{ background: theme.colors.surfaceAlt, borderRadius: theme.radius, padding: 10, border: `1px solid ${theme.colors.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700 }}>{log.actionType}</div>
                    <div style={{ color: theme.colors.muted, fontSize: 12 }}>{formatDate(log.tsISO)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: theme.colors.muted }}>By {log.actor}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Justification: {log.justification}</div>
                </div>
              ))}
              {!assetLog.length && <div style={{ color: theme.colors.muted }}>No actions yet.</div>}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type ChartCardProps = { title: string; children: React.ReactElement; height?: number };
const ChartCard: React.FC<ChartCardProps> = ({ title, children, height = 260 }) => (
  <Card title={title} style={{ height }}>
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  </Card>
);
const LuxPulseUIPrototype: React.FC = () => {
  const { tenant, sites, zones, assets: initialAssets, telemetry: initialTelemetry, events: initialEvents, auditLog: initialAudit, dailyStats } = useMemo(generateData, []);
  const [view, setView] = useState<"map" | "analytics" | "evidence">("map");
  const [siteId, setSiteId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(14);
  const [showAffectedOnly, setShowAffectedOnly] = useState(false);
  const [telemetry, setTelemetry] = useState<Telemetry[]>(initialTelemetry);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [auditLog, setAuditLog] = useState<ControlAction[]>(initialAudit);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [sortKey, setSortKey] = useState("status");
  const [analyticsFilters, setAnalyticsFilters] = useState({ siteId: "all", zoneId: "all", type: "all", costRate: 0.24, carbonFactor: 0.193 });
  const [collapsed, setCollapsed] = useState(false);
  const [activeMonitor, setActiveMonitor] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return initialAssets.filter((a) => {
      const matchesSite = siteId === "all" || a.siteId === siteId;
      const status = getAssetStatus(events, a.id);
      const affectedFilter = !showAffectedOnly || status !== "OK";
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.assetTag.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.make.toLowerCase().includes(q) ||
        zones
          .find((z) => z.id === a.zoneId)
          ?.name.toLowerCase()
          .includes(q) ||
        a.model.toLowerCase().includes(q);
      const monitorFilter = !activeMonitor || evaluateMonitor(activeMonitor).includes(a.id);
      return matchesSite && affectedFilter && matchesSearch && monitorFilter;
    });
  }, [initialAssets, siteId, showAffectedOnly, search, events, zones, activeMonitor]);

  const filteredTelemetry = useMemo(() => telemetry.filter((t) => filteredAssets.find((a) => a.id === t.assetId)), [telemetry, filteredAssets]);

  const statusCounts = useMemo(() => {
    const counts: Record<Event["severity"], number> = { OK: 0, WARN: 0, CRITICAL: 0, OFFLINE: 0 };
    initialAssets.forEach((a) => {
      const status = getAssetStatus(events, a.id);
      counts[status] += 1;
    });
    return counts;
  }, [events, initialAssets]);

  const kpis = useMemo(() => {
    const relevantAssets = initialAssets.filter((a) => siteId === "all" || a.siteId === siteId);
    const telMap = telemetry.filter((t) => relevantAssets.find((a) => a.id === t.assetId));
    const energy = telMap.reduce((sum, t) => sum + t.energyTodayKWh, 0);
    const cost = energy * analyticsFilters.costRate;
    const carbon = energy * analyticsFilters.carbonFactor;
    const availability =
      100 - (events.filter((e) => !e.cleared && e.severity === "OFFLINE" && relevantAssets.find((a) => a.id === e.assetId)).length / Math.max(relevantAssets.length, 1)) * 100;
    const openFaults = events.filter((e) => !e.cleared && relevantAssets.find((a) => a.id === e.assetId)).length;
    const offline = events.filter((e) => !e.cleared && e.severity === "OFFLINE" && relevantAssets.find((a) => a.id === e.assetId)).length;
    return { energy, cost, carbon, availability, openFaults, offline };
  }, [telemetry, siteId, events, initialAssets, analyticsFilters]);

  const timeSeries = useMemo(() => {
    const cutoff = range;
    const dates = dailyStats
      .filter((d) => (siteId === "all" ? true : d.siteId === siteId))
      .slice(0, cutoff)
      .reduce<Record<string, DailyStat[]>>((acc, d) => {
        acc[d.date] = acc[d.date] || [];
        acc[d.date].push(d);
        return acc;
      }, {});
    return Object.entries(dates)
      .map(([date, vals]) => ({
        date,
        energy: vals.reduce((s, v) => s + v.energy, 0),
        faults: vals.reduce((s, v) => s + v.faults, 0),
        availability: parseFloat((vals.reduce((s, v) => s + v.availability, 0) / vals.length).toFixed(2)),
        sites: vals
      }))
      .reverse();
  }, [dailyStats, siteId, range]);

  const evaluateMonitor = (ruleId: string): string[] => {
    if (ruleId === "offline") return events.filter((e) => !e.cleared && e.severity === "OFFLINE").map((e) => e.assetId);
    if (ruleId === "rssi") return telemetry.filter((t) => t.rssi < -80).map((t) => t.assetId);
    if (ruleId === "temp") return telemetry.filter((t) => t.tempC > 60).map((t) => t.assetId);
    if (ruleId === "power") return telemetry.filter((t) => t.powerW > 200).map((t) => t.assetId);
    return [];
  };

  const monitors = [
    { id: "offline", name: "Offline > 15m", severity: "CRITICAL", threshold: "15m", affected: evaluateMonitor("offline") },
    { id: "rssi", name: "Low RSSI", severity: "WARN", threshold: "-80 dBm", affected: evaluateMonitor("rssi") },
    { id: "temp", name: "High Temp", severity: "WARN", threshold: ">60°C", affected: evaluateMonitor("temp") },
    { id: "power", name: "Power Anomaly", severity: "CRITICAL", threshold: ">200W", affected: evaluateMonitor("power") }
  ];

  const handleAction = (action: ControlAction, updates?: { telemetry?: Telemetry; events?: Event[] }) => {
    setAuditLog((prev) => [...prev, action]);
    if (updates?.telemetry) {
      setTelemetry((prev) => prev.map((t) => (t.assetId === updates.telemetry!.assetId ? { ...t, ...updates.telemetry } : t)));
    }
    if (updates?.events) {
      setEvents((prev) => {
        const updated = prev.map((e) => (updates.events!.find((u) => u.id === e.id) ? { ...e, ...updates.events!.find((u) => u.id === e.id)! } : e));
        return updated;
      });
    }
  };

  const handleMonitorView = (id: string) => {
    setActiveMonitor(id);
    setView("map");
    setShowAffectedOnly(true);
  };

  const generateEvidencePack = () => {
    const start = new Date(Date.now() - range * 86400000).toISOString().slice(0, 10);
    const end = new Date().toISOString().slice(0, 10);
    const relevantAssets = initialAssets.filter((a) => (siteId === "all" ? true : a.siteId === siteId));
    const pack = {
      metadata: { generatedAt: new Date().toISOString(), tenant, selectedSite: siteId, range: { start, end, days: range }, version: "0.1" },
      sites,
      zones,
      assets: relevantAssets,
      telemetry: telemetry.filter((t) => relevantAssets.find((a) => a.id === t.assetId)),
      events: events.filter((e) => new Date(e.tsISO) >= new Date(start) && new Date(e.tsISO) <= new Date(end)),
      auditLog: auditLog.filter((a) => new Date(a.tsISO) >= new Date(start) && new Date(a.tsISO) <= new Date(end)),
      schedules,
      kpis: kpis
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luxpulse_evidence_${siteId}_${start}_${end}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analyticsFilteredStats = useMemo(() => {
    const start = range;
    const data = dailyStats
      .filter((d) => (analyticsFilters.siteId === "all" ? true : d.siteId === analyticsFilters.siteId))
      .slice(0, start)
      .reverse();
    return data;
  }, [dailyStats, analyticsFilters.siteId, range]);

  const zoneOptions = zones.filter((z) => analyticsFilters.siteId === "all" || z.siteId === analyticsFilters.siteId);

  return (
    <div style={{ display: "flex", background: theme.colors.bg, color: theme.colors.text, minHeight: "100vh", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <Sidebar view={view} onViewChange={(v) => setView(v as any)} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ flex: 1 }}>
        <TopBar
          tenant={tenant}
          siteId={siteId}
          sites={sites}
          onSiteChange={(id) => {
            setSiteId(id);
            setAnalyticsFilters((f) => ({ ...f, siteId: id, zoneId: "all" }));
          }}
          search={search}
          onSearch={setSearch}
          range={range}
          onRangeChange={setRange}
          statusCounts={statusCounts}
          showAffectedOnly={showAffectedOnly}
          onToggleAffected={() => setShowAffectedOnly((p) => !p)}
        />
        <div style={{ padding: theme.spacing(2), display: "grid", gap: 12 }}>
          <AnimatePresence mode="wait">
            {view === "map" && (
              <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12, alignItems: "start" }}>
                  <FauxMap sites={sites} events={events} selectedSiteId={siteId} onSelectSite={(id) => setSiteId(siteId === id ? "all" : id)} />
                  <div style={{ display: "grid", gap: 8 }}>
                    <Card title="KPI snapshot">
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                        <KPICard label="Energy" value={`${formatNumber(kpis.energy)} kWh`} icon={<Zap size={18} />} color={theme.colors.accent} />
                        <KPICard label="Cost" value={`£${formatNumber(kpis.cost)}`} icon={<Gauge size={18} />} color={theme.colors.warn} />
                        <KPICard label="Carbon" value={`${formatNumber(kpis.carbon)} kg`} icon={<Leaf size={18} />} color={theme.colors.ok} />
                        <KPICard label="Availability" value={`${formatNumber(kpis.availability, 2)}%`} icon={<Clock size={18} />} color={theme.colors.accent2} />
                        <KPICard label="Open faults" value={`${kpis.openFaults}`} icon={<AlertTriangle size={18} />} color={theme.colors.critical} />
                        <KPICard label="Offline" value={`${kpis.offline}`} icon={<WifiOff size={18} />} color={theme.colors.offline} />
                      </div>
                    </Card>
                    <Card title="Availability trend (14d)" style={{ height: 180 }}>
                      <ResponsiveContainer>
                        <AreaChart data={timeSeries}>
                          <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.colors.accent} stopOpacity={0.6} />
                              <stop offset="95%" stopColor={theme.colors.accent} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke={theme.colors.muted} tickFormatter={(d) => d.slice(5)} />
                          <YAxis domain={[95, 100]} stroke={theme.colors.muted} />
                          <Tooltip contentStyle={{ background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}` }} />
                          <Area type="monotone" dataKey="availability" stroke={theme.colors.accent2} fill="url(#grad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>
                </div>
                <AssetTable assets={filteredAssets} zones={zones} telemetry={filteredTelemetry} events={events} onSelect={setSelectedAsset} sort={sortKey} onSort={setSortKey} />
              </motion.div>
            )}
            {view === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  <KPICard label="Energy (range)" value={`${formatNumber(analyticsFilteredStats.reduce((s, d) => s + d.energy, 0))} kWh`} icon={<Zap size={18} />} />
                  <KPICard label="Cost" value={`£${formatNumber(analyticsFilteredStats.reduce((s, d) => s + d.energy, 0) * analyticsFilters.costRate)}`} icon={<Gauge size={18} />} />
                  <KPICard label="Carbon" value={`${formatNumber(analyticsFilteredStats.reduce((s, d) => s + d.energy, 0) * analyticsFilters.carbonFactor)} kg`} icon={<Leaf size={18} />} />
                  <KPICard label="Availability" value={`${formatNumber(analyticsFilteredStats.reduce((s, d) => s + d.availability, 0) / Math.max(analyticsFilteredStats.length, 1), 2)}%`} icon={<Activity size={18} />} />
                  <KPICard label="Faults" value={`${analyticsFilteredStats.reduce((s, d) => s + d.faults, 0)}`} icon={<AlertTriangle size={18} />} />
                </div>
                <Card title="Filters" style={{ marginTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Site</div>
                      <select
                        value={analyticsFilters.siteId}
                        onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, siteId: e.target.value, zoneId: "all" })}
                        style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                      >
                        <option value="all">All</option>
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Zone</div>
                      <select
                        value={analyticsFilters.zoneId}
                        onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, zoneId: e.target.value })}
                        style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                      >
                        <option value="all">All</option>
                        {zoneOptions.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Asset type</div>
                      <select
                        value={analyticsFilters.type}
                        onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, type: e.target.value })}
                        style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                      >
                        <option value="all">All</option>
                        {[...new Set(initialAssets.map((a) => a.type))].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Date range</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[7, 14, 30].map((r) => (
                          <Button key={r} variant={range === r ? "primary" : "soft"} onClick={() => setRange(r)}>
                            {r}d
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>£/kWh</div>
                      <input
                        type="number"
                        value={analyticsFilters.costRate}
                        onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, costRate: parseFloat(e.target.value) })}
                        style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>kgCO2e/kWh</div>
                      <input
                        type="number"
                        value={analyticsFilters.carbonFactor}
                        onChange={(e) => setAnalyticsFilters({ ...analyticsFilters, carbonFactor: parseFloat(e.target.value) })}
                        style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
                      />
                    </div>
                  </div>
                </Card>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 12 }}>
                  <ChartCard title="Daily energy">
                    <LineChart data={timeSeries}>
                      <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke={theme.colors.muted} tickFormatter={(d) => d.slice(5)} />
                      <YAxis stroke={theme.colors.muted} />
                      <Tooltip contentStyle={{ background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}` }} />
                      <Legend />
                      {siteId === "all"
                        ? sites.map((s, i) => (
                            <Line
                              key={s.id}
                              type="monotone"
                              dataKey={(d: any) => (d.sites.find((x: any) => x.siteId === s.id)?.energy || 0)}
                              name={s.name}
                              stroke={[theme.colors.accent, theme.colors.accent2, theme.colors.warn][i % 3]}
                              dot={false}
                            />
                          ))
                        : [<Line key="energy" type="monotone" dataKey="energy" stroke={theme.colors.accent} dot={false} />]}
                    </LineChart>
                  </ChartCard>
                  <ChartCard title="Faults per day">
                    <BarChart data={timeSeries}>
                      <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke={theme.colors.muted} tickFormatter={(d) => d.slice(5)} />
                      <YAxis stroke={theme.colors.muted} />
                      <Tooltip contentStyle={{ background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}` }} />
                      <Bar dataKey="faults" fill={theme.colors.critical} />
                    </BarChart>
                  </ChartCard>
                  <ChartCard title="Availability">
                    <LineChart data={timeSeries}>
                      <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke={theme.colors.muted} tickFormatter={(d) => d.slice(5)} />
                      <YAxis domain={[92, 100]} stroke={theme.colors.muted} />
                      <Tooltip contentStyle={{ background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}` }} />
                      <Line type="monotone" dataKey="availability" stroke={theme.colors.accent2} dot={false} />
                    </LineChart>
                  </ChartCard>
                  <ChartCard title="Energy by type" height={280}>
                    <BarChart data={[...new Set(initialAssets.map((a) => a.type))].map((t) => ({
                      type: t,
                      energy: telemetry
                        .filter((tel) => initialAssets.find((a) => a.id === tel.assetId && a.type === t))
                        .reduce((s, tel) => s + tel.energyTodayKWh, 0)
                    }))}>
                      <CartesianGrid stroke={theme.colors.border} strokeDasharray="3 3" />
                      <XAxis dataKey="type" stroke={theme.colors.muted} />
                      <YAxis stroke={theme.colors.muted} />
                      <Tooltip contentStyle={{ background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}` }} />
                      <Bar dataKey="energy">
                        {[...new Set(initialAssets.map((a) => a.type))].map((_, i) => (
                          <Cell key={i} fill={[theme.colors.accent, theme.colors.warn, theme.colors.accent2, theme.colors.ok, theme.colors.offline][i % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartCard>
                </div>
                <Card title="Monitors & rules" style={{ marginTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                    {monitors.map((m) => (
                      <Card key={m.id} style={{ background: theme.colors.surfaceAlt }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{m.name}</div>
                            <div style={{ color: theme.colors.muted, fontSize: 12 }}>Threshold: {m.threshold}</div>
                          </div>
                          <Pill label={m.severity} color={severityColor(m.severity as Event["severity"])} />
                        </div>
                        <div style={{ marginTop: 8, color: theme.colors.muted, fontSize: 12 }}>Triggered: {m.affected.length}</div>
                        <Button style={{ marginTop: 8 }} onClick={() => handleMonitorView(m.id)}>
                          View affected ({m.affected.length}) <ArrowRight size={14} />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
            {view === "evidence" && (
              <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <Card title="Evidence pack builder">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Site</div>
                      <select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}>
                        <option value="all">All</option>
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Range</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[7, 14, 30].map((r) => (
                          <Button key={r} variant={range === r ? "primary" : "soft"} onClick={() => setRange(r)}>
                            {r} days
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Custom start</div>
                      <input type="date" style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: theme.colors.muted }}>Custom end</div>
                      <input type="date" style={{ width: "100%", padding: 10, borderRadius: theme.radius, background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: theme.colors.muted, fontSize: 12 }}>
                      Evidence pack includes assets, telemetry summary, events, audit log, schedules, and KPI snapshot for the period.
                    </div>
                    <Button onClick={generateEvidencePack}>
                      <Download size={16} /> Generate JSON
                    </Button>
                  </div>
                </Card>
                <Card title="Audit previews" style={{ marginTop: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                    <Card style={{ background: theme.colors.surfaceAlt }}>
                      <div style={{ fontWeight: 700 }}>Open events</div>
                      <div style={{ fontSize: 32, fontWeight: 800 }}>{events.filter((e) => !e.cleared).length}</div>
                      <div style={{ color: theme.colors.muted, fontSize: 12 }}>Across estate</div>
                    </Card>
                    <Card style={{ background: theme.colors.surfaceAlt }}>
                      <div style={{ fontWeight: 700 }}>Audit entries</div>
                      <div style={{ fontSize: 32, fontWeight: 800 }}>{auditLog.length}</div>
                      <div style={{ color: theme.colors.muted, fontSize: 12 }}>Change history</div>
                    </Card>
                    <Card style={{ background: theme.colors.surfaceAlt }}>
                      <div style={{ fontWeight: 700 }}>Energy today</div>
                      <div style={{ fontSize: 32, fontWeight: 800 }}>{formatNumber(kpis.energy)} kWh</div>
                      <div style={{ color: theme.colors.muted, fontSize: 12 }}>Cost £{formatNumber(kpis.cost)}</div>
                    </Card>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Drawer asset={selectedAsset} onClose={() => setSelectedAsset(undefined)} telemetry={telemetry} events={events} zones={zones} site={sites.find((s) => s.id === selectedAsset?.siteId)} onAction={handleAction} auditLog={auditLog} />
    </div>
  );
};

export default LuxPulseUIPrototype;
