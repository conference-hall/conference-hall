import { ButtonLink } from '~/design-system/buttons.tsx';

import { SinglePage } from '../single-page.tsx';

export function InternalServerError() {
  return (
    <SinglePage
      title="Internal Server Error"
      subtitle="Whoops! We are already working to solve the problem."
      withFooter
    >
      <div className="pt-8">
        <ButtonLink to="/">Go to Home</ButtonLink>
      </div>
    </SinglePage>
  );
}
