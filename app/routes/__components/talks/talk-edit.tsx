import { PencilSquareIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons';
import SlideOver from '~/design-system/SlideOver';

import { TalkForm } from './talk-forms/talk-form';

type TalkEditProps = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    languages: string[];
    level: string | null;
    formats?: Array<{ id: string }>;
    categories?: Array<{ id: string }>;
  } | null;
  formats?: Array<{ id: string; name: string; description: string | null }>;
  formatsRequired?: boolean;
  categories?: Array<{ id: string; name: string; description: string | null }>;
  categoriesRequired?: boolean;
  errors?: Record<string, string | string[]> | null;
};

export function TalkEditButton(props: TalkEditProps) {
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <Button iconLeft={PencilSquareIcon} variant="secondary" onClick={onOpen}>
        Edit
      </Button>
      <TalkEditDrawer {...props} open={open} onClose={onClose} />
    </>
  );
}

type TalkEditDrawerProps = TalkEditProps & {
  open: boolean;
  onClose: () => void;
};

function TalkEditDrawer({
  initialValues,
  formats,
  formatsRequired,
  categories,
  categoriesRequired,
  errors,
  open,
  onClose,
}: TalkEditDrawerProps) {
  return (
    <SlideOver open={open} onClose={onClose} size="l">
      <SlideOver.Content title="Edit talk" onClose={onClose}>
        <TalkForm
          id="edit-talk-form"
          initialValues={initialValues}
          formats={formats}
          categories={categories}
          formatsRequired={formatsRequired}
          categoriesRequired={categoriesRequired}
          errors={errors}
        />
      </SlideOver.Content>
      <SlideOver.Actions>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" form="edit-talk-form" name="intent" value="edit-talk">
          Save
        </Button>
      </SlideOver.Actions>
    </SlideOver>
  );
}
