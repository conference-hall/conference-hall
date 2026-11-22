import { useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { DiscussionTab } from './discussion/discussion-card.tsx';
import { NavigationHeader } from './navigation-header.tsx';

describe('NavigationHeader', () => {
  const message = (id: string, isNew: boolean): Message => ({
    id,
    sender: { userId: 'u1', name: 'Bruce Wayne', picture: null },
    content: 'Hello',
    reactions: [],
    sentAt: new Date(),
    isNew,
  });

  const renderComponent = (
    activity: [Array<Message>, Array<Message>] = [[], []],
    onSelectDiscussionTab: (tab: DiscussionTab) => void = vi.fn(),
  ) => {
    const activityPromise = Promise.resolve(activity);

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
              activityPromise={activityPromise}
              onSelectDiscussionTab={onSelectDiscussionTab}
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

  it('selects the Comments tab from the new messages pill when a review comment is new', async () => {
    const onSelectDiscussionTab = vi.fn();
    await renderComponent([[message('c1', true)], [message('m1', true)]], onSelectDiscussionTab);

    await page.getByRole('button', { name: '2 new messages' }).click();

    expect(onSelectDiscussionTab).toHaveBeenCalledWith('comments');
  });

  it('selects the Speakers tab from the new messages pill when only speaker messages are new', async () => {
    const onSelectDiscussionTab = vi.fn();
    await renderComponent([[message('c1', false)], [message('m1', true)]], onSelectDiscussionTab);

    await page.getByRole('button', { name: '1 new message' }).click();

    expect(onSelectDiscussionTab).toHaveBeenCalledWith('speakers');
  });
});
