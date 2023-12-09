import { Text } from '~/design-system/Typography';

type SelectAllBannerProps = { total: number; pageSelected: boolean };

export function SelectAllBanner({ total, pageSelected }: SelectAllBannerProps) {
  if (!pageSelected) return null;

  return (
    <div className="bg-blue-50 border-b border-gray-200 px-4 py-3 sm:px-6 text-center">
      <Text variant="secondary" size="s">
        The <strong>25</strong> proposals on this page are selected.{' '}
        <button className="underline hover:font-semibold">Select the {total} proposals in all pages.</button>
      </Text>
    </div>
  );
}
