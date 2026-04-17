export class LamportClock {
  constructor() {
    this.time = 0;
  }

  tick() {
    this.time += 1;
    return this.time;
  }

  // Call this when receiving a message with a remote timestamp
  update(receivedTime) {
    this.time = Math.max(this.time, receivedTime) + 1;
    return this.time;
  }

  getTime() {
    return this.time;
  }

  reset() {
    this.time = 0;
  }
}