export default function NodeCard({ node, onKill, onRecover }) {
  const alive     = node.status === "alive";
  const isPrimary = node.role === "primary" && node.type === "dispatcher";
  const isBackup  = node.role === "backup"  && node.type === "dispatcher";

  const borderColor = !alive ? "#fca5a5"
    : isPrimary ? "#a5b4fc"
    : "transparent";

  const bgColor = !alive ? "#fff1f1"
    : isPrimary ? "#f5f3ff"
    : "#fff";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "8px 10px", borderRadius: "10px",
      border: `1px solid ${borderColor}`,
      background: bgColor,
      transition: "all 0.3s",
    }}>
      {/* Pulse dot */}
      <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: alive ? (isPrimary ? "#7F77DD" : isBackup ? "#AFA9EC" : "#1D9E75") : "#E24B4A",
          animation: alive ? "pulse 1.4s ease-in-out infinite" : "none",
        }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#3d3d3a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.name.replace(" Dispatcher", " Disp.").replace(" Node", "")}
          </span>
          {node.justPromoted && (
            <span style={{ fontSize: "8px", background: "#7F77DD", color: "#fff", padding: "1px 5px", borderRadius: "6px", flexShrink: 0 }}>
              NEW
            </span>
          )}
        </div>
        <div style={{ fontSize: "10px", color: "#aaa", whiteSpace: "nowrap" }}>
          {node.type} · {alive ? node.role : "dead"}
          {node.missedHeartbeats > 0 && alive && (
            <span style={{ color: "#EF9F27", marginLeft: 4 }}>⚠{node.missedHeartbeats}</span>
          )}
        </div>
      </div>

      {/* Button */}
      {alive ? (
        <button onClick={() => onKill(node.id)} style={btnStyle("#fee2e2", "#ef4444")}>Kill</button>
      ) : (
        <button onClick={() => onRecover(node.id)} style={btnStyle("#dcfce7", "#16a34a")}>↺</button>
      )}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    fontSize: "10px", fontWeight: 500, padding: "3px 8px",
    borderRadius: "6px", border: `1px solid ${color}30`,
    background: bg, color, cursor: "pointer", flexShrink: 0,
    transition: "opacity 0.2s",
  };
}