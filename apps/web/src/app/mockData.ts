export type AssetHealthStatus = 'OK' | 'Warning' | 'Critical' | 'Offline';

export type SiteTrendPoint = {
  label: string;
  availability: number;
  energyMwh: number;
  faults: number;
  offlineAssets: number;
};

export type SiteZoneSummary = {
  id: string;
  name: string;
  assets: number;
  offline: number;
  warning: number;
  critical: number;
  schedule: string;
  lastOverride: string;
  status: AssetHealthStatus;
};

export type SiteAssetPoint = {
  assetTag: string;
  zoneId: string;
  zoneLabel: string;
  status: AssetHealthStatus;
  x: number;
  y: number;
  lastSeen: string;
  burnHours: number;
};

export type SiteRecord = {
  id: string;
  ref: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  availability: number;
  offline: number;
  openTickets: number;
  assets: number;
  energyTodayMwh: number;
  carbonTodayKg: number;
  trend: SiteTrendPoint[];
  zoneSummaries: SiteZoneSummary[];
  assetPoints: SiteAssetPoint[];
};

export const siteData: SiteRecord[] = [
  {
    id: 'site-london-west',
    ref: 'LXP-UK-001',
    name: 'London West Retail Park',
    region: 'Greater London',
    lat: 51.5072,
    lng: -0.1276,
    mapX: 21,
    mapY: 45,
    availability: 98.6,
    offline: 4,
    openTickets: 9,
    assets: 124,
    energyTodayMwh: 6.8,
    carbonTodayKg: 1480,
    trend: [
      { label: '06:00', availability: 98.1, energyMwh: 0.62, faults: 2, offlineAssets: 6 },
      { label: '08:00', availability: 98.3, energyMwh: 0.79, faults: 1, offlineAssets: 5 },
      { label: '10:00', availability: 98.5, energyMwh: 0.88, faults: 1, offlineAssets: 5 },
      { label: '12:00', availability: 98.6, energyMwh: 0.95, faults: 0, offlineAssets: 4 },
      { label: '14:00', availability: 98.7, energyMwh: 1.01, faults: 0, offlineAssets: 4 },
      { label: '16:00', availability: 98.7, energyMwh: 0.94, faults: 1, offlineAssets: 4 },
      { label: '18:00', availability: 98.6, energyMwh: 0.91, faults: 2, offlineAssets: 4 },
      { label: '20:00', availability: 98.6, energyMwh: 0.7, faults: 1, offlineAssets: 4 },
    ],
    zoneSummaries: [
      {
        id: 'zone-a',
        name: 'Ground Floor Retail',
        assets: 52,
        offline: 1,
        warning: 2,
        critical: 0,
        schedule: '07:30-22:30 @ 82%',
        lastOverride: '12m ago',
        status: 'OK',
      },
      {
        id: 'zone-b',
        name: 'Loading Corridor',
        assets: 28,
        offline: 2,
        warning: 1,
        critical: 0,
        schedule: '24/7 @ 65%',
        lastOverride: '1h ago',
        status: 'Warning',
      },
      {
        id: 'zone-c',
        name: 'Parking Deck',
        assets: 44,
        offline: 1,
        warning: 0,
        critical: 0,
        schedule: 'Dusk-Dawn @ 70%',
        lastOverride: '3h ago',
        status: 'OK',
      },
    ],
    assetPoints: [
      { assetTag: 'LUX-0001', zoneId: 'zone-a', zoneLabel: 'Ground Floor Retail', status: 'OK', x: 14, y: 24, lastSeen: '47s ago', burnHours: 6821 },
      { assetTag: 'LUX-0002', zoneId: 'zone-a', zoneLabel: 'Ground Floor Retail', status: 'Warning', x: 19, y: 30, lastSeen: '3m ago', burnHours: 7991 },
      { assetTag: 'LUX-0003', zoneId: 'zone-a', zoneLabel: 'Ground Floor Retail', status: 'OK', x: 23, y: 18, lastSeen: '1m ago', burnHours: 7440 },
      { assetTag: 'LUX-0004', zoneId: 'zone-b', zoneLabel: 'Loading Corridor', status: 'Offline', x: 34, y: 54, lastSeen: '16m ago', burnHours: 8921 },
      { assetTag: 'LUX-0005', zoneId: 'zone-b', zoneLabel: 'Loading Corridor', status: 'OK', x: 41, y: 49, lastSeen: '54s ago', burnHours: 7001 },
      { assetTag: 'LUX-0006', zoneId: 'zone-b', zoneLabel: 'Loading Corridor', status: 'Warning', x: 45, y: 58, lastSeen: '6m ago', burnHours: 8451 },
      { assetTag: 'LUX-0007', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 59, y: 42, lastSeen: '40s ago', burnHours: 6120 },
      { assetTag: 'LUX-0008', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'Critical', x: 64, y: 36, lastSeen: '9m ago', burnHours: 9004 },
      { assetTag: 'LUX-0009', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 71, y: 46, lastSeen: '1m ago', burnHours: 5318 },
      { assetTag: 'LUX-0010', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 77, y: 62, lastSeen: '28s ago', burnHours: 4151 },
      { assetTag: 'LUX-0011', zoneId: 'zone-a', zoneLabel: 'Ground Floor Retail', status: 'OK', x: 28, y: 24, lastSeen: '50s ago', burnHours: 4310 },
      { assetTag: 'LUX-0012', zoneId: 'zone-b', zoneLabel: 'Loading Corridor', status: 'Offline', x: 38, y: 63, lastSeen: '18m ago', burnHours: 9540 },
    ],
  },
  {
    id: 'site-birmingham-hub',
    ref: 'LXP-UK-002',
    name: 'Birmingham Logistics Hub',
    region: 'West Midlands',
    lat: 52.4862,
    lng: -1.8904,
    mapX: 37,
    mapY: 38,
    availability: 97.4,
    offline: 7,
    openTickets: 14,
    assets: 168,
    energyTodayMwh: 8.3,
    carbonTodayKg: 1815,
    trend: [
      { label: '06:00', availability: 96.8, energyMwh: 0.81, faults: 3, offlineAssets: 9 },
      { label: '08:00', availability: 97.0, energyMwh: 0.93, faults: 2, offlineAssets: 8 },
      { label: '10:00', availability: 97.2, energyMwh: 1.05, faults: 3, offlineAssets: 7 },
      { label: '12:00', availability: 97.3, energyMwh: 1.14, faults: 2, offlineAssets: 7 },
      { label: '14:00', availability: 97.4, energyMwh: 1.22, faults: 2, offlineAssets: 7 },
      { label: '16:00', availability: 97.5, energyMwh: 1.1, faults: 1, offlineAssets: 7 },
      { label: '18:00', availability: 97.4, energyMwh: 1.04, faults: 2, offlineAssets: 7 },
      { label: '20:00', availability: 97.4, energyMwh: 1.01, faults: 2, offlineAssets: 7 },
    ],
    zoneSummaries: [
      {
        id: 'zone-a',
        name: 'Dispatch Hall',
        assets: 75,
        offline: 3,
        warning: 4,
        critical: 1,
        schedule: '24/7 @ 74%',
        lastOverride: '26m ago',
        status: 'Warning',
      },
      {
        id: 'zone-b',
        name: 'Cold Chain Bay',
        assets: 49,
        offline: 2,
        warning: 2,
        critical: 0,
        schedule: '24/7 @ 78%',
        lastOverride: '2h ago',
        status: 'Warning',
      },
      {
        id: 'zone-c',
        name: 'External Apron',
        assets: 44,
        offline: 2,
        warning: 1,
        critical: 0,
        schedule: 'Dusk-Dawn @ 72%',
        lastOverride: '4h ago',
        status: 'Warning',
      },
    ],
    assetPoints: [
      { assetTag: 'LUX-0101', zoneId: 'zone-a', zoneLabel: 'Dispatch Hall', status: 'Warning', x: 13, y: 26, lastSeen: '5m ago', burnHours: 8781 },
      { assetTag: 'LUX-0102', zoneId: 'zone-a', zoneLabel: 'Dispatch Hall', status: 'OK', x: 22, y: 19, lastSeen: '39s ago', burnHours: 6451 },
      { assetTag: 'LUX-0103', zoneId: 'zone-a', zoneLabel: 'Dispatch Hall', status: 'Offline', x: 31, y: 33, lastSeen: '19m ago', burnHours: 9320 },
      { assetTag: 'LUX-0104', zoneId: 'zone-b', zoneLabel: 'Cold Chain Bay', status: 'OK', x: 44, y: 51, lastSeen: '57s ago', burnHours: 7413 },
      { assetTag: 'LUX-0105', zoneId: 'zone-b', zoneLabel: 'Cold Chain Bay', status: 'Warning', x: 49, y: 48, lastSeen: '4m ago', burnHours: 8120 },
      { assetTag: 'LUX-0106', zoneId: 'zone-b', zoneLabel: 'Cold Chain Bay', status: 'OK', x: 57, y: 56, lastSeen: '1m ago', burnHours: 7055 },
      { assetTag: 'LUX-0107', zoneId: 'zone-c', zoneLabel: 'External Apron', status: 'Critical', x: 66, y: 44, lastSeen: '9m ago', burnHours: 9642 },
      { assetTag: 'LUX-0108', zoneId: 'zone-c', zoneLabel: 'External Apron', status: 'OK', x: 71, y: 61, lastSeen: '42s ago', burnHours: 5225 },
      { assetTag: 'LUX-0109', zoneId: 'zone-c', zoneLabel: 'External Apron', status: 'Offline', x: 78, y: 67, lastSeen: '17m ago', burnHours: 9324 },
      { assetTag: 'LUX-0110', zoneId: 'zone-a', zoneLabel: 'Dispatch Hall', status: 'OK', x: 27, y: 25, lastSeen: '51s ago', burnHours: 6422 },
      { assetTag: 'LUX-0111', zoneId: 'zone-c', zoneLabel: 'External Apron', status: 'OK', x: 74, y: 38, lastSeen: '55s ago', burnHours: 5083 },
      { assetTag: 'LUX-0112', zoneId: 'zone-b', zoneLabel: 'Cold Chain Bay', status: 'Warning', x: 54, y: 63, lastSeen: '6m ago', burnHours: 8610 },
    ],
  },
  {
    id: 'site-manchester-campus',
    ref: 'LXP-UK-003',
    name: 'Manchester Commerce Campus',
    region: 'Greater Manchester',
    lat: 53.4808,
    lng: -2.2426,
    mapX: 31,
    mapY: 24,
    availability: 99.1,
    offline: 2,
    openTickets: 3,
    assets: 96,
    energyTodayMwh: 4.9,
    carbonTodayKg: 1102,
    trend: [
      { label: '06:00', availability: 98.9, energyMwh: 0.41, faults: 1, offlineAssets: 3 },
      { label: '08:00', availability: 99.0, energyMwh: 0.56, faults: 0, offlineAssets: 2 },
      { label: '10:00', availability: 99.1, energyMwh: 0.63, faults: 0, offlineAssets: 2 },
      { label: '12:00', availability: 99.2, energyMwh: 0.72, faults: 0, offlineAssets: 2 },
      { label: '14:00', availability: 99.2, energyMwh: 0.74, faults: 0, offlineAssets: 2 },
      { label: '16:00', availability: 99.1, energyMwh: 0.67, faults: 1, offlineAssets: 2 },
      { label: '18:00', availability: 99.1, energyMwh: 0.61, faults: 0, offlineAssets: 2 },
      { label: '20:00', availability: 99.1, energyMwh: 0.56, faults: 1, offlineAssets: 2 },
    ],
    zoneSummaries: [
      {
        id: 'zone-a',
        name: 'Atrium',
        assets: 31,
        offline: 1,
        warning: 0,
        critical: 0,
        schedule: '08:00-21:00 @ 80%',
        lastOverride: '52m ago',
        status: 'OK',
      },
      {
        id: 'zone-b',
        name: 'Office Spine',
        assets: 40,
        offline: 1,
        warning: 1,
        critical: 0,
        schedule: '07:00-20:00 @ 78%',
        lastOverride: '1h ago',
        status: 'OK',
      },
      {
        id: 'zone-c',
        name: 'Parking Deck',
        assets: 25,
        offline: 0,
        warning: 0,
        critical: 0,
        schedule: 'Dusk-Dawn @ 68%',
        lastOverride: '6h ago',
        status: 'OK',
      },
    ],
    assetPoints: [
      { assetTag: 'LUX-0201', zoneId: 'zone-a', zoneLabel: 'Atrium', status: 'OK', x: 17, y: 31, lastSeen: '38s ago', burnHours: 5130 },
      { assetTag: 'LUX-0202', zoneId: 'zone-a', zoneLabel: 'Atrium', status: 'OK', x: 23, y: 22, lastSeen: '49s ago', burnHours: 4975 },
      { assetTag: 'LUX-0203', zoneId: 'zone-a', zoneLabel: 'Atrium', status: 'Warning', x: 28, y: 29, lastSeen: '5m ago', burnHours: 8220 },
      { assetTag: 'LUX-0204', zoneId: 'zone-b', zoneLabel: 'Office Spine', status: 'OK', x: 42, y: 47, lastSeen: '1m ago', burnHours: 6011 },
      { assetTag: 'LUX-0205', zoneId: 'zone-b', zoneLabel: 'Office Spine', status: 'Offline', x: 49, y: 52, lastSeen: '14m ago', burnHours: 8832 },
      { assetTag: 'LUX-0206', zoneId: 'zone-b', zoneLabel: 'Office Spine', status: 'OK', x: 57, y: 45, lastSeen: '44s ago', burnHours: 5904 },
      { assetTag: 'LUX-0207', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 66, y: 61, lastSeen: '41s ago', burnHours: 4708 },
      { assetTag: 'LUX-0208', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 73, y: 67, lastSeen: '1m ago', burnHours: 4640 },
      { assetTag: 'LUX-0209', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 79, y: 58, lastSeen: '1m ago', burnHours: 4401 },
      { assetTag: 'LUX-0210', zoneId: 'zone-b', zoneLabel: 'Office Spine', status: 'OK', x: 54, y: 39, lastSeen: '58s ago', burnHours: 5220 },
      { assetTag: 'LUX-0211', zoneId: 'zone-a', zoneLabel: 'Atrium', status: 'Critical', x: 20, y: 37, lastSeen: '11m ago', burnHours: 9410 },
      { assetTag: 'LUX-0212', zoneId: 'zone-c', zoneLabel: 'Parking Deck', status: 'OK', x: 69, y: 52, lastSeen: '33s ago', burnHours: 4301 },
    ],
  },
];

const fallbackSite = siteData[0];
if (!fallbackSite) {
  throw new Error('siteData must include at least one site');
}
const defaultSite: SiteRecord = fallbackSite;

export const sites = siteData.map((site) => ({
  id: site.id,
  ref: site.ref,
  name: site.name,
  availability: site.availability,
  offline: site.offline,
  openTickets: site.openTickets,
  assets: site.assets,
}));

export const zoneAssets = defaultSite.assetPoints.map((point) => ({
  assetTag: point.assetTag,
  model: point.zoneLabel,
  status: point.status,
  burnHours: point.burnHours,
  lastSeen: point.lastSeen,
}));

export const adapterHealth = [
  { name: 'DALI Gateway / West', type: 'protocol_gateway', status: 'OK', lastHeartbeat: '22s ago' },
  { name: 'BMS BACnet Bridge', type: 'protocol_gateway', status: 'Warning', lastHeartbeat: '2m ago' },
  { name: 'Vendor Cloud A', type: 'vendor_api', status: 'OK', lastHeartbeat: '57s ago' },
  { name: 'CSV Onboarding', type: 'file_onboarding', status: 'OK', lastHeartbeat: '5m ago' },
] as const;

export function getSiteById(siteId: string | undefined): SiteRecord {
  if (!siteId) {
    return defaultSite;
  }

  return siteData.find((site) => site.id === siteId) ?? defaultSite;
}

export function buildStatusMix(assetPoints: SiteAssetPoint[]) {
  const counts = assetPoints.reduce(
    (acc, asset) => {
      acc[asset.status] += 1;
      return acc;
    },
    {
      OK: 0,
      Warning: 0,
      Critical: 0,
      Offline: 0,
    } as Record<AssetHealthStatus, number>,
  );

  return [
    { name: 'OK', value: counts.OK },
    { name: 'Warning', value: counts.Warning },
    { name: 'Critical', value: counts.Critical },
    { name: 'Offline', value: counts.Offline },
  ];
}
