import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Subtitle } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';

type Props = {
  company: string | null;
  address: string | null;
  twitter: string | null;
  github: string | null;
  errors?: Record<string, string>;
};

export function AdditionalInfoForm({ company, address, twitter, github, errors }: Props) {
  return (
    <Form method="POST" aria-labelledby="additional-info-label" preventScrollReset>
      <div className="px-8 pt-8">
        <H2 size="xl" mb={0} id="additional-info-label">
          Additional information
        </H2>
        <Subtitle>Helps organizers to know more about you.</Subtitle>
        <a id="additional-info" href="#additional-info" className="scroll-mt-24" />
      </div>

      <div className="grid grid-cols-1 gap-6 p-8">
        <input type="hidden" name="_type" value="ADDITIONAL" />
        <Input name="company" label="Company" defaultValue={company || ''} error={errors?.company} />
        <Input name="address" label="Location (city, country)" defaultValue={address || ''} error={errors?.address} />
        <Input name="twitter" label="Twitter username" defaultValue={twitter || ''} error={errors?.twitter} />
        <Input name="github" label="GitHub username" defaultValue={github || ''} error={errors?.github} />
      </div>
      <div className="border-t border-t-gray-200 px-8 py-4 text-right">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}
