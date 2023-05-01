import { InformationCircleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import cn from 'classnames';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

export function AlertInfo({ children, className }: Props) {
  return (
    <div className={cn('rounded-md bg-blue-50 p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-700">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function AlertError({ children, className }: Props) {
  return (
    <div className={cn('rounded-md bg-red-50 p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-700">{children}</p>
        </div>
      </div>
    </div>
  );
}
