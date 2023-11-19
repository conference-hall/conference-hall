import { ChevronDownIcon } from '@heroicons/react/20/solid';

import type { ButtonStylesProps } from '~/design-system/Buttons.tsx';
import { button } from '~/design-system/Buttons.tsx';
import { Menu } from '~/design-system/menus/Menu.tsx';

type Props = { selection: Array<string> } & ButtonStylesProps;

function TriggerButton() {
  return (
    <>
      Mark as...
      <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
    </>
  );
}

export function ChangeStatusAction({ selection, ...rest }: Props) {
  return (
    <Menu trigger={TriggerButton} triggerClassname={button(rest)}>
      <Menu.ItemForm method="POST">
        <input type="hidden" name="status" value="ACCEPTED" />
        {selection.map((id) => (
          <input key={id} type="hidden" name="selection" value={id} />
        ))}
        <button type="submit" className="w-full text-left">
          Accepted proposal(s)
        </button>
      </Menu.ItemForm>
      <Menu.ItemForm method="POST">
        <input type="hidden" name="status" value="REJECTED" />
        {selection.map((id) => (
          <input key={id} type="hidden" name="selection" value={id} />
        ))}
        <button type="submit" className="w-full text-left">
          Rejected proposal(s)
        </button>
      </Menu.ItemForm>
    </Menu>
  );
}