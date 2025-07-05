import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { sendSubmittedTalkSlackMessage } from './slack.server.ts';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('Slack services', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
  });

  it('should not send a Slack message if Slack integration not enabled for event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const proposal = await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }) });

    await sendSubmittedTalkSlackMessage(event.id, proposal.id);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should send a Slack message for submitted talk', async () => {
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

    await sendSubmittedTalkSlackMessage(event.id, proposal.id);

    expect(fetchMock).toHaveBeenCalledWith('http://webhook.slack', {
      body: `{"attachments":[{"fallback":"New Talk submitted to Event","pretext":"*New talk submitted to Event*","author_name":"by Speaker 1 & Speaker 2","title":"Title","text":"Abstract","title_link":"${process.env.APP_URL}/team/${team.slug}/${event.slug}/reviews/${proposal.id}","thumb_url":"http://photo","color":"#ffab00","fields":[{"title":"Categories","value":"Category 1 & Category 2","short":true},{"title":"Formats","value":"Format 1 & Format 2","short":true}]}]}`,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });
});
