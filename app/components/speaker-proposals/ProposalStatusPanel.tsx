import { StarIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { useFetcher } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { ProposalDeleteButton } from './ProposalDelete';

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
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-6 w-6 text-orange-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">"{proposal.title}"" is in draft!</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>The proposal is not yet submitted to {event.name}. Do it before the CFP closes.</p>
        </div>
        <div className="mt-5 flex gap-4">
          <ButtonLink to={`../submission/${proposal.talkId}`}>Continue submission</ButtonLink>
        </div>
      </div>
    </div>
  );
}

function SubmittedPanel({ event, proposal }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <CheckCircleIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          "{proposal.title}" successfully submitted to {event.name}
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          {event.isCfpOpen ? (
            <p>You can edit or delete your proposal as long as the CFP is open.</p>
          ) : (
            <p>
              The CFP is closed, the event organizers are reviewing the proposals. You will received the result by email
              soon.
            </p>
          )}
        </div>
        {event.isCfpOpen && (
          <div className="mt-5 flex gap-4">
            <ButtonLink to="edit">Edit proposal</ButtonLink>
            <ProposalDeleteButton />
          </div>
        )}
      </div>
    </div>
  );
}

function AcceptedPanel({ event, proposal }: Props) {
  const fetcher = useFetcher();

  return (
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <StarIcon className="h-6 w-6 text-yellow-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Congrats! "{proposal.title}" proposal has been accepted to {event.name}!
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>
            Please confirm or decline your participation to the event. Don't forget to check the event location and
            dates before.
          </p>
        </div>
        <div className="mt-5 flex gap-4">
          <fetcher.Form action={`/${event.name}/proposals/${proposal.id}/confirm`} method="post">
            <input type="hidden" name="participation" value="CONFIRMED" />
            <Button type="submit">Confirm your participation</Button>
          </fetcher.Form>
          <fetcher.Form action={`/${event.name}/proposals/${proposal.id}/confirm`} method="post">
            <input type="hidden" name="participation" value="DECLINED" />
            <Button type="submit" variant="secondary">
              Decline
            </Button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}

function RejectedPanel({ event, proposal }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <XCircleIcon className="h-6 w-6 text-red-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Unfortunately, "{proposal.title}" has been declined by {event.name}.
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Thank you for your submission.</p>
        </div>
      </div>
    </div>
  );
}

function ConfirmedPanel({ event }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <CheckCircleIcon className="h-6 w-6 text-green-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Your participation to {event.name} is confirmed, Thanks!
        </h3>
      </div>
    </div>
  );
}

function DeclinedPanel({ event }: Props) {
  return (
    <div className="my-6 flex items-start gap-4 border border-gray-100 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
      <div className="flex-shrink-0">
        <XCircleIcon className="h-6 w-6 text-red-300" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          You have declined this proposal for {event.name}.
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Organizers will be notified. Thanks for the notice.</p>
        </div>
      </div>
    </div>
  );
}
