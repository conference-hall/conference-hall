import { useRef } from 'react';
import { Form, useNavigation } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Label } from '~/design-system/typography.tsx';

type Props = {
  name: string;
  intent: string;
  inputLabel: string;
  buttonLabel: string;
  placeholder: string;
  autoFocus?: boolean;
};

export function MessageInputForm({ name, intent, inputLabel, buttonLabel, placeholder, autoFocus = false }: Props) {
  const navigation = useNavigation();
  const isAdding = navigation.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form ref={formRef} method="POST" className="relative w-full" key={isAdding ? 'submitting' : 'idle'}>
      <Label htmlFor={name} className="sr-only">
        {inputLabel}
      </Label>

      <input type="hidden" name="intent" value={intent} />

      <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-xs ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-indigo-600">
        <textarea
          id={name}
          name={name}
          rows={2}
          required
          defaultValue=""
          aria-label={inputLabel}
          placeholder={placeholder}
          autoComplete="off"
          // biome-ignore lint/a11y/noAutofocus: need autoFocus on message when opening
          autoFocus={autoFocus}
          className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm leading-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
        <Button type="submit" variant="secondary" size="m">
          {buttonLabel}
        </Button>
      </div>
    </Form>
  );
}
