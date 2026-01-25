import { SpeakerProposalStatus } from '../../app/shared/types/speaker.types.ts';
import { ConfirmationStatus, DeliberationStatus, Prisma, PublicationStatus } from '../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../servers/environment.server.ts';

const { APP_URL } = getSharedServerEnv();

export const proposalExtension = Prisma.defineExtension({
  result: {
    proposal: {
      routeId: {
        needs: { id: true, proposalNumber: true },
        compute({ id, proposalNumber }) {
          if (proposalNumber) return String(proposalNumber);
          return id;
        },
      },
      invitationLink: {
        needs: { invitationCode: true },
        compute({ invitationCode }) {
          return `${APP_URL}/invite/proposal/${invitationCode}`;
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
