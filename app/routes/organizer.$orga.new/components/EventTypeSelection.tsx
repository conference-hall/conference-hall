import { MegaphoneIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '~/design-system/Buttons';
import { CardLink } from '~/design-system/Card';
import { Container } from '~/design-system/Container';
import { H1, H2, Text } from '~/design-system/Typography';

export function EventTypeSelection() {
  return (
    <Container className="mt-16 flex flex-col items-center gap-16">
      <H1>Select an event type</H1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <CardLink
          to={{ pathname: '.', search: '?type=CONFERENCE' }}
          className="flex gap-8 p-8 text-left"
          aria-label="Create a new conference"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <MegaphoneIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H2>New conference</H2>
            <Text variant="secondary">
              Conferences are open to proposals for a time limited period. You can also make the conference public or
              private.
            </Text>
          </span>
        </CardLink>
        <CardLink
          to={{ pathname: '.', search: '?type=MEETUP' }}
          className="flex gap-8 p-8 text-left"
          aria-label="Create a new meetup"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="flex flex-col gap-2">
            <H2>New meetup</H2>
            <Text variant="secondary">
              Meetup are open to proposals all the year. You can manually open or close the call for paper. You can also
              make the meetup public or private.
            </Text>
          </span>
        </CardLink>
      </div>
      <ButtonLink to=".." variant="secondary">
        Cancel
      </ButtonLink>
    </Container>
  );
}
