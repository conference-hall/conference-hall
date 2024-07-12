import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const speaker1 = await userFactory({ attributes: { name: 'Marie Jane' } });

  const team = await teamFactory({
    attributes: { name: 'Awesome team', slug: 'team-1' },
    owners: [organizer1],
    reviewers: [organizer2],
  });

  const event = await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: {
      name: 'Conference 1',
      slug: 'conference-1',
      timezone: 'Europe/Paris',
      conferenceStart: new Date('2022-01-01'),
      conferenceEnd: new Date('2022-01-02'),
    },
  });

  const format = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const category = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });

  await proposalFactory({
    event,
    formats: [format],
    categories: [category],
    talk: await talkFactory({ attributes: { title: 'Talk 1' }, speakers: [speaker1] }),
  });
};
