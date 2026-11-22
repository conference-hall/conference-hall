import type { ComponentProps } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { UserProvider } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { AuthenticatedUser } from '~/shared/types/user.types.ts';
import { DiscussionCard } from './discussion-card.tsx';
import type { ReviewMember } from './reviews-panel.tsx';

describe('DiscussionCard component', () => {
  const user: AuthenticatedUser = {
    id: 'user-1',
    uid: 'user-uid-1',
    name: 'Clark Kent',
    email: 'clark@example.com',
    picture: null,
    role: 'user',
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const comment = (id: string, name: string, content: string): Message => ({
    id,
    sender: { userId: `user-${id}`, name, picture: null },
    content,
    reactions: [],
    sentAt: new Date(),
  });

  const speakerMessage = (id: string, name: string, role: 'SPEAKER' | 'ORGANIZER', content: string): Message => ({
    ...comment(id, name, content),
    sender: { userId: `user-${id}`, name, picture: null, role },
  });

  const recipients = [{ name: 'Peter Parker' }, { name: 'Marie Jane' }];

  const review = (id: string, name: string, note: number, dismissedAt: Date | null = null): ReviewMember => ({
    id,
    userId: `user-${id}`,
    name,
    picture: null,
    note,
    feeling: 'NEUTRAL',
    dismissedAt,
    updatedAt: new Date(),
  });

  const defaultProps: ComponentProps<typeof DiscussionCard> = {
    selectedTab: 'comments',
    onSelectTab: vi.fn(),
    comments: [comment('c1', 'Bruce Wayne', 'Great talk'), comment('c2', 'Diana Prince', 'Too generic')],
    reviews: [review('r1', 'Bruce Wayne', 4), review('r2', 'Diana Prince', 2)],
    reviewsSummary: { average: 3, positives: 0, negatives: 0 },
    speakerConversation: null,
    canManageConversations: false,
    canDismissReviews: false,
  };

  const renderComponent = (props: Partial<ComponentProps<typeof DiscussionCard>> = {}) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <UserProvider user={user}>
            <I18nextProvider i18n={i18nTest}>
              <DiscussionCard {...defaultProps} {...props} />
            </I18nextProvider>
          </UserProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/']} />);
  };

  it('shows the review comments and the comment form under the Comments tab', async () => {
    await renderComponent();

    await expect.element(page.getByRole('tab', { name: /Comments/ })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tab', { name: /Reviews/ })).toHaveAttribute('aria-selected', 'false');

    const panel = page.getByRole('tabpanel', { name: /Comments/ });
    await expect.element(panel.getByText('Visible only to the organizing team.')).toBeInTheDocument();
    await expect.element(panel.getByText('Great talk')).toBeInTheDocument();
    await expect.element(panel.getByText('Too generic')).toBeInTheDocument();
    await expect.element(panel.getByRole('textbox', { name: 'Add your comment' })).toBeInTheDocument();
    await expect.element(panel.getByRole('button', { name: /Comment/ })).toBeInTheDocument();
  });

  it('shows every review and the global review under the Reviews tab', async () => {
    await renderComponent({ selectedTab: 'reviews' });

    await expect.element(page.getByRole('tab', { name: /Reviews/ })).toHaveAttribute('aria-selected', 'true');

    const panel = page.getByRole('tabpanel', { name: /Reviews/ });
    await expect.element(panel.getByText('Visible only to the organizing team.')).toBeInTheDocument();
    const rows = panel.getByRole('listitem');
    await expect.element(rows.nth(0).getByText('Bruce Wayne')).toBeInTheDocument();
    await expect.element(rows.nth(0).getByText('4', { exact: true })).toBeInTheDocument();
    await expect.element(rows.nth(1).getByText('Diana Prince')).toBeInTheDocument();
    await expect.element(rows.nth(1).getByText('2', { exact: true })).toBeInTheDocument();
    await expect.element(rows.nth(2).getByText('Global review')).toBeInTheDocument();
    await expect.element(rows.nth(2).getByLabelText('Global review = 3')).toBeInTheDocument();
    await expect.element(panel.getByText('Great talk')).not.toBeInTheDocument();
  });

  it('asks to select a tab when the organizer clicks it', async () => {
    const onSelectTab = vi.fn();
    await renderComponent({ onSelectTab });

    await page.getByRole('tab', { name: /Reviews/ }).click();

    expect(onSelectTab).toHaveBeenCalledWith('reviews');
  });

  it('hides the Reviews tab when the members reviews are hidden', async () => {
    await renderComponent({ reviews: null, reviewsSummary: null, selectedTab: 'reviews' });

    await expect.element(page.getByRole('tab', { name: /Reviews/ })).not.toBeInTheDocument();
    await expect.element(page.getByRole('tab', { name: /Comments/ })).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByText('Great talk')).toBeInTheDocument();
  });

  it('counts the review comments and the non-dismissed reviews', async () => {
    await renderComponent({
      reviews: [review('r1', 'Bruce Wayne', 4), review('r2', 'Diana Prince', 2, new Date()), review('r3', 'Barry', 1)],
      comments: [comment('c1', 'Bruce Wayne', 'Great talk')],
    });

    await expect.element(page.getByRole('tab', { name: 'Comments 1' })).toBeInTheDocument();
    await expect.element(page.getByRole('tab', { name: 'Reviews 2' })).toBeInTheDocument();
  });

  it('offers to dismiss or restore a review when the user can dismiss reviews', async () => {
    await renderComponent({
      selectedTab: 'reviews',
      canDismissReviews: true,
      reviews: [review('r1', 'Bruce Wayne', 4), review('r2', 'Diana Prince', 2, new Date())],
    });

    const rows = page.getByRole('tabpanel').getByRole('listitem');
    await expect.element(rows.nth(0).getByRole('button', { name: 'Dismiss review' })).toBeInTheDocument();
    await expect.element(rows.nth(1).getByRole('button', { name: 'Restore review' })).toBeInTheDocument();
  });

  it('hides the dismiss action when the user cannot dismiss reviews', async () => {
    await renderComponent({ selectedTab: 'reviews' });

    await expect.element(page.getByRole('tabpanel').getByText('Bruce Wayne')).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Dismiss review' })).not.toBeInTheDocument();
  });

  it('shows only the comment form when there is no review comment', async () => {
    await renderComponent({ comments: [] });

    await expect.element(page.getByRole('tab', { name: 'Comments 0' })).toBeInTheDocument();
    await expect.element(page.getByRole('tabpanel').getByRole('listitem')).not.toBeInTheDocument();
    await expect.element(page.getByRole('textbox', { name: 'Add your comment' })).toBeInTheDocument();
  });

  it('shows "No reviews" when there is no review', async () => {
    await renderComponent({
      selectedTab: 'reviews',
      reviews: [],
      reviewsSummary: { average: null, positives: 0, negatives: 0 },
    });

    await expect.element(page.getByRole('tab', { name: 'Reviews 0' })).toBeInTheDocument();
    await expect.element(page.getByRole('tabpanel').getByText('No reviews')).toBeInTheDocument();
    await expect.element(page.getByText('Global review')).not.toBeInTheDocument();
  });

  it('shows the speaker conversation and the message form under the Speakers tab', async () => {
    await renderComponent({
      selectedTab: 'speakers',
      speakerConversation: {
        recipients,
        messages: [
          speakerMessage('m1', 'Peter Parker', 'SPEAKER', 'Hello from speaker'),
          speakerMessage('m2', 'Clark Kent', 'ORGANIZER', 'Hello from organizer'),
        ],
      },
    });

    const tabs = page.getByRole('tab');
    await expect.element(tabs.nth(2)).toHaveAccessibleName('Speakers 2');
    await expect.element(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');

    const panel = page.getByRole('tabpanel', { name: /Speakers/ });
    await expect
      .element(panel.getByText('Peter Parker and Marie Jane see these messages and will be notified.'))
      .toBeInTheDocument();
    const messages = panel.getByRole('listitem');
    await expect.element(messages.nth(0).getByText('Hello from speaker')).toBeInTheDocument();
    await expect.element(messages.nth(0).getByText('SPEAKER', { exact: true })).toBeInTheDocument();
    await expect.element(messages.nth(1).getByText('Hello from organizer')).toBeInTheDocument();
    await expect.element(messages.nth(1).getByText('ORGANIZER', { exact: true })).toBeInTheDocument();
    await expect
      .element(panel.getByRole('textbox', { name: 'Send a message to Peter Parker and Marie Jane' }))
      .toHaveAttribute('placeholder', 'Send a message to Peter Parker and Marie Jane');
    await expect.element(panel.getByRole('button', { name: /Send to speakers/ })).toBeInTheDocument();
    await expect.element(panel.getByText('Start a conversation with speakers')).not.toBeInTheDocument();
  });

  it('hides the Speakers tab when the speaker conversation is unavailable', async () => {
    await renderComponent({ speakerConversation: null, selectedTab: 'speakers' });

    await expect.element(page.getByRole('tab', { name: /Speakers/ })).not.toBeInTheDocument();
    await expect.element(page.getByRole('tab', { name: /Comments/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('invites to start a conversation when there is no speaker message', async () => {
    await renderComponent({
      selectedTab: 'speakers',
      speakerConversation: { recipients: [{ name: 'Peter Parker' }], messages: [] },
    });

    const panel = page.getByRole('tabpanel');
    await expect.element(page.getByRole('tab', { name: 'Speakers 0' })).toBeInTheDocument();
    await expect.element(panel.getByText('Peter Parker sees these messages and will be notified.')).toBeInTheDocument();
    await expect.element(panel.getByText('Start a conversation with speaker', { exact: true })).toBeInTheDocument();
    await expect.element(panel.getByRole('listitem')).not.toBeInTheDocument();
    await expect.element(panel.getByRole('textbox', { name: 'Send a message to Peter Parker' })).toBeInTheDocument();
  });

  it('shows a sent speaker message at once', async () => {
    await renderComponent({ selectedTab: 'speakers', speakerConversation: { recipients, messages: [] } });

    const panel = page.getByRole('tabpanel');
    await panel.getByRole('textbox').fill('First message to speakers');
    await panel.getByRole('button', { name: /Send to speakers/ }).click();

    await expect.element(panel.getByRole('listitem').getByText('First message to speakers')).toBeInTheDocument();
    await expect.element(panel.getByRole('listitem').getByText('ORGANIZER', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('tab', { name: 'Speakers 1' })).toBeInTheDocument();
    await expect.element(panel.getByText('Start a conversation with speakers')).not.toBeInTheDocument();
  });
});
