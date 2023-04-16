import { ChevronDownIcon } from '@heroicons/react/20/solid';
import type { ButtonStylesProps } from '~/design-system/Buttons';
import { getStyles } from '~/design-system/Buttons';
import { Menu } from '~/design-system/menus/Menu';

type Props = { selection: Array<string> } & ButtonStylesProps;

function TriggerButton() {
  return (
    <>
      Mark as...
      <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
    </>
  );
}

export function UpdateStatusMenu({ selection, ...rest }: Props) {
  const disabled = selection.length === 0;
  const styles = getStyles({ disabled, ...rest });

  return (
    <Menu trigger={TriggerButton} triggerClassname={styles}>
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
