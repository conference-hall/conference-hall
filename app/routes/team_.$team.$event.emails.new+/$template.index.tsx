import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Badge } from '~/design-system/Badges.tsx';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H2, Subtitle, Text } from '~/design-system/Typography.tsx';
import { campaignTemplates } from '~/domain/email-campaigns/campaign-templates.server.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.event, 'Invalid event slug');
  invariant(params.template, 'Invalid temaplte name');

  const template = campaignTemplates.find((template) => template.name === params.template);

  return json(template);
};

export default function CampaignTemplatePreview() {
  const template = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <Card p={8}>
        <H2>{template.title}</H2>
        <Subtitle>{template.description}</Subtitle>
      </Card>
      <Card>
        <div className="flex justify-between items-center px-8 py-4">
          <Text weight="semibold">From: {template.email_from}</Text>
          <Badge>Email preview</Badge>
        </div>
        <div className="border-b border-b-gray-200" />
        <div className="px-8 py-4">
          <Markdown>{template.email_subject}</Markdown>
        </div>
        <div className="border-b border-b-gray-200" />
        <div className="p-8">
          <Markdown>{template.email_template}</Markdown>
        </div>
      </Card>
      <div className="flex justify-end">
        <ButtonLink to="selection" iconRight={ArrowRightIcon}>
          Go to proposals selection
        </ButtonLink>
      </div>
    </div>
  );
}
