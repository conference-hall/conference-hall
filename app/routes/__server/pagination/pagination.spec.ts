import { getPagination } from './pagination.server.ts';

describe('#getPagination', () => {
  it('computes pagination for the first page', () => {
    const pagination = getPagination(1, 100, 10);

    expect(pagination.currentPage).toBe(1);
    expect(pagination.pageIndex).toBe(0);
    expect(pagination.totalPages).toBe(10);
  });

  it('computes pagination for a middle page', () => {
    const pagination = getPagination(4, 100, 10);

    expect(pagination.currentPage).toBe(4);
    expect(pagination.pageIndex).toBe(3);
    expect(pagination.totalPages).toBe(10);
  });

  it('computes pagination for the last page', () => {
    const pagination = getPagination(10, 100, 10);

    expect(pagination.currentPage).toBe(10);
    expect(pagination.pageIndex).toBe(9);
    expect(pagination.totalPages).toBe(10);
  });

  it('returns the first page when the current page is greater than total pages', () => {
    const pagination = getPagination(-1, 100, 10);

    expect(pagination.currentPage).toBe(1);
    expect(pagination.pageIndex).toBe(0);
    expect(pagination.totalPages).toBe(10);
  });

  it('returns the last page when the current page is greater than total pages', () => {
    const pagination = getPagination(11, 100, 10);

    expect(pagination.currentPage).toBe(10);
    expect(pagination.pageIndex).toBe(9);
    expect(pagination.totalPages).toBe(10);
  });
});
