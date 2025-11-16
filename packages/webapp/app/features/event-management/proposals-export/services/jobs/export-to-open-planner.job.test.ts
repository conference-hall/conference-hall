import type { Event, EventCategory, EventFormat, Team, User } from '@conference-hall/database';
import { eventCategoryFactory } from '@conference-hall/database/tests/factories/categories.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { eventFormatFactory } from '@conference-hall/database/tests/factories/formats.ts';
import { type ProposalFactory, proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import type { SocialLinks } from '@conference-hall/shared/types/speaker.types.ts';
import type { Mock } from 'vitest';
import { OpenPlanner } from '~/shared/integrations/open-planner.server.ts';
import { exportToOpenPlanner } from './export-to-open-planner.job.ts';

vi.mock('~/shared/integrations/open-planner.server.ts', () => {
  return { OpenPlanner: { postSessionsAndSpeakers: vi.fn() } };
});
const postSessionsAndSpeakersMock = OpenPlanner.postSessionsAndSpeakers as Mock;

describe('Job: exportToOpenPlanner', () => {
  let owner: User;
  let speakerUser: User;
  let team: Team;
  let event: Event;
  let format: EventFormat;
  let category: EventCategory;
  let proposal1: ProposalFactory;
  let proposal2: ProposalFactory;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    speakerUser = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team, traits: ['withIntegration'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    proposal1 = await proposalFactory({
      event,
      formats: [format],
      talk: await talkFactory({ speakers: [speakerUser] }),
    });
    proposal2 = await proposalFactory({
      event,
      categories: [category],
      talk: await talkFactory({ speakers: [speakerUser] }),
    });
  });

  it('exports sessions and speakers to OpenPlanner', async () => {
    postSessionsAndSpeakersMock.mockResolvedValue({ success: true });

    await exportToOpenPlanner.config.run({ userId: owner.id, eventSlug: event.slug, teamSlug: team.slug, filters: {} });

    const expectedSpeaker = proposal1.speakers.at(0);
    const expectedSocialLinks = expectedSpeaker?.socialLinks as SocialLinks;

    expect(postSessionsAndSpeakersMock).toHaveBeenCalledWith('open-planner-event-id', 'open-planner-api-key', {
      sessions: [
        {
          id: proposal2.id,
          title: proposal2.title,
          abstract: proposal2.abstract,
          level: proposal2.level,
          language: 'en',
          speakerIds: proposal2.speakers.map((s) => s.id),
          categoryId: category.id,
          categoryName: category.name,
          showInFeedback: true,
        },
        {
          id: proposal1.id,
          title: proposal1.title,
          abstract: proposal1.abstract,
          level: proposal1.level,
          language: 'en',
          speakerIds: proposal1.speakers.map((s) => s.id),
          formatId: format.id,
          formatName: format.name,
          showInFeedback: true,
        },
      ],
      speakers: [
        {
          id: expectedSpeaker?.id,
          name: expectedSpeaker?.name,
          email: expectedSpeaker?.email,
          bio: expectedSpeaker?.bio,
          company: expectedSpeaker?.company,
          geolocation: expectedSpeaker?.location,
          photoUrl: expectedSpeaker?.picture,
          socials: expect.arrayContaining([
            { icon: 'link', name: 'link', link: expectedSocialLinks[0] },
            { icon: 'link', name: 'link', link: expectedSocialLinks[1] },
          ]),
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
