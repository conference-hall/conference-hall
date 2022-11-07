import { ExclamationTriangleIcon, StarIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/20/solid';
import { IconLabel } from '~/design-system/IconLabel';

type Props = {
  proposal: {
    isDraft: boolean;
    isSubmitted: boolean;
    isAccepted: boolean;
    isRejected: boolean;
    isConfirmed: boolean;
    isDeclined: boolean;
  };
  isCfpOpen: boolean;
};

export function ProposalStatusLabel(props: Props) {
  const { proposal, isCfpOpen } = props;

  if (proposal.isDraft && isCfpOpen) {
    return <DraftLabel />;
  } else if (proposal.isSubmitted) {
    return <SubmittedLabel />;
  } else if (proposal.isAccepted) {
    return <AcceptedLabel />;
  } else if (proposal.isRejected) {
    return <RejectedLabel />;
  } else if (proposal.isConfirmed) {
    return <ConfirmedLabel />;
  } else if (proposal.isDeclined) {
    return <DeclinedLabel />;
  }
  return null;
}

export function DraftLabel() {
  return (
    <IconLabel icon={ExclamationTriangleIcon} iconClassName="text-orange-400" className="font-semibold text-gray-600">
      Draft proposal, don't forget to submit it.
    </IconLabel>
  );
}

function SubmittedLabel() {
  return (
    <IconLabel icon={CheckCircleIcon} iconClassName="text-gray-400">
      Submitted
    </IconLabel>
  );
}

function AcceptedLabel() {
  return (
    <IconLabel icon={StarIcon} iconClassName="text-yellow-400" className="font-semibold text-gray-600">
      Accepted! Please confirm or decline it.
    </IconLabel>
  );
}

function RejectedLabel() {
  return (
    <IconLabel icon={XCircleIcon} iconClassName="text-red-400">
      Declined
    </IconLabel>
  );
}

function ConfirmedLabel() {
  return (
    <IconLabel icon={CheckCircleIconSolid} iconClassName="text-green-400" className="font-semibold text-gray-600">
      Participation confirmed
    </IconLabel>
  );
}

function DeclinedLabel() {
  return (
    <IconLabel icon={ExclamationCircleIcon} iconClassName="text-orange-400" className="font-semibold text-gray-600">
      Participation declined
    </IconLabel>
  );
}
