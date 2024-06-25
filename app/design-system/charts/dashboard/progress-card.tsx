import { Card } from '~/design-system/layouts/card.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';

import { ProgressCircle } from '../progress-circle.tsx';

type Props = { label: string; value?: number; max?: number };

export function ProgressCard({ label, value = 0, max = 0 }: Props) {
  const safeValue = Math.min(max, Math.max(value, 0));
  const percentage = max ? (safeValue / max) * 100 : safeValue;

  return (
    <Card className="flex flex-col">
      <div className="flex flex-col justify-center gap-4 p-4 px-6 grow">
        <div className="flex items-center gap-x-5">
          <ProgressCircle value={safeValue}>
            <Text weight="medium">{`${percentage}%`}</Text>
          </ProgressCircle>
          <div>
            <Text weight="medium">{`${safeValue} / ${max}`}</Text>
            <Subtitle>{label}</Subtitle>
          </div>
        </div>
      </div>
    </Card>
  );
}
