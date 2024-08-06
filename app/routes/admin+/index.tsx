import { Page } from '~/design-system/layouts/page.tsx';
import { H1 } from '~/design-system/typography.tsx';

export const loader = async () => {
  return null;
};

export default function AdminRoute() {
  return (
    <Page>
      <H1>Admin page</H1>
    </Page>
  );
}
