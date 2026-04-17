import { useSimStore } from "./store/useSimStore";
import { useSimulation } from "./hooks/useSimulation";
import { uid, randomEmergencyType } from "./utils/helpers";
import { MUMBAI_BOUNDS } from "./data/cityData";

import ControlBar    from "./components/ControlBar";
import MapPanel      from "./components/MapPanel";
import NetworkGraph  from "./components/NetworkGraph";
import LoadChart     from "./components/LoadChart";
import EventLog      from "./components/EventLog";
import NodeCard      from "./components/NodeCard";

export default function App() {
  const { triggerEmergency, killPrimary, killAmbulance, recoverNode } = useSimulation();
  const nodes     = useSimStore((s) => s.nodes);
  const resetAll  = useSimStore((s) => s.resetAll);
  const addEmergency = useSimStore((s) => s.addEmergency);
  const tickLamport  = useSimStore((s) => s.tickLamport);
  const addEvent     = useSimStore((s) => s.addEvent);

  function handleMapClick(latlng) {
    const { lat, lng } = latlng;
    const type = randomEmergencyType();
    const t = tickLamport();
    const id = uid();
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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top control bar */}
      <ControlBar
        onTriggerEmergency={triggerEmergency}
        onKillPrimary={killPrimary}
        onReset={resetAll}
      />

      {/* Main 2×2 grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 p-3 overflow-hidden">

        {/* Top-left: Map */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 overflow-hidden flex flex-col">
          <MapPanel onMapClick={handleMapClick} />
        </div>

        {/* Top-right: Network graph + node cards */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 overflow-hidden flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <NetworkGraph onKill={handleKillNode} onRecover={recoverNode} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 shrink-0">
            {nodes.map((n) => (
              <NodeCard key={n.id} node={n} onKill={handleKillNode} onRecover={recoverNode} />
            ))}
          </div>
        </div>

        {/* Bottom-left: Load chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 overflow-hidden flex flex-col">
          <LoadChart />
        </div>

        {/* Bottom-right: Event log */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 overflow-hidden flex flex-col">
          <EventLog />
        </div>
      </div>
    </div>
  );
}