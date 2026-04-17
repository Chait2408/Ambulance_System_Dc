import { useSimStore } from "../store/useSimStore";
import { EVENT_COLORS } from "../utils/helpers";

const FILTERS = ["ALL", "DISPATCH", "ACK", "CRASH", "RECOVER", "HEARTBEAT", "REPLICATE", "DELIVERED"];

export default function EventLog() {
  const events         = useSimStore((s) => s.events);
  const showTimestamps = useSimStore((s) => s.showTimestamps);
  const eventFilter    = useSimStore((s) => s.eventFilter);
  const networkDelay   = useSimStore((s) => s.networkDelay);
  const setShowTimestamps = useSimStore((s) => s.setShowTimestamps);
  const setEventFilter    = useSimStore((s) => s.setEventFilter);
  const setNetworkDelay   = useSimStore((s) => s.setNetworkDelay);

  const visible = eventFilter === "ALL"
    ? events
    : events.filter((e) => e.type === eventFilter);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event log</span>
        <button
          onClick={() => setShowTimestamps(!showTimestamps)}
          className="text-xs px-2 py-0.5 rounded border border-gray-200 hover:bg-gray-50"
        >
          {showTimestamps ? "Hide [T]" : "Show [T]"}
        </button>
      </div>

      {/* Network delay slider */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 whitespace-nowrap">Delay</span>
        <input
          type="range" min={0} max={2000} step={100}
          value={networkDelay}
          onChange={(e) => setNetworkDelay(Number(e.target.value))}
          className="flex-1 h-1 accent-purple-500"
        />
        <span className="text-xs font-medium w-14 text-right">{networkDelay}ms</span>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1 mb-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setEventFilter(f)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              eventFilter === f
                ? "bg-gray-800 text-white border-gray-800"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ minHeight: 0 }}>
        {visible.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8">No events yet — start the simulation</p>
        )}
        {visible.map((ev) => (
          <div
            key={ev.id}
            className="flex items-start gap-2 text-xs py-1 border-b border-gray-100"
          >
            {showTimestamps && (
              <span
                className="font-mono shrink-0 font-medium px-1 rounded"
                style={{ color: EVENT_COLORS[ev.type] || "#888", background: "#f5f5f5" }}
              >
                T:{ev.lamport}
              </span>
            )}
            <span
              className="shrink-0 font-medium uppercase px-1.5 py-0.5 rounded text-white"
              style={{ fontSize: "9px", background: EVENT_COLORS[ev.type] || "#888" }}
            >
              {ev.type}
            </span>
            <span className="text-gray-600 leading-4">{ev.message}</span>
            <span className="text-gray-300 shrink-0 ml-auto">
              {new Date(ev.ts).toLocaleTimeString("en-IN", { hour12: false })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}