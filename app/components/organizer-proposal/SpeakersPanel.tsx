import c from 'classnames';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AvatarName } from '~/design-system/Avatar';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';

type Props = { className?: string };

export function SpeakersPanel({ className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto py-8', className)}>
      <div>
        <Text className="mx-6 text-sm font-semibold">Speakers</Text>
        <div className="mt-4">
          <SpeakerInfos />
          <SpeakerInfos />
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Formats</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Quickie</Badge>
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Categories</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
          <Badge>Web</Badge>
          <Badge>Cloud</Badge>
        </div>
      </div>
      <div className="mx-6">
        <Text className="text-sm font-semibold">Tags</Text>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Top speaker</Badge>
          <Badge>Awesome talk</Badge>
        </div>
      </div>
    </section>
  );
}

function SpeakerInfos() {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={c('flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50', { 'bg-gray-50': open })}
          >
            <AvatarName photoURL="http://placekitten.com/24/24" name="Benjamin Petetot" subtitle="ben@example.com" />
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className={c('space-y-4 py-4 px-6', { 'bg-gray-50': open })}>
            <div>
              <Text className="text-sm font-semibold">Biography</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
            <div>
              <Text className="text-sm font-semibold">References</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
            <div>
              <Text className="text-sm font-semibold">Survey</Text>
              <Text className="mt-4">
                Some of you might be surprised to know that the Cloud isn't in the sky, it's undersea. Google Cloud is
                underpinned by fiber optic cables that criss-cross the globe to create one of the most advanced networks
                supporting failover, redundancy, and a highly performant virtualized network.
              </Text>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
