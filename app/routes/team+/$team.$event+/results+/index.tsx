import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { Card } from '~/design-system/layouts/Card';
import { PageContent } from '~/design-system/layouts/PageContent';
import { Link } from '~/design-system/Links';
import { H1, Subtitle, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function AcceptedProposalEmails() {
  return (
    <PageContent className="flex flex-col">
      <H1>Results announcement</H1>
      <ul className="flex flex-col gap-4 lg:flex-row lg:gap-16">
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
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">87</dd>
              </div>
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Results published</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
              </div>
            </dl>
          </Card.Content>
          <Card.Actions>
            <Link to="accepted" weight="semibold" className="my-2">
              Publish results
              <ArrowRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </Link>
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
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
              </div>
              <div className="overflow-hidden">
                <dt className="truncate text-sm font-medium text-gray-500">Results published</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
              </div>
            </dl>
          </Card.Content>
          <Card.Actions>
            <Link to="rejected" weight="semibold" className="my-2">
              Publish results
              <ArrowRightIcon className="h-5 w-5 ml-1" aria-hidden="true" />
            </Link>
          </Card.Actions>
        </Card>
      </ul>
    </PageContent>
  );
}
