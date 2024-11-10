import { Outlet } from '@remix-run/react';

import { FullscreenPage } from '~/routes/__components/fullscreen-page.tsx';

export default function EventCreationLayout() {
  return (
    <FullscreenPage navbar="default" compact>
      <Outlet />
    </FullscreenPage>
  );
}
