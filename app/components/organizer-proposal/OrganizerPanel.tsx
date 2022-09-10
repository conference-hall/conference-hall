import c from 'classnames';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon, HeartIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Avatar, AvatarName } from '~/design-system/Avatar';
import { TextArea } from '~/design-system/forms/TextArea';
import { IconLabel } from '~/design-system/IconLabel';
import { Text } from '~/design-system/Typography';

type Props = { className?: string };

export function OrganizerPanel({ className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto', className)}>
      <TotalRating />
      <div className="px-6">
        <TextArea
          name="message"
          aria-label="Write a comment to other organizers"
          placeholder="Write a comment..."
          className="grow"
          rows={3}
        />
        <div className="mt-8 space-y-4">
          <div className="flex items-end gap-4">
            <Avatar photoURL="http://placekitten.com/24/24" alt="you" />
            <div className="grow">
              <Text size="xs" variant="secondary" className="pl-4">
                Benjamin Petetot
              </Text>
              <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                This talk is awesome.
              </Text>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <Avatar photoURL="http://placekitten.com/24/24" alt="you" />
            <div className="grow">
              <Text size="xs" variant="secondary" className="pl-4">
                Benjamin Petetot
              </Text>
              <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                Yes!
              </Text>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TotalRating() {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={'flex w-full items-center justify-between border-b border-gray-200 px-6 py-8 hover:bg-gray-50'}
          >
            <div className="flex items-center justify-around gap-4 font-medium">
              <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                4.8
              </IconLabel>
              <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                1
              </IconLabel>
              <IconLabel icon={XCircleIcon} iconClassName="text-gray-400">
                0
              </IconLabel>
            </div>
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className="space-y-4 border-b border-gray-200 px-6 py-8">
            <div className="flex justify-between">
              <AvatarName photoURL="http://placekitten.com/24/24" size="xs" name="Benjamin Petetot" />
              <div className="flex items-center justify-around gap-4">
                <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                  1
                </IconLabel>
                <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                  4.8
                </IconLabel>
              </div>
            </div>
            <div className="flex justify-between">
              <AvatarName photoURL="http://placekitten.com/24/24" size="xs" name="Benjamin Petetot" />
              <div className="flex items-center justify-around gap-4">
                <IconLabel icon={HeartIcon} iconClassName="text-gray-400">
                  1
                </IconLabel>
                <IconLabel icon={StarIcon} iconClassName="text-gray-400">
                  4.8
                </IconLabel>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
