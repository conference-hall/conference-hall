import type { CfpState } from '~/types/events.types';

type CfpIconProps = { cfpState: CfpState; cfpStart?: string; cfpEnd?: string };

export function CfpIcon({ cfpState, cfpStart, cfpEnd }: CfpIconProps) {
  if (!cfpStart && !cfpEnd) {
    return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-gray-400"></span>;
  }
  if (cfpState === 'CLOSED') {
    return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-orange-400"></span>;
  }
  if (cfpState === 'FINISHED') {
    return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-red-400"></span>;
  }
  return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-green-400"></span>;
}
