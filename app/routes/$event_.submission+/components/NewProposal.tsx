import { SquaresPlusIcon } from '@heroicons/react/24/outline';
import { Link } from '@remix-run/react';

export function NewProposal() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Link
        to="new"
        className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-400 p-3 hover:border-gray-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <SquaresPlusIcon className="mx-auto h-8 w-8 text-gray-400" aria-hidden />
        <span className="mt-2 block text-sm font-semibold text-gray-900">Create a new proposal</span>
      </Link>
    </div>
  );
}
