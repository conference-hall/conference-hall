import { I18nextProvider } from 'react-i18next';
import { createRoutesStub, useLocation } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { FiltersTags } from './filters-tags.tsx';

vi.mock('~/features/event-management/event-team-context.tsx', () => ({
  useCurrentEventTeam: () => ({ event: { formats: [], categories: [], tags: [] } }),
}));

function CurrentSearch() {
  const location = useLocation();
  return <output>search:{location.search}</output>;
}

describe('FiltersTags component', () => {
  const renderComponent = () => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <FiltersTags filters={{ speakers: 'speaker-1' }} filteredSpeaker={{ name: 'Ada Lovelace' }} />
            <CurrentSearch />
          </I18nextProvider>
        ),
      },
    ]);
    return page.render(<RouteStub initialEntries={['/?speakers=speaker-1']} />);
  };

  it('displays the filtered speaker name', async () => {
    await renderComponent();

    await expect.element(page.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('removes the speakers filter on close', async () => {
    await renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Remove Ada Lovelace' }));

    await expect.element(page.getByText('search:', { exact: true })).toBeInTheDocument();
  });
});
