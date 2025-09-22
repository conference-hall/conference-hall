import { parseWithZod } from '@conform-to/zod/v4';
import { useTranslation } from 'react-i18next';
import { Callout } from '~/design-system/callout.tsx';
import DonutCard from '~/design-system/dashboard/donut-card.tsx';
import { ProgressCard } from '~/design-system/dashboard/progress-card.tsx';
import { StatisticCard } from '~/design-system/dashboard/statistic-card.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { H1, H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { BadRequestError } from '~/shared/errors.server.ts';
import { getInstance } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/publication.ts';
import { PublicationButton } from './components/publication-confirm-modal.tsx';
import { Publication, PublishResultFormSchema } from './services/publication.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  return Publication.for(userId, params.team, params.event).statistics();
};

export const action = async ({ request, params, context }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const i18n = getInstance(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: PublishResultFormSchema });
  if (result.status !== 'success') throw new BadRequestError(i18n.t('error.invalid-form-data'));

  const { type, sendEmails } = result.value;
  await Publication.for(userId, params.team, params.event).publishAll(type, sendEmails);
  return toast(
    'success',
    type === 'ACCEPTED'
      ? i18n.t('event-management.publication.feedbacks.accepted-proposals-published')
      : i18n.t('event-management.publication.feedbacks.rejected-proposals-published'),
  );
};

export default function PublicationRoute({ loaderData: statistics }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <Page>
      <H1 srOnly>{t('event-management.nav.publication')}</H1>

      <div className="space-y-4 lg:space-y-6">
        <Card as="section">
          <Card.Title>
            <H2>{t('event-management.publication.publish.label')}</H2>
            <Subtitle>{t('event-management.publication.publish.description')}</Subtitle>
          </Card.Title>

          <Card.Content className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-3">
            <ProgressCard
              label={t('event-management.publication.publish.total-published')}
              value={statistics.accepted.published + statistics.rejected.published}
              max={statistics.deliberation.accepted + statistics.deliberation.rejected}
            >
              <Link to="../reviews" relative="path" size="s" weight="medium">
                {t('common.see-all-proposals')} &rarr;
              </Link>
            </ProgressCard>

            <StatisticCard
              label={t('event-management.publication.publish.accepted-to-publish')}
              stat={`${statistics.accepted.notPublished}`}
            >
              <StatisticCard.Footer>
                <PublicationButton type="ACCEPTED" statistics={statistics.accepted} />
              </StatisticCard.Footer>
            </StatisticCard>

            <StatisticCard
              label={t('event-management.publication.publish.rejected-to-publish')}
              stat={`${statistics.rejected.notPublished}`}
            >
              <StatisticCard.Footer>
                <PublicationButton type="REJECTED" statistics={statistics.rejected} />
              </StatisticCard.Footer>
            </StatisticCard>
          </Card.Content>
        </Card>

        <section className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <DonutCard
            title={t('event-management.publication.deliberation-chart.label')}
            subtitle={t('event-management.publication.deliberation-chart.description')}
            donutLabel={`${statistics.deliberation.total}`}
            categoryLabel={t('event-management.publication.deliberation-chart.category')}
            amountLabel={t('common.proposals')}
            noDataHint={t('event-management.publication.deliberation-chart.empty')}
            data={[
              {
                name: t('common.proposals.status.accepted'),
                amount: statistics.deliberation.accepted,
                colorChart: 'green',
                colorLegend: 'bg-green-500',
                to: '../reviews?status=accepted',
              },
              {
                name: t('common.proposals.status.rejected'),
                amount: statistics.deliberation.rejected,
                colorChart: 'red',
                colorLegend: 'bg-red-500',
                to: '../reviews?status=rejected',
              },
              {
                name: t('common.proposals.status.pending'),
                amount: statistics.deliberation.pending,
                colorChart: 'blue',
                colorLegend: 'bg-blue-500',
                to: '../reviews?status=pending',
              },
            ]}
          >
            <Callout>{t('event-management.publication.deliberation-chart.info')}</Callout>
          </DonutCard>

          <DonutCard
            title={t('event-management.publication.confirmation-chart.label')}
            subtitle={t('event-management.publication.confirmation-chart.description')}
            donutLabel={`${statistics.accepted.published}`}
            categoryLabel={t('event-management.publication.confirmation-chart.category')}
            amountLabel={t('common.proposals')}
            noDataHint={t('event-management.publication.confirmation-chart.empty')}
            data={[
              {
                name: t('common.proposals.status.confirmed'),
                amount: statistics.confirmations.confirmed,
                colorChart: 'green',
                colorLegend: 'bg-green-500',
                to: '../reviews?status=confirmed',
              },
              {
                name: t('common.proposals.status.declined'),
                amount: statistics.confirmations.declined,
                colorChart: 'red',
                colorLegend: 'bg-red-500',
                to: '../reviews?status=declined',
              },
              {
                name: t('common.proposals.status.not-answered'),
                amount: statistics.confirmations.pending,
                colorChart: 'blue',
                colorLegend: 'bg-blue-500',
                to: '../reviews?status=not-answered',
              },
            ]}
          >
            <Callout>{t('event-management.publication.confirmation-chart.info')}</Callout>
          </DonutCard>
        </section>
      </div>
    </Page>
  );
}
