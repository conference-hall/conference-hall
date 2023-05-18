import { StarIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Button } from './Buttons';
import { Modal } from './Modals';
import { StoryBlock } from './StoryBlock';

export const Documentation = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <>
      <StoryBlock title="Default" vertical>
        <Button onClick={() => setOpen1(true)}>Open modal</Button>
        <Modal open={open1} onClose={() => setOpen1(false)}>
          Hello world !!!
        </Modal>
      </StoryBlock>

      <StoryBlock title="With title and actions" vertical>
        <Button onClick={() => setOpen2(true)}>Open modal</Button>
        <Modal open={open2} onClose={() => setOpen2(false)}>
          <Modal.Title title="Welcome" description="To a new world" icon={StarIcon} iconColor="info" />
          Hello world !!!
          <Modal.Actions>
            <Button variant="secondary">Close</Button>
            <Button>Hello</Button>
          </Modal.Actions>
        </Modal>
      </StoryBlock>
    </>
  );
};
