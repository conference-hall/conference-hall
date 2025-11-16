type Props = { className?: string };

export function SlashBarIcon({ className }: Props) {
  return (
    <svg
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
    >
      <path d="m10.15 0 1.35.65L1.85 22 .5 21.35z" />
    </svg>
  );
}
