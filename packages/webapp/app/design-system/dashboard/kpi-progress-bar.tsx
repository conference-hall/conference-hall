import { ProgressBar } from '../charts/progress-bar.tsx';
import { Text } from '../typography.tsx';

type Props = { label: string; value?: number; max?: number };

export function KpiProgressBar({ label, value = 0, max = 100 }: Props) {
  const safeValue = Math.min(max, Math.max(value, 0));
  const percentage = max ? (safeValue / max) * 100 : safeValue;

  return (
    <div className="grid gap-1 lg:grid-cols-5 lg:gap-4">
      <div className="flex items-center justify-between lg:col-span-2">
        <Text variant="secondary">{label}</Text>
        <div className="flex gap-1">
          <Text weight="semibold">{value}</Text>
          <Text>({Math.round(percentage)}%)</Text>
        </div>
      </div>

      <ProgressBar value={value} max={max} className="lg:col-span-3" />
    </div>
  );
}
