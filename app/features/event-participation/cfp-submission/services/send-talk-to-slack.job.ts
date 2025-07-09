import { db } from 'prisma/db.server.ts';
import { job } from '~/shared/jobs/job.ts';
import { Slack, type SlackMessage } from '../../../../shared/integrations/slack.server.ts';
import { sortBy } from '../../../../shared/utils/arrays-sort-by.ts';

type SendSubmissionToSlackPayload = {
  eventId: string;
  proposalId: string;
};

const appUrl = process.env.APP_URL;

export const sendTalkToSlack = job<SendSubmissionToSlackPayload>({
  name: 'send-talk-to-slack',
  queue: 'default',
  run: async ({ eventId, proposalId }: SendSubmissionToSlackPayload) => {
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { team: true },
    });

    if (!event || !event.slackWebhookUrl) return;

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      include: { speakers: true, formats: true, categories: true },
    });

    if (!proposal) return;

    const payload: SlackMessage = {
      fallback: `New Talk submitted to ${event.name}`,
      pretext: `*New talk submitted to ${event.name}*`,
      author_name: `by ${sortBy(proposal.speakers, 'name')
        .map((s) => s.name)
        .join(' & ')}`,
      title: proposal.title,
      text: proposal.abstract,
      title_link: `${appUrl}/team/${event.team.slug}/${event.slug}/reviews/${proposal.id}`,
      thumb_url: proposal.speakers[0].picture,
      color: '#ffab00',
      fields: [],
    };

    if (proposal.categories.length > 0) {
      payload.fields.push({
        title: 'Categories',
        value: sortBy(proposal.categories, 'name')
          .map((c) => c.name)
          .join(' & '),
        short: true,
      });
    }

    if (proposal.formats.length > 0) {
      payload.fields.push({
        title: 'Formats',
        value: sortBy(proposal.formats, 'name')
          .map((c) => c.name)
          .join(' & '),
        short: true,
      });
    }

    await Slack.sendMessage(event.slackWebhookUrl, payload);
  },
});
