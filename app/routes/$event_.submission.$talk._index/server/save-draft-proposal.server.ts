import type { ProposalCreateData } from '~/schemas/proposal';
import { getCfpState } from '~/utils/event';

import { db } from '../../../libs/db';
import { CfpNotOpenError, EventNotFoundError, TalkNotFoundError } from '../../../libs/errors';

export async function saveDraftProposal(talkId: string, eventSlug: string, userId: string, data: ProposalCreateData) {
  if (talkId !== 'new') {
    const talk = await db.talk.findFirst({
      where: { id: talkId, speakers: { some: { id: userId } } },
    });
    if (!talk) throw new TalkNotFoundError();
  }

  const event = await db.event.findUnique({
    select: { id: true, type: true, cfpStart: true, cfpEnd: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  if (!isCfpOpen) throw new CfpNotOpenError();

  const talk = await db.talk.upsert({
    where: { id: talkId },
    update: { ...data },
    create: {
      ...data,
      creator: { connect: { id: userId } },
      speakers: { connect: [{ id: userId }] },
    },
    include: { speakers: true },
  });

  const speakers = talk.speakers.map((speaker) => ({ id: speaker.id }));

  await db.proposal.upsert({
    where: { talkId_eventId: { talkId: talk.id, eventId: event.id } },
    update: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      languages: talk.languages || [],
      speakers: { set: [], connect: speakers },
    },
    create: {
      title: talk.title,
      abstract: talk.abstract,
      level: talk.level,
      references: talk.references,
      languages: talk.languages || [],
      status: 'DRAFT',
      talk: { connect: { id: talk.id } },
      event: { connect: { id: event.id } },
      speakers: { connect: speakers },
    },
  });

  return { talkId: talk.id };
}
