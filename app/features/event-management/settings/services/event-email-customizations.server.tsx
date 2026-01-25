import { render } from '@react-email/components';
import xss from 'xss';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import type {
  CustomTemplateName,
  EventEmailCustomDelete,
  EventEmailCustomUpsert,
} from '~/shared/emails/email.types.ts';
import { getCustomTemplate } from '~/shared/emails/templates/templates.ts';
import { ForbiddenOperationError, NotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';

export class EventEmailCustomizations {
  constructor(private authorizedEvent: AuthorizedEvent) {}

  static for(authorizedEvent: AuthorizedEvent) {
    return new EventEmailCustomizations(authorizedEvent);
  }

  async list() {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    return db.eventEmailCustomization.findMany({ where: { eventId: event.id } });
  }

  async getForPreview(template: CustomTemplateName, locale = 'en') {
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
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
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
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
    const { event, permissions } = this.authorizedEvent;
    if (!permissions.canEditEvent) throw new ForbiddenOperationError();
    const { template, locale } = data;

    try {
      await db.eventEmailCustomization.delete({
        where: { eventId_template_locale: { eventId: event.id, template, locale } },
      });
    } catch {
      console.warn(`Customization for template "${template}" and locale "${locale}" not found`);
    }
  }
}
