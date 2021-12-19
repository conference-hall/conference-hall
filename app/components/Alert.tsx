import { CheckCircleIcon } from '@heroicons/react/solid';
import cn from 'classnames'

type AlertProps = { message: string, className?: string };

export default function SuccessAlert({ message, className }: AlertProps) {
  if (!message) return null;

  return (
    <div className={cn("rounded-md bg-green-50 border border-green-400 p-4", className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
