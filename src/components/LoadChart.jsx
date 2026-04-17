import { useSimStore } from "../store/useSimStore";

const AMB_COLORS = {
  "AMB-1": "#378ADD",
  "AMB-2": "#1D9E75",
  "AMB-3": "#D85A30",
  "AMB-4": "#7F77DD",
  "AMB-5": "#BA7517",
};

export default function LoadChart() {
  const ambulances = useSimStore((s) => s.ambulances);
  const algorithm  = useSimStore((s) => s.algorithm);

  const maxLoad = Math.max(...ambulances.map((a) => a.load), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Load distribution</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
          {algorithm.replace("_", " ")}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {ambulances.map((amb) => {
          const pct = Math.round((amb.load / maxLoad) * 100);
          const color = AMB_COLORS[amb.id] || "#888";
          const isDead = amb.nodeStatus === "dead";

          return (
            <div key={amb.id} className="flex items-center gap-2">
              <span className="text-xs font-medium w-12 text-gray-600 shrink-0">{amb.id}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-700"
                  style={{
                    width: isDead ? "100%" : `${Math.max(pct, 2)}%`,
                    background: isDead ? "#E24B4A" : color,
                    opacity: isDead ? 0.5 : 1,
                  }}
                />
              </div>
              <span className="text-xs w-12 text-right text-gray-500 shrink-0">
                {isDead ? "DEAD" : `${amb.load} calls`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="mt-3 grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
        {[
          { label: "Total calls", value: ambulances.reduce((s, a) => s + a.callsHandled, 0) },
          { label: "Active",      value: ambulances.filter((a) => a.status !== "available" && a.nodeStatus !== "dead").length },
          { label: "Available",   value: ambulances.filter((a) => a.status === "available" && a.nodeStatus !== "dead").length },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-medium text-gray-800">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}