import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page, userEvent } from 'vitest/browser';
import { SortableList } from './sortable-list.tsx';

type Item = { id: string; name: string };

const ITEMS: Array<Item> = [
  { id: 'talk', name: 'Talk' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'lightning', name: 'Lightning' },
];

describe('SortableList component', () => {
  const renderComponent = (items: Array<Item> = ITEMS) => {
    const onReorder = vi.fn();
    const screen = page.render(
      <I18nextProvider i18n={i18nTest}>
        <SortableList
          items={items}
          getLabel={(item) => item.name}
          onReorder={onReorder}
          aria-label="Formats list"
          footer={<p>Footer at rest</p>}
        >
          {(item) => <span data-name>{item.name}</span>}
        </SortableList>
      </I18nextProvider>,
    );
    return { onReorder, screen };
  };

  const rowNames = () =>
    page
      .getByRole('list', { name: 'Formats list' })
      .getByRole('listitem')
      .elements()
      .map((row) => row.querySelector('[data-name]')?.textContent);

  it('labels each handle with the item name', async () => {
    await renderComponent();

    await expect.element(page.getByRole('button', { name: 'Move "Talk"' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Move "Workshop"' })).toBeInTheDocument();
    await expect
      .element(page.getByRole('button', { name: 'Move "Lightning"' }))
      .toHaveAccessibleDescription(/Press Space to grab the item/);
  });

  it('shows no handle when the list has a single item', async () => {
    await renderComponent([ITEMS[0]]);

    await expect.element(page.getByText('Talk')).toBeInTheDocument();
    expect(page.getByRole('button').elements()).toHaveLength(0);
  });

  it('moves an item with the keyboard and reorders once on drop', async () => {
    const { onReorder } = await renderComponent();

    const handle = page.getByRole('button', { name: 'Move "Talk"' });
    await userEvent.click(handle);
    await userEvent.keyboard(' ');
    await expect.element(page.getByRole('status')).toHaveTextContent('"Talk" grabbed, position 1 of 3.');

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('status')).toHaveTextContent('"Talk" moved to position 2 of 3.');
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('status')).toHaveTextContent('"Talk" moved to position 3 of 3.');
    expect(onReorder).not.toHaveBeenCalled();

    await userEvent.keyboard(' ');
    await expect.element(page.getByRole('status')).toHaveTextContent('"Talk" dropped at position 3 of 3.');
    expect(onReorder).toHaveBeenCalledOnce();
    expect(onReorder).toHaveBeenCalledWith('talk', 2);
    expect(rowNames()).toEqual(['Workshop', 'Lightning', 'Talk']);
    await expect.element(handle).toHaveFocus();
  });

  it('restores the order and does not reorder when the move is cancelled', async () => {
    const { onReorder } = await renderComponent();

    await userEvent.click(page.getByRole('button', { name: 'Move "Lightning"' }));
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{ArrowUp}');
    expect(rowNames()).toEqual(['Talk', 'Lightning', 'Workshop']);

    await userEvent.keyboard('{Escape}');
    await expect
      .element(page.getByRole('status'))
      .toHaveTextContent('Move cancelled, "Lightning" is back to position 3 of 3.');
    expect(rowNames()).toEqual(['Talk', 'Workshop', 'Lightning']);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('shows the shortcuts and the position in the footer while an item is grabbed', async () => {
    await renderComponent();

    await expect.element(page.getByText('Footer at rest')).toBeInTheDocument();

    await userEvent.click(page.getByRole('button', { name: 'Move "Workshop"' }));
    await userEvent.keyboard(' ');
    await expect.element(page.getByText('Position 2 of 3')).toBeInTheDocument();
    await expect.element(page.getByText('Arrows to move, Space to drop, Escape to cancel')).toBeInTheDocument();
    await expect.element(page.getByText('Footer at rest')).not.toBeInTheDocument();

    await userEvent.keyboard('{ArrowUp}');
    await expect.element(page.getByText('Position 1 of 3')).toBeInTheDocument();

    await userEvent.keyboard(' ');
    await expect.element(page.getByText('Footer at rest')).toBeInTheDocument();
    await expect.element(page.getByText('Position 1 of 3')).not.toBeInTheDocument();
  });
});
