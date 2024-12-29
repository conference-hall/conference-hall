import { render } from '@testing-library/react';
import type { JSX } from 'react';
import { createRoutesStub } from 'react-router';
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
    it('team owners can access to all features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={ownerPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/team/t1/e1');
      expect(screen.queryByRole('link', { name: 'Proposals' })).toHaveAttribute('href', '/team/t1/e1/reviews');
      expect(screen.queryByRole('link', { name: 'Publication' })).toHaveAttribute('href', '/team/t1/e1/publication');
      expect(screen.queryByRole('link', { name: 'Schedule' })).toHaveAttribute('href', '/team/t1/e1/schedule');
      expect(screen.queryByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/team/t1/e1/settings');
      expect(screen.queryByRole('link', { name: 'Event page' })).toHaveAttribute('href', '/e1');
    });

    it('team members can access to all features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={memberPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Proposals' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Publication' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Schedule' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="CONFERENCE" permissions={reviewerPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Proposals' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });

  describe('for a meetup', () => {
    it('team owners can access to all features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={ownerPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Proposals' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team members can access to all features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={memberPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Proposals' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Settings' })).toBeVisible();
    });

    it('team reviewers can access to limited set of features', () => {
      const screen = renderComponent(
        <EventTabs teamSlug="t1" eventSlug="e1" eventType="MEETUP" permissions={reviewerPermissions} />,
      );

      expect(screen.queryByRole('link', { name: 'Overview' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Proposals' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Publication' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Schedule' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
    });
  });
});
