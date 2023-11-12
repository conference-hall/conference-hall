import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H2, Subtitle, Text } from '~/design-system/Typography.tsx';
import { campaignTemplates } from '~/domain/email-campaigns/campaign-templates.server.ts';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  invariant(params.template, 'Invalid template name');

  const template = campaignTemplates.find((template) => template.name === params.template);

  return json(template);
};

export default function CampaignTemplatePreview() {
  const template = useLoaderData<typeof loader>();

  return (
    <form method="POST">
      <Card>
        <Card.Title>
          <H2>{template.title}</H2>
          <Subtitle>{template.description}</Subtitle>
        </Card.Title>
        <Card.Content>
          <Input label="Campaign name" name="name" defaultValue={template.title} required />
          <div>
            <Text weight="medium" mb={2}>
              Email preview
            </Text>
            <div className="rounded border border-gray-300">
              <div className="rounded-t bg-gray-50 border-b border-b-gray-300 p-4">
                <Text weight="semibold">From: {template.email_from}</Text>
              </div>
              <div className="p-4 border-b border-b-gray-200">
                <Text weight="medium">{template.email_subject}</Text>
              </div>
              <div className="p-4">
                <Markdown>{template.email_template}</Markdown>
              </div>
            </div>
          </div>
        </Card.Content>
        <Card.Actions>
          <ButtonLink to="selection" iconRight={ArrowRightIcon}>
            Go to proposals selection
          </ButtonLink>
        </Card.Actions>
      </Card>
    </form>
  );
}
