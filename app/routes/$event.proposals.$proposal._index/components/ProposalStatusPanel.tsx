import { useFetcher } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { ProposalDeleteButton } from './ProposalDelete';
import { Card } from '~/design-system/Card';
import { H3, Subtitle, Text } from '~/design-system/Typography';

type Props = {
  event: { name: string; isCfpOpen: boolean };
  proposal: {
    id: string;
    title: string;
    talkId: string | null;
    isDraft: boolean;
    isSubmitted: boolean;
    isAccepted: boolean;
    isRejected: boolean;
    isConfirmed: boolean;
    isDeclined: boolean;
  };
};

export function ProposalStatusPanel(props: Props) {
  const { event, proposal } = props;

  if (proposal.isDraft && event.isCfpOpen) {
    return <DraftPanel {...props} />;
  } else if (proposal.isSubmitted) {
    return <SubmittedPanel {...props} />;
  } else if (proposal.isAccepted) {
    return <AcceptedPanel {...props} />;
  } else if (proposal.isRejected) {
    return <RejectedPanel {...props} />;
  } else if (proposal.isConfirmed) {
    return <ConfirmedPanel {...props} />;
  } else if (proposal.isDeclined) {
    return <DeclinedPanel {...props} />;
  }
  return null;
}

function DraftPanel({ event, proposal }: Props) {
  return (
    <Card rounded="xl" p={8} className="space-y-8">
      <div>
        <H3>Draft proposal!</H3>
        <Subtitle>The proposal is not yet submitted to {event.name}. Do it before the CFP closes.</Subtitle>
      </div>
      <div className="mt-5 flex gap-4">
        <ButtonLink to={`../submission/${proposal.talkId}`} block>
          Continue submission
        </ButtonLink>
      </div>
    </Card>
  );
}

function SubmittedPanel({ event, proposal }: Props) {
  return (
    <Card rounded="xl" p={8} className="space-y-8">
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

function AcceptedPanel({ event, proposal }: Props) {
  const fetcher = useFetcher();

  return (
    <Card rounded="xl" p={8} className="space-y-8">
      <div>
        <H3>Proposal has been accepted to {event.name}!</H3>
        <Text variant="secondary" size="s">
          Please confirm or decline your participation to the event. Don't forget to check the event location and dates
          before.
        </Text>
      </div>
      <div className="flex gap-4">
        <fetcher.Form action={`/${event.name}/proposals/${proposal.id}/confirm`} method="POST" className="flex-1">
          <input type="hidden" name="participation" value="CONFIRMED" />
          <Button type="submit" block>
            Confirm
          </Button>
        </fetcher.Form>
        <fetcher.Form action={`/${event.name}/proposals/${proposal.id}/confirm`} method="POST" className="flex-1">
          <input type="hidden" name="participation" value="DECLINED" />
          <Button type="submit" variant="secondary" block>
            Decline
          </Button>
        </fetcher.Form>
      </div>
    </Card>
  );
}

function RejectedPanel({ event, proposal }: Props) {
  return (
    <Card rounded="xl" p={8} className="space-y-8">
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

function ConfirmedPanel({ event }: Props) {
  return (
    <Card rounded="xl" p={8}>
      <H3>Your participation to {event.name} is confirmed, Thanks!</H3>
      <Text variant="secondary" size="s">
        We are happy to see you there.
      </Text>
    </Card>
  );
}

function DeclinedPanel({ event }: Props) {
  return (
    <Card rounded="xl" p={8}>
      <H3>You have declined this proposal for {event.name}.</H3>
      <Text variant="secondary" size="s">
        Organizers will be notified. Thanks for the notice.
      </Text>
    </Card>
  );
}
