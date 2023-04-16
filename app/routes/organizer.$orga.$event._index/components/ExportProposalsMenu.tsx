import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useParams, useSearchParams } from '@remix-run/react';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';
import { Menu } from '~/design-system/menus/Menu';

type Props = { selection: Array<string>; total: number } & ButtonStylesProps;

export function ExportProposalsStatus({ selection, total, ...rest }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Menu trigger={ExportMenuButton} triggerClassname={getStyles(rest)}>
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
      <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
    </>
  );
}
