import { Text } from '~/design-system/Typography';
import Select from '~/design-system/forms/Select';
import { useProposalsSearchFilter } from '../../useProposalsSearchFilter';

type Props = {
  defaultFormatValue?: string;
  defaultCategorytValue?: string;
  formats: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
};

export function TracksFilter({ defaultFormatValue = '', defaultCategorytValue = '', formats, categories }: Props) {
  const { addFilterFor } = useProposalsSearchFilter();

  const hasFormats = formats.length > 0;
  const hasCategories = categories.length > 0;

  if (!hasFormats && !hasCategories) return null;

  return (
    <div className="space-y-2 p-4">
      <Text size="s" variant="secondary" strong>
        More filters
      </Text>

      {hasFormats && (
        <Select
          name="formats"
          label="Formats"
          onChange={addFilterFor}
          options={[{ id: '', label: 'All formats' }, ...formats.map(({ id, name }) => ({ id, label: name }))]}
          value={defaultFormatValue}
          srOnly
        />
      )}

      {hasCategories && (
        <Select
          name="categories"
          label="Categories"
          onChange={addFilterFor}
          options={[{ id: '', label: 'All categories' }, ...categories.map(({ id, name }) => ({ id, label: name }))]}
          value={defaultCategorytValue}
          srOnly
        />
      )}
    </div>
  );
}
