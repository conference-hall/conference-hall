import { I18nextProvider } from 'react-i18next';
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

  const renderComponent = (reviews: Pick<ProposalData['reviews'], 'summary' | 'members'>) => {
    const proposal = { id: 'p1', reviews: { you: { feeling: null, note: null }, ...reviews } } as ProposalData;
    return page.render(
      <I18nextProvider i18n={i18nTest}>
        <ReviewSidebar
          proposal={proposal}
          reviewEnabled={false}
          canDeliberate={false}
          pageRef={{ current: null }}
          onShowReviews={onShowReviews}
        />
      </I18nextProvider>,
    );
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
});
