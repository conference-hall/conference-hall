import { ChevronDownIcon } from '@heroicons/react/20/solid';

import type { ButtonStylesProps } from '~/design-system/Buttons';
import { button } from '~/design-system/Buttons';
import { Menu } from '~/design-system/menus/Menu';

import { useProposalsSearchFilter } from '../../useProposalsSearchFilter';

type Props = ButtonStylesProps;

export function SortActions(props: Props) {
  const { filterPathFor } = useProposalsSearchFilter();

  return (
    <Menu trigger={SortByButton} triggerClassname={button(props)}>
      <Menu.ItemLink to={filterPathFor('sort', 'newest')}>Newest</Menu.ItemLink>
      <Menu.ItemLink to={filterPathFor('sort', 'oldest')}>Oldest</Menu.ItemLink>
    </Menu>
  );
}

function SortByButton() {
  return (
    <>
      Sort by...
      <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
    </>
  );
}
