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
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="CONFERENCE"
            displaySpeakers={true}
            permissions={ownerPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/team/t1/e1');
      await expect
        .element(screen.getByRole('link', { name: 'Proposals' }))
        .toHaveAttribute('href', '/team/t1/e1/reviews');
      await expect
        .element(screen.getByRole('link', { name: 'Speakers' }))
        .toHaveAttribute('href', '/team/t1/e1/speakers');
      await expect
        .element(screen.getByRole('link', { name: 'Publication' }))
        .toHaveAttribute('href', '/team/t1/e1/publication');
      await expect
        .element(screen.getByRole('link', { name: 'Schedule' }))
        .toHaveAttribute('href', '/team/t1/e1/schedule');
      await expect
        .element(screen.getByRole('link', { name: 'Settings' }))
        .toHaveAttribute('href', '/team/t1/e1/settings');
      await expect.element(screen.getByRole('link', { name: 'Event page' })).toHaveAttribute('href', '/e1');
    });

    it('team members can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="CONFERENCE"
            displaySpeakers={true}
            permissions={memberPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Speakers' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Publication' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Schedule' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="CONFERENCE"
            displaySpeakers={true}
            permissions={reviewerPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Speakers' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    });

    it('hides speakers tab when displaySpeakers disabled', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="CONFERENCE"
            displaySpeakers={false}
            permissions={reviewerPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Speakers' })).not.toBeInTheDocument();
    });
  });

  describe('for a meetup', () => {
    it('team owners can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="MEETUP"
            displaySpeakers={true}
            permissions={ownerPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Speakers' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team members can access to all features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="MEETUP"
            displaySpeakers={true}
            permissions={memberPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Speakers' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', async () => {
      const screen = renderComponent(
        <I18nextProvider i18n={i18nTest}>
          <EventTabs
            teamSlug="t1"
            eventSlug="e1"
            eventType="MEETUP"
            displaySpeakers={true}
            permissions={reviewerPermissions}
          />
        </I18nextProvider>,
      );

      await expect.element(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Proposals' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Speakers' })).toBeVisible();
      await expect.element(screen.getByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });
});
