import { renderEmail } from '~/emails/email.renderer.tsx';
import { getEnv } from '~/libs/jobs/env.ts';
import { job } from '~/libs/jobs/job.ts';
import { getEmailProvider } from './providers/provider.ts';

type Email = {
  locale: string;
  template: string;
  from: string;
  to: string[];
  subject: string;
  data: Record<string, any>;
};

const env = getEnv();

export const sendEmail = job<Email>({
  name: 'send-email',
  queue: 'default',

  run: async (payload: Email) => {
    const emailProvider = getEmailProvider(env);

    if (!emailProvider) return Promise.reject('Email provider not found');

    const emailRendered = await renderEmail(payload.template, payload.data, payload.locale);

    if (!emailRendered) return Promise.reject('Email rendering failed');

    const { html, text } = emailRendered;

    return emailProvider.send({
      from: payload.from,
      to: payload.to.filter(Boolean),
      subject: payload.subject,
      html,
      text,
    });
  },
});
