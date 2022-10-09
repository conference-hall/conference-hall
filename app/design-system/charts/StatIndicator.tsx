import type { ReactNode } from 'react';

type Props = { label: string; children: ReactNode };

export function StatIndicator({ label, children }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{children}</dd>
    </div>
  );
}
