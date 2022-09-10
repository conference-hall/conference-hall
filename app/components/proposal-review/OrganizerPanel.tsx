import c from 'classnames';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon, HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Avatar, AvatarName } from '~/design-system/Avatar';
import { IconLabel } from '~/design-system/IconLabel';
import { Text } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';

type Rating = {
  average: number | null;
  positives: number;
  negatives: number;
  membersRatings: Array<{
    id: string;
    name: string | null;
    photoURL: string | null;
    rating: number | null;
    feeling: string | null;
  }>;
};

type Message = {
  id: string;
  name: string | null;
  photoURL: string | null;
  message: string;
};

type Props = {
  rating: Rating;
  messages: Array<Message>;
  className?: string;
};

export function OrganizerPanel({ rating, messages, className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto', className)}>
      <TotalRating rating={rating} />
      <div className="px-6">
        <div className="flex gap-2">
          <Input
            type="text"
            name="message"
            aria-label="Write a comment to other organizers"
            placeholder="Write a comment..."
            className="grow"
          />
          <Button variant="secondary">Send</Button>
        </div>
        <div className="mt-8 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-end gap-4">
              <Avatar photoURL={message.photoURL} />
              <div className="grow">
                <Text size="xs" variant="secondary" className="pl-4">
                  {message.name}
                </Text>
                <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                  {message.message}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TotalRating({ rating }: { rating: Rating }) {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={'flex w-full items-center justify-between border-b border-gray-200 px-6 py-8 hover:bg-gray-50'}
          >
            <div className="flex items-center justify-around gap-4 font-medium">
              <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                {rating.average ?? '-'}
              </IconLabel>
              <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                {rating.positives}
              </IconLabel>
              <IconLabel icon={XCircleIcon} iconClassName="text-gray-400">
                {rating.negatives}
              </IconLabel>
            </div>
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className="space-y-4 border-b border-gray-200 px-6 py-8">
            {rating.membersRatings.length === 0 && <Text>No rated yet.</Text>}
            {rating.membersRatings.map((member) => (
              <div key={member.id} className="flex justify-between">
                <AvatarName photoURL={member.photoURL} size="xs" name={member.name} />
                <div className="flex items-center justify-around gap-4">
                  <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                    {member.rating ?? '-'}
                  </IconLabel>
                </div>
              </div>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
