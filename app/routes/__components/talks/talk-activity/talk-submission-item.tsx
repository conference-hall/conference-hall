import {
  BeakerIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { formatDistanceToNowStrict } from 'date-fns';

import { ClientOnly } from '~/routes/__components/utils/ClientOnly';
import { SpeakerProposalStatus } from '~/types/speaker.types';

type Props = { slug: string; name: string; timestamp: string; proposalStatus: SpeakerProposalStatus };

export function TalkSubmissionItem({ slug, name, timestamp, proposalStatus }: Props) {
  if (proposalStatus === SpeakerProposalStatus.Draft) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Talk in draft for "
        icon={ExclamationTriangleIcon}
        className="bg-orange-400"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.ConfirmedBySpeaker) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Confirmed by you for "
        icon={CheckIcon}
        className="bg-green-700"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.DeclinedBySpeaker) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Declined by you for "
        icon={XMarkIcon}
        className="bg-red-400"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.AcceptedByOrganizers) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Talk accepted for "
        icon={CheckIcon}
        className="bg-green-700"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.RejectedByOrganizers) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Talk rejected for "
        icon={XMarkIcon}
        className="bg-red-400"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.DeliberationPending) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Deliberation pending for "
        icon={BeakerIcon}
        className="bg-gray-400"
      />
    );
  } else if (proposalStatus === SpeakerProposalStatus.Submitted) {
    return (
      <Item
        slug={slug}
        name={name}
        timestamp={timestamp}
        proposalStatus={proposalStatus}
        label="Talk submitted to "
        icon={PaperAirplaneIcon}
        className="bg-blue-600"
      />
    );
  }
}

type ItemProps = Props & { icon: React.ComponentType<{ className?: string }>; label: string; className: string };

function Item({ slug, name, timestamp, icon: Icon, label, className }: ItemProps) {
  return (
    <>
      <div className={cx('relative flex h-6 w-6 flex-none items-center justify-center rounded-full z-10', className)}>
        <Icon className="h-4 w-4 text-white" aria-hidden="true" />
      </div>
      <div className="py-0.5">
        <p className="text-sm text-gray-500">
          {label}
          <strong>
            <Link className="hover:underline" to={`/${slug}`}>
              {name}
            </Link>
          </strong>
        </p>
        <time dateTime={timestamp} className="text-xs text-gray-500">
          <ClientOnly>{() => `${formatDistanceToNowStrict(new Date(timestamp))} ago`}</ClientOnly>
        </time>
      </div>
    </>
  );
}
