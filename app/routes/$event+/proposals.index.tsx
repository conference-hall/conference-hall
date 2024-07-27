import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Submissions } from '~/.server/cfp-submissions/submissions.ts';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

import { ProposalStatusLabel } from '../__components/proposals/proposal-status-label.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const proposals = await Submissions.for(userId, params.event).list();
  return json(proposals);
};

export default function EventSpeakerProposalsRoute() {
  const proposals = useLoaderData<typeof loader>();

  return (
    <Page>
      <h1 className="sr-only">Your proposals</h1>

      <List>
        <List.Header>
          <Text weight="semibold">{`${proposals.length} proposal(s) submitted`}</Text>
        </List.Header>

        <List.Content aria-label="Proposals list">
          {proposals.length === 0 ? <EmptyState icon={InboxIcon} label="No proposals submitted!" noBorder /> : null}
          {proposals.map((proposal) => (
            <List.RowLink key={proposal.id} to={proposal.id} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {proposal.title}
                </Text>
                <Text size="xs" variant="secondary">
                  {proposal.speakers.length ? `by ${proposal.speakers.map((a) => a.name).join(', ')}` : null}
                </Text>
              </div>
              <div className="flex items-center gap-4">
                <ProposalStatusLabel status={proposal.status} />
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </List.RowLink>
          ))}
        </List.Content>
      </List>
    </Page>
  );
}
