import { eventCategoryFactory } from '@conference-hall/database/tests/factories/categories.ts';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { eventFormatFactory } from '@conference-hall/database/tests/factories/formats.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { getSharedServerEnv } from '@conference-hall/shared/environment.ts';
import type { Mock } from 'vitest';
import { Slack } from '~/shared/integrations/slack.server.ts';
import { sendTalkToSlack } from './send-talk-to-slack.job.ts';

const { APP_URL } = getSharedServerEnv();

vi.mock('~/shared/integrations/slack.server.ts', () => {
  return { Slack: { sendMessage: vi.fn() } };
});
const sendMessageMock = Slack.sendMessage as Mock;

describe('Job: sendTalkToSlack', () => {
  it('sends a Slack message for submitted talk', async () => {
    const team = await teamFactory({ attributes: { slug: 'my-team' } });
    const event = await eventFactory({
      team,
      attributes: { slug: 'event-1', name: 'Event', slackWebhookUrl: 'http://webhook.slack' },
    });
    const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
    const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
    const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
    const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });
    const speaker1 = await userFactory({ attributes: { name: 'Speaker 1', picture: 'http://photo' } });
    const speaker2 = await userFactory({ attributes: { name: 'Speaker 2' } });

    const proposal = await proposalFactory({
      event,
      talk: await talkFactory({
        speakers: [speaker1, speaker2],
        attributes: { id: 'proposal-1', title: 'Title', abstract: 'Abstract' },
      }),
      formats: [format1, format2],
      categories: [category1, category2],
    });

    await sendTalkToSlack.config.run({ eventId: event.id, proposalId: proposal.id });

    expect(sendMessageMock).toHaveBeenCalledWith('http://webhook.slack', {
      fallback: `New Talk submitted to ${event.name}`,
      pretext: `*New talk submitted to ${event.name}*`,
      author_name: `by ${speaker1.name} & ${speaker2.name}`,
      title: proposal.title,
      text: proposal.abstract,
      title_link: `${APP_URL}/team/${team.slug}/${event.slug}/proposals/${proposal.id}`,
      thumb_url: speaker1.picture,
      color: '#ffab00',
      fields: [
        { title: 'Categories', value: 'Category 1 & Category 2', short: true },
        { title: 'Formats', value: 'Format 1 & Format 2', short: true },
      ],
    });
  });
});
