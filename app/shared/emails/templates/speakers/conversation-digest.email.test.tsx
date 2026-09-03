import { render } from 'react-email';
import ConversationDigestEmail, { type TemplateData } from './conversation-digest.email.tsx';

const data: TemplateData = {
  email: 'speaker@example.com',
  unsubscribeUrl: 'https://conference-hall.io/unsubscribe?token=abc',
  events: [
    {
      name: 'Awesome Conference',
      logo: null,
      proposals: [
        {
          title: 'Designing deep modules',
          conversations: [
            { type: 'speaker', count: 3, url: 'https://app.test/awesome/proposals/p1?conversation=speaker' },
          ],
        },
        {
          title: 'A talk about testing',
          conversations: [
            { type: 'speaker', count: 1, url: 'https://app.test/awesome/proposals/p2?conversation=speaker' },
            { type: 'review', count: 2, url: 'https://app.test/team/t/awesome/proposals/p2?conversation=review' },
          ],
        },
      ],
    },
  ],
};

describe('ConversationDigestEmail', () => {
  it('renders events, proposals and per-conversation counts and links', async () => {
    const html = await render(<ConversationDigestEmail {...data} locale="en" />);

    expect(html).toContain('Awesome Conference');
    expect(html).toContain('Designing deep modules');
    expect(html).toContain('A talk about testing');

    expect(html).toContain('3 new messages');
    expect(html).toContain('1 new message');
    expect(html).toContain('2 new messages');

    expect(html).toContain('Speaker conversation');
    expect(html).toContain('Review comments');

    expect(html).toContain('https://app.test/awesome/proposals/p1?conversation=speaker');
    expect(html).toContain('https://app.test/awesome/proposals/p2?conversation=speaker');
    expect(html).toContain('https://app.test/team/t/awesome/proposals/p2?conversation=review');
  });

  it('renders the unsubscribe link when provided', async () => {
    const html = await render(<ConversationDigestEmail {...data} locale="en" />);
    expect(html).toContain('https://conference-hall.io/unsubscribe?token=abc');
    expect(html).toContain('Unsubscribe from these emails');
  });

  it('omits the unsubscribe link when not provided', async () => {
    const html = await render(<ConversationDigestEmail {...data} unsubscribeUrl={undefined} locale="en" />);
    expect(html).not.toContain('Unsubscribe from these emails');
  });

  it('renders in the recipient locale', async () => {
    const html = await render(<ConversationDigestEmail {...data} locale="fr" />);
    expect(html).toContain('Conversation avec les speakers');
    expect(html).toContain('3 nouveaux messages');
  });
});
