import { config } from '../app/libs/config.ts';

const MAILPIT_URL = `http://${config.MAILPIT_HOST}:${config.MAILPIT_HTTP_PORT}`;

const MAILPIT_APIV1 = `${MAILPIT_URL}/api/v1`;

type MailpitMessage = {
  ID: string;
  From: { Name: string; Address: string };
  To: Array<{ Name: string; Address: string }>;
  Cc: Array<{ Name: string; Address: string }>;
  Subject: string;
};

type MailpitMessages = {
  messages_count: number;
  messages: Array<MailpitMessage>;
};

export type EmailMeta = { from: { name: string; address: string }; subject: string };

export async function resetEmails() {
  const response = await fetch(`${MAILPIT_APIV1}/messages`, { method: 'DELETE' });
  if (response.status !== 200) {
    throw new Error(`Unable to reset Mailpit emails on ${MAILPIT_APIV1}`);
  }
}

export async function getEmailsFor(email: string | null): Promise<Array<EmailMeta> | null> {
  if (!email) return null;

  const response = await fetch(`${MAILPIT_APIV1}/messages`, { method: 'GET' });
  if (response.status !== 200) {
    throw new Error(`Unable to get Mailpit emails on ${MAILPIT_APIV1}`);
  }
  const messages = (await response.json()) as MailpitMessages;

  return messages.messages
    .filter((message) => message.To.find((to) => to.Address === email))
    .map((message) => ({
      from: { name: message.From.Name, address: message.From.Address },
      subject: message.Subject,
    }));
}
