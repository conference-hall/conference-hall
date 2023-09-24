import { expect } from 'vitest';

import { type EmailMeta, getEmailsFor } from './email-helpers.ts';

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
});

interface CustomMatchers<R = unknown> {
  toHaveEmail(expected: EmailMeta): Promise<R>;
  toHaveEmails(expected: Array<EmailMeta>): Promise<R>;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
