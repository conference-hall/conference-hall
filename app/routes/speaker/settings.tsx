import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { Container } from '../../design-system/Container';
import { Input } from '../../design-system/forms/Input';
import { MarkdownTextArea } from '../../design-system/forms/MarkdownTextArea';
import { Button } from '../../design-system/Buttons';
import { H2, Text } from '../../design-system/Typography';
import type { ValidationErrors } from '../../utils/validation-errors';
import { useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import type { UserSettings } from '../../services/speakers/settings.server';
import { getSettings, updateSettings, validateProfileData } from '../../services/speakers/settings.server';
import { mapErrorToResponse } from '../../services/errors';
import { sessionRequired } from '../../services/auth/auth.server';
import { NavMenu } from '~/design-system/NavMenu';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await sessionRequired(request);
  try {
    const profile = await getSettings(uid);
    return json<UserSettings>(profile);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export const action: ActionFunction = async ({ request }) => {
  const uid = await sessionRequired(request);
  const form = await request.formData();
  const type = form.get('_type') as string;
  const result = validateProfileData(form, type);
  if (!result.success) {
    return result.error.flatten();
  }
  try {
    await updateSettings(uid, result.data);
    return redirect('/speaker/settings');
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SettingsRoute() {
  const user = useLoaderData<UserSettings>();
  const errors = useActionData<ValidationErrors>();
  const fieldErrors = errors?.fieldErrors;
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
      { method: 'post' }
    );
  }, [submit]);

  const MENU_ITEMS = [
    { to: '#personal-info', icon: UserCircleIcon, label: 'Personal information' },
    { to: '#speaker-details', icon: KeyIcon, label: 'Speaker details' },
    { to: '#additional-info', icon: CreditCardIcon, label: 'Additional information' },
  ];

  return (
    <Container className="my-4 sm:my-8">
      <h1 className="sr-only">Settings</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <NavMenu items={MENU_ITEMS} className="hidden sm:block" />

        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <Form method="post" aria-labelledby="personal-info-label">
            <div className="overflow-hidden border border-gray-200 sm:rounded-md">
              <a id="personal-info" href="#personal-info" className="scroll-mt-16" aria-hidden={true} />
              <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                <div>
                  <H2 id="personal-info-label">Personal information</H2>
                  <Text variant="secondary" className="mt-1">
                    Use a permanent address where you can receive email.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="INFO" />
                  <Input
                    name="name"
                    label="Full name"
                    defaultValue={user.name || ''}
                    key={user.name}
                    error={fieldErrors?.name?.[0]}
                  />
                  <Input
                    name="email"
                    label="Email address"
                    defaultValue={user.email || ''}
                    key={user.email}
                    error={fieldErrors?.email?.[0]}
                  />
                  <Input
                    name="photoURL"
                    label="Avatar picture URL"
                    defaultValue={user.photoURL || ''}
                    key={user.photoURL}
                    error={fieldErrors?.photoURL?.[0]}
                  />
                </div>
              </div>
              <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
                <Button type="button" onClick={resetCurrentUser} variant="secondary">
                  Reset default
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>

          <Form method="post" aria-labelledby="speaker-details-label">
            <div className="overflow-hidden border border-gray-200 sm:rounded-md">
              <a id="speaker-details" href="#speaker-details" className="scroll-mt-16" />
              <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                <div>
                  <H2 id="speaker-details-label">Speaker details</H2>
                  <Text variant="secondary" className="mt-1">
                    Give more information about you, these information will be visible by organizers when you submit a
                    talk.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="DETAILS" />
                  <MarkdownTextArea
                    name="bio"
                    label="Biography"
                    description="Brief description for your profile."
                    rows={5}
                    error={fieldErrors?.bio?.[0]}
                    defaultValue={user.bio || ''}
                  />
                  <MarkdownTextArea
                    name="references"
                    label="Speaker references"
                    description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
                    rows={5}
                    error={fieldErrors?.references?.[0]}
                    defaultValue={user.references || ''}
                  />
                </div>
              </div>
              <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>

          <Form method="post" aria-labelledby="additional-info-label">
            <div className="overflow-hidden border border-gray-200 sm:rounded-md">
              <a id="additional-info" href="#additional-info" className="scroll-mt-16" />
              <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
                <div>
                  <H2 id="additional-info-label">Additional information</H2>
                  <Text variant="secondary" className="mt-1">
                    Helps organizers to know more about you.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="ADDITIONAL" />
                  <Input
                    name="company"
                    label="Company"
                    defaultValue={user.company || ''}
                    error={fieldErrors?.company?.[0]}
                  />
                  <Input
                    name="address"
                    label="Location (city, country)"
                    defaultValue={user.address || ''}
                    error={fieldErrors?.address?.[0]}
                  />
                  <Input
                    name="twitter"
                    label="Twitter username"
                    defaultValue={user.twitter || ''}
                    error={fieldErrors?.twitter?.[0]}
                  />
                  <Input
                    name="github"
                    label="GitHub username"
                    defaultValue={user.github || ''}
                    error={fieldErrors?.github?.[0]}
                  />
                </div>
              </div>
              <div className="space-x-4 bg-gray-50 px-4 py-3 text-right sm:px-6">
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
}
