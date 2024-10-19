import { emailProvider } from 'jobs/libs/emails/provider.ts';
import { task } from 'jobs/libs/tasks/task.ts';

export type Email = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  html: string;
};

export const sendEmail = task<Email>({
  id: 'send-email',
  run: async (payload: Email) => {
    if (!emailProvider) return Promise.reject('Email provider not found');

    return emailProvider.send(payload);
  },
});
