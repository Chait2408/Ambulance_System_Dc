import { useSimStore } from "../store/useSimStore";
import { LoadBalancer } from "./LoadBalancer";
import { FaultManager } from "./FaultManager";
import {
  randomInBounds,
  randomEmergencyType,
  nearestHospital,
  uid,
  stepToward,
} from "../utils/helpers";

const TICK_MS_BASE = 2000;
const HEARTBEAT_TICKS = 3;   // heartbeat fires every N ticks
const TRAVEL_TICKS = 6;      // ambulance arrives in N ticks
const HOSPITAL_TICKS = 3;    // treatment + delivery takes N ticks

export class SimulationEngine {
  constructor() {
    this.lb = new LoadBalancer();
    this.fm = new FaultManager();
    this.tickCount = 0;
    this.intervalId = null;
    this.manuallyKilled = new Set();  // node ids killed by user
  }

  start() {
    if (this.intervalId) return;
    this._tick();
    const getSpeed = () => useSimStore.getState().speed;
    const loop = () => {
      if (!useSimStore.getState().running) return;
      this._tick();
      this.intervalId = setTimeout(loop, TICK_MS_BASE / getSpeed());
    };
    this.intervalId = setTimeout(loop, TICK_MS_BASE / getSpeed());
  }

  stop() {
    clearTimeout(this.intervalId);
    this.intervalId = null;
  }

  // Called externally when user clicks "Trigger Emergency"
  triggerManualEmergency() {
    this._spawnEmergency();
  }

  // Called externally when user clicks "Kill Dispatcher"
  killPrimary() {
    const { nodes, setNodes, addEvent, tickLamport } = useSimStore.getState();
    const primary = nodes.find((n) => n.role === "primary" && n.type === "dispatcher" && n.status === "alive");
    if (!primary) return;
    this.manuallyKilled.add(primary.id);
    this._handleNodeDeath(primary.id);
    const t = tickLamport();
    addEvent({ id: uid(), lamport: t, type: "CRASH", source: primary.id, message: `${primary.name} was manually killed`, ts: Date.now() });
  }

  // Called externally when user kills a specific ambulance
  killAmbulance(ambId) {
    const { updateAmbulance, updateNode, addEvent, tickLamport } = useSimStore.getState();
    this.manuallyKilled.add(ambId);
    updateAmbulance(ambId, { nodeStatus: "dead", status: "dead" });
    updateNode(ambId, { status: "dead" });
    const t = tickLamport();
    addEvent({ id: uid(), lamport: t, type: "CRASH", source: ambId, message: `${ambId} node crashed`, ts: Date.now() });
  }

  // Called externally when user recovers a node
  recoverNode(nodeId) {
    const { nodes, setNodes, updateAmbulance, addEvent, tickLamport } = useSimStore.getState();
    this.manuallyKilled.delete(nodeId);
    const updated = this.fm.recoverNode(nodes, nodeId);
    setNodes(updated);
    // If it's an ambulance node, also update ambulance state
    updateAmbulance(nodeId, { nodeStatus: "alive", status: "available", activeCall: null, load: 0 });
    const t = tickLamport();
    addEvent({ id: uid(), lamport: t, type: "RECOVER", source: nodeId, message: `${nodeId} recovered and rejoined`, ts: Date.now() });
  }

  // ── Internal tick ──────────────────────────────────────────

  _tick() {
    this.tickCount += 1;
    const store = useSimStore.getState();
    if (!store.running) return;

    this.lb.setAlgorithm(store.algorithm);

    // 1. Heartbeat check
    if (this.tickCount % HEARTBEAT_TICKS === 0) {
      this._runHeartbeat();
    }

    // 2. Possibly spawn a new emergency (70% chance per tick)
    if (Math.random() < 0.7) {
      this._spawnEmergency();
    }

    // 3. Move all en-route ambulances one step
    this._moveAmbulances();

    // 4. Push load history snapshot
    this._snapshotLoad();
  }

  _runHeartbeat() {
    const { nodes, setNodes, addEvent, tickLamport } = useSimStore.getState();

    // Increment missed heartbeats for manually killed nodes
    const ticked = this.fm.tickHeartbeats(nodes, [...this.manuallyKilled]);
    setNodes(ticked);

    // Check if any node exceeded the missed heartbeat limit
    const faultEvents = this.fm.checkHeartbeats(ticked);
    faultEvents.forEach((fe) => {
      if (fe.type === "NODE_DEAD") {
        const alreadyDead = ticked.find((n) => n.id === fe.nodeId)?.status === "dead";
        if (!alreadyDead) {
          this._handleNodeDeath(fe.nodeId);
        }
      }
    });

    // Log heartbeat for alive nodes
    const t = tickLamport();
    addEvent({
      id: uid(), lamport: t, type: "HEARTBEAT",
      source: "SYSTEM",
      message: `Heartbeat — ${ticked.filter((n) => n.status === "alive").length} nodes alive`,
      ts: Date.now(),
    });
  }

  _handleNodeDeath(nodeId) {
    const { nodes, setNodes, addEvent, tickLamport } = useSimStore.getState();
    const { updatedNodes, events } = this.fm.handleNodeDeath(nodes, nodeId);
    setNodes(updatedNodes);
    events.forEach((e) => {
      const t = tickLamport();
      if (e.type === "NODE_PROMOTED") {
        addEvent({
          id: uid(), lamport: t, type: "RECOVER",
          source: e.nodeId,
          message: `${e.nodeId} promoted to PRIMARY dispatcher`,
          ts: Date.now(),
        });
      }
    });
  }

  _spawnEmergency() {
    const { ambulances, nodes, addEvent, addEmergency, tickLamport, networkDelay } = useSimStore.getState();

    const primary = nodes.find((n) => n.role === "primary" && n.type === "dispatcher" && n.status === "alive");
    if (!primary) return;  // no dispatcher alive — cannot dispatch

    const pos = randomInBounds();
    const emergencyType = randomEmergencyType();
    const emergencyId = uid();

    const emergency = {
      id: emergencyId,
      ...pos,
      ...emergencyType,
      assignedAmb: null,
      status: "pending",
      spawnedAt: Date.now(),
      travelTicksLeft: TRAVEL_TICKS,
      hospitalTicksLeft: HOSPITAL_TICKS,
    };

    // Apply simulated network delay before dispatching
    setTimeout(() => {
      const state = useSimStore.getState();
      const chosen = this.lb.pickAmbulance(state.ambulances, emergency);
      if (!chosen) {
        addEmergency({ ...emergency, status: "unassigned" });
        return;
      }

      const t = state.tickLamport();
      emergency.assignedAmb = chosen.id;
      emergency.status = "dispatched";
      addEmergency(emergency);

      state.updateAmbulance(chosen.id, {
        status: "en-route",
        activeCall: emergencyId,
        load: chosen.load + 1,
        targetLat: pos.lat,
        targetLng: pos.lng,
        travelTicksLeft: TRAVEL_TICKS,
        phase: "to-emergency",
        emergencyId,
      });

      state.updateNode(chosen.id, { status: "busy" });

      addEvent({
        id: uid(), lamport: t, type: "DISPATCH",
        source: primary.id,
        message: `${chosen.id} dispatched → ${emergencyType.label} (${emergencyType.severity})`,
        severity: emergencyType.severity,
        ts: Date.now(),
      });

      // Replicate to backup
      const backup = state.nodes.find((n) => n.type === "dispatcher" && n.role === "backup" && n.status === "alive");
      if (backup) {
        const tr = state.tickLamport();
        addEvent({
          id: uid(), lamport: tr, type: "REPLICATE",
          source: primary.id,
          message: `State replicated to ${backup.id}`,
          ts: Date.now(),
        });
      }
    }, networkDelay);
  }

  _moveAmbulances() {
    const { ambulances, updateAmbulance, removeEmergency, addEvent, tickLamport, updateNode } = useSimStore.getState();

    ambulances.forEach((amb) => {
      if (amb.status === "available" || amb.nodeStatus === "dead") return;

      if (amb.phase === "to-emergency" && amb.targetLat != null) {
        const next = stepToward({ lat: amb.lat, lng: amb.lng }, { lat: amb.targetLat, lng: amb.targetLng });
        const ticksLeft = (amb.travelTicksLeft || TRAVEL_TICKS) - 1;

        if (ticksLeft <= 0) {
          // Arrived at emergency
          const hospital = nearestHospital(amb.targetLat, amb.targetLng);
          const t = tickLamport();
          addEvent({
            id: uid(), lamport: t, type: "ACK",
            source: amb.id,
            message: `${amb.id} arrived at scene — transporting to ${hospital.name}`,
            ts: Date.now(),
          });
          removeEmergency(amb.emergencyId);
          updateAmbulance(amb.id, {
            lat: amb.targetLat, lng: amb.targetLng,
            phase: "to-hospital",
            targetLat: hospital.lat, targetLng: hospital.lng,
            travelTicksLeft: HOSPITAL_TICKS,
            hospitalId: hospital.id,
          });
        } else {
          updateAmbulance(amb.id, { lat: next.lat, lng: next.lng, travelTicksLeft: ticksLeft });
        }
      } else if (amb.phase === "to-hospital" && amb.targetLat != null) {
        const next = stepToward({ lat: amb.lat, lng: amb.lng }, { lat: amb.targetLat, lng: amb.targetLng });
        const ticksLeft = (amb.travelTicksLeft || HOSPITAL_TICKS) - 1;

        if (ticksLeft <= 0) {
          // Delivered — return ambulance to available
          const t = tickLamport();
          addEvent({
            id: uid(), lamport: t, type: "DELIVERED",
            source: amb.id,
            message: `${amb.id} delivered patient — now available`,
            ts: Date.now(),
          });
          updateAmbulance(amb.id, {
            lat: amb.targetLat, lng: amb.targetLng,
            status: "available", phase: null,
            activeCall: null, emergencyId: null,
            targetLat: null, targetLng: null,
            load: Math.max(0, amb.load - 1),
            callsHandled: amb.callsHandled + 1,
          });
          updateNode(amb.id, { status: "alive" });
        } else {
          updateAmbulance(amb.id, { lat: next.lat, lng: next.lng, travelTicksLeft: ticksLeft });
        }
      }
    });
  }

  _snapshotLoad() {
    const { ambulances, pushLoadHistory } = useSimStore.getState();
    ambulances.forEach((a) => {
      pushLoadHistory(a.id, a.load);
    });
  }
}