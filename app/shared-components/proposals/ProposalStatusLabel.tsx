import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, StarIcon, ClockIcon } from '@heroicons/react/20/solid';
import { IconLabel } from '~/design-system/IconLabel';
import { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';

type Props = { status: SpeakerProposalStatus };

export function ProposalStatusLabel({ status }: Props) {
  switch (status) {
    case SpeakerProposalStatus.Draft:
      return <Draft />;
    case SpeakerProposalStatus.Submitted:
      return <Submitted />;
    case SpeakerProposalStatus.DeliberationPending:
      return <DeliberationPending />;
    case SpeakerProposalStatus.AcceptedByOrganizers:
      return <AcceptedByOrganizers />;
    case SpeakerProposalStatus.RejectedByOrganizers:
      return <RejectedByOrganizers />;
    case SpeakerProposalStatus.ConfirmedBySpeaker:
      return <ConfirmedBySpeaker />;
    case SpeakerProposalStatus.DeclinedBySpeaker:
      return <DeclinedBySpeaker />;
    default:
      return null;
  }
}

export function Draft() {
  return <IconLabel icon={ExclamationTriangleIcon}>Draft proposal</IconLabel>;
}

function Submitted() {
  return <IconLabel icon={CheckCircleIcon}>Submitted</IconLabel>;
}

function DeliberationPending() {
  return <IconLabel icon={ClockIcon}>Deliberation pending</IconLabel>;
}

function AcceptedByOrganizers() {
  return <IconLabel icon={StarIcon}>Accepted</IconLabel>;
}

function RejectedByOrganizers() {
  return <IconLabel icon={XCircleIcon}>Declined by organizers</IconLabel>;
}

function ConfirmedBySpeaker() {
  return <IconLabel icon={CheckCircleIcon}>Participation confirmed</IconLabel>;
}

function DeclinedBySpeaker() {
  return <IconLabel icon={XCircleIcon}>Declined by you</IconLabel>;
}
