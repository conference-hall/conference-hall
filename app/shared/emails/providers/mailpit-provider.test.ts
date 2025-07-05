import { MailpitProvider } from './mailpit-provider.ts';

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
    const email = {
      from: 'from@example.com',
      to: ['to1@example.com', 'to2@example.com'],
      subject: 'Hello',
      html: 'World',
      text: 'World text',
    };

    await mailpitProvider.send(email);

    expect(mailpitProvider['transporter'].sendMail).toHaveBeenCalledWith({
      from: email.from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  });
});
