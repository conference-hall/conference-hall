import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys';
import { cx } from 'class-variance-authority';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Label, Subtitle } from '~/design-system/typography.tsx';
import { MESSAGE_MAX_LENGTH, type Message } from '~/shared/types/conversation.types.ts';

type Props = {
  channel: string;
  inputLabel: string;
  placeholder?: string;
  buttonLabel?: string;
  message?: Message;
  autoFocus?: boolean;
  onOptimisticSave?: (data: { id?: string; content: string }) => void;
  onClose?: VoidFunction;
};

export function MessageInputForm({
  channel,
  inputLabel,
  onOptimisticSave,
  placeholder,
  buttonLabel,
  message,
  autoFocus = false,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const inputId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fetcherKey = message?.id ? `save-message:${message.id}` : 'save-message:new';
  const fetcher = useFetcher({ key: fetcherKey });
  const [charCount, setCharCount] = useState(message?.content?.length ?? 0);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = Object.fromEntries(formData);
    onOptimisticSave?.({ id: message?.id, content: String(data.message) });
    onClose?.();

    await fetcher.submit(formData, { method: 'POST', preventScrollReset: true, flushSync: true });
    formRef.current?.reset();
    setCharCount(message?.content?.length ?? 0);
  };

  const isLoading = fetcher.state === 'submitting';

  useHotkey('Mod+Enter', () => formRef.current?.requestSubmit(), { target: textareaRef });
  useHotkey('Escape', () => onClose?.(), { target: textareaRef, enabled: !!onClose });

  return (
    <Form ref={formRef} className="relative w-full" navigate={false} onSubmit={handleSubmit}>
      <Label htmlFor={inputId} className="sr-only">
        {inputLabel}
      </Label>
      <input type="hidden" name="intent" value="save-message" />
      <input type="hidden" name="channel" value={channel} />
      {message ? <input type="hidden" name="id" value={message.id} /> : null}
      <div className="cursor-text overflow-hidden rounded-lg bg-white pb-12 shadow-xs ring-1 ring-gray-200 ring-inset focus-within:ring-2 focus-within:ring-indigo-600">
        <textarea
          ref={textareaRef}
          id={inputId}
          name="message"
          required
          maxLength={MESSAGE_MAX_LENGTH}
          defaultValue={message?.content}
          onChange={(event) => setCharCount(event.target.value.length)}
          aria-label={inputLabel}
          placeholder={placeholder}
          autoComplete="off"
          style={{ fieldSizing: 'content', maxHeight: '400px' }}
          autoFocus={autoFocus}
          className="block w-full resize-none border-0 bg-transparent py-1.5 text-sm leading-6 text-gray-900 placeholder:text-gray-400 focus:ring-0"
        />
      </div>

      {/*oxlint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        className="absolute inset-x-0 bottom-0 flex cursor-text flex-row-reverse gap-x-2 pr-2 pb-2 pl-3"
        onClick={(e) => {
          if (e.target === e.currentTarget) textareaRef.current?.focus();
        }}
      >
        <Button
          type="submit"
          variant={onClose ? 'primary' : 'secondary'}
          size={onClose ? 'sm' : 'base'}
          disabled={isLoading}
        >
          {buttonLabel || t('common.save')}
          <kbd
            className={cx('ml-2 hidden font-sans font-normal sm:inline', {
              'text-white': Boolean(onClose),
              'text-gray-500': !onClose,
            })}
          >
            {formatForDisplay('Mod+Enter')}
          </kbd>
        </Button>

        {onClose ? (
          <Button type="button" variant="secondary" onClick={onClose} size="sm">
            {t('common.cancel')}
          </Button>
        ) : null}

        <div className="mr-auto self-end">
          <Subtitle size="xs" variant={charCount >= MESSAGE_MAX_LENGTH ? 'error' : 'secondary'}>
            {charCount} / {MESSAGE_MAX_LENGTH}
          </Subtitle>
        </div>
      </div>
    </Form>
  );
}
