type Props = { value: number; max: number };

export function ProgressBar({ value = 0, max = 0 }: Props) {
  const progress = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200" aria-hidden>
      <div className="h-1.5 rounded-full bg-gray-500 dark:bg-gray-400" style={{ width: `${progress}%` }}></div>
    </div>
  );
}
