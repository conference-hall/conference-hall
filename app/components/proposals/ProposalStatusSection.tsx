import { Form } from '@remix-run/react';

import { Button, ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { H3, Subtitle, Text } from '~/design-system/Typography';
import { SpeakerProposalStatus } from '~/server/proposals/get-speaker-proposal-status';

import { ProposalDeleteButton } from './ProposalDelete';

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
  return (
    <Card as="section" p={8} className="space-y-8">
      <div>
        <H3>Draft proposal!</H3>
        {event.isCfpOpen ? (
          <Subtitle>The proposal is not yet submitted to {event.name}. Do it before the CFP closes.</Subtitle>
        ) : (
          <Subtitle>The CFP is closed, sorry but you miss the submission timeframe 😔</Subtitle>
        )}
      </div>
      <div className="mt-5 flex gap-4">
        {event.isCfpOpen ? (
          <>
            <ButtonLink to={`../submission/${proposal.talkId}`} block>
              Continue submission
            </ButtonLink>
            <ProposalDeleteButton className="flex-1" />
          </>
        ) : (
          <ProposalDeleteButton className="flex-1" />
        )}
      </div>
    </Card>
  );
}

function Submitted({ event }: Props) {
  return (
    <Card as="section" p={8} className="space-y-8">
      <div>
        <H3>Submitted to {event.name}!</H3>
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
          <ButtonLink to="edit" block className="flex-1">
            Edit proposal
          </ButtonLink>
          <ProposalDeleteButton className="flex-1" />
        </div>
      )}
    </Card>
  );
}

function DeliberationPending() {
  return (
    <Card as="section" p={8}>
      <H3>Deliberation pending</H3>
      <Subtitle>
        The organizers are currently deliberating, you will be notified by email when the proposal is accepted or
        declined.
      </Subtitle>
    </Card>
  );
}

function AcceptedByOrganizers({ event, proposal }: Props) {
  return (
    <Card as="section" p={8} className="space-y-8">
      <div>
        <H3>Proposal has been accepted to {event.name}!</H3>
        <Text variant="secondary" size="s">
          Please confirm or decline your participation to the event. Don't forget to check the event location and dates
          before.
        </Text>
      </div>
      <div className="flex gap-4">
        <Form method="POST" className="flex-1">
          <input type="hidden" name="_action" value="confirm" />
          <input type="hidden" name="participation" value="CONFIRMED" />
          <Button type="submit" block>
            Confirm
          </Button>
        </Form>
        <Form method="POST" className="flex-1">
          <input type="hidden" name="_action" value="confirm" />
          <input type="hidden" name="participation" value="DECLINED" />
          <Button type="submit" variant="secondary" block>
            Decline
          </Button>
        </Form>
      </div>
    </Card>
  );
}

function RejectedByOrganizers({ event, proposal }: Props) {
  return (
    <Card as="section" p={8} className="space-y-8">
      <div>
        <H3>Proposal has been declined by {event.name}.</H3>
        <Text variant="secondary" size="s">
          Thank you for your submission.
        </Text>
      </div>
      <ButtonLink to={{ pathname: '/', search: `talkId=${proposal.talkId}` }} variant="secondary" block>
        Submit it to an other event
      </ButtonLink>
    </Card>
  );
}

function ConfirmedBySpeaker({ event }: Props) {
  return (
    <Card as="section" p={8}>
      <H3>Your participation to {event.name} is confirmed, Thanks!</H3>
      <Text variant="secondary" size="s">
        We are happy to see you there.
      </Text>
    </Card>
  );
}

function DeclinedBySpeaker({ event }: Props) {
  return (
    <Card as="section" p={8}>
      <H3>You have declined this proposal for {event.name}.</H3>
      <Text variant="secondary" size="s">
        Organizers will be notified. Thanks for the notice.
      </Text>
    </Card>
  );
}
