import slugify from '@sindresorhus/slugify';
import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Modal } from '~/design-system/dialogs/Modals';
import { Button } from '~/design-system/Buttons';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { Input } from '~/design-system/forms/Input';

type Props = {
  errors?: {
    [field: string]: string[];
  };
};

export function OrganizationNewButton({ errors }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>New organization</Button>
      <OrganizationNewModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} errors={errors} />
    </>
  );
}

type OrganizationNewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  errors?: {
    [field: string]: string[];
  };
};

function OrganizationNewModal({ isOpen, onClose, errors }: OrganizationNewModalProps) {
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="post">
        <Modal.Title
          title="Create a new organization"
          icon={BuildingStorefrontIcon}
          description="Give a cool name to your organization. You will be able to invite members and create your first event."
          iconColor="info"
        />
        <Input
          name="name"
          label="Organization name"
          required
          autoComplete="off"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value.toLowerCase()));
          }}
          error={errors?.name?.[0]}
          className="mt-8"
        />
        <Input
          name="slug"
          label="Organization slug"
          required
          autoComplete="off"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
          }}
          error={errors?.slug?.[0]}
          className="mt-4"
        />
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Create organization</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
