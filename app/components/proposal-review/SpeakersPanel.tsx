import c from 'classnames';
import { Disclosure } from '@headlessui/react';
import {
  BuildingOffice2Icon,
  ChevronRightIcon,
  GlobeEuropeAfricaIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { AvatarName } from '~/design-system/Avatar';
import Badge from '~/design-system/Badges';
import { Text } from '~/design-system/Typography';
import { IconLabel } from '~/design-system/IconLabel';

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
    rating: Rating;
    formats: string[];
    categories: string[];
  };
  className?: string;
};

export function SpeakersPanel({ proposal, className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto', className)}>
      <div className="divide-y divide-gray-200 border-b border-gray-200">
        <TotalRating rating={proposal.rating} />
        {proposal.speakers.map((speaker) => (
          <SpeakerInfos key={speaker.id} speaker={speaker} />
        ))}
      </div>
      <ProposalDetails formats={proposal.formats} categories={proposal.categories} />
    </section>
  );
}

function TotalRating({ rating }: { rating: Rating }) {
  return (
    <Disclosure as="div" className="flex flex-col overflow-hidden">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full items-center justify-between px-6 py-8 hover:bg-gray-50">
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
            <ChevronRightIcon className={c('h-6 w-6 transition-transform', { 'rotate-0': !open, 'rotate-90': open })} />
          </Disclosure.Button>
          <Disclosure.Panel className="grow space-y-4 overflow-auto px-6 pt-4 pb-8">
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

function SpeakerInfos({ speaker }: { speaker: Speaker }) {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full items-center justify-between px-6 py-8 hover:bg-gray-50">
            <AvatarName photoURL={speaker.photoURL} name={speaker.name} subtitle={speaker.email} />
            <ChevronRightIcon className={c('h-6 w-6 transition-transform', { 'rotate-0': !open, 'rotate-90': open })} />
          </Disclosure.Button>
          <Disclosure.Panel className="space-y-4 px-6 pt-4 pb-8">
            <div className="grid grid-cols-2 gap-4">
              {speaker.company && (
                <IconLabel truncate icon={BuildingOffice2Icon}>
                  {speaker.company}
                </IconLabel>
              )}
              {speaker.address && (
                <IconLabel truncate icon={MapPinIcon}>
                  {speaker.address}
                </IconLabel>
              )}
              {speaker.github && (
                <IconLabel truncate icon={GlobeEuropeAfricaIcon}>
                  {speaker.github}
                </IconLabel>
              )}
              {speaker.twitter && (
                <IconLabel truncate icon={GlobeEuropeAfricaIcon}>
                  {speaker.twitter}
                </IconLabel>
              )}
            </div>
            {speaker.bio && <Text>{speaker.bio}</Text>}
            {speaker.references && <Text className="mt-1">{speaker.references}</Text>}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function ProposalDetails({ formats, categories }: { formats: string[]; categories: string[] }) {
  return (
    <div className="space-y-8 pb-8">
      {formats.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Formats</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {formats.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {categories.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Categories</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
      {formats.length > 0 && (
        <div className="mx-6">
          <Text className="text-sm font-semibold">Tags</Text>
          <div className="mt-4 flex flex-wrap gap-2">
            {formats.map((name) => (
              <Badge key={name}>{name}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
