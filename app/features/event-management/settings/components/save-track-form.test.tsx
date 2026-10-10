import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { EditTrackButton, NewTrackButton } from './save-track-form.tsx';

describe('SaveTrackForm component', () => {
  const renderComponent = (children: React.ReactNode) => {
    const RouteStub = createRoutesStub([
      { path: '/', Component: () => <I18nextProvider i18n={i18nTest}>{children}</I18nextProvider> },
    ]);
    return page.render(<RouteStub />);
  };

  it.each(['formats', 'categories'] as const)('starts a new %s track on gray', async (type) => {
    await renderComponent(<NewTrackButton type={type} />);

    await userEvent.click(page.getByRole('button', { name: /New/ }));

    await expect.element(page.getByRole('button', { name: /^Color/ })).toHaveTextContent('Gray');
  });

  it('does not offer the "No color" option', async () => {
    await renderComponent(<NewTrackButton type="categories" />);

    await userEvent.click(page.getByRole('button', { name: /New/ }));
    await userEvent.click(page.getByRole('button', { name: /^Color/ }));

    await expect.element(page.getByRole('menuitem', { name: 'Red', exact: true })).toBeInTheDocument();
    await expect.element(page.getByRole('menuitem', { name: 'No color' })).not.toBeInTheDocument();
  });

  it('keeps the duration input next to the color for formats', async () => {
    await renderComponent(
      <EditTrackButton
        type="formats"
        initialValues={{ id: '1', name: 'Talk', description: 'A talk', durationInMinutes: 45, color: '#ff5f5f' }}
      />,
    );

    await userEvent.click(page.getByRole('button', { name: 'Edit' }));

    await expect.element(page.getByLabelText('Duration (minutes)')).toHaveValue(45);
    await expect.element(page.getByRole('button', { name: /^Color/ })).toHaveTextContent('Red');
  });
});
