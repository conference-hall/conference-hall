import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, NavLink, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/solid';
import { Container } from '../../components/layout/Container';
import { IconLabel } from '../../components/IconLabel';
import { Input } from '../../components/forms/Input';
import { MarkdownTextArea } from '../../components/forms/MarkdownTextArea';
import { Button } from '../../components/Buttons';
import { H2, Text } from '../../components/Typography';
import {
  getSettings,
  SpeakerSettings,
  updateProfile,
  validateProfileData,
} from '../../features/speaker-settings.server';
import { ValidationErrors } from '../../utils/validation-errors';
import { useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { requireUserSession } from '../../features/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  try {
    const profile = await getSettings(uid);
    return json<SpeakerSettings>(profile);
  } catch {
    throw new Response('Speaker not found.', { status: 404 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  const form = await request.formData();
  const type = form.get('_type') as string;
  const result = validateProfileData(form, type);
  if (!result.success) {
    return result.error.flatten();
  }
  try {
    await updateProfile(uid, result.data);
    return redirect('/speaker/settings');
  } catch {
    throw new Response('Speaker not found.', { status: 404 });
  }
};

export default function SettingsRoute() {
  const user = useLoaderData<SpeakerSettings>();
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
  }, []);

  return (
    <Container className="my-8">
      <h1 className="sr-only">Edit profile</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            <NavLink
              to={{ pathname: '/speaker/settings', hash: '#personal-info' }}
              className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
            >
              <IconLabel icon={UserCircleIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                Personal information
              </IconLabel>
            </NavLink>
            <NavLink
              to={{ pathname: '/speaker/settings', hash: '#speaker-details' }}
              className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
            >
              <IconLabel icon={KeyIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                Speaker details
              </IconLabel>
            </NavLink>
            <NavLink
              to={{ pathname: '/speaker/settings', hash: '#additional-info' }}
              className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
            >
              <IconLabel icon={CreditCardIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                Additional information
              </IconLabel>
            </NavLink>
          </nav>
        </aside>

        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <Form method="post">
            <div className="border border-gray-200 sm:rounded-md sm:overflow-hidden">
              <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                <div>
                  <H2 id="personal-info">Personal information</H2>
                  <Text variant="secondary" className="mt-1">
                    Use a permanent address where you can receive email.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="INFO" />
                  <Input
                    id="name"
                    name="name"
                    label="Full name"
                    defaultValue={user.name || ''}
                    key={user.name}
                    error={fieldErrors?.name?.[0]}
                  />
                  <Input
                    id="email"
                    name="email"
                    label="Email address"
                    defaultValue={user.email || ''}
                    key={user.email}
                    error={fieldErrors?.email?.[0]}
                  />
                  <Input
                    id="photoURL"
                    name="photoURL"
                    label="Avatar picture URL"
                    defaultValue={user.photoURL || ''}
                    key={user.photoURL}
                    error={fieldErrors?.photoURL?.[0]}
                  />
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
                <Button type="button" onClick={resetCurrentUser} variant="secondary">
                  Reset default
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>

          <Form method="post">
            <div className="border border-gray-200 sm:rounded-md sm:overflow-hidden">
              <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                <div>
                  <H2 id="speaker-details">Speaker details</H2>
                  <Text variant="secondary" className="mt-1">
                    Give more information about you, these information will be visible by organizers when you submit a
                    talk.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="DETAILS" />
                  <MarkdownTextArea
                    id="bio"
                    name="bio"
                    label="Biography"
                    description="Brief description for your profile."
                    rows={5}
                    error={fieldErrors?.bio?.[0]}
                    defaultValue={user.bio || ''}
                  />
                  <MarkdownTextArea
                    id="references"
                    name="references"
                    label="Speaker references"
                    description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
                    rows={5}
                    error={fieldErrors?.references?.[0]}
                    defaultValue={user.references || ''}
                  />
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>

          <Form method="post">
            <div className="border border-gray-200 sm:rounded-md sm:overflow-hidden">
              <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                <div>
                  <H2 id="additional-info">Additional information</H2>
                  <Text variant="secondary" className="mt-1">
                    Helps organizers to know more about you.
                  </Text>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <input type="hidden" name="_type" value="ADDITIONAL" />
                  <Input
                    id="company"
                    name="company"
                    label="Company"
                    defaultValue={user.company || ''}
                    error={fieldErrors?.company?.[0]}
                  />
                  <Input
                    id="address"
                    name="address"
                    label="Location (city, country)"
                    defaultValue={user.address || ''}
                    error={fieldErrors?.address?.[0]}
                  />
                  <Input
                    id="twitter"
                    name="twitter"
                    label="Twitter username"
                    defaultValue={user.twitter || ''}
                    error={fieldErrors?.twitter?.[0]}
                  />
                  <Input
                    id="github"
                    name="github"
                    label="GitHub username"
                    defaultValue={user.github || ''}
                    error={fieldErrors?.github?.[0]}
                  />
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
                <Button type="submit">Save</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Container>
  );
}
