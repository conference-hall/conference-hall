import { Text } from '~/design-system/Typography';

type SelectAllBannerProps = {
  total: number;
  totalSelected: number;
  isCurrentPageSelected: boolean;
  isAllPagesSelected: boolean;
  toggleAllPages: () => void;
};

export function SelectAllBanner({
  total,
  totalSelected,
  isCurrentPageSelected,
  isAllPagesSelected,
  toggleAllPages,
}: SelectAllBannerProps) {
  if (isAllPagesSelected) {
    return (
      <div className="bg-blue-50 border-b border-gray-200 px-4 py-3 sm:px-6 text-center">
        <Text variant="secondary" size="s">
          The <strong>{total} proposals on all pages</strong> are selected.{' '}
          <button className="underline hover:font-semibold" onClick={toggleAllPages}>
            Cancel selection
          </button>
        </Text>
      </div>
    );
  }

  if (!isCurrentPageSelected) return null;

  return (
    <div className="bg-blue-50 border-b border-gray-200 px-4 py-3 sm:px-6 text-center">
      <Text variant="secondary" size="s">
        The <strong>{totalSelected}</strong> proposals on this page are selected.{' '}
        <button className="underline hover:font-semibold" onClick={toggleAllPages}>
          Select the {total} proposals in all pages
        </button>
      </Text>
    </div>
  );
}
