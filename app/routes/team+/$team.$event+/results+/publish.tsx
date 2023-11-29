import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { useState } from 'react';

import { Button, ButtonLink } from '~/design-system/Buttons';
import { ToggleGroup } from '~/design-system/forms/Toggles';
import { Modal } from '~/design-system/Modals';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function ResultsAnnouncementPublish() {
  const navigate = useNavigate();
  const [shouldSendEmail, setShouldSendEmail] = useState(true);

  return (
    <Modal size="l" open onClose={() => navigate(-1)}>
      <Modal.Title>You are going to publish results for accepted proposals</Modal.Title>
      <Modal.Content className="pt-6 space-y-4">
        <dl className="flex items-center justify-evenly p-8 gap-4 lg:gap-16 text-center bg-slate-100 border border-slate-200 rounded">
          <div className="overflow-hidden">
            <dt className="truncate text-sm font-medium text-gray-500">Accepted proposals</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">87</dd>
          </div>
          <div className="overflow-hidden">
            <dt className="truncate text-sm font-medium text-gray-500">To publish</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">87</dd>
          </div>
          <div className="overflow-hidden">
            <dt className="truncate text-sm font-medium text-gray-500">Results published</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">0</dd>
          </div>
        </dl>
        <div className="p-4 border border-gray-300 rounded">
          <ToggleGroup
            label="Send an email to notify speakers for accepted proposals"
            description="The email will be sent to all speakers of proposals"
            value={shouldSendEmail}
            onChange={setShouldSendEmail}
          />
        </div>
      </Modal.Content>
      <Modal.Actions>
        <ButtonLink to=".." relative="path" variant="secondary">
          Cancel
        </ButtonLink>
        <Button>Publish results for accepted proposals</Button>
      </Modal.Actions>
    </Modal>
  );
}
