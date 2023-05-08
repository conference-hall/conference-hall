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
import { Text } from '~/design-system/Typography';
import { IconLabel } from '~/design-system/IconLabel';
import type { UserSocialLinks } from '~/schemas/user';
import { formatRating } from '~/utils/ratings';

type Ratings = {
  summary?: {
    average: number | null;
    positives: number;
    negatives: number;
  };
  members: Array<{
    id?: string;
    name?: string | null;
    picture?: string | null;
    rating: number | null;
    feeling: string | null;
  }>;
};

type Speaker = {
  id: string;
  name: string | null;
  picture: string | null;
  bio: string | null;
  references: string | null;
  email: string | null;
  company: string | null;
  address: string | null;
  socials: UserSocialLinks;
};

type Props = {
  proposal: {
    speakers: Array<Speaker>;
    ratings: Ratings;
  };
  displayRatings: boolean;
  className?: string;
};

export function LeftPanel({ proposal, displayRatings, className }: Props) {
  return (
    <section className={c('space-y-8 overflow-auto', className)}>
      <div className="divide-y divide-gray-200 border-b border-gray-200">
        {displayRatings && <TotalRating ratings={proposal.ratings} />}
        {proposal.speakers.map((speaker, index) => (
          <SpeakerInfos key={speaker.id} speaker={speaker} defaultOpen={index === 0} />
        ))}
      </div>
    </section>
  );
}

function TotalRating({ ratings }: { ratings: Ratings }) {
  const { summary, members } = ratings;

  return (
    <Disclosure as="section" className="flex flex-col overflow-hidden">
      {({ open }) => (
        <>
          <Disclosure.Button
            aria-label="Toggle organizer ratings details"
            className="flex w-full items-center justify-between px-6 py-8 hover:bg-gray-50"
          >
            <div className="flex items-center justify-around gap-4 font-medium">
              <IconLabel icon={StarIcon} alt={`Rating total ${formatRating(summary?.average)} out of 5`}>
                {formatRating(summary?.average) ?? '-'}
              </IconLabel>
              <IconLabel icon={HeartIcon} alt={`${summary?.positives} loves ratings`}>
                {summary?.positives}
              </IconLabel>
              <IconLabel icon={XCircleIcon} alt={`${summary?.negatives} negatives ratings`}>
                {summary?.negatives}
              </IconLabel>
            </div>
            <ChevronRightIcon
              className={c('h-6 w-6 shrink-0 transition-transform', { 'rotate-0': !open, 'rotate-90': open })}
            />
          </Disclosure.Button>
          <Disclosure.Panel
            aria-label="Organizer ratings details"
            className="grow space-y-4 overflow-auto px-6 pb-8 pt-4"
          >
            {members.length === 0 && <Text>No rated yet.</Text>}
            {members.map((member) => (
              <div key={member.id} className="flex justify-between">
                <AvatarName picture={member.picture} size="xs" name={member.name} />
                <div className="flex items-center justify-around gap-4">
                  <IconLabel icon={StarIcon}>{member.rating ?? '-'}</IconLabel>
                </div>
              </div>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function SpeakerInfos({ speaker, defaultOpen }: { speaker: Speaker; defaultOpen: boolean }) {
  return (
    <Disclosure as="section" defaultOpen={defaultOpen}>
      {({ open }) => (
        <>
          <Disclosure.Button
            aria-label={`Toggle speaker ${speaker.name} details`}
            className="flex w-full items-center justify-between px-6 py-8 hover:bg-gray-50"
          >
            <AvatarName picture={speaker.picture} name={speaker.name} subtitle={speaker.email} />
            <ChevronRightIcon
              className={c('h-6 w-6 shrink-0 transition-transform', { 'rotate-0': !open, 'rotate-90': open })}
            />
          </Disclosure.Button>
          <Disclosure.Panel aria-label={`Speaker ${speaker.name} details`} className="space-y-4 px-6 pb-8 pt-4">
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
              {speaker.socials?.github && (
                <IconLabel truncate icon={GlobeEuropeAfricaIcon}>
                  {speaker.socials.github}
                </IconLabel>
              )}
              {speaker.socials?.twitter && (
                <IconLabel truncate icon={GlobeEuropeAfricaIcon}>
                  {speaker.socials.twitter}
                </IconLabel>
              )}
            </div>
            {speaker.bio && <Text>{speaker.bio}</Text>}
            {speaker.references && <Text>{speaker.references}</Text>}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
