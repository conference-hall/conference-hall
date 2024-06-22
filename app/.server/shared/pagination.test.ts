import { Pagination, parseUrlPage } from './pagination.cap.ts';

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

describe('parseUrlPage', () => {
  it('returns valid page', async () => {
    const url = 'http://localhost/?page=1';
    const result = parseUrlPage(url);
    expect(result).toBe(1);
  });

  it('returns page 1 when page number invalid', async () => {
    const url = 'http://localhost/?query=XXX';
    const result = parseUrlPage(url);
    expect(result).toBe(1);
  });

  it('returns page 1 when no query params', async () => {
    const url = 'http://localhost';
    const result = parseUrlPage(url);
    expect(result).toBe(1);
  });
});
