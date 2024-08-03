export class MockEmailQueue {
  static instance: MockEmailQueue;
  static get() {
    if (!MockEmailQueue.instance) {
      MockEmailQueue.instance = new MockEmailQueue();
    }
    return MockEmailQueue.instance;
  }
  enqueue = vi.fn();
  close = vi.fn();
}
