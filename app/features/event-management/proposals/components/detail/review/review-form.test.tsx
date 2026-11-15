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
          <button type="button">Outside</button>
        </I18nextProvider>
      );
    }
    const RouteStub = createRoutesStub([{ path: '/team/:team/:event/proposals/:proposal', Component: Page, action }]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/proposals/p1']} />);
  };

  const press = (key: string, code: string, target: EventTarget = document, repeat = false) => {
    const event = new KeyboardEvent('keydown', { key, code, repeat, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  const submitted = async () => {
    await vi.waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const request: Request = action.mock.calls[0][0].request;
    return Object.fromEntries(await request.formData());
  };

  it.each(['1', '2', '3', '4', '5'])('gives a note of %s stars when pressing %s', async (key) => {
    await renderComponent();

    await userEvent.keyboard(key);

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: key });
  });

  it('reviews as positive with f and no opinion with x', async () => {
    await renderComponent();

    await userEvent.keyboard('f');
    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'POSITIVE', note: '5' });

    action.mockClear();
    await userEvent.keyboard('x');
    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NO_OPINION', note: '' });
  });

  it('reviews as negative with 0', async () => {
    await renderComponent();

    await userEvent.keyboard('0');

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEGATIVE', note: '0' });
  });

  it('clears the review when pressing the key of the current note', async () => {
    await renderComponent({ feeling: 'NEUTRAL', note: 3 });

    await userEvent.keyboard('3');

    expect(await submitted()).toEqual({ intent: 'clear-review' });
  });

  it('submits once when the key is held down', async () => {
    await renderComponent();

    press('3', 'Digit3');
    press('3', 'Digit3', document, true);
    press('3', 'Digit3', document, true);

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '3' });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('reviews from the digit row of an AZERTY keyboard without Shift', async () => {
    await renderComponent();

    press('&', 'Digit1');

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '1' });
  });

  it('reviews from the numeric keypad', async () => {
    await renderComponent();

    press('2', 'Numpad2');

    expect(await submitted()).toEqual({ intent: 'add-review', feeling: 'NEUTRAL', note: '2' });
  });

  it('ignores keys typed in a text field', async () => {
    await renderComponent();

    await userEvent.type(page.getByLabelText('Comment'), '3');

    await expect.element(page.getByLabelText('Comment')).toHaveValue('3');
    expect(action).not.toHaveBeenCalled();
  });

  it('lets keys through when the focus is outside the page', async () => {
    await renderComponent();
    const outside = page.getByRole('button', { name: 'Outside' }).element() as HTMLElement;
    outside.focus();

    const event = press('3', 'Digit3', outside);

    expect(event.defaultPrevented).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });

  it('announces the note to screen readers', async () => {
    action.mockReturnValue(new Promise(() => {}));
    await renderComponent();

    await userEvent.keyboard('4');

    await expect.element(page.getByRole('status')).toHaveTextContent('4 stars');
  });

  it('announces when the review is cleared', async () => {
    action.mockReturnValue(new Promise(() => {}));
    await renderComponent({ feeling: 'NEUTRAL', note: 3 });

    await userEvent.keyboard('3');

    await expect.element(page.getByRole('status')).toHaveTextContent('Not reviewed');
  });
});
