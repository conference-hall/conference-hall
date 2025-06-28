import { db } from 'prisma/db.server.ts';
import { renderEmail } from '~/emails/email.renderer.tsx';
import { getEnv } from '~/libs/jobs/env.ts';
import { job } from '~/libs/jobs/job.ts';
import type { CustomTemplate } from './email.types.ts';
import { getEmailProvider } from './providers/provider.ts';

export type EmailPayload = {
  template: string;
  from: string;
  to: string[];
  subject: string;
  data: Record<string, any>;
  customization?: CustomizationIds;
  locale: string;
};

type CustomizationIds = {
  eventId: string;
  template: CustomTemplate;
};

const env = getEnv();

export const sendEmail = job<EmailPayload>({
  name: 'send-email',
  queue: 'default',

  run: async (payload: EmailPayload) => {
    const emailProvider = getEmailProvider(env);

    if (!emailProvider) return Promise.reject('Email provider not found');

    const customization = await getEmailCustomization(payload.customization, payload.locale);

    const emailRendered = await renderEmail(payload.template, payload.data, payload.locale, customization);

    if (!emailRendered) return Promise.reject('Email rendering failed');

    const subject = customization?.subject || payload.subject;
    const { html, text } = emailRendered;

    return emailProvider.send({
      from: payload.from,
      to: payload.to.filter(Boolean),
      subject,
      html,
      text,
    });
  },
});

async function getEmailCustomization(customization: CustomizationIds | undefined, locale: string) {
  if (!customization) return null;

  const emailCustomization = await db.eventEmailCustomization.findUnique({
    where: { eventId_template_locale: { ...customization, locale } },
  });

  return emailCustomization;
}
