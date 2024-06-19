import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { formatDistanceToNowStrict } from 'date-fns';

import { ClientOnly } from '~/routes/__components/utils/ClientOnly';

type Props = { item: { type: string; timestamp: string; user: string; event: { name: string; slug: string } } };

export function TalkSubmittedItem({ item }: Props) {
  if (item.type !== 'status') return null;

  return (
    <>
      <div className="relative flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-500 z-10">
        <PaperAirplaneIcon className="h-4 w-4 text-white" aria-hidden="true" />
      </div>
      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
        The talk has been <strong>submitted</strong> to{' '}
        <strong>
          <Link className="hover:underline" to={`/${item.event.slug}`}>
            {item.event.name}
          </Link>
        </strong>
      </p>
      <time dateTime={item.timestamp} className="flex-none py-0.5 pr-3 text-xs leading-5 text-gray-500">
        <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(item.timestamp))} ago`}</ClientOnly>
      </time>
    </>
  );
}
