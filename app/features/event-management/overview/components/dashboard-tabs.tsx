import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, NavLink } from 'react-router';

type Props = { team: string; event: string };

export function DashboardTabs({ team, event }: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-gray-200 border-b">
      <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto px-6">
        <DashboardTab to={href('/team/:team/:event/overview', { team, event })}>
          {t('common.call-for-paper')}
        </DashboardTab>
        <DashboardTab to={href('/team/:team/:event/overview/reviewers', { team, event })}>
          {t('common.reviewers')}
        </DashboardTab>
        <DashboardTab to={href('/team/:team/:event/overview/reviews', { team, event })}>
          {t('common.reviews')}
        </DashboardTab>
      </nav>
    </div>
  );
}

type DashboardTabProps = { to: string; children: React.ReactNode };

function DashboardTab({ to, children }: DashboardTabProps) {
  return (
    <NavLink
      to={to}
      end
      discover="render"
      preventScrollReset
      className={({ isActive }) =>
        cx('flex gap-2 whitespace-nowrap border-b-2 p-4 px-1 text-sm', {
          'border-indigo-500 font-semibold text-indigo-600': isActive,
          'border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-900': !isActive,
        })
      }
    >
      <span>{children}</span>
    </NavLink>
  );
}
