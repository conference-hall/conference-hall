import c from 'classnames';
import { Avatar } from '~/design-system/Avatar';
import { Text } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { useFetcher, useLocation } from '@remix-run/react';
import { useEffect, useRef } from 'react';

type Message = {
  id: string;
  name: string | null;
  photoURL: string | null;
  message: string;
};

type Props = {
  messages: Array<Message>;
  className?: string;
};

export function OrganizerPanel({ messages, className }: Props) {
  return (
    <section className={c('relative flex min-h-full flex-col', className)}>
      <OrganizerComments messages={messages} />
    </section>
  );
}

function OrganizerComments({ messages }: { messages: Array<Message> }) {
  const fetcher = useFetcher();
  const location = useLocation();

  const isAdding = fetcher.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col-reverse gap-4 overflow-auto px-6 py-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-end gap-4">
            <Avatar photoURL={message.photoURL} />
            <div className="grow">
              <Text size="xs" variant="secondary" className="pl-4">
                {message.name}
              </Text>
              <Text as="div" className="mt-1 rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                {message.message}
              </Text>
            </div>
          </div>
        ))}
      </div>
      <fetcher.Form
        ref={formRef}
        action={`${location.pathname}/comments`}
        method="post"
        className="flex gap-2 border-t border-gray-200 bg-white p-6"
      >
        <Input
          ref={inputRef}
          type="text"
          name="comment"
          aria-label="Write a comment to other organizers"
          placeholder="Write a comment..."
          className="grow"
          autoComplete="off"
          required
        />
        <Button type="submit" variant="secondary" loading={fetcher.state !== 'idle'}>
          Send
        </Button>
      </fetcher.Form>
    </div>
  );
}
