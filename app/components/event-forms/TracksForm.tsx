import { H1, H2, Text } from '~/design-system/Typography';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Container } from '~/design-system/Container';
import { Input } from '~/design-system/forms/Input';
import { PlusIcon } from '@heroicons/react/20/solid';

export default function TracksForm() {
  return (
    <Container className="max-w-3xl">
      <div className="mt-24 mb-12 space-y-12 text-center">
        <H1>Create tracks</H1>
        <Text variant="secondary">Define the formats and categories of proposals available for the event.</Text>
      </div>
      <div className="space-y-16 bg-white p-8 shadow sm:overflow-hidden sm:rounded-md">
        <div className="space-y-12">
          <Form action="post">
            <H2>Formats</H2>
            <Text variant="secondary">You can create or change them later.</Text>
            <div className="mt-4 flex items-end gap-2">
              <Input name="name" label="Name" autoComplete="off" />
              <Input name="description" label="Description" autoComplete="off" className="grow" />
              <Button variant="secondary">
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
          </Form>
          <Form action="post">
            <H2>Categories</H2>
            <Text variant="secondary">You can create or change them later.</Text>
            <div className="mt-4 flex items-end gap-2">
              <Input name="name" label="Name" autoComplete="off" />
              <Input name="description" label="Description" autoComplete="off" className="grow" />
              <Button variant="secondary">
                <PlusIcon className="h-5 w-5" />
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
}
