import { db } from 'prisma/db.server.ts';
import { renderEmail } from '~/shared/emails/email.renderer.tsx';
import { job } from '~/shared/jobs/job.ts';
import type { CustomTemplateName } from './email.types.ts';
import type { EmailTemplateName } from './templates/templates.ts';
import { getEmailProvider } from './providers/provider.ts';

export type EmailPayload = {
  template: EmailTemplateName;
  from: string;
  to: string[];
  subject: string;
  data: Record<string, any>;
  customEventId?: string;
  locale: string;
};

export const sendEmail = job<EmailPayload>({
  name: 'send-email',
  queue: 'default',

  run: async (payload: EmailPayload) => {
    const emailProvider = getEmailProvider();

    if (!emailProvider) return Promise.reject('Email provider not found');

    let customization = null;
    if (payload.customEventId) {
      customization = await getEmailCustomization(
        payload.template as CustomTemplateName,
        payload.locale,
        payload.customEventId,
      );
    }

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

async function getEmailCustomization(template: CustomTemplateName, locale: string, eventId: string) {
  const emailCustomization = await db.eventEmailCustomization.findUnique({
    where: { eventId_template_locale: { template, locale, eventId } },
  });

  return emailCustomization;
}
