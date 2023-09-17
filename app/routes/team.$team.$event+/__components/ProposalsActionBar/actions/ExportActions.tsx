import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useParams, useSearchParams } from '@remix-run/react';

import type { ButtonStylesProps } from '~/design-system/Buttons.tsx';
import { button } from '~/design-system/Buttons.tsx';
import { Menu } from '~/design-system/menus/Menu.tsx';

type Props = ButtonStylesProps;

export function ExportActions(props: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  return (
    <Menu trigger={ExportMenuButton} triggerClassname={button(props)}>
      <Menu.ItemExternalLink
        href={`/team/${params.team}/${params.event}/export/json?${searchParams.toString()}`}
        target="_blank"
        rel="noreferrer"
      >
        As JSON
      </Menu.ItemExternalLink>
      <Menu.ItemExternalLink
        href={`/team/${params.team}/${params.event}/export/cards?${searchParams.toString()}`}
        target="_blank"
        rel="noreferrer"
      >
        As printable cards
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
