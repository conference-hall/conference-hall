import { BadgeDot } from '~/design-system/Badges.tsx';

const STATUSES = {
  PENDING: { color: 'gray', label: 'Submitted' },
  ACCEPTED: { color: 'green', label: 'Accepted' },
  REJECTED: { color: 'red', label: 'Rejected' },
} as const;

type Props = { status: keyof typeof STATUSES };

export function ProposalStatusBadge({ status }: Props) {
  const { color, label } = STATUSES[status];
  return <BadgeDot color={color}>{label}</BadgeDot>;
}
