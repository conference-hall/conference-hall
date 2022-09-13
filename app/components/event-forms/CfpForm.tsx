import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { Input } from '~/design-system/forms/Input';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function CfpForm() {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <Input name="startDate" label="Start date" autoComplete="off" className="col-span-2 sm:col-span-1" />
        <Input name="endDate" label="End date" autoComplete="off" className="col-span-2 sm:col-span-1" />
      </div>
      <Input name="maxProposals" label="Maximum of proposals per speaker" type="number" autoComplete="off" />
    </>
  );
}
