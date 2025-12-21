import { cx } from 'class-variance-authority';
import type { ChangeEventHandler } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import { Button } from '../button.tsx';
import { Modal } from '../dialogs/modals.tsx';
import { Markdown } from '../markdown.tsx';
import { Label } from '../typography.tsx';

type MarkdownTextAreaProps = {
  label: string;
  description?: string;
  defaultValue?: string | null;
  error?: SubmissionError;
  preview?: boolean;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500';
const errorStyles = 'border-red-300 focus:outline-hidden focus:ring-red-500 focus:border-red-500';

export function MarkdownTextArea({
  name,
  label,
  description,
  className,
  error,
  defaultValue,
  preview = true,
  rows,
  ...rest
}: MarkdownTextAreaProps) {
  const { t } = useTranslation();
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [markdown, setMarkdown] = useState(defaultValue);
  const textareaId = useId();

  const handleClosePreview = () => setPreviewOpen(false);
  const handleOpenPreview = () => setPreviewOpen(true);
  const handleChangeText: ChangeEventHandler<HTMLTextAreaElement> = (e) => setMarkdown(e.target.value);

  const styles = cx('mt-1 block w-full overflow-hidden rounded-md border text-gray-900 text-sm', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div>
      <Label htmlFor={textareaId} mb={1}>
        {label}
      </Label>
      <div className="relative">
        <div className={styles}>
          <textarea
            id={textareaId}
            name={name}
            rows={rows}
            className={cx('block w-full border-0 py-3 text-sm placeholder-gray-500 focus:ring-0', className)}
            {...rest}
            defaultValue={defaultValue}
            onChange={handleChangeText}
            aria-describedby={`${name}-describe`}
          />
          {/* Spacer element to match the height of the toolbar */}
          <div aria-hidden="true">
            <div className="py-2">
              <div className="h-7" />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-px bottom-0 flex h-11 items-center justify-between space-x-3 border-gray-200 border-t px-2 py-2 sm:px-3">
          <p className="text-gray-500 text-xs">{t('common.markdown-supported')}</p>
          {preview ? (
            <div className="shrink-0">
              <Button type="button" variant="secondary" size="sm" onClick={handleOpenPreview}>
                {t('common.preview')}
              </Button>
              <MardownPreviewModal
                label={label}
                markdown={markdown}
                isOpen={isPreviewOpen}
                onClose={handleClosePreview}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div id={`${name}-describe`}>
        {description && <p className="mt-2 text-gray-500 text-sm">{description}</p>}
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}

type MardownPreviewModalProps = {
  label: string;
  markdown?: string | null;
  isOpen: boolean;
  onClose: VoidFunction;
};

function MardownPreviewModal({ label, markdown, isOpen, onClose }: MardownPreviewModalProps) {
  const { t } = useTranslation();
  return (
    <Modal title={label} size="full" open={isOpen} onClose={onClose}>
      <Modal.Content className="space-y-4">
        {markdown ? <Markdown>{markdown}</Markdown> : <p>{t('common.no-preview')}</p>}
      </Modal.Content>
    </Modal>
  );
}
