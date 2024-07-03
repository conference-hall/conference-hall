import { useLocation, useMatch, useNavigate, useSearchParams } from '@remix-run/react';

export function useScheduleFullscreen() {
  const scheduleRoute = useMatch('/team/:team/:event/schedule/:day');

  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isFullscreen = Boolean(scheduleRoute) && searchParams.get('fullscreen') === 'true';

  const toggle = () => {
    if (!scheduleRoute) return;
    searchParams.set('fullscreen', String(!isFullscreen));
    navigate({ pathname: location.pathname, search: searchParams.toString() });
  };

  return { isFullscreen, toggle };
}
