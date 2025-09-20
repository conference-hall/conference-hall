import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { generatePath, Link, matchPath, useLocation, useParams } from 'react-router';

type Props = { to: string; label: string; icon?: React.ComponentType<{ className?: string }>; className?: string };

export function BackButton({ to, label, icon: Icon, className }: Props) {
  return (
    <Link to={to} className={cx('shrink-0', className)}>
      <span className="sr-only">{label}</span>
      {Icon ? (
        <Icon className="h-6 w-6 shrink-0" aria-hidden />
      ) : (
        <ArrowLeftIcon className="h-6 w-6 shrink-0" aria-hidden />
      )}
    </Link>
  );
}

type BackNavigationConfig = Array<{ path: string; back: string; title?: string }>;

export function useBackNavigation(config: BackNavigationConfig) {
  const params = useParams();
  const { pathname } = useLocation();

  const backRoute = config.find((route) => matchPath({ path: route.path, end: true }, pathname));

  if (!backRoute) {
    return { backPath: '/' };
  }

  return {
    backPath: generatePath(backRoute.back, params),
    title: backRoute.title,
  };
}
