import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/solid';
import cn from 'classnames';
import { ReactNode } from 'react';

type AlertProps = { children: ReactNode; className?: string };

export function AlertSuccess({ children, className }: AlertProps) {
  return (
    <div className={cn('rounded-md bg-green-50 p-4', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function AlertInfo({ children, className }: AlertProps) {
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
