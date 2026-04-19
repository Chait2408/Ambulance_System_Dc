import { useSimStore } from "../store/useSimStore";
import { EVENT_COLORS } from "../utils/helpers";

const FILTERS = ["ALL", "DISPATCH", "ACK", "CRASH", "RECOVER", "HEARTBEAT", "REPLICATE", "DELIVERED"];

export default function EventLog() {
  const events            = useSimStore((s) => s.events);
  const showTimestamps    = useSimStore((s) => s.showTimestamps);
  const eventFilter       = useSimStore((s) => s.eventFilter);
  const networkDelay      = useSimStore((s) => s.networkDelay);
  const setShowTimestamps = useSimStore((s) => s.setShowTimestamps);
  const setEventFilter    = useSimStore((s) => s.setEventFilter);
  const setNetworkDelay   = useSimStore((s) => s.setNetworkDelay);

  const visible = eventFilter === "ALL"
    ? events
    : events.filter((e) => e.type === eventFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexShrink: 0 }}>
        <span style={sectionLabel}>Event log</span>
        <button
          onClick={() => setShowTimestamps(!showTimestamps)}
          style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "8px", border: "1px solid #e0dfda", background: showTimestamps ? "#EEEDFE" : "#fff", color: showTimestamps ? "#534AB7" : "#888", cursor: "pointer" }}
        >
          {showTimestamps ? "Hide [T]" : "Show [T]"}
        </button>
      </div>

      {/* Delay slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", color: "#aaa", flexShrink: 0 }}>Delay</span>
        <input
          type="range" min={0} max={2000} step={100}
          value={networkDelay}
          onChange={(e) => setNetworkDelay(Number(e.target.value))}
          style={{ flex: 1, height: "3px", accentColor: "#7F77DD" }}
        />
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#888", width: "38px", textAlign: "right", flexShrink: 0 }}>
          {networkDelay}ms
        </span>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px", flexShrink: 0 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setEventFilter(f)}
            style={{
              fontSize: "10px", fontWeight: 500, padding: "3px 8px", borderRadius: "12px", cursor: "pointer",
              border: eventFilter === f ? "none" : "1px solid #e0dfda",
              background: eventFilter === f ? "#3d3d3a" : "#fff",
              color: eventFilter === f ? "#fff" : "#888",
              transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: "1px" }}>
        {visible.length === 0 && (
          <p style={{ textAlign: "center", color: "#ccc", fontSize: "12px", marginTop: "24px" }}>
            No events yet — press Start
          </p>
        )}
        {visible.map((ev) => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 2px", borderBottom: "1px solid #f5f5f3", fontSize: "11px" }}>
            {showTimestamps && (
              <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "10px", padding: "1px 5px", borderRadius: "4px", background: "#f5f5f3", color: EVENT_COLORS[ev.type] || "#888", flexShrink: 0 }}>
                T:{ev.lamport}
              </span>
            )}
            <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "5px", color: "#fff", background: EVENT_COLORS[ev.type] || "#888", flexShrink: 0, letterSpacing: "0.03em" }}>
              {ev.type}
            </span>
            <span style={{ color: "#555", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.message}</span>
            <span style={{ color: "#ccc", flexShrink: 0, fontSize: "10px" }}>
              {new Date(ev.ts).toLocaleTimeString("en-IN", { hour12: false })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const sectionLabel = { fontSize: "11px", fontWeight: 600, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em" };