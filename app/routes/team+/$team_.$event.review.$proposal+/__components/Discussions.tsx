import { TrashIcon } from '@heroicons/react/24/outline';
import { Form, useSubmit } from '@remix-run/react';

import { Avatar } from '~/design-system/Avatar.tsx';
import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { IconButton } from '~/design-system/IconButtons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Text } from '~/design-system/Typography.tsx';

type Props = {
  userId?: string;
  messages: Array<{
    id: string;
    userId: string;
    name: string | null;
    picture: string | null;
    message: string;
  }>;
};

export function Discussions({ userId, messages }: Props) {
  const submit = useSubmit();

  const handleDelete = (messageId: string) => {
    submit({ _action: 'delete', messageId }, { method: 'POST' });
  };

  return (
    <Card
      as="section"
      aria-label="Team discussions section"
      className="flex flex-1 flex-col justify-between overflow-hidden"
    >
      {messages.length === 0 ? (
        <div className="p-8">
          <Text variant="secondary" weight="medium">
            No conversation about the proposal.
          </Text>
        </div>
      ) : (
        <ul aria-label="Organizers messages" className="flex flex-col-reverse gap-4 p-8">
          {messages.map((message) => (
            <li key={message.id} className="group flex items-end gap-4">
              <Avatar picture={message.picture} name={message.name} />
              <div className="grow">
                <Text size="xs" mb={1} variant="secondary">
                  {message.name}
                </Text>
                <div className="flex items-center justify-between gap-4 break-all rounded border border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="grow">
                    <Text>{message.message}</Text>
                  </div>
                  {userId === message.userId && (
                    <IconButton
                      label="Delete message"
                      icon={TrashIcon}
                      variant="secondary"
                      onClick={() => handleDelete(message.id)}
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Form method="POST" className="flex flex-col lg:flex-row gap-2 border-t border-gray-200 p-6">
        <Input
          type="text"
          name="comment"
          aria-label="Write a message to other organizers"
          placeholder="Write a message to other organizers..."
          className="grow"
          autoComplete="off"
          required
        />
        <Button type="submit" variant="secondary">
          Send
        </Button>
      </Form>
    </Card>
  );
}
