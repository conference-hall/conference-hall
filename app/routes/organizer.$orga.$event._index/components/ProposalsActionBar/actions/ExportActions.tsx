import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useParams, useSearchParams } from '@remix-run/react';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';
import { Menu } from '~/design-system/menus/Menu';

type Props = ButtonStylesProps;

export function ExportActions(props: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Menu trigger={ExportMenuButton} triggerClassname={getStyles(props)}>
      <Menu.ItemExternalLink
        href={`/export/proposals/json?orga=${params.orga}&event=${params.event}&${searchParams.toString()}`}
        target="_blank"
        rel="noreferrer"
        className="w-full"
      >
        As JSON
      </Menu.ItemExternalLink>
    </Menu>
  );
}

function ExportMenuButton() {
  return (
    <>
      Export...
      <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
    </>
  );
}