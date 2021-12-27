import { Form, LoaderFunction, NavLink, useLoaderData } from 'remix';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/solid';
import { AuthUser, requireAuthUser } from '../../features/auth/auth.server';
import { Container } from '../../components/layout/Container';
import { IconLabel } from '../../components/IconLabel';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/Buttons';
import { MarkdownTextArea } from '../../components/forms/MarkdownTextArea';
import { H2, Text } from '../../components/Typography';

export const loader: LoaderFunction = ({ request }) => {
  const user = requireAuthUser(request);
  return user;
};

export default function ProfileEditRoute() {
  const user = useLoaderData<AuthUser>();
  return (
    <div className="bg-gray-100 py-8">
      <Container>
        <h1 className="sr-only">Edit profile</h1>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              <NavLink
                to="/speaker/edit#personal-info"
                className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
              >
                <IconLabel icon={UserCircleIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                  Personal information
                </IconLabel>
              </NavLink>
              <NavLink
                to="/speaker/edit#speaker-details"
                className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
              >
                <IconLabel icon={KeyIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                  Speaker details
                </IconLabel>
              </NavLink>
              <NavLink
                to="/speaker/edit#personal-info"
                className="group rounded-md px-3 py-2 flex items-center text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-50"
              >
                <IconLabel icon={CreditCardIcon} iconClassName="text-gray-400 group-hover:text-gray-500">
                  Additional information
                </IconLabel>
              </NavLink>
            </nav>
          </aside>

          <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
            <Form action="#" method="post">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <H2>Personal information</H2>
                    <Text variant="secondary" className="mt-1">
                      Use a permanent address where you can receive email.
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input id="name" name="name" label="Full name" defaultValue={user.name} />
                    <Input id="email" name="email" label="Email address" defaultValue={user.email} />
                    <Input id="photoURL" name="photoURL" label="Avatar picture URL" defaultValue={user.picture} />
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
                  <Button type="button" variant="secondary">
                    Reset default
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </Form>

            <Form action="#" method="post">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <H2>Speaker details</H2>
                    <Text variant="secondary" className="mt-1">
                      Give more information about you, these information will be visible by organizers when you submit a
                      talk.
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <MarkdownTextArea
                      id="bio"
                      name="bio"
                      label="Biography"
                      description="Brief description for your profile."
                      rows={5}
                      defaultValue={user.bio}
                    />
                    <MarkdownTextArea
                      id="references"
                      name="references"
                      label="Speaker references"
                      description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
                      rows={5}
                      defaultValue={user.references}
                    />
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right space-x-4 sm:px-6">
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </Form>

            <Form action="#" method="post">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <H2>Additional information</H2>
                    <Text variant="secondary" className="mt-1">
                      Helps organizers to know more about you.
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input id="company" name="company" label="Company" defaultValue={user.company} />
                    <Input id="location" name="location" label="Location (city, country)" defaultValue={user.address} />
                    <Input id="twitter" name="twitter" label="Twitter username" defaultValue={user.twitter} />
                    <Input id="github" name="github" label="GitHub username" defaultValue={user.github} />
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
    </div>
  );
}
