import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import type { ProposalResult } from '~/features/event-management/autocomplete/types/autocomplete.types.ts';
import { type SessionIdentity, SessionIdentityField } from './session-identity-field.tsx';

// Resolve the debounced search immediately so results render without waiting.
vi.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (...args: unknown[]) => unknown) => fn,
}));

const PROPOSALS: ProposalResult[] = [
  {
    kind: 'proposals',
    id: 'p1',
    routeId: 'react-performance',
    title: 'React Performance Best Practices',
    speakers: [{ name: 'John Doe', picture: null }],
  },
  {
    kind: 'proposals',
    id: 'p2',
    routeId: 'vue-patterns',
    title: 'Vue.js Advanced Patterns',
    speakers: [{ name: 'Jane Smith', picture: null }],
  },
];

function Harness({ initial }: { initial?: SessionIdentity }) {
  const [identity, setIdentity] = useState<SessionIdentity>(initial ?? { name: '', proposal: null });
  return <SessionIdentityField name={identity.name} proposal={identity.proposal} onChange={setIdentity} />;
}

function renderField(options: { initial?: SessionIdentity; results?: ProposalResult[] } = {}) {
  const RouteStub = createRoutesStub([
    {
      path: '/team/:team/:event/schedule',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <Harness initial={options.initial} />
        </I18nextProvider>
      ),
    },
    {
      path: '/team/:team/:event/autocomplete',
      loader: () => options.results ?? PROPOSALS,
    },
  ]);
  return page.render(<RouteStub initialEntries={['/team/t1/e1/schedule']} />);
}

describe('SessionIdentityField component', () => {
  it('autofocuses an empty session and shows no dropdown', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await expect.element(input).toHaveFocus();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('does not autofocus when editing an existing raw session and shows the caption', async () => {
    await renderField({ initial: { name: 'Lunch break', proposal: null } });

    const input = page.getByRole('combobox');
    await expect.element(input).not.toHaveFocus();
    await expect.element(page.getByText('Raw session')).toBeVisible();
  });

  it('lists "Create raw session" first (default active) then matching proposals', async () => {
    await renderField();

    await userEvent.type(page.getByRole('combobox'), 'React');

    const createRaw = page.getByRole('option', { name: /Create raw session/ });
    await expect.element(createRaw).toBeVisible();
    await expect.element(createRaw).toHaveAttribute('data-focus');

    await expect.element(page.getByRole('option', { name: /React Performance Best Practices/ })).toBeVisible();
    await expect.element(page.getByText('John Doe')).toBeVisible();
  });

  it('commits a raw session with Enter and shows the caption', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Coffee break');
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByText('Raw session')).toBeVisible();
    await expect.element(input).toHaveValue('Coffee break');
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('links a proposal into a card and switches back to an empty field via change', async () => {
    await renderField();

    await userEvent.type(page.getByRole('combobox'), 'React');
    await page.getByRole('option', { name: /React Performance Best Practices/ }).click();

    // The input is replaced by a linked card.
    await expect.element(page.getByText('React Performance Best Practices')).toBeVisible();
    await expect.element(page.getByRole('combobox')).not.toBeInTheDocument();
    const changeButton = page.getByRole('button', { name: 'Change proposal' });
    await expect.element(changeButton).toBeVisible();

    await changeButton.click();

    const input = page.getByRole('combobox');
    await expect.element(input).toHaveValue('');
    await expect.element(input).toHaveFocus();
  });

  it('keeps the typed text when the list is dismissed with Esc', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Keynote');
    await expect.element(page.getByRole('option', { name: /Create raw session/ })).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
    await expect.element(input).toHaveValue('Keynote');
    await expect.element(page.getByText('Raw session')).toBeVisible();
  });

  it('clears the typed text and keeps focus with the clear control', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Lunch');

    await page.getByRole('button', { name: 'Clear' }).click();

    await expect.element(input).toHaveValue('');
    await expect.element(input).toHaveFocus();
  });
});
