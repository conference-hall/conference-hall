import { cx } from 'class-variance-authority';
import type { ChangeEventHandler } from 'react';
import { useState } from 'react';

import type { SubmissionError } from '~/types/errors.types.ts';

import { Button } from '../buttons.tsx';
import { Modal } from '../dialogs/modals.tsx';
import { Markdown } from '../markdown.tsx';
import { Label } from '../typography.tsx';

type MarkdownTextAreaProps = {
  label: string;
  description?: string;
  defaultValue?: string | null;
  error?: SubmissionError;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500';
const errorStyles = 'border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';

export function MarkdownTextArea({
  name,
  label,
  description,
  className,
  error,
  defaultValue,
  ...rest
}: MarkdownTextAreaProps) {
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [markdown, setMarkdown] = useState(defaultValue);

  const handleClosePreview = () => setPreviewOpen(false);
  const handleOpenPreview = () => setPreviewOpen(true);
  const handleChangeText: ChangeEventHandler<HTMLTextAreaElement> = (e) => setMarkdown(e.target.value);

  const styles = cx('shadow-sm block w-full text-gray-900 text-sm rounded-md overflow-hidden border mt-1', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      <Label htmlFor={name} mb={1}>
        {label}
      </Label>
      <div className="relative">
        <div className={styles}>
          <textarea
            id={name}
            name={name}
            className="block w-full border-0 py-3 placeholder-gray-500 focus:ring-0 text-sm"
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
        <div className="absolute inset-x-px bottom-0 flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
          <p className="text-xs text-gray-500">Mardown supported.</p>
          <div className="flex-shrink-0">
            <Button type="button" variant="secondary" size="s" onClick={handleOpenPreview}>
              Preview
            </Button>
            <MardownPreviewModal
              label={label}
              markdown={markdown}
              isOpen={isPreviewOpen}
              onClose={handleClosePreview}
            />
          </div>
        </div>
      </div>
      <div id={`${name}-describe`}>
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
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
  return (
    <Modal title={label} size="full" open={isOpen} onClose={onClose}>
      <Modal.Content className="space-y-4">
        {markdown ? <Markdown>{markdown}</Markdown> : <p>Nothing to preview.</p>}
      </Modal.Content>
    </Modal>
  );
}
