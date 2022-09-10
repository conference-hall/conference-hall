import c from 'classnames';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { AvatarName } from '~/design-system/Avatar';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';

type Speaker = {
  id: string;
  name: string | null;
  photoURL: string | null;
  bio: string | null;
  references: string | null;
  email: string | null;
  company: string | null;
  address: string | null;
  github: string | null;
  twitter: string | null;
};

type Props = {
  proposal: {
    speakers: Array<Speaker>;
    formats: string[];
    categories: string[];
  };
  className?: string;
};

export function SpeakersPanel({ proposal, className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto py-8', className)}>
      <div>
        <Text className="mx-6 text-sm font-semibold">Speakers</Text>
        <div className="mt-4">
          {proposal.speakers.map((speaker) => (
            <SpeakerInfos key={speaker.id} speaker={speaker} />
          ))}
        </div>
      </div>
      {proposal.formats.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Formats</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.formats.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.categories.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Categories</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.categories.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {proposal.formats.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Tags</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.formats.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SpeakerInfos({ speaker }: { speaker: Speaker }) {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button
            className={c('flex w-full items-center justify-between px-6 py-4 hover:bg-gray-50', { 'bg-gray-50': open })}
          >
            <AvatarName photoURL={speaker.photoURL} name={speaker.name} subtitle={speaker.email} />
            {open ? <ChevronDownIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
          </Disclosure.Button>
          <Disclosure.Panel className={c('space-y-4 py-4 px-6', { 'bg-gray-50': open })}>
            {speaker.bio && (
              <div>
                <Text className="text-sm font-semibold">Biography</Text>
                <Text className="mt-4">{speaker.bio}</Text>
              </div>
            )}
            {speaker.references && (
              <div>
                <Text className="text-sm font-semibold">References</Text>
                <Text className="mt-4">{speaker.references}</Text>
              </div>
            )}
            {speaker.bio && (
              <div>
                <Text className="text-sm font-semibold">Survey</Text>
                <Text className="mt-4">{speaker.bio}</Text>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
