import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { List } from '~/design-system/list/list.tsx';
import { H2, Text } from '~/design-system/typography.tsx';

type Props = {
  label: string;
  talks: Array<{
    id: string;
    title: string;
    speakers: Array<{
      id: string;
      name: string | null;
      picture?: string | null;
    }>;
  }>;
};

export function SubmissionTalksList({ label, talks }: Props) {
  return (
    <section className="space-y-3">
      <H2>{label}</H2>
      <List>
        <List.Content aria-label={label}>
          {talks.map((talk) => (
            <List.RowLink key={talk.id} to={talk.id} className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <Text size="s" weight="medium" truncate>
                  {talk.title}
                </Text>
                <Text size="xs" variant="secondary">
                  {talk.speakers.length ? `by ${talk.speakers.map((a) => a.name).join(', ')}` : null}
                </Text>
              </div>
              <div>
                <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
              </div>
            </List.RowLink>
          ))}
        </List.Content>
      </List>
    </section>
  );
}