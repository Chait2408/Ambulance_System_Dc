import { useSimStore } from "../store/useSimStore";

const ALGORITHMS = [
  { value: "ROUND_ROBIN",  label: "Round Robin"  },
  { value: "LEAST_LOADED", label: "Least Loaded" },
  { value: "NEAREST",      label: "Nearest"      },
];

export default function ControlBar({ onTriggerEmergency, onKillPrimary, onReset }) {
  const running      = useSimStore((s) => s.running);
  const speed        = useSimStore((s) => s.speed);
  const algorithm    = useSimStore((s) => s.algorithm);
  const lamportTime  = useSimStore((s) => s.lamportTime);
  const setRunning   = useSimStore((s) => s.setRunning);
  const setSpeed     = useSimStore((s) => s.setSpeed);
  const setAlgorithm = useSimStore((s) => s.setAlgorithm);

  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px",
      padding: "10px 16px", background: "#fff",
      borderBottom: "1px solid #e5e5e3", flexShrink: 0,
    }}>
      {/* Brand */}
      <span style={{ fontWeight: 700, fontSize: "14px", color: "#3d3d3a", marginRight: "4px" }}>
        Ambulance Dispatch
      </span>

      {/* Lamport clock badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: "#EEEDFE", border: "1px solid #AFA9EC" }}>
        <span style={{ fontSize: "11px", color: "#7F77DD", fontWeight: 500 }}>T:</span>
        <span style={{ fontSize: "13px", fontFamily: "monospace", fontWeight: 700, color: "#534AB7" }}>{lamportTime}</span>
      </div>

      <div style={divider} />

      {/* Start / Pause */}
      <button onClick={() => setRunning(!running)} style={running ? btnAmber : btnGreen}>
        {running ? "⏸ Pause" : "▶ Start"}
      </button>

      {/* Manual emergency */}
      <button onClick={onTriggerEmergency} style={btnRed}>
        🚨 Emergency
      </button>

      {/* Kill dispatcher */}
      <button onClick={onKillPrimary} style={btnGray}>
        💀 Kill Dispatcher
      </button>

      {/* Reset */}
      <button onClick={onReset} style={btnGray}>
        ↺ Reset
      </button>

      <div style={divider} />

      {/* Algorithm */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={ctrlLabel}>Algorithm</span>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          style={{ fontSize: "12px", border: "1px solid #e0dfda", borderRadius: "8px", padding: "5px 10px", background: "#fff", color: "#3d3d3a", cursor: "pointer" }}
        >
          {ALGORITHMS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Speed */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={ctrlLabel}>Speed</span>
        <input
          type="range" min={0.5} max={3} step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ width: "80px", accentColor: "#7F77DD" }}
        />
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#555", minWidth: "26px" }}>{speed}×</span>
      </div>
    </div>
  );
}

const divider  = { width: "1px", height: "22px", background: "#e5e5e3", flexShrink: 0 };
const ctrlLabel = { fontSize: "11px", color: "#aaa", fontWeight: 500 };

const baseBtn = { fontSize: "12px", fontWeight: 600, padding: "6px 14px", borderRadius: "8px", cursor: "pointer", border: "none", transition: "opacity 0.2s" };
const btnGreen = { ...baseBtn, background: "#dcfce7", color: "#16a34a" };
const btnAmber = { ...baseBtn, background: "#fef3c7", color: "#d97706" };
const btnRed   = { ...baseBtn, background: "#fee2e2", color: "#dc2626" };
const btnGray  = { ...baseBtn, background: "#f4f4f3", color: "#555" };