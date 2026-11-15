export function GripIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 16" fill="currentColor" className={className}>
      <circle cx="2" cy="3" r="1.5" />
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="2" cy="13" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
