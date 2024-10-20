import { getEmailProvider } from '~/libs/email-providers/provider.ts';
import { getEnv } from '~/libs/jobs/env.ts';
import { job } from '~/libs/jobs/job.ts';

export type Email = {
  from: string;
  to: string[];
  bcc?: string[];
  subject: string;
  html: string;
};

const env = getEnv();

export const sendEmail = job<Email>({
  name: 'send-email',
  queue: 'default',
  run: async (payload: Email) => {
    const emailProvider = getEmailProvider(env);

    if (!emailProvider) return Promise.reject('Email provider not found');

    return emailProvider.send(payload);
  },
});
