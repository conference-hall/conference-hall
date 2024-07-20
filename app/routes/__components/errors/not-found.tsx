import { ButtonLink } from '~/design-system/buttons.tsx';

import { SinglePage } from '../single-page.tsx';

export function NotFound() {
  return (
    <SinglePage title="Page not found" subtitle="Whoops! That page doesn’t exist." withFooter>
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </SinglePage>
  );
}
