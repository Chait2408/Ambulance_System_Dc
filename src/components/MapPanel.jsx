import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useSimStore } from "../store/useSimStore";
import { HOSPITALS, CITY_CENTER } from "../data/cityData";
import { SEVERITY_COLOR } from "../utils/helpers";

// Fix default leaflet icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function makeCircleIcon(color, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,0.3);">
    </div>`,
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAmbIcon(amb) {
  const color = amb.nodeStatus === "dead"
    ? "#E24B4A"
    : amb.status === "en-route" ? "#EF9F27" : "#1D9E75";
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};color:#fff;font-size:9px;font-weight:600;
      padding:2px 5px;border-radius:10px;white-space:nowrap;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);">
      ${amb.id}
    </div>`,
    iconAnchor: [20, 10],
  });
}

function makeHospitalIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:#BA7517;color:#fff;font-size:10px;font-weight:700;
      width:20px;height:20px;border-radius:4px;display:flex;
      align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);">H</div>`,
    iconAnchor: [10, 10],
  });
}

function ClickToEmergency({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function MapPanel({ onMapClick }) {
  const ambulances  = useSimStore((s) => s.ambulances);
  const emergencies = useSimStore((s) => s.emergencies);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Live map — Mumbai</span>
        <span className="text-xs text-gray-400">click map to place emergency</span>
      </div>

      <div className="flex-1 rounded-lg overflow-hidden border border-gray-200" style={{ minHeight: 0 }}>
        <MapContainer
          center={[CITY_CENTER.lat, CITY_CENTER.lng]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToEmergency onMapClick={onMapClick} />

          {/* Hospitals */}
          {HOSPITALS.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={makeHospitalIcon()}>
              <Popup><strong>{h.name}</strong></Popup>
            </Marker>
          ))}

          {/* Ambulances */}
          {ambulances.map((amb) => (
            <Marker key={amb.id} position={[amb.lat, amb.lng]} icon={makeAmbIcon(amb)}>
              <Popup>
                <strong>{amb.id}</strong><br />
                Status: {amb.status}<br />
                Load: {amb.load} calls<br />
                Handled: {amb.callsHandled}
              </Popup>
            </Marker>
          ))}

          {/* Route lines */}
          {ambulances
            .filter((a) => a.status === "en-route" && a.targetLat)
            .map((a) => (
              <Polyline
                key={`route-${a.id}`}
                positions={[
                  [a.lat, a.lng],
                  [a.targetLat, a.targetLng],
                ]}
                color="#EF9F27"
                weight={2}
                dashArray="6 4"
              />
            ))}

          {/* Emergency markers */}
          {emergencies.map((em) => (
            <Marker
              key={em.id}
              position={[em.lat, em.lng]}
              icon={makeCircleIcon(SEVERITY_COLOR[em.severity] || "#E24B4A", 16)}
            >
              <Popup>
                <strong>{em.label}</strong><br />
                Severity: {em.severity}<br />
                {em.assignedAmb ? `Assigned: ${em.assignedAmb}` : "Unassigned"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map legend */}
      <div className="flex gap-4 mt-2">
        {[
          { color: "#1D9E75", label: "Available" },
          { color: "#EF9F27", label: "En-route" },
          { color: "#E24B4A", label: "Emergency" },
          { color: "#BA7517", label: "Hospital" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}