import { parseWithZod } from '@conform-to/zod';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

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
import { requireSession } from '~/libs/auth/session.ts';
import { BadRequestError } from '~/libs/errors.server.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { PublicationButton } from './__components/publication-confirm-modal.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');

  const statistics = await Publication.for(userId, params.team, params.event).statistics();

  return json(statistics);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const result = parseWithZod(form, { schema: PublishResultFormSchema });
  if (result.status !== 'success') throw new BadRequestError('Invalid form data');

  const { type, sendEmails } = result.value;
  await Publication.for(userId, params.team, params.event).publishAll(type, sendEmails);

  return toast('success', type === 'ACCEPTED' ? 'Accepted proposals published.' : 'Rejected proposals published.');
};

export default function PublicationRoute() {
  const statistics = useLoaderData<typeof loader>();

  return (
    <Page className="flex flex-col">
      <H1 srOnly>Publication</H1>

      <Card as="section">
        <Card.Title>
          <H2>Publish results</H2>
          <Subtitle>Announce results and send emails to speakers for accepted or rejected proposals.</Subtitle>
        </Card.Title>

        <Card.Content className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
          <StatisticCard
            label="Total results published"
            stat={`${statistics.accepted.published + statistics.rejected.published}`}
          >
            <Link to="../reviews" relative="path" size="s" weight="medium">
              See all proposals &rarr;
            </Link>
          </StatisticCard>
          <ProgressCard
            label="Accepted published"
            value={statistics.accepted.published}
            max={statistics.deliberation.accepted}
          >
            <PublicationButton type="ACCEPTED" statistics={statistics.accepted} />
          </ProgressCard>
          <ProgressCard
            label="Rejected published"
            value={statistics.rejected.published}
            max={statistics.deliberation.rejected}
          >
            <PublicationButton type="REJECTED" statistics={statistics.rejected} />
          </ProgressCard>
        </Card.Content>
      </Card>

      <section className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <DonutCard
          title="Deliberation results"
          subtitle="Proposals accepted or rejected by organizers"
          donutLabel={`${statistics.deliberation.total}`}
          categoryLabel="Status"
          amountLabel="Proposals"
          noDataHint="You need to mark proposals as accepted or rejected."
          data={[
            {
              name: 'Accepted proposals',
              amount: statistics.deliberation.accepted,
              colorChart: 'cyan',
              colorLegend: 'bg-cyan-500',
            },
            {
              name: 'Rejected proposals',
              amount: statistics.deliberation.rejected,
              colorChart: 'pink',
              colorLegend: 'bg-pink-500',
            },
            {
              name: 'Pending proposals',
              amount: statistics.deliberation.pending,
              colorChart: 'gray',
              colorLegend: 'bg-gray-500',
            },
          ]}
        >
          <Callout>
            To deliberate, open the Proposals page, select and mark proposals as accepted or rejected. You can also
            change the deliberation status individually on a proposal page.
          </Callout>
        </DonutCard>

        <DonutCard
          title="Speaker confirmations"
          subtitle="Proposals confirmed or declined by speakers."
          donutLabel={`${statistics.accepted.published}`}
          categoryLabel="Status"
          amountLabel="Proposals"
          noDataHint="You need to publish results for accepted proposals."
          data={[
            {
              name: 'Confirmed by speakers',
              amount: statistics.confirmations.confirmed,
              colorChart: 'cyan',
              colorLegend: 'bg-cyan-500',
            },
            {
              name: 'Declined by speakers',
              amount: statistics.confirmations.declined,
              colorChart: 'pink',
              colorLegend: 'bg-pink-500',
            },
            {
              name: 'Waiting for confirmation',
              amount: statistics.confirmations.pending,
              colorChart: 'gray',
              colorLegend: 'bg-gray-500',
            },
          ]}
        />
      </section>
    </Page>
  );
}
