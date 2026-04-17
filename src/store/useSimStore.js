import { create } from "zustand";
import { INITIAL_AMBULANCES, INITIAL_NODES } from "../data/cityData";

const MAX_EVENTS = 120;

export const useSimStore = create((set, get) => ({
  // --- Simulation meta ---
  running: false,
  speed: 1,
  lamportTime: 0,

  // --- Entities ---
  ambulances: INITIAL_AMBULANCES.map((a) => ({ ...a, nodeStatus: "alive" })),
  nodes: INITIAL_NODES,
  emergencies: [],      // active emergencies on map
  events: [],           // event log entries
  loadHistory: {},      // { ambId: [{ x: timestamp, y: load }, ...] }

  // --- User controls ---
  algorithm: "ROUND_ROBIN",
  networkDelay: 0,
  showTimestamps: true,
  eventFilter: "ALL",

  // ── Setters ──────────────────────────────────────────────

  setRunning: (val) => set({ running: val }),
  setSpeed: (val) => set({ speed: val }),
  setAlgorithm: (val) => set({ algorithm: val }),
  setNetworkDelay: (val) => set({ networkDelay: val }),
  setShowTimestamps: (val) => set({ showTimestamps: val }),
  setEventFilter: (val) => set({ eventFilter: val }),

  // ── Lamport clock ─────────────────────────────────────────

  tickLamport: () => {
    const t = get().lamportTime + 1;
    set({ lamportTime: t });
    return t;
  },

  updateLamport: (received) => {
    const t = Math.max(get().lamportTime, received) + 1;
    set({ lamportTime: t });
    return t;
  },

  resetLamport: () => set({ lamportTime: 0 }),

  // ── Event log ─────────────────────────────────────────────

  addEvent: (event) => {
    set((state) => {
      const next = [event, ...state.events].slice(0, MAX_EVENTS);
      return { events: next };
    });
  },

  clearEvents: () => set({ events: [] }),

  // ── Ambulances ────────────────────────────────────────────

  updateAmbulance: (id, patch) => {
    set((state) => ({
      ambulances: state.ambulances.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    }));
  },

  updateAllAmbulances: (updater) => {
    set((state) => ({ ambulances: state.ambulances.map(updater) }));
  },

  // ── Emergencies ───────────────────────────────────────────

  addEmergency: (em) => {
    set((state) => ({ emergencies: [...state.emergencies, em] }));
  },

  removeEmergency: (id) => {
    set((state) => ({
      emergencies: state.emergencies.filter((e) => e.id !== id),
    }));
  },

  // ── Nodes (network graph) ─────────────────────────────────

  setNodes: (nodes) => set({ nodes }),

  updateNode: (id, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  },

  // ── Load history (for Chart.js) ───────────────────────────

  pushLoadHistory: (ambId, load) => {
    const now = Date.now();
    set((state) => {
      const prev = state.loadHistory[ambId] || [];
      const next = [...prev, { x: now, y: load }].slice(-60);
      return { loadHistory: { ...state.loadHistory, [ambId]: next } };
    });
  },

  clearLoadHistory: () => set({ loadHistory: {} }),

  // ── Full reset ────────────────────────────────────────────

  resetAll: () =>
    set({
      running: false,
      lamportTime: 0,
      ambulances: INITIAL_AMBULANCES.map((a) => ({ ...a, nodeStatus: "alive" })),
      nodes: INITIAL_NODES,
      emergencies: [],
      events: [],
      loadHistory: {},
      algorithm: "ROUND_ROBIN",
      networkDelay: 0,
    }),
}));