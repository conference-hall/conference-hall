import { ArrowRightIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
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

// todo(18n) !!!
function Draft({ proposal, event }: Props) {
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>Draft proposal!</H2>
        {event.isCfpOpen ? (
          <Subtitle>The proposal is not yet submitted to {event.name}. Do it before the CFP closes.</Subtitle>
        ) : (
          <Subtitle>The CFP is closed, sorry but you miss the submission timeframe 😔</Subtitle>
        )}
      </div>
      <div className="mt-5 flex gap-4">
        {event.isCfpOpen ? (
          <>
            <ProposalDeleteButton />
            <ButtonLink to={`../submission/${proposal.talkId}`} iconRight={ArrowRightIcon}>
              Continue submission
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
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>Submitted to {event.name}!</H2>
        {event.isCfpOpen ? (
          <Subtitle>You can edit or delete your proposal as long as the CFP is open.</Subtitle>
        ) : (
          <Subtitle>
            The CFP is closed, the event organizers are reviewing the proposals. You will received the result by email
            soon.
          </Subtitle>
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
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>Deliberation pending</H2>
      <Subtitle>
        The organizers are currently deliberating, you will be notified by email when the proposal is accepted or
        declined.
      </Subtitle>
    </Card>
  );
}

function AcceptedByOrganizers({ event }: Props) {
  return (
    <Card as="section" p={8} className="flex flex-col lg:justify-between lg:flex-row lg:items-center space-y-4">
      <div>
        <H2 mb={1}>Proposal has been accepted to {event.name}!</H2>
        <Text variant="secondary">
          Please confirm or decline your participation to the event. Don't forget to check the event location and dates
          before.
        </Text>
      </div>
      <div className="flex gap-4">
        <Form method="POST">
          <input type="hidden" name="participation" value="DECLINED" />
          <Button type="submit" name="intent" value="proposal-confirmation" variant="secondary" iconRight={XMarkIcon}>
            Decline
          </Button>
        </Form>
        <Form method="POST">
          <input type="hidden" name="participation" value="CONFIRMED" />
          <Button type="submit" name="intent" value="proposal-confirmation" iconRight={CheckIcon}>
            Confirm
          </Button>
        </Form>
      </div>
    </Card>
  );
}

function RejectedByOrganizers({ event }: Props) {
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>Proposal has been declined by {event.name}.</H2>
      <Text variant="secondary">Thank you for your submission.</Text>
    </Card>
  );
}

function ConfirmedBySpeaker({ event }: Props) {
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>Your participation to {event.name} is confirmed, Thanks!</H2>
      <Text variant="secondary">We are happy to see you there.</Text>
    </Card>
  );
}

function DeclinedBySpeaker({ event }: Props) {
  return (
    <Card as="section" p={8}>
      <H2 mb={1}>You have declined this proposal for {event.name}.</H2>
      <Text variant="secondary">Organizers will be notified. Thanks for the notice.</Text>
    </Card>
  );
}
