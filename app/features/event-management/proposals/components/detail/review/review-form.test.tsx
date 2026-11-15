import { useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import type { UserReview } from '~/shared/types/proposals.types.ts';
import { ReviewForm } from './review-form.tsx';

describe('ReviewForm', () => {
  const action = vi.fn();

  beforeEach(() => {
    action.mockReset();
    action.mockResolvedValue(null);
  });

  const renderComponent = (initialValues: UserReview = { feeling: null, note: null }) => {
    function Page() {
      const pageRef = useRef<HTMLElement>(null);
      return (
        <I18nextProvider i18n={i18nTest}>
          <main ref={pageRef}>
            <ReviewForm initialValues={initialValues} pageRef={pageRef} />
            <input aria-label="Comment" />
          </main>
        </I18nextProvider>
      );
    }
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/proposals/:proposal', Component: Page, action }]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/proposals/p1']} />);
  };

  const submitted = async () => {
    await vi.waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const request: Request = action.mock.calls[0][0].request;
    return Object.fromEntries(await request.formData());
  };

  it('rates with 3 stars when pressing 3', async () => {
    await renderComponent();

    await userEvent.keyboard('3');

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '3' });
  });

  it('rates as positive with + and no opinion with -', async () => {
    await renderComponent();

    await userEvent.keyboard('+');
    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'POSITIVE', note: '5' });

    action.mockClear();
    await userEvent.keyboard('-');
    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NO_OPINION', note: '' });
  });

  it('rates as negative with 0', async () => {
    await renderComponent();

    await userEvent.keyboard('0');

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEGATIVE', note: '0' });
  });

  it('clears the review when pressing the key of the current rating', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3 });

    await userEvent.keyboard('3');

    expect(await submitted()).toEqual({ intent: 'clear-review' });
  });

  it('rates from the digit row of an AZERTY keyboard without Shift', async () => {
    await renderComponent();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '&', code: 'Digit1', bubbles: true }));

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '1' });
  });

  it('ignores keys typed in a text field', async () => {
    await renderComponent();

    await userEvent.type(page.getByLabelText('Comment'), '3');

    await expect.element(page.getByLabelText('Comment')).toHaveValue('3');
    expect(action).not.toHaveBeenCalled();
  });

  it('exposes the shortcut of each rating', async () => {
    await renderComponent();

    await expect.element(page.getByRole('button', { name: '3 stars' })).toHaveAttribute('aria-keyshortcuts', '3');
  });

  it('announces the rating to screen readers', async () => {
    action.mockReturnValue(new Promise(() => {}));
    await renderComponent();

    await userEvent.keyboard('4');

    await expect.element(page.getByRole('status')).toHaveTextContent('4 stars');
  });
});
