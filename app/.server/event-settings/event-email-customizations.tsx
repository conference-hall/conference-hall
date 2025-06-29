import { render } from '@react-email/components';
import { db } from 'prisma/db.server.ts';
import xss from 'xss';
import { getEmailTemplateComponent } from '~/emails/email.renderer.tsx';
import type { CustomTemplate, EventEmailCustomDelete, EventEmailCustomUpsert } from '~/emails/email.types.ts';
import type { EmailPayload } from '~/emails/send-email.job.ts';
import { NotFoundError } from '~/libs/errors.server.ts';
import { UserEvent } from './user-event.ts';

export class EventEmailCustomizations {
  private userEvent: UserEvent;

  constructor(userId: string, teamSlug: string, eventSlug: string) {
    this.userEvent = new UserEvent(userId, teamSlug, eventSlug);
  }

  static for(userId: string, teamSlug: string, eventSlug: string) {
    return new EventEmailCustomizations(userId, teamSlug, eventSlug);
  }

  async list() {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.findMany({ where: { eventId: event.id } });
  }

  async getForPreview(template: CustomTemplate, locale = 'en') {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const customization = await db.eventEmailCustomization.findUnique({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
    });

    // Get the email template component for preview
    const EmailTemplate = await getEmailTemplateComponent(`speakers/${template}`);
    if (!EmailTemplate) {
      throw new NotFoundError(`Email template "${template}" not found`);
    }

    // Get the preview props for the email template
    const templateData = {
      ...EmailTemplate.PreviewProps,
      preview: true,
      event,
      locale,
      customization: { subject: customization?.subject, content: customization?.content },
    };

    // Get default subject and from address from the template
    const { subject, from } = EmailTemplate.buildPayload
      ? (EmailTemplate.buildPayload(templateData) as EmailPayload)
      : { subject: '', from: '' };

    try {
      const preview = await render(<EmailTemplate {...templateData} />);
      return { template, customization, defaults: { subject, from }, preview };
    } catch {
      return { template, customization, defaults: { subject, from }, preview: 'Error while rendering email preview' };
    }
  }

  async save(data: EventEmailCustomUpsert) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const { template, locale, subject, content } = data;

    const safeData = {
      subject: subject ? xss(subject) : null,
      content: content ? xss(content) : null,
    };

    if (!subject && !content) {
      return this.reset({ template, locale });
    }

    return db.eventEmailCustomization.upsert({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
      create: { ...safeData, eventId: event.id, template, locale },
      update: safeData,
    });
  }

  async reset(data: EventEmailCustomDelete) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const { template, locale } = data;

    try {
      await db.eventEmailCustomization.delete({
        where: { eventId_template_locale: { eventId: event.id, template, locale } },
      });
    } catch (_error) {
      throw new NotFoundError(`Customization for template "${template}" and locale "${locale}" not found`);
    }
  }
}
