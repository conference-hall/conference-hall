import { Form } from '@remix-run/react';
import { EventForm } from '~/shared-components/events/EventForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { H1, Text } from '~/design-system/Typography';

export function CreateEventForm({ type, errors }: { type: string; errors?: Record<string, string> }) {
  return (
    <>
      <div className="mb-12 mt-12 space-y-6 text-center">
        <H1>{`Create a new ${type?.toLowerCase()}`}</H1>
        <Text variant="secondary">
          Provide main information about your event and it's visibility in Conference Hall.
        </Text>
      </div>
      <Form
        method="post"
        className="space-y-8 border border-gray-200 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md"
      >
        <EventForm errors={errors} />
        <input name="type" type="hidden" value={type} />
        <div className="flex justify-end gap-2">
          <ButtonLink to="." variant="secondary">
            Cancel
          </ButtonLink>
          <Button>Create and configure event</Button>
        </div>
      </Form>
    </>
  );
}
