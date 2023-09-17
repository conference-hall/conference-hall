import { AvatarGroup } from '~/design-system/Avatar.tsx';
import { Badge } from '~/design-system/Badges.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H3, Text } from '~/design-system/Typography.tsx';
import { getLanguage } from '~/utils/languages.ts';
import { getLevel } from '~/utils/levels.ts';

type Props = {
  abstract: string;
  references: string | null;
  formats?: Array<{ name: string }>;
  categories?: Array<{ name: string }>;
  level: string | null;
  languages: Array<string>;
  speakers: Array<{ picture?: string | null; name?: string | null }>;
};

export function ProposalDetailsSection(props: Props) {
  const hasFormats = props.formats && props.formats.length > 0;
  const hasCategories = props.categories && props.categories.length > 0;

  return (
    <Card as="section" p={8} className="space-y-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {props.speakers.length > 0 && <AvatarGroup avatars={props.speakers} displayNames />}
        <div className="space-x-4">
          {props.level && <Badge color="indigo">{getLevel(props.level)}</Badge>}
          {props.languages.map((language) => (
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
        </div>
      </div>

      <div>
        <H3 srOnly>Abstract</H3>
        <Markdown>{props.abstract}</Markdown>
      </div>

      {hasFormats && (
        <div>
          <H3 mb={2}>Formats</H3>
          <Text>{props.formats?.map(({ name }) => name).join(', ') || '—'}</Text>
        </div>
      )}

      {hasCategories && (
        <div>
          <H3 mb={2}>Categories</H3>
          <Text>{props.categories?.map(({ name }) => name).join(', ') || '—'}</Text>
        </div>
      )}

      {props.references && (
        <div>
          <H3 mb={2}>References</H3>
          <Markdown>{props.references}</Markdown>
        </div>
      )}
    </Card>
  );
}