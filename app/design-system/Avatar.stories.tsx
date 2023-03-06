import { StoryBlock } from './StoryBlock';
import { Avatar, AvatarGroup, AvatarName } from './Avatar';

const photoURL = 'https://i.pravatar.cc/100?u=1';

export const Documentation = () => (
  <>
    <StoryBlock title="Avatar">
      <Avatar photoURL={photoURL} size="xl" />
      <Avatar photoURL={photoURL} size="l" />
      <Avatar photoURL={photoURL} size="m" />
      <Avatar photoURL={photoURL} size="s" />
      <Avatar photoURL={photoURL} size="xs" />
    </StoryBlock>

    <StoryBlock title="Avatar with a ring">
      <Avatar photoURL={photoURL} size="xl" ring ringColor="primary" />
      <Avatar photoURL={photoURL} size="l" ring ringColor="primary" />
      <Avatar photoURL={photoURL} size="m" ring ringColor="primary" />
      <Avatar photoURL={photoURL} size="s" ring ringColor="primary" />
      <Avatar photoURL={photoURL} size="xs" ring ringColor="primary" />
    </StoryBlock>

    <StoryBlock title="AvatarName">
      <AvatarName photoURL={photoURL} name="Bobby" subtitle="bobby@example.com" />
    </StoryBlock>

    <StoryBlock title="AvatarGroup">
      <AvatarGroup
        avatars={[
          { photoURL: 'https://i.pravatar.cc/100?u=1', name: 'Bobby' },
          { photoURL: 'https://i.pravatar.cc/100?u=2', name: 'Johnny' },
          { photoURL: 'https://i.pravatar.cc/100?u=3', name: 'Rosy' },
        ]}
      />
    </StoryBlock>

    <StoryBlock title="AvatarGroup with names">
      <AvatarGroup
        avatars={[
          { photoURL: 'https://i.pravatar.cc/100?u=1', name: 'Bobby' },
          { photoURL: 'https://i.pravatar.cc/100?u=2', name: 'Johnny' },
          { photoURL: 'https://i.pravatar.cc/100?u=3', name: 'Rosy' },
        ]}
        displayNames
      />
    </StoryBlock>
  </>
);
