import { MailgunProvider } from './mailgun-provider';
import { Template } from './template/template';

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
    const emailData = {
      from: 'from@example.com',
      to: ['to1@example.com', 'to2@example.com'],
      bcc: ['bcc1@example.com'],
      variables: { subject: 'Hello', content: 'Workd' },
    };

    const template = new Template('%subject%', '**%content%**');

    await mailgunProvider.send(emailData.from, [emailData], template);

    expect(mailgunProvider['client'].messages.create).toHaveBeenCalledWith('example.com', {
      from: emailData.from,
      to: emailData.to,
      bcc: emailData.bcc,
      subject: 'Hello',
      html: expect.any(String),
    });
  });
});
