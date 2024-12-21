import type { Event, EventCategory, EventFormat, Proposal, Team, User } from '@prisma/client/app/index.js';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { OpenPlanner } from '~/libs/integrations/open-planner.ts';
import { exportToOpenPlanner } from './export-to-open-planner.job.ts';

vi.mock('~/libs/integrations/open-planner.ts', () => {
  return { OpenPlanner: { postSessionsAndSpeakers: vi.fn() } };
});

describe('Job: exportToOpenPlanner', () => {
  const postSessionsAndSpeakersMock = OpenPlanner.postSessionsAndSpeakers as Mock;
  let owner: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal1: Proposal;
  let proposal2: Proposal;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team, traits: ['withIntegration'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    proposal1 = await proposalFactory({
      event,
      formats: [format],
      talk: await talkFactory({ speakers: [speaker] }),
    });
    proposal2 = await proposalFactory({
      event,
      categories: [category],
      talk: await talkFactory({ speakers: [speaker] }),
    });

    postSessionsAndSpeakersMock.mockReset();
  });

  it('exports sessions and speakers to OpenPlanner', async () => {
    postSessionsAndSpeakersMock.mockResolvedValue({ success: true });

    await exportToOpenPlanner.config.run({ userId: owner.id, eventSlug: event.slug, teamSlug: team.slug, filters: {} });

    expect(postSessionsAndSpeakersMock).toHaveBeenCalledWith('open-planner-event-id', 'open-planner-api-key', {
      sessions: [
        {
          id: proposal2.id,
          title: proposal2.title,
          abstract: proposal2.abstract,
          level: proposal2.level,
          language: 'en',
          speakerIds: [speaker.id],
          categoryId: category.id,
          categoryName: category.name,
        },
        {
          id: proposal1.id,
          title: proposal1.title,
          abstract: proposal1.abstract,
          level: proposal1.level,
          language: 'en',
          speakerIds: [speaker.id],
          formatId: format.id,
          formatName: format.name,
        },
      ],
      speakers: [
        {
          id: speaker.id,
          name: speaker.name,
          bio: speaker.bio,
          company: speaker.company,
          photoUrl: speaker.picture,
          socials: [],
        },
      ],
    });
  });

  it('does not call OpenPlanner if no configuration set for the event', async () => {
    const event2 = await eventFactory({ team });

    await exportToOpenPlanner.config.run({
      userId: owner.id,
      eventSlug: event2.slug,
      teamSlug: team.slug,
      filters: {},
    });

    expect(postSessionsAndSpeakersMock).not.toHaveBeenCalled();
  });
});
