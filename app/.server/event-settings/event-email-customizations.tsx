import { render } from '@react-email/components';
import { db } from 'prisma/db.server.ts';
import xss from 'xss';
import type {
  CustomTemplateName,
  EventEmailCustomDelete,
  EventEmailCustomUpsert,
} from '~/shared/emails/email.types.ts';
import { getCustomTemplate } from '~/shared/emails/templates/templates.ts';
import { NotFoundError } from '~/shared/errors.server.ts';
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

  async getForPreview(template: CustomTemplateName, locale = 'en') {
    const event = await this.userEvent.needsPermission('canEditEvent');
    const customization = await db.eventEmailCustomization.findUnique({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
    });

    // Get the email template component for preview
    const EmailTemplate = await getCustomTemplate(template);
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

    const { subject, from } = EmailTemplate.buildPayload(templateData, locale);

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
