import { cx } from 'class-variance-authority';

import { Link } from '~/design-system/Links';

export type Statistics = { total: number; notPublished: number; published: number };

type StatisticProps = { name: string; label: string; value?: number; className?: string };

export function Statistic({ name, label, value, className }: StatisticProps) {
  return (
    <div className={cx('overflow-hidden flex flex-col p-2 grow items-center', className)}>
      <dt id={name} className="truncate text-sm font-medium text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby={name}>
        {value}
      </dd>
    </div>
  );
}

type StatisticLinkProps = StatisticProps & { to: string };

export function StatisticLink({ name, label, value, to, className }: StatisticLinkProps) {
  return (
    <Link
      to={to}
      className={cx(
        'overflow-hidden flex flex-col p-2 grow items-center hover:bg-slate-100 hover:no-underline',
        className,
      )}
    >
      <dt id={name} className="truncate text-sm font-medium text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900" aria-labelledby={name}>
        {value}
      </dd>
    </Link>
  );
}
