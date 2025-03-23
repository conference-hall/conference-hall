import { parseWithZod } from '@conform-to/zod';
import { Publication } from '~/.server/publications/publication.ts';
import { PublishResultFormSchema } from '~/.server/publications/publication.types.ts';
import { Callout } from '~/design-system/callout.tsx';
import DonutCard from '~/design-system/dashboard/donut-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { H1, H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { BadRequestError } from '~/libs/errors.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/index.ts';
import { PublicationButton } from './components/publication-confirm-modal.tsx';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return Publication.for(userId, params.team, params.event).statistics();
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: PublishResultFormSchema });
  if (result.status !== 'success') throw new BadRequestError('Invalid form data');

  const { type, sendEmails } = result.value;
  await Publication.for(userId, params.team, params.event).publishAll(type, sendEmails);
  return toast('success', type === 'ACCEPTED' ? 'Accepted proposals published.' : 'Rejected proposals published.');
};

export default function PublicationRoute({ loaderData: statistics }: Route.ComponentProps) {
  return (
    <Page>
      <H1 srOnly>Publication</H1>

      <div className="space-y-4 lg:space-y-6">
        <Card as="section">
          <Card.Title>
            <H2>Publish results</H2>
            <Subtitle>Announce results and send emails to speakers for accepted or rejected proposals.</Subtitle>
          </Card.Title>

          <Card.Content className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
            <ProgressCard
              label="Total results published"
              value={statistics.accepted.published + statistics.rejected.published}
              max={statistics.deliberation.accepted + statistics.deliberation.rejected}
            >
              <Link to="../reviews" relative="path" size="s" weight="medium">
                See all proposals &rarr;
              </Link>
            </ProgressCard>

            <StatisticCard label="Accepted proposals to publish" stat={`${statistics.accepted.notPublished}`}>
              <StatisticCard.Footer>
                <PublicationButton type="ACCEPTED" statistics={statistics.accepted} />
              </StatisticCard.Footer>
            </StatisticCard>

            <StatisticCard label="Rejected proposals to publish" stat={`${statistics.rejected.notPublished}`}>
              <StatisticCard.Footer>
                <PublicationButton type="REJECTED" statistics={statistics.rejected} />
              </StatisticCard.Footer>
            </StatisticCard>
          </Card.Content>
        </Card>

        <section className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <DonutCard
            title="Deliberation results"
            subtitle="Proposals accepted or rejected by organizers"
            donutLabel={`${statistics.deliberation.total}`}
            categoryLabel="Deliberation status"
            amountLabel="Proposals"
            noDataHint="You need to mark proposals as accepted or rejected."
            data={[
              {
                name: 'Accepted proposals',
                amount: statistics.deliberation.accepted,
                colorChart: 'green',
                colorLegend: 'bg-green-500',
                to: '../reviews?status=accepted',
              },
              {
                name: 'Rejected proposals',
                amount: statistics.deliberation.rejected,
                colorChart: 'red',
                colorLegend: 'bg-red-500',
                to: '../reviews?status=rejected',
              },
              {
                name: 'Not deliberated proposals',
                amount: statistics.deliberation.pending,
                colorChart: 'blue',
                colorLegend: 'bg-blue-500',
                to: '../reviews?status=pending',
              },
            ]}
          >
            <Callout>
              To deliberate, open the proposals page, select and mark proposals as accepted or rejected. You can also
              change the deliberation status individually on a proposal page.
            </Callout>
          </DonutCard>

          <DonutCard
            title="Speaker confirmations"
            subtitle="Proposals confirmed or declined by speakers."
            donutLabel={`${statistics.accepted.published}`}
            categoryLabel="Confirmation status"
            amountLabel="Proposals"
            noDataHint="You need to publish results for accepted proposals."
            data={[
              {
                name: 'Confirmed by speakers',
                amount: statistics.confirmations.confirmed,
                colorChart: 'green',
                colorLegend: 'bg-green-500',
                to: '../reviews?status=confirmed',
              },
              {
                name: 'Declined by speakers',
                amount: statistics.confirmations.declined,
                colorChart: 'red',
                colorLegend: 'bg-red-500',
                to: '../reviews?status=declined',
              },
              {
                name: 'Waiting for confirmation',
                amount: statistics.confirmations.pending,
                colorChart: 'blue',
                colorLegend: 'bg-blue-500',
                to: '../reviews?status=not-answered',
              },
            ]}
          >
            <Callout>To get speaker confirmation, organizers must publish results for accepted proposals.</Callout>
          </DonutCard>
        </section>
      </div>
    </Page>
  );
}
