import { MockEmailQueue } from 'jobs/email/__mocks__/email.queue.ts';
import { EmailQueue } from 'jobs/email/email.queue.ts';
import type { Mock } from 'vitest';
import { expect } from 'vitest';

import { type EmailMeta, getEmailsFor } from './email-helpers.ts';

vi.mock('jobs/email/email.queue', () => ({ EmailQueue: MockEmailQueue }));
const mockEmailQueue = vi.mocked(EmailQueue, true);
type ExpectEnqueuedEmail = { from?: string; to?: string[]; bcc?: string[]; subject?: string };

expect.extend({
  async toHaveEmail(email: string | null, expected: EmailMeta) {
    const emails = await getEmailsFor(email);
    const lastEmail = emails?.at(0);
    return {
      pass: this.equals(lastEmail, expected),
      message: () =>
        `Expected to have ${this.utils.printExpected(expected)} but got ${this.utils.printReceived(lastEmail)}`,
    };
  },
  async toHaveEmails(email: string | null, expected: Array<EmailMeta>) {
    const emails = await getEmailsFor(email);
    return {
      pass: this.equals(emails, expected),
      message: () =>
        `Expected to have ${this.utils.printExpected(expected)} but got ${this.utils.printReceived(emails)}`,
    };
  },
  toHaveEmailsEnqueued(expected: Array<ExpectEnqueuedEmail>) {
    const enqueueMock = mockEmailQueue.get().enqueue as Mock;

    const enqueued = enqueueMock.mock.calls.map((call: any[], index) => {
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
  toHaveEmail(expected: EmailMeta): Promise<R>;
  toHaveEmails(expected: Array<EmailMeta>): Promise<R>;
  toHaveEmailsEnqueued(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
