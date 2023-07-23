import type { Event, EventCategory, EventFormat, Proposal, Team, User } from '@prisma/client';

import { config } from '~/libs/config';
import { db } from '~/libs/db';
import { sortBy } from '~/utils/arrays';

function buildPayload(
  event: Event & { team: Team },
  proposal: Proposal & { speakers: User[]; categories: EventCategory[]; formats: EventFormat[] },
) {
  const attachment = {
    fallback: `New Talk submitted to ${event.name}`,
    pretext: `*New talk submitted to ${event.name}*`,
    author_name: `by ${proposal.speakers.map((s) => s.name).join(' & ')}`,
    title: proposal.title,
    text: proposal.abstract,
    title_link: `${config.appUrl}/team/${event.team.slug}/${event.slug}/review/${proposal.id}`,
    thumb_url: proposal.speakers[0].picture,
    color: '#ffab00',
    fields: [] as unknown[],
  };

  if (proposal.categories.length > 0) {
    attachment.fields.push({
      title: 'Categories',
      value: sortBy(proposal.categories, 'name')
        .map((c) => c.name)
        .join(' & '),
      short: true,
    });
  }

  if (proposal.formats.length > 0) {
    attachment.fields.push({
      title: 'Formats',
      value: sortBy(proposal.formats, 'name')
        .map((c) => c.name)
        .join(' & '),
      short: true,
    });
  }

  return {
    attachments: [attachment],
  };
}

export async function sendSubmittedTalkSlackMessage(eventId: string, proposalId: string) {
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { team: true },
  });

  if (!event || !event.slackWebhookUrl) return;

  const proposal = await db.proposal.findUnique({
    where: { id: proposalId },
    include: { speakers: true, formats: true, categories: true },
  });

  if (!proposal) return;

  try {
    await fetch(event.slackWebhookUrl, {
      method: 'POST',
      body: JSON.stringify(buildPayload(event, proposal)),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
  }
}
