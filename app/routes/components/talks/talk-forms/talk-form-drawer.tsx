import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { Button } from '~/design-system/buttons.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

import { TalkForm } from './talk-form.tsx';

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
  event?: {
    formats?: Array<{ id: string; name: string; description: string | null }>;
    formatsRequired?: boolean;
    formatsAllowMultiple?: boolean;
    categories?: Array<{ id: string; name: string; description: string | null }>;
    categoriesRequired?: boolean;
    categoriesAllowMultiple?: boolean;
  };
  errors: SubmissionErrors;
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
  onClose: VoidFunction;
};

function TalkEditDrawer({ initialValues, event, errors, open, onClose }: TalkEditDrawerProps) {
  return (
    <SlideOver open={open} onClose={onClose} size="xl">
      <SlideOver.Content onClose={onClose} className="sm:px-6">
        <TalkForm
          id="edit-talk-form"
          initialValues={initialValues}
          formats={event?.formats}
          categories={event?.categories}
          formatsRequired={event?.formatsRequired}
          formatsAllowMultiple={event?.formatsAllowMultiple}
          categoriesRequired={event?.categoriesRequired}
          categoriesAllowMultiple={event?.categoriesAllowMultiple}
          errors={errors}
          onSubmit={onClose}
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
