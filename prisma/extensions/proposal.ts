import { ConfirmationStatus, DeliberationStatus, Prisma, PublicationStatus } from '@prisma/client/app/index.js';

import { appUrl } from '../../app/libs/env/env.server.ts';
import { SpeakerProposalStatus } from '../../app/types/speaker.types.ts';

export const proposalExtension = Prisma.defineExtension({
  result: {
    proposal: {
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${appUrl()}/invite/proposal/${invitationCode}`;
        },
      },
      getStatusForSpeaker: {
        needs: { deliberationStatus: true, confirmationStatus: true, publicationStatus: true, isDraft: true },
        compute({ deliberationStatus, confirmationStatus, publicationStatus, isDraft }) {
          return (isCfpOpen: boolean): SpeakerProposalStatus => {
            if (isDraft) {
              return SpeakerProposalStatus.Draft;
            }

            if (confirmationStatus === ConfirmationStatus.CONFIRMED) {
              return SpeakerProposalStatus.ConfirmedBySpeaker;
            }

            if (confirmationStatus === ConfirmationStatus.DECLINED) {
              return SpeakerProposalStatus.DeclinedBySpeaker;
            }

            if (
              deliberationStatus === DeliberationStatus.ACCEPTED &&
              publicationStatus === PublicationStatus.PUBLISHED
            ) {
              return SpeakerProposalStatus.AcceptedByOrganizers;
            }

            if (
              deliberationStatus === DeliberationStatus.REJECTED &&
              publicationStatus === PublicationStatus.PUBLISHED
            ) {
              return SpeakerProposalStatus.RejectedByOrganizers;
            }

            if (!isCfpOpen) {
              return SpeakerProposalStatus.DeliberationPending;
            }
            return SpeakerProposalStatus.Submitted;
          };
        },
      },
    },
  },
});
