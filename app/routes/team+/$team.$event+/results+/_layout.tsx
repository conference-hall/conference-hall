import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { AlertInfo } from '~/design-system/Alerts';
import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { PageContent } from '~/design-system/layouts/PageContent';
import { H1, Subtitle, Text } from '~/design-system/Typography.tsx';
import type { ResultsStatistics } from '~/domains/organizer-cfp-results/ResultsAnnouncement';
import { ResultsAnnouncement } from '~/domains/organizer-cfp-results/ResultsAnnouncement';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.team, 'Invalid team slug');
  const results = ResultsAnnouncement.for(userId, params.team, params.event);
  return json(await results.statistics());
};

export default function ResultsAnnouncementRoute() {
  const statistics = useLoaderData<typeof loader>();

  return (
    <PageContent className="flex flex-col">
      <H1>Results announcement</H1>

      <AlertInfo>
        You still have {statistics.submitted} proposals to deliberate. You can also publish accepted and rejected
        results individually directly from a proposal review page.
      </AlertInfo>

      <ul className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <Card as="li" className="basis-1/2">
          <Card.Content>
            <div>
              <div className="absolute">
                <CheckCircleIcon className="h-12 w-12 text-green-600" aria-hidden="true" />
              </div>
              <div className="ml-16 overflow-hidden">
                <Text size="base" weight="semibold" truncate>
                  Accepted proposals
                </Text>
                <Subtitle truncate>Announce results to speakers for accepted proposals.</Subtitle>
              </div>
            </div>
            <dl className="flex ml-16 gap-16">
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Accepted proposals</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {statistics.accepted.total}
                </dd>
              </div>
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Results published</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {statistics.accepted.published}
                </dd>
              </div>
            </dl>
          </Card.Content>
          <Card.Actions>
            <ButtonLink to="accepted" variant="secondary">
              Publish results
              <ArrowRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </ButtonLink>
          </Card.Actions>
        </Card>

        <Card as="li" className="basis-1/2">
          <Card.Content>
            <div>
              <div className="absolute">
                <XCircleIcon className="h-12 w-12 text-yellow-600" aria-hidden="true" />
              </div>
              <div className="ml-16 overflow-hidden">
                <Text size="base" weight="semibold" truncate>
                  Rejected proposals
                </Text>
                <Subtitle truncate>Announce results to speakers for rejected proposals.</Subtitle>
              </div>
            </div>
            <dl className="ml-16 flex gap-16">
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Rejected proposals</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {statistics.rejected.total}
                </dd>
              </div>
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Results published</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                  {statistics.rejected.published}
                </dd>
              </div>
            </dl>
          </Card.Content>
          <Card.Actions>
            <ButtonLink to="rejected" variant="secondary">
              Publish results
              <ArrowRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </ButtonLink>
          </Card.Actions>
        </Card>
      </ul>

      <Outlet context={statistics} />
    </PageContent>
  );
}

export const useResultsStatistics = (type?: string) => {
  const statistics = useOutletContext<ResultsStatistics>();
  if (type === 'accepted') return statistics.accepted;
  if (type === 'rejected') return statistics.rejected;
  return null;
};
