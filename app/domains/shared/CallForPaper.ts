import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';
import { getCfpState } from '~/utils/event';

type CallForPaperEvent = {
  id: string;
  type: 'CONFERENCE' | 'MEETUP';
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

export class CallForPaper {
  constructor(public event: CallForPaperEvent) {}

  static async for(eventSlug: string) {
    const event = await db.event.findUnique({
      select: { id: true, type: true, cfpStart: true, cfpEnd: true },
      where: { slug: eventSlug },
    });
    if (!event) throw new EventNotFoundError();

    return new CallForPaper(event);
  }

  get eventId() {
    return this.event.id;
  }

  get isOpen() {
    const { type, cfpStart, cfpEnd } = this.event;
    return getCfpState(type, cfpStart, cfpEnd) === 'OPENED';
  }
}
