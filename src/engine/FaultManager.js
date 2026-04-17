export class FaultManager {
  constructor() {
    this.MISSED_HEARTBEAT_LIMIT = 2;
  }

  // Returns list of event objects describing what changed
  checkHeartbeats(nodes) {
    const events = [];
    nodes.forEach((node) => {
      if (node.status === "dead") return;
      if (node.missedHeartbeats >= this.MISSED_HEARTBEAT_LIMIT) {
        events.push({ type: "NODE_DEAD", nodeId: node.id });
      }
    });
    return events;
  }

  // Returns updated nodes array + any promotion events
  handleNodeDeath(nodes, deadNodeId) {
    const events = [];
    const updated = nodes.map((n) => {
      if (n.id === deadNodeId) {
        return { ...n, status: "dead", missedHeartbeats: 0 };
      }
      return n;
    });

    // If a primary dispatcher died, promote the backup
    const deadNode = nodes.find((n) => n.id === deadNodeId);
    if (deadNode && deadNode.role === "primary" && deadNode.type === "dispatcher") {
      const backupIdx = updated.findIndex(
        (n) => n.type === "dispatcher" && n.role === "backup" && n.status === "alive"
      );
      if (backupIdx !== -1) {
        updated[backupIdx] = { ...updated[backupIdx], role: "primary", justPromoted: true };
        events.push({ type: "NODE_PROMOTED", nodeId: updated[backupIdx].id });
      }
    }
    return { updatedNodes: updated, events };
  }

  recoverNode(nodes, nodeId) {
    return nodes.map((n) => {
      if (n.id === nodeId) {
        const isDispatcher = n.type === "dispatcher";
        return {
          ...n,
          status: "alive",
          missedHeartbeats: 0,
          justPromoted: false,
          // Recovered dispatcher always comes back as backup if a primary exists
          role: isDispatcher ? "backup" : n.role,
        };
      }
      return n;
    });
  }

  tickHeartbeats(nodes, deadNodeIds = []) {
    return nodes.map((n) => {
      if (n.status === "dead") return n;
      if (deadNodeIds.includes(n.id)) {
        return { ...n, missedHeartbeats: n.missedHeartbeats + 1 };
      }
      // Node is alive — reset missed counter
      return { ...n, missedHeartbeats: 0 };
    });
  }
}