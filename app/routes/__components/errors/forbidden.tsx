import { ButtonLink } from '~/design-system/buttons.tsx';

import { SinglePage } from '../single-page.tsx';

export function Forbidden() {
  return (
    <SinglePage title="Forbidden action" subtitle="Whoops! You cannot do that." withFooter>
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </SinglePage>
  );
}
