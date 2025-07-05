import { useTranslation } from 'react-i18next';
import { BadgeDot } from '~/design-system/badges.tsx';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';

type Props = { status: SpeakerProposalStatus };

export function ProposalStatusLabel({ status }: Props) {
  const { t } = useTranslation();

  switch (status) {
    case SpeakerProposalStatus.Draft:
      return <BadgeDot color="yellow">{t('event.proposals.status.draft')}</BadgeDot>;
    case SpeakerProposalStatus.Submitted:
    case SpeakerProposalStatus.DeliberationPending:
      return <BadgeDot color="blue">{t('event.proposals.status.submitted')}</BadgeDot>;
    case SpeakerProposalStatus.AcceptedByOrganizers:
      return <BadgeDot color="green">{t('event.proposals.status.accepted')}</BadgeDot>;
    case SpeakerProposalStatus.RejectedByOrganizers:
      return <BadgeDot color="red">{t('event.proposals.status.declined')}</BadgeDot>;
    case SpeakerProposalStatus.ConfirmedBySpeaker:
      return <BadgeDot color="green">{t('event.proposals.status.confirmed')}</BadgeDot>;
    case SpeakerProposalStatus.DeclinedBySpeaker:
      return <BadgeDot color="red">{t('event.proposals.status.declined-by-speaker')}</BadgeDot>;
    default:
      return null;
  }
}
