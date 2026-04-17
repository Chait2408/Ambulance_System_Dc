# Ambulance System (React + Vite)

A small simulation and visualization app for ambulance dispatch and load balancing built with React and Vite.

This repository contains a modular simulation engine and a UI that visualizes nodes, networks, and live events.

**Key features:**
- Simulation engine with Lamport clock and fault management: [src/engine/SimulationEngine.js](src/engine/SimulationEngine.js#L1)
- Load balancing logic: [src/engine/LoadBalancer.js](src/engine/LoadBalancer.js#L1)
- React components for map, graph, and controls: [src/components/MapPanel.jsx](src/components/MapPanel.jsx#L1), [src/components/NetworkGraph.jsx](src/components/NetworkGraph.jsx#L1)
- Hooks and store for simulation state: [src/hooks/useSimulation.js](src/hooks/useSimulation.js#L1), [src/store/useSimStore.js](src/store/useSimStore.js#L1)

Getting started

Prerequisites:
- Node.js 18+ (or compatible)

Install dependencies:

```bash
npm install
```

Run development server with HMR:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Project structure (high level)
- `src/engine/` — core simulation logic and managers
- `src/components/` — UI components: `ControlBar`, `MapPanel`, `NetworkGraph`, `NodeCard`, etc.
- `src/hooks/` — custom hooks used by the UI
- `src/store/` — lightweight app state for simulation
- `src/data/` — sample city/network data used by the simulator

Development notes
- The simulation is driven from `src/main.jsx` and `src/App.jsx` which wire the UI to the engine and store.
- To explore or extend simulation behaviors, start with `src/engine/SimulationEngine.js` and `src/engine/FaultManager.js`.

If you'd like, I can:
- add usage examples for the engine API
- add a short CONTRIBUTING guide and developer scripts
- run the app locally and verify the dev server starts

License

This project does not include a license file. Add one if you plan to publish or share the code.
