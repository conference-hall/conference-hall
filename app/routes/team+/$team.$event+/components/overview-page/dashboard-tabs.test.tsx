import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
import { render } from 'vitest-browser-react';
import { DashboardTabs } from './dashboard-tabs.tsx';

describe('DashboardTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1/e1']} />);
  };

  it('has call for paper tab selected', async () => {
    const screen = renderComponent(<DashboardTabs tab="call-for-paper" team="t1" event="e1" />);

    const callForPaperLink = screen.getByRole('link', { name: 'Call for paper' });
    await expect.element(callForPaperLink).toHaveAttribute('href', '/team/t1/e1');
    await expect.element(callForPaperLink).toHaveAttribute('aria-current', 'page');

    const reviewersLink = screen.getByRole('link', { name: 'Reviewers' });
    await expect.element(reviewersLink).toHaveAttribute('href', '/team/t1/e1?tab=reviewers');
    await expect.element(reviewersLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('has reviewers tab selected', async () => {
    const screen = renderComponent(<DashboardTabs tab="reviewers" team="t1" event="e1" />);

    const callForPaperLink = screen.getByRole('link', { name: 'Call for paper' });
    await expect.element(callForPaperLink).toHaveAttribute('href', '/team/t1/e1');
    await expect.element(callForPaperLink).not.toHaveAttribute('aria-current', 'page');

    const reviewersLink = screen.getByRole('link', { name: 'Reviewers' });
    await expect.element(reviewersLink).toHaveAttribute('href', '/team/t1/e1?tab=reviewers');
    await expect.element(reviewersLink).toHaveAttribute('aria-current', 'page');
  });
});
