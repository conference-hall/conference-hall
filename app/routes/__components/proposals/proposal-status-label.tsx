import { BadgeDot } from '~/design-system/badges.tsx';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

type Props = { status: SpeakerProposalStatus };

export function ProposalStatusLabel({ status }: Props) {
  switch (status) {
    case SpeakerProposalStatus.Draft:
      return <BadgeDot color="yellow">Draft</BadgeDot>;
    case SpeakerProposalStatus.Submitted:
    case SpeakerProposalStatus.DeliberationPending:
      return <BadgeDot color="blue">Applied</BadgeDot>;
    case SpeakerProposalStatus.AcceptedByOrganizers:
      return <BadgeDot color="green">Accepted</BadgeDot>;
    case SpeakerProposalStatus.RejectedByOrganizers:
      return <BadgeDot color="red">Declined</BadgeDot>;
    case SpeakerProposalStatus.ConfirmedBySpeaker:
      return <BadgeDot color="green">Confirmed</BadgeDot>;
    case SpeakerProposalStatus.DeclinedBySpeaker:
      return <BadgeDot color="red">Declined by you</BadgeDot>;
    default:
      return null;
  }
}
