import { cx } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
  containerClassName?: string;
};

export type TableBuilderCell = {
  value: ReactNode;
  className?: string;
};

export type TableBuilderRow = {
  key: string;
  cells: Array<TableBuilderCell>;
};

type TableBuilderProps = {
  headers: Array<string>;
  rows: Array<TableBuilderRow>;
  tableClassName?: string;
  containerClassName?: string;
};

export function Table({ children, className, containerClassName, ...rest }: TableProps) {
  return (
    <div className={cx('overflow-x-auto rounded-md ring-1 ring-gray-200', containerClassName)}>
      <table className={cx('w-full text-left text-xs', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

function Head({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cx('bg-gray-50 text-gray-500', className)} {...rest}>
      {children}
    </thead>
  );
}

Table.Head = Head;

function Body({ children, className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cx('divide-y divide-gray-100', className)} {...rest}>
      {children}
    </tbody>
  );
}

Table.Body = Body;

function Row({ children, className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={className} {...rest}>
      {children}
    </tr>
  );
}

Table.Row = Row;

function HeaderCell({ children, className, scope = 'col', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cx('px-3 py-2 font-medium', className)} scope={scope} {...rest}>
      {children}
    </th>
  );
}

Table.HeaderCell = HeaderCell;

function Cell({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cx('px-3 py-2 align-top', className)} {...rest}>
      {children}
    </td>
  );
}

Table.Cell = Cell;

export function TableBuilder({ headers, rows, tableClassName, containerClassName }: TableBuilderProps) {
  return (
    <Table className={tableClassName} containerClassName={containerClassName}>
      <Table.Head>
        <Table.Row>
          {headers.map((header) => (
            <Table.HeaderCell key={header}>{header}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.key}>
            {row.cells.map((cell, index) => (
              <Table.Cell key={`${row.key}-${index}`} className={cell.className}>
                {cell.value}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
