import { useEffect, useRef } from "react";
import { SimulationEngine } from "../engine/SimulationEngine";
import { useSimStore } from "../store/useSimStore";

export function useSimulation() {
  const engineRef = useRef(null);
  const running = useSimStore((s) => s.running);
  const speed = useSimStore((s) => s.speed);

  // Create engine once
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }

  // Start/stop based on running state
  useEffect(() => {
    const engine = engineRef.current;
    if (running) {
      engine.start();
    } else {
      engine.stop();
    }
    return () => engine.stop();
  }, [running, speed]);

  return {
    triggerEmergency: () => engineRef.current?.triggerManualEmergency(),
    killPrimary:      () => engineRef.current?.killPrimary(),
    killAmbulance:    (id) => engineRef.current?.killAmbulance(id),
    recoverNode:      (id) => engineRef.current?.recoverNode(id),
  };
}