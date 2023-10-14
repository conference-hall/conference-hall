import { useState } from 'react';

import { Button } from './Buttons.tsx';
import { Modal } from './Modals.tsx';
import { StoryBlock } from './StoryBlock.tsx';

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
          <Modal.Title title="Welcome" description="To a new world" />
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
