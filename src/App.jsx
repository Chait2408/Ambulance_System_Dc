import { useSimStore } from "./store/useSimStore";
import { useSimulation } from "./hooks/useSimulation";
import { uid, randomEmergencyType } from "./utils/helpers";

import ControlBar   from "./components/ControlBar";
import MapPanel     from "./components/MapPanel";
import NetworkGraph from "./components/NetworkGraph";
import LoadChart    from "./components/LoadChart";
import EventLog     from "./components/EventLog";
import NodeCard     from "./components/NodeCard";

export default function App() {
  const { triggerEmergency, killPrimary, killAmbulance, recoverNode } = useSimulation();
  const nodes      = useSimStore((s) => s.nodes);
  const resetAll   = useSimStore((s) => s.resetAll);
  const addEmergency  = useSimStore((s) => s.addEmergency);
  const tickLamport   = useSimStore((s) => s.tickLamport);
  const addEvent      = useSimStore((s) => s.addEvent);

  function handleMapClick(latlng) {
    const { lat, lng } = latlng;
    const type = randomEmergencyType();
    const t    = tickLamport();
    const id   = uid();
    addEmergency({ id, lat, lng, ...type, assignedAmb: null, status: "pending", spawnedAt: Date.now() });
    addEvent({ id: uid(), lamport: t, type: "DISPATCH", source: "USER", message: `Manual emergency placed — ${type.label}`, ts: Date.now() });
  }

  function handleKillNode(nodeId) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.status === "dead") return;
    if (node.type === "dispatcher" && node.role === "primary") {
      killPrimary();
    } else {
      killAmbulance(nodeId);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8f8f7", overflow: "hidden" }}>

      {/* ── Control bar ── */}
      <ControlBar
        onTriggerEmergency={triggerEmergency}
        onKillPrimary={killPrimary}
        onReset={resetAll}
      />

      {/* ── Main area: two columns ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "12px", padding: "12px", overflow: "hidden", minHeight: 0 }}>

        {/* Top-left: Map — spans rows 1 */}
        <div style={card}>
          <MapPanel onMapClick={handleMapClick} />
        </div>

        {/* Top-right: Network graph only (no cards here) */}
        <div style={card}>
          <NetworkGraph onKill={handleKillNode} onRecover={recoverNode} />
        </div>

        {/* Bottom-left: Load chart */}
        <div style={card}>
          <LoadChart />
        </div>

        {/* Bottom-right: Event log */}
        <div style={card}>
          <EventLog />
        </div>
      </div>

      {/* ── Node card strip — full width at bottom ── */}
      <div style={{ display: "flex", gap: "8px", padding: "0 12px 12px", flexShrink: 0 }}>
        {nodes.map((n) => (
          <div key={n.id} style={{ flex: 1 }}>
            <NodeCard node={n} onKill={handleKillNode} onRecover={recoverNode} />
          </div>
        ))}
      </div>

    </div>
  );
}

const card = {
  background: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e5e5e3",
  padding: "14px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};