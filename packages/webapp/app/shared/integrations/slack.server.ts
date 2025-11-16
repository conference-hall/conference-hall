export type SlackMessage = {
  fallback: string;
  pretext: string;
  author_name: string;
  title: string;
  text: string;
  title_link: string;
  thumb_url: string | null;
  color: string;
  fields: Array<{ title: string; value: string; short?: boolean }>;
};

async function sendMessage(slackUrl: string, payload: SlackMessage) {
  await fetch(slackUrl, {
    method: 'POST',
    body: JSON.stringify({ attachments: [payload] }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export const Slack = { sendMessage };
