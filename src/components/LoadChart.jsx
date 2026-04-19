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
  const maxLoad    = Math.max(...ambulances.map((a) => a.load), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexShrink: 0 }}>
        <span style={sectionLabel}>Load distribution</span>
        <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: "#EEEDFE", color: "#534AB7" }}>
          {algorithm.replace("_", " ")}
        </span>
      </div>

      {/* Bars */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
        {ambulances.map((amb) => {
          const isDead = amb.nodeStatus === "dead";
          const pct    = isDead ? 100 : Math.max((amb.load / maxLoad) * 100, amb.load > 0 ? 8 : 1);
          const color  = isDead ? "#E24B4A" : AMB_COLORS[amb.id] || "#888";

          return (
            <div key={amb.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#555", width: "46px", flexShrink: 0 }}>{amb.id}</span>
              <div style={{ flex: 1, background: "#f0efea", borderRadius: "6px", height: "18px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "6px",
                  width: `${pct}%`,
                  background: color,
                  opacity: isDead ? 0.5 : 1,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <span style={{ fontSize: "11px", color: "#999", width: "52px", textAlign: "right", flexShrink: 0 }}>
                {isDead ? "DEAD" : `${amb.load} call${amb.load !== 1 ? "s" : ""}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", paddingTop: "12px", marginTop: "12px", borderTop: "1px solid #f0efea", flexShrink: 0 }}>
        {[
          { label: "Total handled", value: ambulances.reduce((s, a) => s + a.callsHandled, 0) },
          { label: "Active now",    value: ambulances.filter((a) => a.status !== "available" && a.nodeStatus !== "dead").length },
          { label: "Available",     value: ambulances.filter((a) => a.status === "available"  && a.nodeStatus !== "dead").length },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 500, color: "#3d3d3a" }}>{value}</div>
            <div style={{ fontSize: "10px", color: "#aaa", marginTop: "1px" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: "11px", fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em" };