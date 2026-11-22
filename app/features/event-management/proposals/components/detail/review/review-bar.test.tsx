import { I18nextProvider } from 'react-i18next';
import { createRoutesStub, useLocation } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import type { UserReview } from '~/shared/types/proposals.types.ts';
import { ReviewBar } from './review-bar.tsx';

describe('ReviewBar', () => {
  const action = vi.fn();

  beforeEach(async () => {
    action.mockResolvedValue(null);
    await page.viewport(390, 844);
  });

  afterEach(async () => {
    await page.viewport(1920, 1080);
  });

  const renderComponent = (
    initialValues: UserReview = { feeling: null, note: null },
    navigation: { previous?: string; next?: string } = { previous: 'p1', next: 'p3' },
  ) => {
    function Page() {
      return (
        <I18nextProvider i18n={i18nTest}>
          <ReviewBar team="t1" event="e1" {...navigation} initialValues={initialValues} />
        </I18nextProvider>
      );
    }
    function OtherProposal() {
      const { pathname, search } = useLocation();
      return <h1>{`${pathname}${search}`}</h1>;
    }
    const RouteStub = createRoutesStub([
      { path: '/team/:team/:event/proposals/p1', Component: OtherProposal },
      { path: '/team/:team/:event/proposals/p3', Component: OtherProposal },
      { path: '/team/:team/:event/proposals/:proposal', Component: Page, action },
    ]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/proposals/p2?query=mutation']} />);
  };

  const bar = () => page.getByRole('region', { name: 'Your review' });

  const submitted = async () => {
    await vi.waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const request: Request = action.mock.calls[0][0].request;
    return Object.fromEntries(await request.formData());
  };

  it('gives a note when tapping a star', async () => {
    await renderComponent();

    await bar().getByRole('button', { name: '4 stars' }).click();

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '4' });
  });

  it.each([
    { name: 'No opinion', review: { intent: 'add-review', feeling: 'NO_OPINION', note: '' } },
    { name: 'Not for me', review: { intent: 'add-review', feeling: 'NEGATIVE', note: '0' } },
    { name: 'Favorite', review: { intent: 'add-review', feeling: 'POSITIVE', note: '5' } },
  ])('reviews as "$name" when tapping its text button', async ({ name, review }) => {
    await renderComponent();

    await expect.element(bar().getByRole('button', { name })).toHaveTextContent(name);
    await bar().getByRole('button', { name }).click();

    expect(await submitted()).toEqual(review);
  });

  it('clears the review when tapping the current note', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3 });

    await bar().getByRole('button', { name: '3 stars' }).click();

    expect(await submitted()).toEqual({ intent: 'clear-review' });
  });

  it('clears the review when tapping the current text button', async () => {
    await renderComponent({ feeling: 'NO_OPINION', note: null });

    await bar().getByRole('button', { name: 'No opinion' }).click();

    expect(await submitted()).toEqual({ intent: 'clear-review' });
  });

  it('fills the stars up to the note', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 4 });

    await expect.element(bar().getByRole('button', { pressed: true })).toHaveLength(4);
    await expect.element(bar().getByRole('button', { name: '4 stars' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(bar().getByRole('button', { name: '5 stars' })).toHaveAttribute('aria-pressed', 'false');
    await expect.element(bar().getByRole('status')).toHaveTextContent('4 stars');
  });

  it('fills the five stars for a favorite', async () => {
    await renderComponent({ feeling: 'POSITIVE', note: 5 });

    await expect.element(bar().getByRole('button', { name: /stars?$/, pressed: true })).toHaveLength(5);
    await expect.element(bar().getByRole('button', { name: 'Favorite' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(bar().getByRole('status')).toHaveTextContent('Favorite');
  });

  it('presses only the selected text button', async () => {
    await renderComponent({ feeling: 'NO_OPINION', note: null });

    await expect.element(bar().getByRole('button', { pressed: true })).toHaveLength(1);
    await expect.element(bar().getByRole('button', { name: 'No opinion' })).toHaveAttribute('aria-pressed', 'true');
    await expect.element(bar().getByRole('status')).toHaveTextContent('No opinion');
  });

  it('says when the proposal is not reviewed', async () => {
    await renderComponent();

    await expect.element(bar().getByRole('status')).toHaveTextContent('Not reviewed');
    await expect.element(bar().getByRole('button', { pressed: true })).toHaveLength(0);
  });

  it('shows the review before the server answers', async () => {
    action.mockReturnValue(new Promise(() => {}));
    await renderComponent({ feeling: 'NEUTRAL', note: 1 });

    await bar().getByRole('button', { name: '3 stars' }).click();

    await expect.element(bar().getByRole('status')).toHaveTextContent('3 stars');
    await expect.element(bar().getByRole('button', { pressed: true })).toHaveLength(3);
  });

  it('shows the cleared review before the server answers', async () => {
    action.mockReturnValue(new Promise(() => {}));
    await renderComponent({ feeling: 'NEGATIVE', note: 0 });

    await bar().getByRole('button', { name: 'Not for me' }).click();

    await expect.element(bar().getByRole('status')).toHaveTextContent('Not reviewed');
    await expect.element(bar().getByRole('button', { name: 'Not for me' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('goes to the previous proposal and keeps the list filters', async () => {
    await renderComponent();

    await bar().getByRole('link', { name: 'Previous proposal' }).click();

    await expect
      .element(page.getByRole('heading', { name: '/team/t1/e1/proposals/p1?query=mutation' }))
      .toBeInTheDocument();
  });

  it('goes to the next proposal and keeps the list filters', async () => {
    await renderComponent();

    await bar().getByRole('link', { name: 'Next proposal' }).click();

    await expect
      .element(page.getByRole('heading', { name: '/team/t1/e1/proposals/p3?query=mutation' }))
      .toBeInTheDocument();
  });

  it('disables the previous link on the first proposal', async () => {
    await renderComponent(undefined, { next: 'p3' });

    await expect
      .element(bar().getByRole('link', { name: 'Previous proposal' }))
      .toHaveAttribute('aria-disabled', 'true');
    await expect.element(bar().getByRole('link', { name: 'Next proposal' })).not.toHaveAttribute('aria-disabled');
  });

  it('disables the next link on the last proposal', async () => {
    await renderComponent(undefined, { previous: 'p1' });

    await expect.element(bar().getByRole('link', { name: 'Next proposal' })).toHaveAttribute('aria-disabled', 'true');
    await expect.element(bar().getByRole('link', { name: 'Previous proposal' })).not.toHaveAttribute('aria-disabled');
  });

  it('puts the previous and next links on each side of the stars', async () => {
    await renderComponent();

    const previous = bar().getByRole('link', { name: 'Previous proposal' }).element().getBoundingClientRect();
    const next = bar().getByRole('link', { name: 'Next proposal' }).element().getBoundingClientRect();
    const firstStar = bar().getByRole('button', { name: '1 star' }).element().getBoundingClientRect();
    const lastStar = bar().getByRole('button', { name: '5 stars' }).element().getBoundingClientRect();
    expect(previous.width).toBeGreaterThanOrEqual(44);
    expect(next.width).toBeGreaterThanOrEqual(44);
    expect(previous.right).toBeLessThanOrEqual(firstStar.left);
    expect(next.left).toBeGreaterThanOrEqual(lastStar.right);
    expect(previous.top).toBeLessThan(firstStar.bottom);
    expect(previous.bottom).toBeGreaterThan(firstStar.top);
  });

  it('stays at the bottom of the screen on a phone', async () => {
    await renderComponent();

    await expect.element(bar()).toBeVisible();
    const box = bar().element().getBoundingClientRect();
    expect(box.left).toBe(0);
    expect(box.width).toBe(390);
    expect(box.bottom).toBe(844);
    expect(box.height).toBeLessThanOrEqual(160);
  });

  it('keeps its controls centered and narrow on a tablet in portrait', async () => {
    await page.viewport(768, 1024);
    await renderComponent();

    const first = bar().getByRole('button', { name: 'No opinion' }).element().getBoundingClientRect();
    const last = bar().getByRole('button', { name: 'Favorite' }).element().getBoundingClientRect();
    expect(last.right - first.left).toBeLessThanOrEqual(448);
    expect(first.left).toBeCloseTo(768 - last.right, 0);
  });

  it('is hidden on a desktop', async () => {
    await page.viewport(1280, 800);
    await renderComponent();

    await expect.element(page.getByText('Your review')).toBeInTheDocument();
    await expect.element(bar()).not.toBeInTheDocument();
  });
});
