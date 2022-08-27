import type { ChangeEventHandler } from 'react';
import { useState } from 'react';
import cn from 'classnames';
import { Dialog } from '@headlessui/react';
import { Button } from '../Buttons';
import { Markdown } from '../Markdown';
import { XMarkIcon } from '@heroicons/react/20/solid';

type MarkdownTextAreaProps = {
  label: string;
  description?: string;
  defaultValue?: string | null;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseStyles = 'border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500';
const errorStyles = 'border-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500';

export function MarkdownTextArea({
  id,
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

  const styles = cn('shadow-sm block w-full sm:text-sm rounded-md overflow-hidden border mt-1', {
    [baseStyles]: !error,
    [errorStyles]: !!error,
  });

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className={styles}>
          <textarea
            id={id}
            className="block w-full border-0 py-3 placeholder-gray-500 focus:ring-0 sm:text-sm"
            {...rest}
            defaultValue={defaultValue}
            onChange={handleChangeText}
            aria-describedby={`${id}-description`}
          />
          {/* Spacer element to match the height of the toolbar */}
          <div aria-hidden="true">
            <div className="py-2">
              <div className="py-px">
                <div className="h-7" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-px bottom-0 flex items-center justify-between space-x-3 border-t border-gray-200 px-2 py-2 sm:px-3">
          <p className="text-xs text-gray-500">Mardown supported.</p>
          <div className="flex-shrink-0">
            <Button type="button" variant="secondary" size="small" onClick={handleOpenPreview}>
              Preview
            </Button>
            <MardownPreviewModal markdown={markdown} isOpen={isPreviewOpen} onClose={handleClosePreview} />
          </div>
        </div>
      </div>
      <div id={`${id}-description`}>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

type MardownPreviewModalProps = {
  markdown?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

function MardownPreviewModal({ markdown, isOpen, onClose }: MardownPreviewModalProps) {
  return (
    <Dialog className="fixed inset-0 z-10 overflow-y-auto" open={isOpen} onClose={onClose}>
      <div className="block min-h-screen p-0 px-4 pt-4 pb-20 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="inline-block w-full transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl sm:my-8 sm:p-6 sm:align-middle md:max-w-5xl">
          {markdown ? <Markdown source={markdown} /> : <p>Nothing to preview.</p>}
        </div>
      </div>
    </Dialog>
  );
}
