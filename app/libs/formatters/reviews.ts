// TODO Add tests
export function formatReviewNote(note?: number | null) {
  if (note === null || note === undefined) return null;

  return (Math.round(note * 10) / 10)
    .toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    .replace(/\.0$/, '');
}
