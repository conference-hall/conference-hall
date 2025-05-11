import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { ReviewersList } from './reviewers-list.tsx';

describe('ReviewersList component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1/e1']} />);
  };

  it('displays reviewers metrics', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <ReviewersList
          proposalsCount={2}
          reviewersMetrics={[
            {
              id: 'r1',
              name: 'Reviewer 1',
              picture: 'https://example.com/picture.jpg',
              reviewsCount: 1,
              averageNote: 3,
              positiveCount: 1,
              negativeCount: 0,
            },
          ]}
        />
      </I18nextProvider>,
    );

    await expect.element(screen.getByRole('list')).toHaveAttribute('aria-label', 'Reviewers metrics');

    const reviewerListItem = screen.getByRole('listitem', { name: 'Reviewer 1' });
    await expect.element(reviewerListItem).toBeInTheDocument();
    await expect.element(reviewerListItem.getByText('#1')).toBeInTheDocument();
    await expect.element(reviewerListItem.getByText('Reviewer 1')).toBeInTheDocument();
    await expect.element(reviewerListItem.getByText('50%')).toBeInTheDocument();
    await expect.element(reviewerListItem.getByLabelText('Review: 0 (No way)')).toBeInTheDocument();
    await expect.element(reviewerListItem.getByLabelText('Review: 1 (Love it)')).toBeInTheDocument();
    await expect.element(reviewerListItem.getByLabelText('Review: 3 (Score)')).toBeInTheDocument();
  });

  it('displays empty state', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <ReviewersList proposalsCount={0} reviewersMetrics={[]} />
      </I18nextProvider>,
    );

    await expect.element(screen.getByText('No reviews yet')).toBeInTheDocument();
  });
});
