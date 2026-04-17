function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class LoadBalancer {
  constructor() {
    this.algorithm = "ROUND_ROBIN";
    this.roundRobinIndex = 0;
  }

  setAlgorithm(algo) {
    this.algorithm = algo;
    this.roundRobinIndex = 0;
  }

  getAlgorithm() {
    return this.algorithm;
  }

  // Returns the chosen ambulance object or null if none available
  pickAmbulance(ambulances, emergency) {
    const available = ambulances.filter(
      (a) => a.status === "available" && a.nodeStatus !== "dead"
    );
    if (available.length === 0) return null;

    switch (this.algorithm) {
      case "ROUND_ROBIN":
        return this._roundRobin(available);
      case "LEAST_LOADED":
        return this._leastLoaded(available);
      case "NEAREST":
        return this._nearest(available, emergency);
      default:
        return this._roundRobin(available);
    }
  }

  _roundRobin(available) {
    const idx = this.roundRobinIndex % available.length;
    this.roundRobinIndex += 1;
    return available[idx];
  }

  _leastLoaded(available) {
    return available.reduce((best, amb) =>
      amb.load < best.load ? amb : best
    );
  }

  _nearest(available, emergency) {
    return available.reduce((best, amb) => {
      const dBest = getDistance(best.lat, best.lng, emergency.lat, emergency.lng);
      const dAmb  = getDistance(amb.lat,  amb.lng,  emergency.lat, emergency.lng);
      return dAmb < dBest ? amb : best;
    });
  }
}