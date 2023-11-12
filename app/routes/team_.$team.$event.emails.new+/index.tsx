import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { RadioGroupList } from '~/design-system/forms/RadioGroupList.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { campaignTemplates } from '~/domain/email-campaigns/campaign-templates.server.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');

  const templates = campaignTemplates.map((template) => ({
    name: template.name,
    title: template.title,
    description: template.description,
    segments: template.segments,
  }));

  return json(templates);
};

export default function CampaignTemplateSelection() {
  const templates = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<string>(templates[0].name);

  return (
    <>
      <H2 mb={4}>Choose an email campaign template</H2>
      <div className="flex flex-col gap-8">
        <RadioGroupList
          name="campaign"
          label="Campaign type"
          value={selected}
          onChange={setSelected}
          options={templates.map((template) => ({
            value: template.name,
            title: template.title,
            description: template.description,
          }))}
        />
        <div className="flex justify-end">
          <ButtonLink to={selected} iconRight={ArrowRightIcon}>
            Continue
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
