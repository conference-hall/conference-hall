import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';

import SlideOver from '~/design-system/SlideOver.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function ProposalSpeakerRoute() {
  const navigate = useNavigate();

  const onClose = () => navigate(-1);

  return (
    <SlideOver open onClose={onClose}>
      <SlideOver.Content title="Speaker" onClose={onClose}>
        Speaker
      </SlideOver.Content>
    </SlideOver>
  );
}
