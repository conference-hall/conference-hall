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

function renderField(options: { initial?: SessionIdentity; results?: ProposalResult[]; neverResolves?: boolean } = {}) {
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
      loader: () => (options.neverResolves ? new Promise(() => {}) : (options.results ?? PROPOSALS)),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/team/t1/e1/schedule']} />);
}

describe('SessionIdentityField component', () => {
  it('shows no dropdown while the field is empty', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await input.click();

    await expect.element(input).toHaveFocus();
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('renders an existing raw session value without opening the dropdown', async () => {
    await renderField({ initial: { name: 'Lunch break', proposal: null } });

    const input = page.getByRole('combobox');
    await expect.element(input).toHaveValue('Lunch break');
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('lists "Create raw session" first (default active) then matching proposals', async () => {
    await renderField();

    await userEvent.type(page.getByRole('combobox'), 'React');

    const createRaw = page.getByRole('option', { name: /Name session/ });
    await expect.element(createRaw).toBeVisible();
    await expect.element(createRaw).toHaveAttribute('data-focus');

    await expect.element(page.getByRole('option', { name: /React Performance Best Practices/ })).toBeVisible();
    await expect.element(page.getByText(/John Doe/)).toBeVisible();
  });

  it('commits a raw session with Enter and closes the list', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Coffee break');
    await userEvent.keyboard('{Enter}');

    await expect.element(input).toHaveValue('Coffee break');
    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
  });

  it('links a proposal into a card and detaches back to an empty field via change', async () => {
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
    await expect.element(input).toBeVisible();
    await expect.element(input).toHaveValue('');
  });

  it('keeps the typed text when the list is dismissed with Esc', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Keynote');
    await expect.element(page.getByRole('option', { name: /Name session/ })).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await expect.element(page.getByRole('option')).not.toBeInTheDocument();
    await expect.element(input).toHaveValue('Keynote');
  });

  it('clears the typed text with the clear control', async () => {
    await renderField();

    const input = page.getByRole('combobox');
    await userEvent.type(input, 'Lunch');

    await page.getByRole('button', { name: 'Clear' }).click();

    await expect.element(input).toHaveValue('');
  });

  it('highlights the query match in the proposal title', async () => {
    await renderField();

    await userEvent.type(page.getByRole('combobox'), 'React');

    // The matched fragment of the title is wrapped in its own span (scoped to the
    // proposal row to avoid the emphasised text in the Create-raw row).
    const proposalRow = page.getByRole('option', { name: /React Performance Best Practices/ });
    const highlight = proposalRow.getByText('React', { exact: true });
    await expect.element(highlight).toBeVisible();
    expect(highlight.element().tagName).toBe('SPAN');
  });

  it('shows a loading indicator while results load and keeps the Create-raw row', async () => {
    await renderField({ neverResolves: true });

    await userEvent.type(page.getByRole('combobox'), 'React');

    await expect.element(page.getByLabelText('Loading')).toBeVisible();
    await expect.element(page.getByRole('option', { name: /Name session/ })).toBeVisible();
    await expect
      .element(page.getByRole('option', { name: /React Performance Best Practices/ }))
      .not.toBeInTheDocument();
  });
});
