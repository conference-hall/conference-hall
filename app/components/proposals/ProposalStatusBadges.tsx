import { BadgeDot } from '~/design-system/badges/Badges';

const STATUSES = {
  DRAFT: { color: 'gray', label: 'Draft' },
  SUBMITTED: { color: 'gray', label: 'Submitted' },
  ACCEPTED: { color: 'blue', label: 'Accepted' },
  REJECTED: { color: 'yellow', label: 'Rejected' },
  CONFIRMED: { color: 'green', label: 'Confirmed' },
  DECLINED: { color: 'red', label: 'Declined' },
} as const;

type Props = { status: keyof typeof STATUSES };

export function ProposalStatusBadge({ status }: Props) {
  const { color, label } = STATUSES[status];
  return <BadgeDot color={color}>{label}</BadgeDot>;
}
