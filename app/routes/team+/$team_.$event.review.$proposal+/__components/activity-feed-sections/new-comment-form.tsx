import { Form } from '@remix-run/react';

import { Avatar } from '~/design-system/Avatar';
import { Button } from '~/design-system/Buttons';
import { useUser } from '~/root';

export function NewCommentForm() {
  const { user } = useUser();

  return (
    <>
      <Avatar picture={user?.picture} name={user?.name} size="xs" />

      <Form method="POST" className="relative flex-auto">
        <input type="hidden" name="intent" value="add-comment" />

        <div className="overflow-hidden bg-white rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
          <label htmlFor="comment" className="sr-only">
            Add your comment
          </label>
          <textarea
            rows={2}
            name="comment"
            id="comment"
            className="block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="Add your comment..."
            defaultValue=""
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex justify-end py-2 pl-3 pr-2">
          <Button type="submit" variant="secondary">
            Comment
          </Button>
        </div>
      </Form>
    </>
  );
}
