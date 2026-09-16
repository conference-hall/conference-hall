import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { ColorInput } from '~/design-system/forms/color-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { getRandomColor } from '~/shared/colors/colors.ts';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';

type TagModalProps = {
  mode: 'create' | 'edit';
  initialValues?: TagType;
  children: (props: { onOpen: VoidFunction }) => ReactNode;
};

export function TagModal({ mode, initialValues, children }: TagModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children({ onOpen: () => setOpen(true) })}
      <TagModalContent
        key={String(open)}
        mode={mode}
        initialValues={initialValues}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

type TagModalContentProps = {
  mode: 'create' | 'edit';
  initialValues?: TagType;
  open: boolean;
  onClose: VoidFunction;
};

function TagModalContent({ mode, initialValues, open, onClose }: TagModalContentProps) {
  const { t } = useTranslation();
  const defaultColor = initialValues?.color || getRandomColor();

  const formId = useId();
  const [name, setName] = useState(initialValues?.name);
  const [color, setColor] = useState(defaultColor);

  const TagPreview = (
    <Tag
      tag={{ id: 'new', color, name: name || t('event-management.settings.tags.modal.preview') }}
      isSearchLink={false}
    />
  );

  return (
    <Modal title={TagPreview} size="m" open={open} onClose={onClose}>
      <Modal.Content>
        <Form id={formId} method="POST" onSubmit={onClose} className="space-y-4 lg:space-y-6">
          <div className="flex gap-2">
            <input type="hidden" name="id" value={initialValues?.id} />

            <ColorInput
              name="color"
              label={t('event-management.settings.tags.pick-a-color')}
              value={color}
              onChange={(value) => value && setColor(value)}
            />

            <Input
              name="name"
              aria-label={t('event-management.settings.tags.tag-name')}
              placeholder={t('event-management.settings.tags.tag-name')}
              defaultValue={initialValues?.name}
              onChange={(event) => setName(event.target.value?.trim())}
              className="w-full"
              required
            />
          </div>
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="save-tag" form={formId} disabled={!name}>
          {mode === 'create'
            ? t('event-management.settings.tags.create-tag')
            : t('event-management.settings.tags.save-tag')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
