import { MockEmailQueue } from 'jobs/email/__mocks__/email.queue';
import { EmailQueue } from 'jobs/email/email.queue.ts';
import type { Mock } from 'vitest';
import { expect } from 'vitest';

vi.mock('jobs/email/email.queue', () => ({ EmailQueue: MockEmailQueue }));
const mockEmailQueue = vi.mocked(EmailQueue, true);
type ExpectEnqueuedEmail = { from?: string; to?: string[]; bcc?: string[]; subject?: string };

expect.extend({
  toHaveEmailsEnqueued(expected: Array<ExpectEnqueuedEmail>) {
    const enqueueMock = mockEmailQueue.get().enqueue as Mock;

    const enqueued = enqueueMock.mock.calls.map((call: any[]) => {
      const { from, to, bcc, subject } = call[1];
      return { from, to, bcc, subject };
    });

    return {
      pass: this.equals(enqueued, expected),
      message: () =>
        `Expected to have ${this.utils.printExpected(expected)} but got ${this.utils.printReceived(enqueued)}`,
    };
  },
});

interface CustomMatchers<R = unknown> {
  toHaveEmailsEnqueued(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
