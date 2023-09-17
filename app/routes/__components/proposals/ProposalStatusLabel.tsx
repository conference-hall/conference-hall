import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, StarIcon, XCircleIcon } from '@heroicons/react/20/solid';

import { IconLabel } from '~/design-system/IconLabel.tsx';
import { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status.ts';

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
    <IconLabel icon={ExclamationTriangleIcon} variant="secondary">
      Draft proposal
    </IconLabel>
  );
}

function Submitted() {
  return (
    <IconLabel icon={CheckCircleIcon} variant="secondary">
      Submitted
    </IconLabel>
  );
}

function DeliberationPending() {
  return (
    <IconLabel icon={ClockIcon} variant="secondary">
      Deliberation pending
    </IconLabel>
  );
}

function AcceptedByOrganizers() {
  return (
    <IconLabel icon={StarIcon} variant="secondary">
      Accepted
    </IconLabel>
  );
}

function RejectedByOrganizers() {
  return (
    <IconLabel icon={XCircleIcon} variant="secondary">
      Declined by organizers
    </IconLabel>
  );
}

function ConfirmedBySpeaker() {
  return (
    <IconLabel icon={CheckCircleIcon} variant="secondary">
      Participation confirmed
    </IconLabel>
  );
}

function DeclinedBySpeaker() {
  return (
    <IconLabel icon={XCircleIcon} variant="secondary">
      Declined by you
    </IconLabel>
  );
}
