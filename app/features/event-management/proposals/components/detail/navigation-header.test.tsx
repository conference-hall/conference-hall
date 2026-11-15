import { useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { NavigationHeader } from './navigation-header.tsx';

describe('NavigationHeader', () => {
  const renderComponent = () => {
    function Page() {
      const pageRef = useRef<HTMLElement>(null);
      return (
        <I18nextProvider i18n={i18nTest}>
          <main ref={pageRef}>
            <NavigationHeader
              team="t1"
              event="e1"
              current={2}
              total={3}
              reviewed={1}
              next="p3"
              previous="p1"
              pageRef={pageRef}
              activityPromise={Promise.resolve([[], []])}
            />
          </main>
          <button type="button">Outside</button>
        </I18nextProvider>
      );
    }
    const RouteStub = createRoutesStub([
      { path: '/team/:team/:event/proposals/p2', Component: Page },
      { path: '/team/:team/:event/proposals/p3', Component: () => <h1>Next proposal</h1> },
      { path: '/team/:team/:event/proposals/p1', Component: () => <h1>Previous proposal</h1> },
    ]);
    return page.render(<RouteStub initialEntries={['/team/t1/e1/proposals/p2']} />);
  };

  it('goes to the next proposal with n', async () => {
    await renderComponent();

    await userEvent.keyboard('n');

    await expect.element(page.getByRole('heading', { name: 'Next proposal' })).toBeInTheDocument();
  });

  it('goes to the previous proposal with p', async () => {
    await renderComponent();

    await userEvent.keyboard('p');

    await expect.element(page.getByRole('heading', { name: 'Previous proposal' })).toBeInTheDocument();
  });

  it('lets keys through when the focus is outside the page', async () => {
    await renderComponent();
    const outside = page.getByRole('button', { name: 'Outside' }).element() as HTMLElement;
    outside.focus();

    const event = new KeyboardEvent('keydown', { key: 'n', code: 'KeyN', bubbles: true, cancelable: true });
    outside.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    await expect.element(page.getByRole('button', { name: 'Outside' })).toBeInTheDocument();
  });
});
