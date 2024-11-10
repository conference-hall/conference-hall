import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { formatDistanceToNowStrict } from 'date-fns';

import { Avatar } from '~/design-system/avatar.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3, Subtitle, Text } from '~/design-system/typography.tsx';
import type { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { ProposalStatusLabel } from '../proposals/proposal-status-label.tsx';
import { ClientOnly } from '../utils/client-only.tsx';

type Props = {
  submissions: Array<{
    slug: string;
    name: string;
    logoUrl: string | null;
    proposalStatus: SpeakerProposalStatus;
    createdAt: Date;
  }>;
};

export function TalkSubmissionsSection({ submissions }: Props) {
  return (
    <Card as="section" className="divide-y divide-gray-200">
      <div className="px-4 py-4">
        <H3>Talk submissions</H3>
      </div>

      <ul className="flex flex-col divide-y divide-gray-200">
        {submissions.map((submission) => (
          <li key={submission.slug}>
            <Link
              to={`/${submission.slug}/proposals`}
              aria-label={`Go to ${submission.name}`}
              className="flex items-center gap-4 justify-between hover:bg-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <Avatar picture={submission.logoUrl} name={submission.name} square size="s" aria-hidden />
                <div className="overflow-hidden">
                  <Text weight="medium" truncate>
                    {submission.name}
                  </Text>
                  <Subtitle size="xs">
                    <ClientOnly fallback="-">
                      {() => `${formatDistanceToNowStrict(submission.createdAt)} ago`}
                    </ClientOnly>
                  </Subtitle>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProposalStatusLabel status={submission.proposalStatus} />
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </Link>
          </li>
        ))}
        <li className="flex justify-between items-center px-4 py-3">
          <Subtitle size="xs">{`${submissions.length} submission(s)`}</Subtitle>
        </li>
      </ul>
    </Card>
  );
}
