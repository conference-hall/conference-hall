import { db } from 'prisma/db.server.ts';
import type { CustomTemplate, EventEmailCustomization } from '~/emails/email.types.ts';
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

  async get(template: CustomTemplate, locale = 'en') {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.findUnique({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
    });
  }

  async upsert(template: CustomTemplate, locale: string, data: Omit<EventEmailCustomization, 'template' | 'locale'>) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.upsert({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
      create: { ...data, eventId: event.id, template, locale },
      update: data,
    });
  }

  async delete(template: CustomTemplate, locale: string) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.delete({
      where: { eventId_template_locale: { eventId: event.id, template, locale } },
    });
  }
}
