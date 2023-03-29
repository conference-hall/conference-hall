import type { CfpState } from '~/schemas/event';
export type CfpIconProps = { cfpState: CfpState; className?: string };

const STYLE = 'flex flex-shrink-0 h-4 w-4 items-center justify-center rounded-full';

export function CfpIcon({ cfpState }: CfpIconProps) {
  if (cfpState === 'CLOSED') {
    return (
      <span className={`${STYLE} bg-orange-100`} aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-orange-400"></span>
      </span>
    );
  }
  if (cfpState === 'FINISHED') {
    return (
      <span className={`${STYLE} bg-red-100`} aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-red-400"></span>
      </span>
    );
  }
  return (
    <span className={`${STYLE} bg-green-100`} aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-green-400"></span>
    </span>
  );
}
