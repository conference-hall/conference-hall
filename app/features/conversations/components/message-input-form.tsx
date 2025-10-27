import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Label } from '~/design-system/typography.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = {
  intent: string;
  inputLabel: string;
  placeholder?: string;
  buttonLabel?: string;
  message?: Message;
  autoFocus?: boolean;
  onClose?: VoidFunction;
};

export function MessageInputForm({
  intent,
  placeholder,
  inputLabel,
  buttonLabel,
  message,
  autoFocus = false,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const inputId = useId();
  const fetcherKey = message?.id ? `${intent}:${message.id}` : `${intent}:new`;
  const fetcher = useFetcher({ key: fetcherKey });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <fetcher.Form
      ref={formRef}
      method="POST"
      className="relative w-full"
      key={fetcher.state}
      onSubmit={onClose}
      preventScrollReset={true}
    >
      <Label htmlFor={inputId} className="sr-only">
        {inputLabel}
      </Label>

      <input type="hidden" name="intent" value={intent} />
      {message ? <input type="hidden" name="id" value={message.id} /> : null}

      <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600">
        <textarea
          id={inputId}
          name="message"
          required
          defaultValue={message?.content}
          aria-label={inputLabel}
          placeholder={placeholder}
          autoComplete="off"
          // @ts-expect-error fieldSizing not supported yet
          style={{ fieldSizing: 'content', maxHeight: '400px' }}
          // biome-ignore lint/a11y/noAutofocus: need autoFocus on message when opening
          autoFocus={autoFocus}
          className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm leading-6"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-x-2 pb-2 pl-3 pr-2">
        {onClose ? (
          <Button type="button" variant="secondary" onClick={onClose} size="sm">
            {t('common.cancel')}
          </Button>
        ) : null}

        <Button type="submit" variant={onClose ? 'primary' : 'secondary'} size={onClose ? 'sm' : 'base'}>
          {buttonLabel || t('common.save')}
        </Button>
      </div>
    </fetcher.Form>
  );
}
