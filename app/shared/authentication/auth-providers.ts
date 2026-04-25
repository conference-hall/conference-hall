import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { GoogleIcon } from '~/design-system/icons/google-icon.tsx';

export type ProviderId = 'google' | 'github';

type ProviderInfo = { id: ProviderId; label: string; icon: React.ComponentType<{ className?: string }> };

export const PROVIDERS: Array<ProviderInfo> = [
  { id: 'google', label: 'Google', icon: GoogleIcon },
  { id: 'github', label: 'GitHub', icon: GitHubIcon },
];
