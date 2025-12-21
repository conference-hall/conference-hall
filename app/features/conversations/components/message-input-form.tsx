import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
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
  onOptimisticSave?: (data: { id?: string; content: string }) => void;
  onClose?: VoidFunction;
};

export function MessageInputForm({
  intent,
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
  const fetcherKey = message?.id ? `${intent}:${message.id}` : `${intent}:new`;
  const fetcher = useFetcher({ key: fetcherKey });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = Object.fromEntries(formData);
    onOptimisticSave?.({ id: message?.id, content: String(data.message) });
    onClose?.();

    fetcher.submit(formData, { method: 'POST', preventScrollReset: true, flushSync: true });
  };

  const isLoading = fetcher.state === 'submitting';

  return (
    <Form className="relative w-full" key={fetcher.state} navigate={false} onSubmit={handleSubmit}>
      <Label htmlFor={inputId} className="sr-only">
        {inputLabel}
      </Label>

      <input type="hidden" name="intent" value={intent} />
      {message ? <input type="hidden" name="id" value={message.id} /> : null}

      <div className="overflow-hidden rounded-lg bg-white pb-12 shadow-xs ring-1 ring-gray-200 ring-inset focus-within:ring-2 focus-within:ring-indigo-600">
        <textarea
          id={inputId}
          name="message"
          required
          defaultValue={message?.content}
          aria-label={inputLabel}
          placeholder={placeholder}
          autoComplete="off"
          style={{ fieldSizing: 'content', maxHeight: '400px' }}
          // biome-ignore lint/a11y/noAutofocus: need autoFocus on message when opening
          autoFocus={autoFocus}
          className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 text-sm leading-6 placeholder:text-gray-400 focus:ring-0"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-end gap-x-2 pr-2 pb-2 pl-3">
        {onClose ? (
          <Button type="button" variant="secondary" onClick={onClose} size="sm">
            {t('common.cancel')}
          </Button>
        ) : null}

        <Button
          type="submit"
          variant={onClose ? 'primary' : 'secondary'}
          size={onClose ? 'sm' : 'base'}
          disabled={isLoading}
        >
          {buttonLabel || t('common.save')}
        </Button>
      </div>
    </Form>
  );
}
