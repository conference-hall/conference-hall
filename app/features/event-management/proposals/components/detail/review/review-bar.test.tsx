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
    i18n = i18nTest,
  ) => {
    function Page() {
      return (
        <I18nextProvider i18n={i18n}>
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

  it('shrinks to a single row on a phone in landscape', async () => {
    await page.viewport(667, 375);
    await renderComponent({ feeling: 'NEUTRAL', note: 4 });

    const link = (name: string) => bar().getByRole('link', { name }).element().getBoundingClientRect();
    const button = (name: string) => bar().getByRole('button', { name }).element().getBoundingClientRect();
    const controls = [
      { left: 0, right: 0, top: 0, bottom: 375, height: 375 },
      link('Previous proposal'),
      ...['No opinion', 'Not for me', 'Favorite', '1 star', '2 stars', '3 stars', '4 stars', '5 stars'].map(button),
      link('Next proposal'),
    ];
    const middle = (controls[1].top + controls[1].bottom) / 2;
    controls.forEach((control, index) => {
      expect(control.top).toBeLessThan(middle);
      expect(control.bottom).toBeGreaterThan(middle);
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.left).toBeGreaterThanOrEqual(controls[Math.max(index - 1, 0)].right);
    });
    expect(controls[10].right).toBeLessThanOrEqual(667);

    const region = bar().element().getBoundingClientRect();
    expect(region.bottom).toBe(375);
    expect(region.height).toBeLessThanOrEqual(68);
    const label = bar().getByRole('status').element().parentElement!.getBoundingClientRect();
    expect(label.width).toBeLessThanOrEqual(1);
    expect(label.height).toBeLessThanOrEqual(1);
    await expect.element(bar().getByRole('status')).toHaveTextContent('4 stars');
  });

  describe.each([
    { language: 'en', title: 'Your review', textButtons: ['No opinion', 'Not for me', 'Favorite'] },
    { language: 'fr', title: 'Votre note', textButtons: ["Pas d'avis", 'Pas pour moi', 'Favori'] },
  ])('in "$language"', ({ language, title, textButtons }) => {
    const renderTranslated = () => renderComponent(undefined, undefined, i18nTest.cloneInstance({ lng: language }));
    const region = () => page.getByRole('region', { name: title });
    const textButton = (name: string) => region().getByRole('button', { name }).element();
    const icons = () => textButtons.map((name) => textButton(name).querySelector('svg')!.getBoundingClientRect().width);

    const expectNoOverflow = (width: number) => {
      const controls = [...region().getByRole('link').elements(), ...region().getByRole('button').elements()];
      expect(controls).toHaveLength(10);
      for (const control of controls) {
        const box = control.getBoundingClientRect();
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.width).toBeGreaterThanOrEqual(28);
        expect(control.scrollWidth).toBeLessThanOrEqual(control.clientWidth);
      }
      const boxes = textButtons.map((name) => textButton(name).getBoundingClientRect());
      expect(boxes[1].top).toBe(boxes[0].top);
      expect(boxes[2].top).toBe(boxes[0].top);
      expect(boxes[1].left).toBeGreaterThanOrEqual(boxes[0].right);
      expect(boxes[2].left).toBeGreaterThanOrEqual(boxes[1].right);
      expect(Math.max(...boxes.map((box) => box.height))).toBeLessThanOrEqual(48);
    };

    it('shows the icon of the text buttons on a phone', async () => {
      await renderTranslated();

      await expect.element(region()).toBeVisible();
      expect(icons()).toEqual([20, 20, 20]);
      expectNoOverflow(390);
    });

    it('fits the text buttons without their icon on a 320 px wide phone', async () => {
      await page.viewport(320, 568);
      await renderTranslated();

      await expect.element(region()).toBeVisible();
      expect(textButtons.map((name) => textButton(name).textContent)).toEqual(textButtons);
      expect(icons()).toEqual([0, 0, 0]);
      expectNoOverflow(320);
    });

    it('fits the single row on a small phone in landscape', async () => {
      await page.viewport(568, 320);
      await renderTranslated();

      await expect.element(region()).toBeVisible();
      expectNoOverflow(568);
    });
  });

  it('is hidden on a desktop', async () => {
    await page.viewport(1280, 800);
    await renderComponent();

    await expect.element(page.getByText('Your review')).toBeInTheDocument();
    await expect.element(bar()).not.toBeInTheDocument();
  });
});
