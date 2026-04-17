export const CITY_CENTER = { lat: 19.076, lng: 72.8777 };

export const ZONES = {
  NORTH: { name: "North Mumbai", bounds: { minLat: 19.18, maxLat: 19.26, minLng: 72.82, maxLng: 72.92 } },
  SOUTH: { name: "South Mumbai", bounds: { minLat: 18.89, maxLat: 18.98, minLng: 72.80, maxLng: 72.90 } },
  EAST:  { name: "East Mumbai",  bounds: { minLat: 19.05, maxLat: 19.15, minLng: 72.92, maxLng: 73.00 } },
  WEST:  { name: "West Mumbai",  bounds: { minLat: 19.05, maxLat: 19.15, minLng: 72.78, maxLng: 72.88 } },
  CENTRAL: { name: "Central Mumbai", bounds: { minLat: 19.00, maxLat: 19.10, minLng: 72.83, maxLng: 72.93 } },
};

export const HOSPITALS = [
  { id: "H1", name: "KEM Hospital",      lat: 18.9929, lng: 72.8427, zone: "SOUTH"   },
  { id: "H2", name: "Lilavati Hospital",  lat: 19.0496, lng: 72.8266, zone: "WEST"    },
  { id: "H3", name: "Kokilaben Hospital", lat: 19.1272, lng: 72.8258, zone: "NORTH"   },
  { id: "H4", name: "Fortis Mulund",      lat: 19.1725, lng: 72.9560, zone: "EAST"    },
  { id: "H5", name: "Hinduja Hospital",   lat: 19.0596, lng: 72.8295, zone: "CENTRAL" },
];

export const INITIAL_AMBULANCES = [
  { id: "AMB-1", name: "Amb-1", lat: 19.2183, lng: 72.8479, zone: "NORTH",   status: "available", activeCall: null, callsHandled: 0, load: 0 },
  { id: "AMB-2", name: "Amb-2", lat: 18.9388, lng: 72.8354, zone: "SOUTH",   status: "available", activeCall: null, callsHandled: 0, load: 0 },
  { id: "AMB-3", name: "Amb-3", lat: 19.0896, lng: 72.9615, zone: "EAST",    status: "available", activeCall: null, callsHandled: 0, load: 0 },
  { id: "AMB-4", name: "Amb-4", lat: 19.1085, lng: 72.8204, zone: "WEST",    status: "available", activeCall: null, callsHandled: 0, load: 0 },
  { id: "AMB-5", name: "Amb-5", lat: 19.0760, lng: 72.8777, zone: "CENTRAL", status: "available", activeCall: null, callsHandled: 0, load: 0 },
];

export const INITIAL_NODES = [
  { id: "DISP-1", name: "Primary Dispatcher", type: "dispatcher", role: "primary",  status: "alive", missedHeartbeats: 0 },
  { id: "DISP-2", name: "Backup Dispatcher",  type: "dispatcher", role: "backup",   status: "alive", missedHeartbeats: 0 },
  { id: "AMB-1",  name: "Amb-1 Node",         type: "ambulance",  role: "worker",   status: "alive", missedHeartbeats: 0 },
  { id: "AMB-2",  name: "Amb-2 Node",         type: "ambulance",  role: "worker",   status: "alive", missedHeartbeats: 0 },
  { id: "AMB-3",  name: "Amb-3 Node",         type: "ambulance",  role: "worker",   status: "alive", missedHeartbeats: 0 },
  { id: "AMB-4",  name: "Amb-4 Node",         type: "ambulance",  role: "worker",   status: "alive", missedHeartbeats: 0 },
  { id: "AMB-5",  name: "Amb-5 Node",         type: "ambulance",  role: "worker",   status: "alive", missedHeartbeats: 0 },
];

export const EMERGENCY_TYPES = [
  { type: "CARDIAC",   label: "Cardiac Arrest", severity: "critical", color: "#E24B4A" },
  { type: "ACCIDENT",  label: "Road Accident",  severity: "high",     color: "#EF9F27" },
  { type: "FIRE",      label: "Fire Injury",    severity: "high",     color: "#EF9F27" },
  { type: "FALL",      label: "Fall Injury",    severity: "medium",   color: "#378ADD" },
  { type: "BREATHING", label: "Breathing Issue",severity: "critical", color: "#E24B4A" },
  { type: "GENERAL",   label: "General Medical",severity: "low",      color: "#639922" },
];

export const MUMBAI_BOUNDS = {
  minLat: 18.89, maxLat: 19.27,
  minLng: 72.78, maxLng: 73.00,
};