import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { DashboardTabs } from './dashboard-tabs.tsx';

describe('DashboardTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/overview', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1/e1/overview']} />);
  };

  it('displays the dashboard tabs and links', async () => {
    const screen = await renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <DashboardTabs team="t1" event="e1" />
      </I18nextProvider>,
    );

    const callForPaperLink = screen.getByRole('link', { name: 'Call for papers' });
    await expect.element(callForPaperLink).toHaveAttribute('href', '/team/t1/e1/overview');
    await expect.element(callForPaperLink).toHaveAttribute('aria-current', 'page');

    const reviewersLink = screen.getByRole('link', { name: 'Reviewers' });
    await expect.element(reviewersLink).toHaveAttribute('href', '/team/t1/e1/overview/reviewers');
    await expect.element(reviewersLink).not.toHaveAttribute('aria-current', 'page');

    const reviewsLink = screen.getByRole('link', { name: 'Reviews' });
    await expect.element(reviewsLink).toHaveAttribute('href', '/team/t1/e1/overview/reviews');
    await expect.element(reviewsLink).not.toHaveAttribute('aria-current', 'page');
  });
});
