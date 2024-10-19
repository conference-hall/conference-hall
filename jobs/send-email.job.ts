import { emailProvider } from './libs/emails/provider.ts';
import { job } from './libs/job.ts';

export type Email = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  html: string;
};

export const sendEmail = job<Email>({
  name: 'send-email',
  queue: 'default',
  run: async (payload: Email) => {
    if (!emailProvider) return Promise.reject('Email provider not found');

    return emailProvider.send(payload);
  },
});
