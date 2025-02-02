import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
import { render } from 'vitest-browser-react';
import { TeamTabs } from './team-tabs.tsx';

describe('TeamTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/*', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1']} />);
  };

  it('displays tabs for team owners', async () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="OWNER" />);

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Owner')).toBeVisible();
  });

  it('displays tabs for team members', async () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="MEMBER" />);

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Member')).toBeVisible();
  });

  it('displays tabs for team reviewers', async () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="REVIEWER" />);

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Reviewer')).toBeVisible();
  });
});
