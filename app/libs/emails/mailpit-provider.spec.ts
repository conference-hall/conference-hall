import { MailpitProvider } from './mailpit-provider';
import { Template } from './template/template';

vi.mock('nodemailer', () => {
  const sendMail = vi.fn();
  return { default: { createTransport: () => ({ sendMail }) } };
});

describe('MailpitProvider', () => {
  let mailpitProvider: MailpitProvider;

  beforeEach(() => {
    mailpitProvider = new MailpitProvider('api_key', 123);
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

    await mailpitProvider.send(emailData.from, [emailData], template);

    expect(mailpitProvider['transporter'].sendMail).toHaveBeenCalledWith({
      from: emailData.from,
      to: emailData.to,
      bcc: emailData.bcc,
      subject: 'Hello',
      html: expect.any(String),
    });
  });
});
