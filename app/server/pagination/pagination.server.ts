export function getPagination(page: number, resultsCount: number, resultsByPage: number) {
  const totalPages = Math.ceil(resultsCount / resultsByPage);
  const pageIndex = computePageIndex(page, totalPages);
  const currentPage = pageIndex + 1;
  return { currentPage, totalPages, pageIndex };
}

function computePageIndex(current: number, total: number) {
  if (total === 0) return 0;
  if (current <= 0) return 0;
  if (current > total) return total - 1;
  return current - 1;
}
