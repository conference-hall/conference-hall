import type { CfpState } from '~/utils/event';
import formatRelative from 'date-fns/formatRelative';
import { CalendarIcon, ExclamationCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import { CfpLabel } from './CfpInfo';
import { CardLink } from '~/design-system/Card';
import { IconLabel } from '~/design-system/IconLabel';
import { AvatarGroup } from '~/design-system/Avatar';
import { EmptyState } from '~/design-system/EmptyState';

type Props = {
  proposals: Array<{
    id: string;
    title: string;
    talkId: string | null;
    status: string;
    createdAt: string;
    speakers: Array<{
      id: string;
      name: string | null;
      photoURL?: string | null;
    }>;
  }>;
  cfpState: CfpState;
};

export function EventProposalsList({ proposals, cfpState }: Props) {
  if (cfpState !== 'OPENED') {
    return (
      <EmptyState icon={ExclamationCircleIcon}>
        <CfpLabel cfpState={cfpState} />
      </EmptyState>
    );
  }

  if (proposals.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        label="No submitted proposals yet!"
        description="Get started by submitting your first proposal."
      />
    );
  }

  return (
    <ul aria-label="Proposals list" className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {proposals.map((proposal) => (
        <CardLink as="li" key={proposal.id} to={proposal.id}>
          <div className="flex h-40 flex-col justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="truncate text-base font-semibold text-indigo-600">{proposal.title}</p>
              <AvatarGroup avatars={proposal.speakers} displayNames className="mt-2" />
            </div>

            <div>
              {proposal.status === 'DRAFT' ? (
                <IconLabel icon={ExclamationCircleIcon} className="text-sm text-yellow-600">
                  Draft proposal, don't forget to submit it.
                </IconLabel>
              ) : (
                <IconLabel icon={CalendarIcon} className="text-sm text-gray-500" iconClassName="text-gray-400">
                  Submitted&nbsp;
                  <time dateTime={proposal.createdAt}>{formatRelative(new Date(proposal.createdAt), new Date())}</time>
                </IconLabel>
              )}
            </div>
          </div>
        </CardLink>
      ))}
    </ul>
  );
}
