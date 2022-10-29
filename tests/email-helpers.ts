import { config } from '~/services/config';

const MAILHOG_URL = `http://${config.MAILHOG_HOST}:${config.MAILHOG_HTTP_PORT}`;

const MAILHOG_APIV1 = `${MAILHOG_URL}/api/v1`;

type MailhogEmail = {
  Content: {
    Headers: {
      From: Array<string>;
      To: Array<string>;
      Subject: Array<string>;
    };
    Body: string;
  };
};

export async function resetEmails() {
  const response = await fetch(`${MAILHOG_APIV1}/messages`, { method: 'DELETE' });
  if (response.status !== 200) {
    throw new Error(`Unable to reset Mailhog emails on ${MAILHOG_APIV1}`);
  }
}

export async function getEmails() {
  const response = await fetch(`${MAILHOG_APIV1}/messages`, { method: 'GET' });
  if (response.status !== 200) {
    throw new Error(`Unable to get Mailhog emails on ${MAILHOG_APIV1}`);
  }
  const emails = (await response.json()) as Array<MailhogEmail>;

  return {
    total: emails.length,
    to(to: string | null) {
      if (!to) return {};
      return emails
        .filter((email) => email.Content.Headers.To.includes(to))
        .map((email) => ({
          from: email.Content.Headers.From[0],
          subject: email.Content.Headers.Subject[0],
        }));
    },
    hasEmailWithContent(to: string | null, content: string) {
      if (!to) return {};
      const results = emails.filter(
        (email) => email.Content.Headers.To.includes(to) && email.Content.Body.includes(content)
      );
      return results.length > 0;
    },
  };
}
