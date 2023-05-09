import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { useProposalReview } from '../organizer_.$orga.$event.review.$proposal/route';
import { requireSession } from '~/libs/auth/session';
import invariant from 'tiny-invariant';
import { addProposalComment, removeProposalComment } from './server/comments.server';
import { useUser } from '~/root';
import { Form, useSubmit } from '@remix-run/react';
import { Avatar } from '~/design-system/Avatar';
import { Text } from '~/design-system/Typography';
import { IconButton } from '~/design-system/IconButtons';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Input } from '~/design-system/forms/Input';
import { Button } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.proposal, 'Invalid proposal id');
  const form = await request.formData();

  const action = form.get('_action')?.toString();
  if (action === 'delete') {
    const messageId = form.get('messageId')?.toString();
    if (messageId) await removeProposalComment(params.event, params.proposal, userId, messageId);
  } else {
    const comment = form.get('comment')?.toString();
    if (comment) await addProposalComment(params.event, params.proposal, userId, comment);
  }
  return null;
};

export default function ProposalReviewRoute() {
  const { user } = useUser();
  const { proposalReview } = useProposalReview();

  if (!user) return null;

  return <OrganizerMessages userId={user?.id} messages={proposalReview.proposal.messages} />;
}

type Message = {
  id: string;
  userId: string;
  name: string | null;
  picture: string | null;
  message: string;
};

function OrganizerMessages({ userId, messages }: { userId: string; messages: Array<Message> }) {
  const submit = useSubmit();

  const handleDelete = (messageId: string) => {
    submit({ _action: 'delete', messageId }, { method: 'POST' });
  };

  return (
    <Card
      as="section"
      aria-label="Organizer messages section"
      className="flex flex-1 flex-col justify-between overflow-hidden"
    >
      <div className="flex flex-col-reverse gap-4 overflow-auto p-8">
        {messages.map((message) => (
          <div key={message.id} className="group flex items-end gap-4">
            <Avatar picture={message.picture} name={message.name} />
            <div className="min-w-0 grow">
              <div className="relative">
                <Text size="xs" variant="secondary">
                  {message.name}
                </Text>
                {userId === message.userId && (
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
              <div className="mt-1 break-all rounded-r-md rounded-tl-md border border-gray-200 bg-gray-50 px-4 py-4">
                <Text size="s">{message.message}</Text>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Form method="POST" className="flex gap-2 border-t border-gray-200 bg-white p-6">
        <Input
          type="text"
          name="comment"
          aria-label="Write a comment to other organizers"
          placeholder="Write a comment..."
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
