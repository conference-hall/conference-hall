import { Form, useNavigate, useNavigation } from '@remix-run/react';
import { useCallback } from 'react';

import { Button } from '~/design-system/Buttons';
import { ToggleGroup } from '~/design-system/forms/Toggles';
import { Modal } from '~/design-system/Modals';

import { Statistic, type Statistics } from './Statistics';

type AnnoucementConfirmModalProps = { title: string; statistics: Statistics | null };

export function AnnoucementConfirmModal({ title, statistics }: AnnoucementConfirmModalProps) {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const isLoading = state !== 'idle';

  const close = useCallback(() => {
    if (isLoading) return;
    navigate(-1);
  }, [navigate, isLoading]);

  return (
    <Modal size="l" open onClose={close}>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Content className="pt-6 space-y-4">
        <dl className="flex items-center divide-x p-2 border border-gray-300 rounded">
          <Statistic
            name="total-annouce-published"
            label="Already published"
            className="basis-1/2"
            value={statistics?.published}
          />
          <Statistic
            name="total-annouce-to-publish"
            label="To publish"
            className="basis-1/2"
            value={statistics?.notPublished}
          />
        </dl>
        <div className="p-4 border border-gray-300 rounded">
          <Form id="result-form" method="POST">
            <ToggleGroup
              name="sendEmails"
              label="Send an email to notify speakers"
              description="The email will be sent to each proposal speaker"
              value={true}
            />
          </Form>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={close} variant="secondary" loading={isLoading}>
          Cancel
        </Button>
        <Button type="submit" form="result-form" loading={isLoading}>
          Confirm results announcement
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
