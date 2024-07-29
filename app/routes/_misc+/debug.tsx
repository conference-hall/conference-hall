import { Form } from '@remix-run/react';

import { Button } from '~/design-system/buttons.tsx';

export const loader = async () => {
  return null;
};

export const action = async () => {
  throw new Error('Failed');
  return null;
};

export default function DebugPage() {
  return (
    <Form method="POST">
      <Button type="submit">Server error</Button>
    </Form>
  );
}
