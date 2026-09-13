import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { TracksModal } from './tracks-modal.tsx';

const TRACKS = [
  { id: 'track-1', name: 'Room 1' },
  { id: 'track-2', name: 'Room 2' },
];

describe('TracksModal component', () => {
  const renderComponent = (options: { error?: string } = {}) => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async ({ request }) => {
          onSubmit(Object.fromEntries(await request.formData()));
          return options.error ? { errors: { tracks: options.error } } : null;
        },
        Component: () => (
          <I18nextProvider i18n={i18nTest}>
            <TracksModal initialValues={TRACKS} open onClose={onClose} />
          </I18nextProvider>
        ),
      },
    ]);

    page.render(<RouteStub />);
    return { onClose, onSubmit };
  };

  it('submits the edited list with ids for existing tracks and none for new ones', async () => {
    const { onSubmit } = renderComponent();

    await userEvent.fill(page.getByLabelText('Track 1'), 'Room 1 renamed');
    await userEvent.click(page.getByRole('button', { name: 'Remove track: Room 2' }));
    await userEvent.fill(page.getByLabelText('New track'), 'Room 3');
    await userEvent.click(page.getByRole('button', { name: 'Add track' }));
    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        intent: 'save-tracks',
        'tracks[0].id': 'track-1',
        'tracks[0].name': 'Room 1 renamed',
        'tracks[1].name': 'Room 3',
      }),
    );
  });

  it('adds two tracks with the same name as two rows edited separately', async () => {
    const { onSubmit } = renderComponent();

    await userEvent.fill(page.getByLabelText('New track'), 'Room 3');
    await userEvent.click(page.getByRole('button', { name: 'Add track' }));
    await userEvent.fill(page.getByLabelText('New track'), 'Room 3');
    await userEvent.click(page.getByRole('button', { name: 'Add track' }));

    await userEvent.fill(page.getByLabelText('Track 4'), 'Room 4');
    await expect.element(page.getByLabelText('Track 3')).toHaveValue('Room 3');

    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        intent: 'save-tracks',
        'tracks[0].id': 'track-1',
        'tracks[0].name': 'Room 1',
        'tracks[1].id': 'track-2',
        'tracks[1].name': 'Room 2',
        'tracks[2].name': 'Room 3',
        'tracks[3].name': 'Room 4',
      }),
    );
  });

  it('removes the last remaining row', async () => {
    renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Remove track: Room 1' }));
    await userEvent.click(page.getByRole('button', { name: 'Remove track: Room 2' }));

    await expect.element(page.getByLabelText('Track 1')).not.toBeInTheDocument();
  });

  it('stays open and shows the error when the save is refused', async () => {
    const { onClose } = renderComponent({ error: 'The schedule must keep at least one track.' });

    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await expect.element(page.getByText('The schedule must keep at least one track.')).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when the save succeeds', async () => {
    const { onClose } = renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Save' }));

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('closes without submitting on cancel', async () => {
    const { onClose, onSubmit } = renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
