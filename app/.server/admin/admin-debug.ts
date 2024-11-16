import { z } from 'zod';
import { sendEmail } from '~/emails/send-email.job.ts';
import { testJob } from '../shared/jobs/test.job.ts';
import { needsAdminRole } from './authorization.ts';

export const TestEmailSchema = z.object({ to: z.string().email() });

type TestEmail = z.infer<typeof TestEmailSchema>;

export class AdminDebug {
  private constructor() {}

  static async for(userId: string) {
    await needsAdminRole(userId);
    return new AdminDebug();
  }

  simulateServerError() {
    throw new Error('Simulated server error');
  }

  async sendTestJobcall() {
    await testJob.trigger();
  }

  async sendTestEmail(email: TestEmail) {
    return sendEmail.trigger({
      template: 'base-event-email',
      subject: 'Test email from Conference Hall',
      from: 'Test email <no-reply@mg.conference-hall.io>',
      to: [email.to],
      data: {
        children: 'This is a test email from Conference Hall',
        logoUrl: 'https://conference-hall.io/storage/b6cf57b6-b752-4b8d-a280-02e17b0c5262.jpg',
      },
    });
  }
}
