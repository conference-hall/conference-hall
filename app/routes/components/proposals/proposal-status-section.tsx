import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';
import { ProposalDeleteButton } from './proposal-delete.tsx';

type Props = {
  proposal: { id: string; talkId: string | null; status: SpeakerProposalStatus };
  event: { name: string; slug: string; isCfpOpen: boolean };
};

export function ProposalStatusSection(props: Props) {
  const { proposal } = props;

  switch (proposal.status) {
    case SpeakerProposalStatus.Draft:
      return <Draft {...props} />;
    case SpeakerProposalStatus.Submitted:
      return <Submitted {...props} />;
    case SpeakerProposalStatus.DeliberationPending:
      return <DeliberationPending />;
    case SpeakerProposalStatus.AcceptedByOrganizers:
      return <AcceptedByOrganizers {...props} />;
    case SpeakerProposalStatus.RejectedByOrganizers:
      return <RejectedByOrganizers {...props} />;
    case SpeakerProposalStatus.ConfirmedBySpeaker:
      return <ConfirmedBySpeaker {...props} />;
    case SpeakerProposalStatus.DeclinedBySpeaker:
      return <DeclinedBySpeaker {...props} />;
    default:
      return null;
  }
}

function Draft({ proposal, event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>{t('speaker.proposal-status.draft.heading')}</H2>
        {event.isCfpOpen ? (
          <Subtitle>{t('speaker.proposal-status.draft.cfp-open', { event: event.name })}</Subtitle>
        ) : (
          <Subtitle>{t('speaker.proposal-status.draft.cfp-close')}</Subtitle>
        )}
      </div>
      <div className="mt-5 flex gap-4">
        {event.isCfpOpen ? (
          <>
            <ProposalDeleteButton />
            <ButtonLink to={`../submission/${proposal.talkId}`} iconRight={ArrowRightIcon}>
              {t('speaker.proposal-status.draft.continue')}
            </ButtonLink>
          </>
        ) : (
          <ProposalDeleteButton />
        )}
      </div>
    </Card>
  );
}

function Submitted({ event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>{t('speaker.proposal-status.submitted.heading', { event: event.name })}</H2>
        {event.isCfpOpen ? (
          <Subtitle>{t('speaker.proposal-status.submitted.cfp-open')}</Subtitle>
        ) : (
          <Subtitle>{t('speaker.proposal-status.submitted.cfp-close')}</Subtitle>
        )}
      </div>
      {event.isCfpOpen && (
        <div className="flex gap-4">
          <ProposalDeleteButton />
        </div>
      )}
    </Card>
  );
}

function DeliberationPending() {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{t('speaker.proposal-status.pending.heading')}</H2>
      <Subtitle>{t('speaker.proposal-status.pending.description')}</Subtitle>
    </Card>
  );
}

function AcceptedByOrganizers({ event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>{t('speaker.proposal-status.accepted.heading', { event: event.name })}</H2>
        <Text variant="secondary">{t('speaker.proposal-status.accepted.description')}</Text>
      </div>
      <div className="flex gap-4">
        <Form method="POST">
          <input type="hidden" name="participation" value="DECLINED" />
          <Button type="submit" name="intent" value="proposal-confirmation" variant="secondary" iconRight={XMarkIcon}>
            {t('common.decline')}
          </Button>
        </Form>
        <Form method="POST">
          <input type="hidden" name="participation" value="CONFIRMED" />
          <Button type="submit" name="intent" value="proposal-confirmation" iconRight={CheckIcon}>
            {t('common.confirm')}
          </Button>
        </Form>
      </div>
    </Card>
  );
}

function RejectedByOrganizers({ event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{t('speaker.proposal-status.rejected.heading', { event: event.name })}</H2>
      <Text variant="secondary">{t('speaker.proposal-status.rejected.description')}</Text>
    </Card>
  );
}

function ConfirmedBySpeaker({ event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{t('speaker.proposal-status.confirmed.heading', { event: event.name })}</H2>
      <Text variant="secondary">{t('speaker.proposal-status.confirmed.description')}</Text>
    </Card>
  );
}

function DeclinedBySpeaker({ event }: Props) {
  const { t } = useTranslation();
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>{t('speaker.proposal-status.declined.heading', { event: event.name })}</H2>
      <Text variant="secondary">{t('speaker.proposal-status.declined.description')}</Text>
    </Card>
  );
}
