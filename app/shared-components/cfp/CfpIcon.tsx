import type { CfpState } from '~/schemas/event';
export type CfpIconProps = { cfpState: CfpState; className?: string };

export function CfpIcon({ cfpState }: CfpIconProps) {
  if (cfpState === 'CLOSED') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-orange-400"></span>
      </span>
    );
  }
  if (cfpState === 'FINISHED') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-red-400"></span>
      </span>
    );
  }
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-green-400"></span>
    </span>
  );
}
