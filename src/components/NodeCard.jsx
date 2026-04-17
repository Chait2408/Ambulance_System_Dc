export default function NodeCard({ node, onKill, onRecover }) {
  const alive = node.status === "alive";
  const isPrimary = node.role === "primary";

  return (
    <div
      className={`relative flex items-center gap-3 p-2 rounded-lg border transition-all ${
        !alive
          ? "border-red-200 bg-red-50"
          : isPrimary && node.type === "dispatcher"
          ? "border-purple-300 bg-purple-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Heartbeat pulse */}
      <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${alive ? "bg-green-500" : "bg-red-400"}`}
          style={alive ? { animation: "pulse 1.4s ease-in-out infinite" } : {}}
        />
        {alive && (
          <div
            className="absolute inset-0 rounded-full bg-green-400 opacity-30"
            style={{ animation: "ping 1.4s ease-in-out infinite" }}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-800 truncate">{node.name}</span>
          {node.justPromoted && (
            <span className="text-xs bg-purple-600 text-white px-1 rounded" style={{ fontSize: "9px" }}>
              PRIMARY
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {node.type} · {alive ? node.role : "dead"}
          {node.missedHeartbeats > 0 && alive && (
            <span className="text-amber-500 ml-1">⚠ {node.missedHeartbeats} missed</span>
          )}
        </div>
      </div>

      {/* Action button */}
      {alive ? (
        <button
          onClick={() => onKill(node.id)}
          className="shrink-0 text-xs px-2 py-0.5 rounded border border-red-200 text-red-500 hover:bg-red-50"
        >
          Kill
        </button>
      ) : (
        <button
          onClick={() => onRecover(node.id)}
          className="shrink-0 text-xs px-2 py-0.5 rounded border border-green-200 text-green-600 hover:bg-green-50"
        >
          Recover
        </button>
      )}
    </div>
  );
}