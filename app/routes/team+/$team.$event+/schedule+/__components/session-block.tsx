import { cx } from 'class-variance-authority';

import { formatTimeSlot } from './schedule/timeslots.ts';
import type { Session } from './schedule/types.ts';

type SessionBlockProps = { session: Session; zoomLevel: number; oneLine: boolean };

export function SessionBlock({ session, zoomLevel, oneLine }: SessionBlockProps) {
  return (
    <div
      className={cx(
        'text-xs h-full px-1 text-indigo-400 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded',
        {
          'p-1': !oneLine && zoomLevel >= 3,
          'flex gap-1': oneLine,
        },
      )}
    >
      <p className="truncate">{formatTimeSlot(session.timeslot)}</p>
      <p className="font-semibold truncate">(No title)</p>
    </div>
  );
}
