import { Text } from '~/design-system/Typography';
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
    <Text variant="secondary" size="xs">
      Draft proposal
    </Text>
  );
}

function Submitted() {
  return (
    <Text variant="secondary" size="xs">
      Proposal applied
    </Text>
  );
}

function DeliberationPending() {
  return (
    <Text variant="secondary" size="xs">
      Deliberation pending
    </Text>
  );
}

function AcceptedByOrganizers() {
  return (
    <Text variant="secondary" size="xs">
      Proposal accepted
    </Text>
  );
}

function RejectedByOrganizers() {
  return (
    <Text variant="secondary" size="xs">
      Declined by organizers
    </Text>
  );
}

function ConfirmedBySpeaker() {
  return (
    <Text variant="secondary" size="xs">
      Participation confirmed
    </Text>
  );
}

function DeclinedBySpeaker() {
  return (
    <Text variant="secondary" size="xs">
      Declined by you
    </Text>
  );
}
