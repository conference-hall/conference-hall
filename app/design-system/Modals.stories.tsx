import { useState } from 'react';

import { Button } from './Buttons.tsx';
import { Modal } from './Modals.tsx';
import { StoryBlock } from './StoryBlock.tsx';
import { Text } from './Typography.tsx';

export const Documentation = () => {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <>
      <StoryBlock title="Default" vertical>
        <Button onClick={() => setOpen1(true)}>Open modal</Button>
        <Modal open={open1} onClose={() => setOpen1(false)}>
          <Text>Hello world !!!</Text>
        </Modal>
      </StoryBlock>

      <StoryBlock title="With title and actions" vertical>
        <Button onClick={() => setOpen2(true)}>Open modal</Button>
        <Modal open={open2} onClose={() => setOpen2(false)}>
          <Modal.Title>Payment successful</Modal.Title>
          <Modal.Subtitle>You're payment was successful</Modal.Subtitle>
          <Modal.Content>
            <Text>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo pariatur iste
              dolorem animi vitae error totam. At sapiente aliquam accusamus facere veritatis.
            </Text>
          </Modal.Content>
          <Modal.Actions>
            <Button variant="secondary">Cancel</Button>
            <Button>Deactivate</Button>
          </Modal.Actions>
        </Modal>
      </StoryBlock>
    </>
  );
};
