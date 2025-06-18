import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <Button iconLeft={PencilSquareIcon} variant="secondary" onClick={onOpen}>
        {t('common.edit')}
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
  const { t } = useTranslation();
  const formId = useId();

  return (
    <SlideOver title={initialValues?.title} open={open} onClose={onClose} size="xl">
      <SlideOver.Content className="sm:px-6">
        <TalkForm
          id={formId}
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
          {t('common.cancel')}
        </Button>
        <Button type="submit" form={formId} name="intent" value="edit-talk">
          {t('common.save')}
        </Button>
      </SlideOver.Actions>
    </SlideOver>
  );
}
