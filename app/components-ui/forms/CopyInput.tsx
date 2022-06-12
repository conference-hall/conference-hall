import { ClipboardCopyIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { useState } from 'react';

type Props = { label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function CopyInput({ id, type = 'text', value, className, error, ...rest }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value)).then(() => setCopied(true));
  };

  return (
    <div className={className}>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex items-stretch flex-grow focus-within:z-10">
          <input
            id={id}
            type={type}
            value={value}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            {...rest}
          />
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {copied ? (
            <>
              <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
