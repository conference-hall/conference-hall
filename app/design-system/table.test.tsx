import { page } from 'vitest/browser';
import { Table, TableBuilder } from './table.tsx';

describe('Table component', () => {
  it('renders semantic table structure and forwards classes', async () => {
    const screen = await page.render(
      <Table className="custom-table" containerClassName="custom-container" aria-label="Example table">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Column</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const wrapper = screen.container.firstElementChild;
    const table = screen.getByRole('table', { name: 'Example table' });

    expect(wrapper?.className).toContain('overflow-x-auto');
    expect(wrapper?.className).toContain('custom-container');
    await expect.element(table).toBeInTheDocument();
    await expect.element(table).toHaveClass(/custom-table/);
    await expect.element(screen.getByRole('columnheader', { name: 'Column' })).toBeInTheDocument();
    await expect.element(screen.getByRole('cell', { name: 'Value' })).toBeInTheDocument();
  });
});

describe('TableBuilder component', () => {
  it('renders headers and rows from configuration', async () => {
    const screen = await page.render(
      <TableBuilder
        headers={['Code', 'Description']}
        rows={[
          {
            key: '200-ok',
            cells: [{ value: '200', className: 'font-mono' }, { value: 'Success' }],
          },
          {
            key: '404-missing',
            cells: [{ value: '404' }, { value: <span>Missing resource</span>, className: 'text-gray-600' }],
          },
        ]}
      />,
    );

    await expect.element(screen.getByRole('columnheader', { name: 'Code' })).toBeInTheDocument();
    await expect.element(screen.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument();
    await expect.element(screen.getByRole('cell', { name: '200' })).toHaveClass(/font-mono/);
    await expect.element(screen.getByRole('cell', { name: 'Success' })).toBeInTheDocument();
    await expect.element(screen.getByRole('cell', { name: '404' })).toBeInTheDocument();
    await expect.element(screen.getByRole('cell', { name: 'Missing resource' })).toHaveClass(/text-gray-600/);
  });
});
