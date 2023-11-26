import { AvatarName } from '~/design-system/Avatar.tsx';
import { Badge } from '~/design-system/Badges.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H3, Text } from '~/design-system/Typography.tsx';
import { getLanguage } from '~/libs/formatters/languages';
import { getLevel } from '~/libs/formatters/levels';

type Props = {
  abstract: string;
  references: string | null;
  formats?: Array<{ name: string }>;
  categories?: Array<{ name: string }>;
  level: string | null;
  languages: Array<string>;
  speakers: Array<{ name?: string | null; picture?: string | null; company?: string | null }>;
};

export function ProposalDetailsSection(props: Props) {
  const hasFormats = props.formats && props.formats.length > 0;
  const hasCategories = props.categories && props.categories.length > 0;

  return (
    <Card as="section">
      {props.speakers.length > 0 && (
        <Card.Title className="flex flex-col gap-4 lg:flex-row lg:gap-8 pb-4 lg:pb-8 border-b border-b-gray-200">
          {props.speakers.map((speaker) => (
            <AvatarName
              key={speaker.name}
              name={speaker.name}
              picture={speaker.picture}
              subtitle={speaker.company}
              size="m"
            />
          ))}
        </Card.Title>
      )}
      <Card.Content>
        <div className="space-x-4">
          {props.level && <Badge color="indigo">{getLevel(props.level)}</Badge>}
          {props.languages.map((language) => (
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
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
      </Card.Content>
    </Card>
  );
}
