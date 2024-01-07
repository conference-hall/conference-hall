import type { EventType } from '@prisma/client';
import { ConfirmationStatus, DeliberationStatus, PublicationStatus } from '@prisma/client';

import { SpeakerProposalStatus } from '~/types/speaker.types';

type ProposalArgs = {
  deliberationStatus: DeliberationStatus;
  publicationStatus: PublicationStatus;
  confirmationStatus: ConfirmationStatus | null;
  isDraft: boolean;
};

export function getSpeakerProposalStatus(proposal: ProposalArgs, isCfpOpen: boolean): SpeakerProposalStatus {
  const { deliberationStatus, confirmationStatus, publicationStatus, isDraft } = proposal;

  if (isDraft) {
    return SpeakerProposalStatus.Draft;
  } else if (confirmationStatus === ConfirmationStatus.CONFIRMED) {
    return SpeakerProposalStatus.ConfirmedBySpeaker;
  } else if (confirmationStatus === ConfirmationStatus.DECLINED) {
    return SpeakerProposalStatus.DeclinedBySpeaker;
  } else if (deliberationStatus === DeliberationStatus.ACCEPTED && publicationStatus === PublicationStatus.PUBLISHED) {
    return SpeakerProposalStatus.AcceptedByOrganizers;
  } else if (deliberationStatus === DeliberationStatus.REJECTED && publicationStatus === PublicationStatus.PUBLISHED) {
    return SpeakerProposalStatus.RejectedByOrganizers;
  } else if (!isCfpOpen) {
    return SpeakerProposalStatus.DeliberationPending;
  }
  return SpeakerProposalStatus.Submitted;
}
