import { useSimStore } from "../store/useSimStore";

const ALGORITHMS = [
  { value: "ROUND_ROBIN",  label: "Round Robin" },
  { value: "LEAST_LOADED", label: "Least Loaded" },
  { value: "NEAREST",      label: "Nearest" },
];

export default function ControlBar({ onTriggerEmergency, onKillPrimary, onReset }) {
  const running     = useSimStore((s) => s.running);
  const speed       = useSimStore((s) => s.speed);
  const algorithm   = useSimStore((s) => s.algorithm);
  const lamportTime = useSimStore((s) => s.lamportTime);
  const setRunning  = useSimStore((s) => s.setRunning);
  const setSpeed    = useSimStore((s) => s.setSpeed);
  const setAlgorithm = useSimStore((s) => s.setAlgorithm);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      {/* Brand */}
      <span className="font-semibold text-gray-800 text-sm mr-2">Ambulance Dispatch</span>

      {/* Lamport clock */}
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-purple-50 border border-purple-200">
        <span className="text-xs text-purple-500">T:</span>
        <span className="text-sm font-mono font-medium text-purple-700">{lamportTime}</span>
      </div>

      <div className="w-px h-6 bg-gray-200" />

      {/* Start / Pause */}
      <button
        onClick={() => setRunning(!running)}
        className={`text-sm px-3 py-1.5 rounded font-medium transition-colors ${
          running
            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {running ? "⏸ Pause" : "▶ Start"}
      </button>

      {/* Manual emergency */}
      <button
        onClick={onTriggerEmergency}
        className="text-sm px-3 py-1.5 rounded font-medium bg-red-100 text-red-700 hover:bg-red-200"
      >
        🚨 Emergency
      </button>

      {/* Kill primary */}
      <button
        onClick={onKillPrimary}
        className="text-sm px-3 py-1.5 rounded font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        💀 Kill Dispatcher
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-sm px-3 py-1.5 rounded font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
      >
        ↺ Reset
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Algorithm selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Algorithm</span>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700"
        >
          {ALGORITHMS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      {/* Speed slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Speed</span>
        <input
          type="range" min={0.5} max={3} step={0.5}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-20 h-1 accent-purple-500"
        />
        <span className="text-xs font-medium text-gray-600 w-8">{speed}×</span>
      </div>
    </div>
  );
}