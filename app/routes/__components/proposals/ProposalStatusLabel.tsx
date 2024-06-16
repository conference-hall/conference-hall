import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, StarIcon, XCircleIcon } from '@heroicons/react/20/solid';

import { IconLabel } from '~/design-system/IconLabel.tsx';
import { SpeakerProposalStatus } from '~/types/speaker.types';

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
  return (
    <IconLabel icon={ExclamationTriangleIcon} variant="secondary" size="xs">
      Draft proposal
    </IconLabel>
  );
}

function Submitted() {
  return (
    <IconLabel icon={CheckCircleIcon} variant="secondary" size="xs">
      Submitted
    </IconLabel>
  );
}

function DeliberationPending() {
  return (
    <IconLabel icon={ClockIcon} variant="secondary" size="xs">
      Deliberation pending
    </IconLabel>
  );
}

function AcceptedByOrganizers() {
  return (
    <IconLabel icon={StarIcon} variant="secondary" size="xs">
      Accepted
    </IconLabel>
  );
}

function RejectedByOrganizers() {
  return (
    <IconLabel icon={XCircleIcon} variant="secondary" size="xs">
      Declined by organizers
    </IconLabel>
  );
}

function ConfirmedBySpeaker() {
  return (
    <IconLabel icon={CheckCircleIcon} variant="secondary" size="xs">
      Participation confirmed
    </IconLabel>
  );
}

function DeclinedBySpeaker() {
  return (
    <IconLabel icon={XCircleIcon} variant="secondary" size="xs">
      Declined by you
    </IconLabel>
  );
}
