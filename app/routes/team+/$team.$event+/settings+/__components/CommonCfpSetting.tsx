import { Form } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';
import { Input } from '~/design-system/forms/Input.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H2 } from '~/design-system/Typography.tsx';

type Props = {
  maxProposals: number | null;
  codeOfConductUrl: string | null;
  errors?: Record<string, string | string[]> | null;
};

export function CommonCfpSetting({ maxProposals, codeOfConductUrl, errors }: Props) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Call for paper preferences</H2>
      </Card.Title>

      <Form method="POST">
        <Card.Content>
          <Input
            name="maxProposals"
            label="Maximum of proposals per speaker"
            type="number"
            defaultValue={maxProposals || ''}
            autoComplete="off"
            description="Optional. Limits the number of proposals a speaker can submit to the event."
            error={errors?.maxProposals}
          />
          <Input
            name="codeOfConductUrl"
            label="Code of conduct URL"
            defaultValue={codeOfConductUrl || ''}
            description="Optional. Speakers will be required to agree to the code of conduct before submitting their proposal."
            error={errors?.codeOfConductUrl}
          />
        </Card.Content>

        <Card.Actions>
          <Button name="intent" value="save-cfp-preferences">
            Update CFP preferences
          </Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
