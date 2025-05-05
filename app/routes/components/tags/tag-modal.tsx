import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { getContrastColor, getRandomColor } from '~/libs/colors/colors.ts';
import type { Tag as TagType } from '~/types/tags.types.ts';
import { Tag } from './tag.tsx';

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
      <TagModaContent
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

function TagModaContent({ mode, initialValues, open, onClose }: TagModalContentProps) {
  const { t } = useTranslation();
  const defaultColor = initialValues?.color || getRandomColor();

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
        <Form id="save-tag" method="POST" onSubmit={onClose} className="space-y-4 lg:space-y-6">
          <div className="flex gap-2">
            <input type="hidden" name="id" value={initialValues?.id} />

            <Tooltip text={t('event-management.settings.tags.pick-a-color')} placement="bottom">
              <div className="relative h-9 w-12 group">
                <input
                  type="color"
                  name="color"
                  aria-label={t('event-management.settings.tags.pick-a-color')}
                  defaultValue={defaultColor}
                  onChange={(event) => setColor(event.target.value)}
                  className="bg-white [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch-wrapper]:p-0 h-9 w-12 cursor-pointer"
                  required
                />
                <PaintBrushIcon
                  className="size-6 absolute left-3 top-1.5 pointer-events-none"
                  style={{ color: getContrastColor(color) }}
                />
              </div>
            </Tooltip>

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
        <Button type="submit" name="intent" value="save-tag" form="save-tag" disabled={!name}>
          {mode === 'create'
            ? t('event-management.settings.tags.create-tag')
            : t('event-management.settings.tags.save-tag')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
