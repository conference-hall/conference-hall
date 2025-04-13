import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { UserPermissions } from '~/.server/team/user-permissions.ts';
import { EventTabs } from './event-tabs.tsx';

const ownerPermissions = UserPermissions.getPermissions('OWNER');
const memberPermissions = UserPermissions.getPermissions('MEMBER');
const reviewerPermissions = UserPermissions.getPermissions('REVIEWER');

describe('EventTabs component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/*', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/team/t1/e1']} />);
  };

  describe('for a conference', () => {
    it('team owners can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={ownerPermissions} />
        </I18nextProvider>,
      );

      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.overview' }))
        .toHaveAttribute('href', '/team/t1/e1');
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.proposals' }))
        .toHaveAttribute('href', '/team/t1/e1/reviews');
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.publication' }))
        .toHaveAttribute('href', '/team/t1/e1/publication');
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.schedule' }))
        .toHaveAttribute('href', '/team/t1/e1/schedule');
      await expect
        .element(screen.getByRole('link', { name: 'common.settings' }))
        .toHaveAttribute('href', '/team/t1/e1/settings');
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.event-page-link' }))
        .toHaveAttribute('href', '/e1');
    });

    it('team members can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={memberPermissions} />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'event-management.nav.overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.publication' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.schedule' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'common.settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={reviewerPermissions} />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'event-management.nav.overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.proposals' })).toBeVisible();
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.publication' }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'common.settings' })).not.toBeInTheDocument();
    });
  });

  describe('for a meetup', () => {
    it('team owners can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={ownerPermissions} />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'event-management.nav.overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.proposals' })).toBeVisible();
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.publication' }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'common.settings' })).toBeVisible();
    });

    it('team members can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={memberPermissions} />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'event-management.nav.overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.proposals' })).toBeVisible();
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.publication' }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'common.settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={reviewerPermissions} />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'event-management.nav.overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.proposals' })).toBeVisible();
      await expect
        .element(screen.getByRole('link', { name: 'event-management.nav.publication' }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'event-management.nav.schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'common.settings' })).not.toBeInTheDocument();
    });
  });
});
