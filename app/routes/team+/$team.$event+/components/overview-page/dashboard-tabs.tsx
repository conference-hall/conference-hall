import { cx } from 'class-variance-authority';
import { Link } from 'react-router';

type Props = { tab: string | null; team: string; event: string };

export function DashboardTabs({ tab, team, event }: Props) {
  return (
    <div className="border-b border-gray-200">
      <nav aria-label="Tabs" className="flex space-x-8 px-6 -mb-px">
        <DashboardTab to={`/team/${team}/${event}`} current={tab === 'call-for-paper'}>
          Call for paper
        </DashboardTab>
        <DashboardTab to={`/team/${team}/${event}?tab=reviewers`} current={tab === 'reviewers'}>
          Reviewers
        </DashboardTab>
      </nav>
    </div>
  );
}

type DashboardTabProps = { to: string; current: boolean; children: React.ReactNode };

function DashboardTab({ to, current, children }: DashboardTabProps) {
  return (
    <Link
      to={to}
      aria-current={current ? 'page' : undefined}
      className={cx('border-b-2 px-1 p-4 text-sm', {
        'border-indigo-500 text-indigo-600 font-semibold': current,
        'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 font-medium': !current,
      })}
    >
      {children}
    </Link>
  );
}
