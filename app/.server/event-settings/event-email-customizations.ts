import { db } from 'prisma/db.server.ts';
import type { EmailType, EventEmailCustomization } from '~/emails/email.types.ts';
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

  async get(emailType: EmailType, locale = 'en') {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.findUnique({
      where: { eventId_emailType_locale: { eventId: event.id, emailType, locale } },
    });
  }

  async upsert(emailType: EmailType, locale: string, data: Omit<EventEmailCustomization, 'emailType' | 'locale'>) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.upsert({
      where: { eventId_emailType_locale: { eventId: event.id, emailType, locale } },
      create: { ...data, eventId: event.id, emailType, locale },
      update: data,
    });
  }

  async delete(emailType: EmailType, locale: string) {
    const event = await this.userEvent.needsPermission('canEditEvent');
    return db.eventEmailCustomization.delete({
      where: { eventId_emailType_locale: { eventId: event.id, emailType, locale } },
    });
  }
}
