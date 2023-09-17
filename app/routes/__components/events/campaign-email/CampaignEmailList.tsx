import { CheckIcon } from '@heroicons/react/20/solid';
import type { EmailStatus } from '@prisma/client';
import { useSearchParams } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useMemo } from 'react';

import { Badge } from '~/design-system/Badges.tsx';
import { Checkbox } from '~/design-system/forms/Checkboxes.tsx';
import { useCheckboxSelection } from '~/design-system/forms/useCheckboxSelection.tsx';
import { Link } from '~/design-system/Links.tsx';
import { Text } from '~/design-system/Typography.tsx';

import { ResendEmailButton, SendEmailsButton } from './SendEmailsButton.tsx';

export enum CampaignType {
  ACCEPTATION = 'acceptation',
  REJECTION = 'rejection',
}

type Proposal = {
  id: string;
  title: string;
  speakers: (string | null)[];
  status: string;
  emailAcceptedStatus: EmailStatus | null;
  emailRejectedStatus: EmailStatus | null;
};

type Props = { type: CampaignType; proposals: Array<Proposal>; total: number };

export function CampaignEmailList({ type, proposals, total }: Props) {
  const [searchParams] = useSearchParams();
  const ids = useMemo(() => proposals.map(({ id }) => id), [proposals]);

  const { checkboxRef, selection, checked, isSelected, onSelect, toggleAll, reset } = useCheckboxSelection(ids);

  const emailStatus = type === CampaignType.ACCEPTATION ? 'emailAcceptedStatus' : 'emailRejectedStatus';
  const isSendEmailPage = searchParams.get(emailStatus) !== 'sent';
  const hasEmailToSend = total > 0;

  return (
    <div className="-mx-4 mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
      <div className="flex h-12 flex-row items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 sm:px-6">
        <div className="flex flex-row items-center">
          {isSendEmailPage && hasEmailToSend && (
            <Checkbox
              type="checkbox"
              className="mr-4 hidden h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:mr-6 sm:inline-block"
              ref={checkboxRef}
              checked={checked}
              onChange={toggleAll}
            />
          )}
          <div className="flex items-baseline">
            <Text>{selection.length === 0 ? `${total} proposals` : `${selection.length} selected`}</Text>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          {isSendEmailPage && hasEmailToSend && <SendEmailsButton selection={selection} total={total} onSend={reset} />}
        </div>
      </div>
      <div className="divide-y divide-gray-200 bg-white">
        {isSendEmailPage && !hasEmailToSend && (
          <div key="no-email-to-send" className="flex p-6">
            <Text>
              No email to send, you can check <Link to={{ search: `${emailStatus}=sent` }}>already sent emails</Link>{' '}
              and resend them if necessary.
            </Text>
          </div>
        )}
        {proposals.map((proposal) => (
          <div key={proposal.id} className={cx('relative flex', { 'bg-gray-50': isSelected(proposal.id) })}>
            {isSendEmailPage && (
              <>
                {isSelected(proposal.id) && <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />}
                <Checkbox
                  value={proposal.id}
                  checked={isSelected(proposal.id)}
                  onChange={(e) => onSelect(proposal.id, e.target.checked)}
                  className="flex items-center justify-center pl-6"
                />
              </>
            )}
            <div className="mx-6 flex grow justify-between py-4">
              <div>
                <Text truncate>{proposal.title}</Text>
                <Text variant="secondary" size="xs">
                  by {proposal.speakers.join(', ')}
                </Text>
              </div>
              <div className="flex flex-row items-center gap-2">
                {proposal[emailStatus] && (
                  <Badge color={proposal[emailStatus] === 'SENT' ? 'blue' : 'green'}>
                    <CheckIcon className="mr-1 h-3 w-3" />
                    {proposal[emailStatus]?.toLowerCase()}
                  </Badge>
                )}
                <Badge>{proposal.status.toLowerCase()}</Badge>
                {proposal[emailStatus] && <ResendEmailButton id={proposal.id} title={proposal.title} />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
