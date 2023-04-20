type Props = { value: number; max: number };

export function ProgressBar({ value = 0, max = 0 }: Props) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200" aria-hidden>
      <div
        className="h-1.5 rounded-full bg-blue-600 dark:bg-blue-500"
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      ></div>
    </div>
  );
}
