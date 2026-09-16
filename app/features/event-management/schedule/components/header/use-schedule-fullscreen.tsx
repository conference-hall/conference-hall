import { useLocation, useMatch, useNavigate, useSearchParams } from 'react-router';

export function useScheduleFullscreen() {
  // Not exact: a child route of the schedule, such as the autofill panel, stays in fullscreen.
  const scheduleRoute = useMatch({ path: '/team/:team/:event/schedule/:day', end: false });

  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const isFullscreen = Boolean(scheduleRoute) && searchParams.get('fullscreen') === 'true';

  const toggle = async () => {
    if (!scheduleRoute) return;
    searchParams.set('fullscreen', String(!isFullscreen));
    await navigate({ pathname: location.pathname, search: searchParams.toString() }, { preventScrollReset: true });
  };

  return { isFullscreen, toggle };
}
