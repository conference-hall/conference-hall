import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { TeamTabs } from './team-tabs.tsx';

describe('TeamTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/*', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1']} />);
  };

  it('displays tabs for team owners', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        {/* biome-ignore lint/a11y/useValidAriaRole: not an aria role */}
        <TeamTabs slug="t1" role="OWNER" />
      </I18nextProvider>,
    );

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Owner')).toBeVisible();
  });

  it('displays tabs for team members', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        {/* biome-ignore lint/a11y/useValidAriaRole: not an aria role */}
        <TeamTabs slug="t1" role="MEMBER" />
      </I18nextProvider>,
    );

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Member')).toBeVisible();
  });

  it('displays tabs for team reviewers', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        {/* biome-ignore lint/a11y/useValidAriaRole: not an aria role */}
        <TeamTabs slug="t1" role="REVIEWER" />
      </I18nextProvider>,
    );

    await expect.element(screen.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect.element(screen.getByText('Reviewer')).toBeVisible();
  });
});
