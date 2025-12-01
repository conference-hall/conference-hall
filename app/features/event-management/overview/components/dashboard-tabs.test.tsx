import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { DashboardTabs } from './dashboard-tabs.tsx';

describe('DashboardTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/overview', Component: () => Component }]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/overview']} />);
  };

  it('displays the dashboard tabs and links', async () => {
    await renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <DashboardTabs team="t1" event="e1" />
      </I18nextProvider>,
    );

    const callForPaperLink = page.getByRole('link', { name: 'Call for papers' });
    await expect.element(callForPaperLink).toHaveAttribute('href', '/team/t1/e1/overview');
    await expect.element(callForPaperLink).toHaveAttribute('aria-current', 'page');

    const reviewersLink = page.getByRole('link', { name: 'Reviewers' });
    await expect.element(reviewersLink).toHaveAttribute('href', '/team/t1/e1/overview/reviewers');
    await expect.element(reviewersLink).not.toHaveAttribute('aria-current', 'page');

    const reviewsLink = page.getByRole('link', { name: 'Reviews' });
    await expect.element(reviewsLink).toHaveAttribute('href', '/team/t1/e1/overview/reviews');
    await expect.element(reviewsLink).not.toHaveAttribute('aria-current', 'page');
  });
});
