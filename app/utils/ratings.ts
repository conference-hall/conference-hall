export function formatRating(rating?: number | null) {
  if (rating === null || rating === undefined) return '-';

  return (Math.round(rating * 10) / 10)
    .toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    .replace(/\.0$/, '');
}
