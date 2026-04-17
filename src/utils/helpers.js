import { MUMBAI_BOUNDS, EMERGENCY_TYPES, HOSPITALS } from "../data/cityData";

export function randomInBounds() {
  const { minLat, maxLat, minLng, maxLng } = MUMBAI_BOUNDS;
  return {
    lat: minLat + Math.random() * (maxLat - minLat),
    lng: minLng + Math.random() * (maxLng - minLng),
  };
}

export function randomEmergencyType() {
  return EMERGENCY_TYPES[Math.floor(Math.random() * EMERGENCY_TYPES.length)];
}

export function nearestHospital(lat, lng) {
  return HOSPITALS.reduce((best, h) => {
    const d = Math.hypot(h.lat - lat, h.lng - lng);
    const db = Math.hypot(best.lat - lat, best.lng - lng);
    return d < db ? h : best;
  });
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour12: false });
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Linearly interpolate a marker one step toward target
export function stepToward(current, target, fraction = 0.15) {
  return {
    lat: current.lat + (target.lat - current.lat) * fraction,
    lng: current.lng + (target.lng - current.lng) * fraction,
  };
}

export const EVENT_COLORS = {
  DISPATCH:  "#378ADD",
  ACK:       "#639922",
  CRASH:     "#E24B4A",
  RECOVER:   "#1D9E75",
  HEARTBEAT: "#888780",
  REPLICATE: "#7F77DD",
  DELIVERED: "#BA7517",
};

export const SEVERITY_COLOR = {
  critical: "#E24B4A",
  high:     "#EF9F27",
  medium:   "#378ADD",
  low:      "#639922",
};