import type { CfpState } from '~/domains/shared/CallForPaper';

type CfpIconProps = { cfpState: CfpState; className?: string };

export function CfpIcon({ cfpState, className }: CfpIconProps) {
  if (cfpState === 'CLOSED') {
    return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-orange-400"></span>;
  }
  if (cfpState === 'FINISHED') {
    return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-red-400"></span>;
  }
  return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-green-400"></span>;
}
