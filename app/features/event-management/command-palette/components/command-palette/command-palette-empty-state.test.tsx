import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { CommandPaletteEmptyState } from './command-palette-empty-state.tsx';

type Scenario = { hasQuery: boolean; loading: boolean };

function emptyState({ hasQuery, loading }: Scenario): React.ReactElement {
  return (
    <I18nextProvider i18n={i18nTest}>
      <CommandPaletteEmptyState
        title="Search"
        description="Find proposals and speakers"
        hasQuery={hasQuery}
        loading={loading}
      />
    </I18nextProvider>
  );
}

async function renderEmptyState(...scenarios: Array<Scenario>): Promise<void> {
  const [initial, ...next] = scenarios;
  const screen = await page.render(emptyState(initial));
  for (const scenario of next) {
    await screen.rerender(emptyState(scenario));
  }
}

const IDLE = { hasQuery: false, loading: false };
const SEARCHING = { hasQuery: true, loading: true };
const SETTLED = { hasQuery: true, loading: false };

describe('CommandPaletteEmptyState', () => {
  it('displays the initial state when no query is typed', async () => {
    await renderEmptyState(IDLE);

    await expect.element(page.getByText('Find proposals and speakers')).toBeVisible();
  });

  it('keeps the initial state while the first search is loading', async () => {
    await renderEmptyState(IDLE, SEARCHING);

    await expect.element(page.getByText('Find proposals and speakers')).toBeVisible();
    expect(page.getByText('No results found').elements()).toHaveLength(0);
  });

  it('displays the no results state once the search is settled', async () => {
    await renderEmptyState(IDLE, SEARCHING, SETTLED);

    await expect.element(page.getByText('No results found')).toBeVisible();
  });

  it('keeps the no results state while a subsequent search is loading', async () => {
    await renderEmptyState(IDLE, SETTLED, SEARCHING);

    await expect.element(page.getByText('No results found')).toBeVisible();
  });

  it('resets to the initial state when the query is cleared', async () => {
    await renderEmptyState(IDLE, SETTLED, IDLE);

    await expect.element(page.getByText('Find proposals and speakers')).toBeVisible();
    expect(page.getByText('No results found').elements()).toHaveLength(0);
  });
});
