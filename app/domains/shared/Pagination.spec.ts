import { Pagination } from './Pagination.ts';

describe('Pagination', () => {
  it('computes pagination for the first page', () => {
    const pagination = new Pagination({ page: 1, pageSize: 10, total: 100 });

    expect(pagination.page).toBe(1);
    expect(pagination.pageIndex).toBe(0);
    expect(pagination.pageCount).toBe(10);
  });

  it('computes pagination for a middle page', () => {
    const pagination = new Pagination({ page: 4, pageSize: 10, total: 100 });

    expect(pagination.page).toBe(4);
    expect(pagination.pageIndex).toBe(3);
    expect(pagination.pageCount).toBe(10);
  });

  it('computes pagination for the last page', () => {
    const pagination = new Pagination({ page: 10, pageSize: 10, total: 100 });

    expect(pagination.page).toBe(10);
    expect(pagination.pageIndex).toBe(9);
    expect(pagination.pageCount).toBe(10);
  });

  it('returns the first page when the current page is greater than total pages', () => {
    const pagination = new Pagination({ page: -1, pageSize: 10, total: 100 });

    expect(pagination.page).toBe(1);
    expect(pagination.pageIndex).toBe(0);
    expect(pagination.pageCount).toBe(10);
  });

  it('returns the last page when the current page is greater than total pages', () => {
    const pagination = new Pagination({ page: 11, pageSize: 10, total: 100 });

    expect(pagination.page).toBe(10);
    expect(pagination.pageIndex).toBe(9);
    expect(pagination.pageCount).toBe(10);
  });
});
