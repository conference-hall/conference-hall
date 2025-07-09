import { Slack, type SlackMessage } from './slack.server.ts';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('Slack integration', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
  });

  it('#sendMessage', async () => {
    const payload: SlackMessage = {
      fallback: 'New Talk submitted to Event',
      pretext: '*New talk submitted to Event*',
      title: 'Title',
      text: 'Abstract',
      author_name: 'by Speaker 1 & Speaker 2',
      title_link: `${process.env.APP_URL}/team/my-team/event-1/reviews/proposal-1`,
      thumb_url: 'http://photo',
      color: '#ffab00',
      fields: [
        { title: 'Categories', value: 'Category 1 & Category 2', short: true },
        { title: 'Formats', value: 'Format 1 & Format 2', short: true },
      ],
    };

    await Slack.sendMessage('http://webhook.slack', payload);

    expect(fetchMock).toHaveBeenCalledWith('http://webhook.slack', {
      body: JSON.stringify({ attachments: [payload] }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });
});
