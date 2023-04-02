import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/20/solid';
import { IconLabel } from '~/design-system/IconLabel';

type Props = {
  isDraft?: boolean;
  isSubmitted?: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  isConfirmed?: boolean;
  isDeclined?: boolean;
  isArchived?: boolean;
  isCfpOpen?: boolean;
};

export function ProposalStatusLabel(props: Props) {
  const { isDraft, isSubmitted, isAccepted, isRejected, isConfirmed, isDeclined, isCfpOpen, isArchived } = props;

  if (isDraft && isCfpOpen) {
    return <Draft />;
  } else if (isSubmitted) {
    return <Submitted />;
  } else if (isAccepted) {
    return <Accepted />;
  } else if (isRejected) {
    return <Rejected />;
  } else if (isConfirmed) {
    return <Confirmed />;
  } else if (isDeclined) {
    return <Declined />;
  } else if (isArchived) {
    return <Archived />;
  }
  return null;
}

export function Draft() {
  return <IconLabel icon={ExclamationTriangleIcon}>Draft proposal</IconLabel>;
}

function Submitted() {
  return <IconLabel icon={CheckCircleIcon}>Submitted</IconLabel>;
}

function Accepted() {
  return <IconLabel icon={StarIcon}>Accepted</IconLabel>;
}

function Rejected() {
  return <IconLabel icon={XCircleIcon}>Declined by organizers</IconLabel>;
}

function Confirmed() {
  return <IconLabel icon={CheckCircleIcon}>Participation confirmed</IconLabel>;
}

function Declined() {
  return <IconLabel icon={XCircleIcon}>Declined by you</IconLabel>;
}

function Archived() {
  return <IconLabel icon={ArchiveBoxIcon}>Archived</IconLabel>;
}
