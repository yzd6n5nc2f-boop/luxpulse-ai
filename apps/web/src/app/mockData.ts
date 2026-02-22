export const sites = [
  { id: 'site-london-west', name: 'London West Retail Park', availability: 98.6, offline: 4, openTickets: 9 },
  { id: 'site-birmingham-hub', name: 'Birmingham Logistics Hub', availability: 97.4, offline: 7, openTickets: 14 },
  { id: 'site-manchester-campus', name: 'Manchester Commerce Campus', availability: 99.1, offline: 2, openTickets: 3 },
];

export const zoneAssets = [
  { assetTag: 'LUX-Z1-0001', model: 'Linear Bay D4', status: 'OK', burnHours: 6812, lastSeen: '2m ago' },
  { assetTag: 'LUX-Z1-0002', model: 'Spot ARC-12', status: 'Warning', burnHours: 8122, lastSeen: '5m ago' },
  { assetTag: 'LUX-Z1-0003', model: 'Track NOVA', status: 'Offline', burnHours: 9521, lastSeen: '16m ago' },
  { assetTag: 'LUX-Z1-0004', model: 'Panel L4', status: 'OK', burnHours: 4321, lastSeen: '1m ago' },
];

export const adapterHealth = [
  { name: 'DALI Gateway / West', type: 'protocol_gateway', status: 'OK', lastHeartbeat: '22s ago' },
  { name: 'BMS BACnet Bridge', type: 'protocol_gateway', status: 'Warning', lastHeartbeat: '2m ago' },
  { name: 'Vendor Cloud A', type: 'vendor_api', status: 'OK', lastHeartbeat: '57s ago' },
  { name: 'CSV Onboarding', type: 'file_onboarding', status: 'OK', lastHeartbeat: '5m ago' },
] as const;
