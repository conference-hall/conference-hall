import { MailgunProvider } from './mailgun-provider.ts';

vi.mock('mailgun.js', () => {
  const client = { messages: { create: vi.fn() } };
  class MailgunMock {
    client() {
      return client;
    }
  }
  return { default: MailgunMock };
});

describe('MailgunProvider', () => {
  let mailgunProvider: MailgunProvider;

  beforeEach(() => {
    mailgunProvider = new MailgunProvider('api_key', 'example.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send emails', async () => {
    const email = {
      from: 'from@example.com',
      to: ['to1@example.com', 'to2@example.com'],
      subject: 'Hello',
      html: 'World',
      text: 'World text',
    };

    await mailgunProvider.send(email);

    expect(mailgunProvider['client'].messages.create).toHaveBeenCalledWith('example.com', {
      from: email.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: 'World text',
    });
  });
});
