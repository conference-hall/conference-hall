export type StatusPillProps = { status: 'success' | 'error' | 'warning' | 'disabled' };

export function StatusPill({ status }: StatusPillProps) {
  switch (status) {
    case 'success':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-green-400" aria-hidden="true"></span>;
    case 'error':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-red-400" aria-hidden="true"></span>;
    case 'warning':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-orange-400" aria-hidden="true"></span>;
    case 'disabled':
      return <span className="flex h-3 w-3 flex-shrink-0 rounded-full bg-gray-400" aria-hidden="true"></span>;
  }
}
