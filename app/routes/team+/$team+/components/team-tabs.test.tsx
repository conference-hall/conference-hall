import { render } from '@testing-library/react';
import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
import { TeamTabs } from './team-tabs.tsx';

describe('TeamTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/*', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1']} />);
  };

  it('displays tabs for team owners', () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="OWNER" />);

    expect(screen.queryByRole('link', { name: 'Events' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    expect(screen.queryByText('Owner')).toBeVisible();
  });

  it('displays tabs for team members', () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="MEMBER" />);

    expect(screen.queryByRole('link', { name: 'Events' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    expect(screen.queryByText('Member')).toBeVisible();
  });

  it('displays tabs for team reviewers', () => {
    // biome-ignore lint/a11y/useValidAriaRole: not an aria role
    const screen = renderComponent(<TeamTabs slug="t1" role="REVIEWER" />);

    expect(screen.queryByRole('link', { name: 'Events' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    expect(screen.queryByText('Reviewer')).toBeVisible();
  });
});
