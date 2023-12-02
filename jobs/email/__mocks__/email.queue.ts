export class MockEmailQueue {
  static instance: MockEmailQueue;
  static get() {
    if (!this.instance) {
      this.instance = new MockEmailQueue();
    }
    return this.instance;
  }
  enqueue = vi.fn();
  close = vi.fn();
}
