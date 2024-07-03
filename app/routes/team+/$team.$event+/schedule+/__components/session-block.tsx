import { formatTimeSlot } from './schedule/timeslots.ts';
import type { Session } from './schedule/types.ts';

type SessionBlockProps = { session: Session };

export function SessionBlock({ session }: SessionBlockProps) {
  return (
    <div className="text-xs h-full px-1 text-indigo-400 bg-indigo-50 border border-indigo-200 rounded">
      <p className="truncate">{formatTimeSlot(session.timeslot)}</p>
      <p className="font-semibold truncate">(No title)</p>
    </div>
  );
}
