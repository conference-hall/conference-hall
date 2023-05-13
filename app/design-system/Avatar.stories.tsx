import { Avatar, AvatarGroup, AvatarName } from './Avatar';
import { StoryBlock } from './StoryBlock';

const picture = 'https://i.pravatar.cc/100?u=1';

export const Documentation = () => (
  <>
    <StoryBlock title="Avatar">
      <Avatar picture={picture} size="4xl" />
      <Avatar picture={picture} size="xl" />
      <Avatar picture={picture} size="l" />
      <Avatar picture={picture} size="m" />
      <Avatar picture={picture} size="s" />
      <Avatar picture={picture} size="xs" />
    </StoryBlock>

    <StoryBlock title="Avatar square">
      <Avatar name="Anna" size="l" square />
      <Avatar name="John" size="m" square />
      <Avatar name="Quentin" size="s" square />
    </StoryBlock>

    <StoryBlock title="Avatar with a ring">
      <Avatar picture={picture} size="m" ring ringColor="primary" />
      <Avatar name="Ben" size="m" square ring ringColor="primary" />
    </StoryBlock>

    <StoryBlock title="AvatarName">
      <AvatarName picture={picture} name="Bobby" subtitle="bobby@example.com" />
    </StoryBlock>

    <StoryBlock title="AvatarGroup">
      <AvatarGroup
        avatars={[
          { picture: 'https://i.pravatar.cc/100?u=1', name: 'Bobby' },
          { picture: 'https://i.pravatar.cc/100?u=2', name: 'Johnny' },
          { picture: 'https://i.pravatar.cc/100?u=3', name: 'Rosy' },
        ]}
      />
    </StoryBlock>

    <StoryBlock title="AvatarGroup with names">
      <AvatarGroup
        avatars={[
          { picture: 'https://i.pravatar.cc/100?u=1', name: 'Bobby' },
          { picture: 'https://i.pravatar.cc/100?u=2', name: 'Johnny' },
          { picture: 'https://i.pravatar.cc/100?u=3', name: 'Rosy' },
        ]}
        displayNames
      />
    </StoryBlock>
  </>
);
