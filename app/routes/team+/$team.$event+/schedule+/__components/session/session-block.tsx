import { CheckIcon, ClockIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';

import { formatTimeSlot } from '../../../../../../libs/datetimes/timeslots.ts';
import type { ScheduleProposalData, ScheduleSession } from '../schedule.types.ts';
import { SESSION_COLORS } from './constants.ts';

type SessionBlockProps = { session: ScheduleSession };

export function SessionBlock({ session }: SessionBlockProps) {
  const { timeslot, proposal } = session;

  const { block } = SESSION_COLORS.find((c) => c.value === session.color) ?? SESSION_COLORS[0];

  return (
    <div className={cx('text-xs flex flex-col justify-between h-full px-1 rounded', block)}>
      {proposal ? (
        <>
          <div>
            <div className="flex justify-between">
              <p className="font-semibold">{proposal.title}</p>
              {deliberationIcon(proposal)}
            </div>
            <p className="italic truncate">{proposal.speakers.map((s) => s.name).join(', ')}</p>
          </div>
          <div className="flex justify-between">
            <p>{formatTimeSlot(timeslot)}</p>
            {proposal.languages && <p>[{proposal.languages.join(',')}]</p>}
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col justify-between">
          <p className="font-semibold">{session.name}</p>
          <p>{formatTimeSlot(timeslot)}</p>
        </div>
      )}
    </div>
  );
}

function deliberationIcon({ deliberationStatus, confirmationStatus }: ScheduleProposalData) {
  if (deliberationStatus === 'ACCEPTED' && confirmationStatus === 'PENDING') {
    return <ClockIcon className="inline shrink-0 ml-1 mb-0.5 w-4 h-4 text-gray-600" aria-hidden />;
  } else if (deliberationStatus === 'REJECTED' || confirmationStatus === 'DECLINED') {
    return <XMarkIcon className="inline shrink-0 ml-0.5 mb-0.5 w-4 h-4 text-red-600" aria-hidden />;
  } else if (deliberationStatus === 'ACCEPTED' || confirmationStatus === 'CONFIRMED') {
    return <CheckIcon className="inline shrink-0 ml-0.5 mb-0.5 w-4 h-4 text-green-600" aria-hidden />;
  }
  return null;
}
