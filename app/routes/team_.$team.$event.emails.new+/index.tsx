import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { RadioGroupList } from '~/design-system/forms/RadioGroupList.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2 } from '~/design-system/Typography.tsx';
import { campaignTemplates } from '~/domain/email-campaigns/campaign-templates.server.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);

  const templates = campaignTemplates.map((template) => ({
    name: template.name,
    title: template.title,
    description: template.description,
  }));

  return json(templates);
};

export default function CampaignTemplateSelection() {
  const templates = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState<string>(templates[0].name);

  return (
    <Card>
      <Card.Title>
        <H2>Choose an email campaign template</H2>
      </Card.Title>
      <Card.Content>
        <RadioGroupList
          label="Campaign type"
          value={selected}
          onChange={setSelected}
          options={templates.map((template) => ({
            value: template.name,
            title: template.title,
            description: template.description,
          }))}
        />
      </Card.Content>
      <Card.Actions>
        <ButtonLink to={selected} iconRight={ArrowRightIcon}>
          Continue
        </ButtonLink>
      </Card.Actions>
    </Card>
  );
}
