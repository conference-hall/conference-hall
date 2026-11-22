import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import type { ProposalData } from '../../../proposal.tsx';
import { ReviewSidebar } from './review-sidebar.tsx';

describe('ReviewSidebar component', () => {
  const onShowReviews = vi.fn();

  const review = (id: string, dismissedAt: Date | null = null) => ({
    id,
    userId: `user-${id}`,
    name: `Reviewer ${id}`,
    picture: null,
    note: 3,
    feeling: 'NEUTRAL' as const,
    dismissedAt,
    updatedAt: new Date(),
  });

  afterEach(async () => {
    await page.viewport(1920, 1080);
  });

  const renderComponent = (reviews: Pick<ProposalData['reviews'], 'summary' | 'members'>, reviewEnabled = false) => {
    const proposal = { id: 'p1', reviews: { you: { feeling: null, note: null }, ...reviews } } as ProposalData;
    const RouteStub = createRoutesStub([
      {
        path: '/team/:team/:event/proposals/:proposal',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <ReviewSidebar
              proposal={proposal}
              reviewEnabled={reviewEnabled}
              canDeliberate={false}
              pageRef={{ current: null }}
              onShowReviews={onShowReviews}
            />
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/proposals/p1']} />);
  };

  it('links the global review to the non-dismissed reviews', async () => {
    await renderComponent({
      summary: { average: 3, positives: 0, negatives: 0 },
      members: [review('r1'), review('r2'), review('r3', new Date())],
    });

    await page.getByRole('button', { name: '2 reviews' }).click();

    expect(onShowReviews).toHaveBeenCalledTimes(1);
  });

  it('uses the singular form for a single review', async () => {
    await renderComponent({ summary: { average: 3, positives: 0, negatives: 0 }, members: [review('r1')] });

    await expect.element(page.getByRole('button', { name: '1 review', exact: true })).toBeInTheDocument();
  });

  it('shows no link when the event hides the reviews of the members', async () => {
    await renderComponent({ summary: null, members: null });

    await expect.element(page.getByText('Your review')).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: /review/ })).not.toBeInTheDocument();
  });

  it('shows the review input next to the global review on a desktop', async () => {
    await page.viewport(1280, 800);
    await renderComponent({ summary: { average: 3, positives: 0, negatives: 0 }, members: [review('r1')] }, true);

    await expect.element(page.getByRole('button', { name: '4 stars' })).toBeVisible();
    await expect.element(page.getByText('Global review')).toBeVisible();
  });

  it('keeps the global review without the review input on a phone', async () => {
    await page.viewport(390, 844);
    await renderComponent({ summary: { average: 3, positives: 0, negatives: 0 }, members: [review('r1')] }, true);

    await expect.element(page.getByText('Global review')).toBeVisible();
    await expect.element(page.getByText('Your review')).not.toBeVisible();
    await expect.element(page.getByRole('button', { name: '4 stars' })).not.toBeInTheDocument();
  });

  it('takes no room on a phone when only the review input is left', async () => {
    await page.viewport(390, 844);
    const { container } = await renderComponent({ summary: null, members: null }, true);

    await expect.element(page.getByText('Your review')).not.toBeVisible();
    expect(container.getBoundingClientRect().height).toBe(0);
  });

  it('keeps the review of the member on a phone when reviews are disabled', async () => {
    await page.viewport(390, 844);
    await renderComponent({ summary: null, members: null });

    await expect.element(page.getByText('Your review')).toBeVisible();
  });
});
