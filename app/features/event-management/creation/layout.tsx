import { Outlet } from 'react-router';

import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';

export default function EventCreationLayout() {
  return (
    <FullscreenPage navbar="default" compact>
      <Outlet />
    </FullscreenPage>
  );
}
