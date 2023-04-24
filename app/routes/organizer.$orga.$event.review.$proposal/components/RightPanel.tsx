import c from 'classnames';
import { Avatar } from '~/design-system/Avatar';
import { Text } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { useFetcher, useParams } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { IconButton } from '~/design-system/IconButtons';
import { TrashIcon } from '@heroicons/react/24/outline';

type Message = {
  id: string;
  userId: string;
  name: string | null;
  photoURL: string | null;
  message: string;
};

type Props = {
  uid: string;
  messages: Array<Message>;
  className?: string;
};

export function RightPanel({ uid, messages, className }: Props) {
  return (
    <section className={c('relative flex min-h-full flex-col', className)}>
      <OrganizerComments uid={uid} messages={messages} />
    </section>
  );
}

function OrganizerComments({ uid, messages }: { uid: string; messages: Array<Message> }) {
  const params = useParams();
  const fetcher = useFetcher();

  const isAdding = fetcher.state === 'submitting';
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (messageId: string) => {
    fetcher.submit(
      { _action: 'delete', messageId },
      {
        action: `/organizer/${params.orga}/${params.event}/review/${params.proposal}/comments`,
        method: 'POST',
      }
    );
  };

  useEffect(() => {
    if (isAdding) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isAdding]);

  return (
    <section aria-label="Organizer messages section" className="flex flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col-reverse gap-4 overflow-auto px-6 py-4">
        {messages.map((message) => (
          <div key={message.id} className="group flex items-end gap-4">
            <Avatar photoURL={message.photoURL} name={message.name} />
            <div className="min-w-0 grow">
              <div className="relative">
                <Text size="xs" variant="secondary">
                  {message.name}
                </Text>
                {uid === message.userId && (
                  <IconButton
                    label="Delete comment"
                    icon={TrashIcon}
                    variant="secondary"
                    size="xs"
                    className="absolute bottom-0 right-0 hidden group-hover:block"
                    onClick={() => handleDelete(message.id)}
                  />
                )}
              </div>
              <div className="mt-1 break-all rounded-r-md rounded-tl-md bg-gray-100 px-4 py-4">
                <Text>{message.message}</Text>
              </div>
            </div>
          </div>
        ))}
      </div>
      <fetcher.Form
        ref={formRef}
        action={`/organizer/${params.orga}/${params.event}/review/${params.proposal}/comments`}
        method="POST"
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
    </section>
  );
}
