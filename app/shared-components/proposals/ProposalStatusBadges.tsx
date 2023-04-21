import { Text } from '~/design-system/Typography';
import Badge, { Dotted } from '~/design-system/badges/Badges';

const STATUSES = {
  DRAFT: { color: 'gray', label: 'Draft', longLabel: 'Draft' },
  SUBMITTED: { color: 'gray', label: 'Submitted', longLabel: 'Submitted' },
  ACCEPTED: { color: 'blue', label: 'Accepted', longLabel: 'Accepted proposal' },
  REJECTED: { color: 'yellow', label: 'Rejected', longLabel: 'Rejected proposal' },
  CONFIRMED: { color: 'green', label: 'Confirmed', longLabel: 'Confirmed by speaker' },
  DECLINED: { color: 'red', label: 'Declined', longLabel: 'Declined by speaker' },
} as const;

type Props = { status: keyof typeof STATUSES; variant?: 'badge' | 'label'; className?: string };

export function ProposalStatusBadge({ status, variant = 'badge', className }: Props) {
  const values = STATUSES[status];

  if (variant === 'label') {
    return (
      <Dotted color={values.color} className={className}>
        <Text as="span" size="xs">
          {values.longLabel}
        </Text>
      </Dotted>
    );
  }

  return (
    <Badge variant="dot" color={values.color} pill>
      {values.label}
    </Badge>
  );
}
