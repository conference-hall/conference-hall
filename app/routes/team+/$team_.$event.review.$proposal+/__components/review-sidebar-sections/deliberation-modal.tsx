import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { PaperAirplaneIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { AlertInfo } from '~/design-system/Alerts';
import { Button } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Modal } from '~/design-system/Modals';
import { Text } from '~/design-system/Typography';
import type { DeliberationStatus, PublicationStatus } from '~/types/proposals.types';

const statuses = {
  ACCEPTED: { label: 'Accepted', icon: CheckIcon, color: 'text-green-600' },
  REJECTED: { label: 'Rejected', icon: XMarkIcon, color: 'text-red-600' },
  PENDING: { label: 'Pending', icon: QuestionMarkCircleIcon, color: 'text-gray-600' },
};

type StatusProps = { deliberationStatus: DeliberationStatus; publicationStatus: PublicationStatus };

type ModalProps = { open: boolean; onClose: () => void } & StatusProps;

export function DeliberationModal({ deliberationStatus, publicationStatus, open, onClose }: ModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="l" position="top">
      <Modal.Title>Update or publish deliberation</Modal.Title>
      <Modal.Content>
        <div className="space-y-6 mt-4">
          <UpdateDeliberationStatus deliberationStatus={deliberationStatus} publicationStatus={publicationStatus} />
          <PublishResults deliberationStatus={deliberationStatus} publicationStatus={publicationStatus} />
        </div>
      </Modal.Content>
    </Modal>
  );
}

function UpdateDeliberationStatus({ deliberationStatus, publicationStatus }: StatusProps) {
  return (
    <div className="flex flex-col gap-6 p-4 border border-gray-300 rounded">
      <div>
        <Text weight="semibold" size="base">
          Change deliberation status
        </Text>
        <Text variant="secondary" size="s">
          This will change the deliberation status of the proposal
        </Text>
      </div>
      {publicationStatus === 'PUBLISHED' && (
        <AlertInfo>When you change the deliberation status of a published proposal, it will be unpublished.</AlertInfo>
      )}
      <Form method="POST" className="flex gap-2 items-center">
        <input type="hidden" name="intent" value="update-deliberation" />
        {Object.entries(statuses)
          .filter(([status]) => status !== deliberationStatus)
          .map(([status, { label, icon: Icon, color }]) => (
            <Button key={status} variant="secondary" name="deliberationStatus" value={status}>
              <Icon className={cx('w-5 h-5', color)} aria-hidden />
              {label}
            </Button>
          ))}
      </Form>
    </div>
  );
}

function PublishResults({ deliberationStatus, publicationStatus }: StatusProps) {
  if (deliberationStatus !== 'PENDING') return null;

  return (
    <div className="flex flex-col gap-6 p-4 border border-gray-300 rounded">
      <div>
        <Text weight="semibold" size="base">
          Publish proposal result
        </Text>
        <Text variant="secondary" size="s">
          This will publish the results of the deliberation and send an email to all speakers.
        </Text>
      </div>
      {publicationStatus === 'NOT_PUBLISHED' ? (
        <Form method="POST" className="flex flex-col gap-4">
          <input type="hidden" name="intent" value="publish-results" />
          <Checkbox name="sendEmails" defaultChecked={true}>
            Send an email to notify speakers
          </Checkbox>
          <div>
            <Button variant="secondary">
              <PaperAirplaneIcon className="w-5 h-5" aria-hidden />
              Publish result
            </Button>
          </div>
        </Form>
      ) : (
        <div className="flex items-center">
          <CheckIcon className="h-5 w-5 mr-1 text-green-600" aria-hidden="true" />
          <Text weight="semibold">Result already published</Text>
        </div>
      )}
    </div>
  );
}
