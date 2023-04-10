import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useOutletContext, useSubmit } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { Container } from '../../design-system/Container';
import { Input } from '../../design-system/forms/Input';
import { MarkdownTextArea } from '../../design-system/forms/MarkdownTextArea';
import { Button } from '../../design-system/Buttons';
import { H2, Subtitle } from '../../design-system/Typography';
import { useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { mapErrorToResponse } from '../../libs/errors';
import { sessionRequired } from '../../libs/auth/auth.server';
import { NavMenu } from '~/design-system/NavMenu';
import { withZod } from '@remix-validated-form/with-zod';
import type { SpeakerContext } from '../speaker/route';
import { saveProfile } from '~/shared-server/profile/save-profile.server';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { Header } from '~/shared-components/Header';
import { Card } from '~/design-system/Card';
import { Avatar } from '~/design-system/Avatar';
import { createToast } from '~/libs/toasts/toasts';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return json(null);
};

export const action = async ({ request }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
  const form = await request.formData();
  const type = form.get('_type') as string;
  try {
    let result;

    switch (type) {
      case 'INFO':
        result = await withZod(PersonalInfoSchema).validate(form);
        break;
      case 'DETAILS':
        result = await withZod(DetailsSchema).validate(form);
        break;
      default:
        result = await withZod(AdditionalInfoSchema).validate(form);
    }

    if (result.error) return json(result.error.fieldErrors);
    await saveProfile(uid, result.data);
    const toast = await createToast(session, 'Profile successfully saved.');
    return redirect('/speaker/profile', toast);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function ProfileRoute() {
  const { user } = useOutletContext<SpeakerContext>();
  const errors = useActionData<typeof action>();
  const submit = useSubmit();

  const resetCurrentUser = useCallback(() => {
    const { currentUser } = getAuth();
    submit(
      {
        _type: 'INFO',
        name: currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
        photoURL: currentUser?.photoURL ?? '',
      },
      { method: 'POST' }
    );
  }, [submit]);

  const MENU_ITEMS = [
    { to: '#personal-info', icon: UserCircleIcon, label: 'Personal information' },
    { to: '#speaker-details', icon: KeyIcon, label: 'Speaker details' },
    { to: '#additional-info', icon: CreditCardIcon, label: 'Additional information' },
  ];

  return (
    <>
      <Header title="Your profile" subtitle="Share your biography and references to event organizers." />

      <Container className="mt-4 h-full sm:mt-8 lg:grid lg:grid-cols-12 lg:gap-x-5">
        <NavMenu
          items={MENU_ITEMS}
          className="sticky top-0 hidden px-2 py-6 sm:block sm:px-6 lg:col-span-3 lg:px-0 lg:py-0"
          noActive
        />

        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <Card rounded="xl">
            <Form method="POST" aria-labelledby="personal-info-label" preventScrollReset>
              <div className="px-8 pt-8">
                <H2 size="xl" mb={0} id="personal-info-label">
                  Personal information
                </H2>
                <Subtitle>Use a permanent address where you can receive email.</Subtitle>
                <a id="personal-info" href="#personal-info" className="scroll-mt-24" aria-hidden={true} />
              </div>

              <div className="grid grid-cols-1 gap-6 p-8">
                <input type="hidden" name="_type" value="INFO" />
                <Input
                  name="name"
                  label="Full name"
                  defaultValue={user.name || ''}
                  key={user.name}
                  error={errors?.name}
                />
                <Input
                  name="email"
                  label="Email address"
                  defaultValue={user.email || ''}
                  key={user.email}
                  error={errors?.email}
                />
                <div className="flex justify-between gap-8">
                  <Input
                    name="photoURL"
                    label="Avatar picture URL"
                    defaultValue={user.photoURL || ''}
                    key={user.photoURL}
                    error={errors?.photoURL}
                    className="flex-1"
                  />
                  <Avatar photoURL={user.photoURL} size="xl" square />
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-t-gray-200 px-8 py-4">
                <Button type="button" onClick={resetCurrentUser} variant="secondary">
                  Reset default
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </Form>
          </Card>

          <Card rounded="xl">
            <Form method="POST" aria-labelledby="speaker-details-label" preventScrollReset>
              <div className="px-8 pt-8">
                <H2 size="xl" mb={0} id="speaker-details-label">
                  Speaker details
                </H2>
                <Subtitle>
                  Give more information about you, these information will be visible by organizers when you submit a
                  talk.
                </Subtitle>
                <a id="speaker-details" href="#speaker-details" className="scroll-mt-24" />
              </div>

              <div className="grid grid-cols-1 gap-6 p-8">
                <input type="hidden" name="_type" value="DETAILS" />
                <MarkdownTextArea
                  name="bio"
                  label="Biography"
                  description="Brief description for your profile."
                  rows={5}
                  error={errors?.bio}
                  defaultValue={user.bio || ''}
                />
                <MarkdownTextArea
                  name="references"
                  label="Speaker references"
                  description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
                  rows={5}
                  error={errors?.references}
                  defaultValue={user.references || ''}
                />
              </div>
              <div className="border-t border-t-gray-200 px-8 py-4 text-right">
                <Button type="submit">Save</Button>
              </div>
            </Form>
          </Card>

          <Card rounded="xl">
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
                <Input name="company" label="Company" defaultValue={user.company || ''} error={errors?.company} />
                <Input
                  name="address"
                  label="Location (city, country)"
                  defaultValue={user.address || ''}
                  error={errors?.address}
                />
                <Input
                  name="twitter"
                  label="Twitter username"
                  defaultValue={user.twitter || ''}
                  error={errors?.twitter}
                />
                <Input name="github" label="GitHub username" defaultValue={user.github || ''} error={errors?.github} />
              </div>
              <div className="border-t border-t-gray-200 px-8 py-4 text-right">
                <Button type="submit">Save</Button>
              </div>
            </Form>
          </Card>
        </div>
      </Container>
    </>
  );
}
