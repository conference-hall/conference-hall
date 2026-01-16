import { z } from 'zod';
import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import { testJob } from '~/features/admin/debug/services/jobs/test.job.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { NotAuthorizedError } from '~/shared/errors.server.ts';

export const TestEmailSchema = z.object({ to: z.email() });

type TestEmail = z.infer<typeof TestEmailSchema>;

export class AdminDebug {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
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
      subject: 'Conference Hall',
      from: 'no-reply@mg.conference-hall.io',
      to: [email.to],
      data: {
        children:
          'Dear Ben, We’re excited to welcome you as a speaker at our upcoming conference! Your session will be held in Conference Hall A, equipped with a full AV setup, including a projector, microphones, and a sound system. The hall will be open for you to test your presentation 30 minutes before your scheduled time. If you have any specific requirements or need assistance, please let us know in advance. We’re here to ensure everything runs smoothly so you can focus on delivering an outstanding talk. Looking forward to your presentation!',
        logoUrl: 'https://conference-hall.io/storage/b6cf57b6-b752-4b8d-a280-02e17b0c5262.jpg',
      },
      locale: 'en',
    });
  }
}
