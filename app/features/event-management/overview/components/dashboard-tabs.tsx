import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { href, NavLink } from 'react-router';
import { Badge } from '~/shared/design-system/badges.tsx';

type Props = { team: string; event: string };

export function DashboardTabs({ team, event }: Props) {
  const { t } = useTranslation();

  return (
    <div className="border-b border-gray-200">
      <nav aria-label="Tabs" className="flex space-x-8 px-6 -mb-px">
        <DashboardTab to={href('/team/:team/:event/overview', { team, event })}>
          {t('common.call-for-paper')}
        </DashboardTab>
        <DashboardTab to={href('/team/:team/:event/overview/reviewers', { team, event })}>
          {t('common.reviewers')}
        </DashboardTab>
        <DashboardTab to={href('/team/:team/:event/overview/reviews', { team, event })} isNew>
          {t('common.reviews')}
        </DashboardTab>
      </nav>
    </div>
  );
}

type DashboardTabProps = { to: string; isNew?: boolean; children: React.ReactNode };

function DashboardTab({ to, isNew, children }: DashboardTabProps) {
  const { t } = useTranslation();
  return (
    <NavLink
      to={to}
      end
      discover="render"
      className={({ isActive }) =>
        cx('border-b-2 px-1 p-4 text-sm flex gap-2', {
          'border-indigo-500 text-indigo-600 font-semibold': isActive,
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 font-medium': !isActive,
        })
      }
    >
      <span>{children}</span>
      {isNew ? (
        <Badge color="blue" pill compact>
          {t('common.new')}
        </Badge>
      ) : null}
    </NavLink>
  );
}
