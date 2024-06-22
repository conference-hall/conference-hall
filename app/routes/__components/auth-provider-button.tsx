import { cx } from 'class-variance-authority';

import { GitHubIcon } from '~/design-system/icons/GitHubIcon.tsx';
import { GoogleIcon } from '~/design-system/icons/GoogleIcon.tsx';
import { TwitterIcon } from '~/design-system/icons/TwitterIcon.tsx';

const PROVIDERS = {
  google: { style: 'bg-[#EA2533] focus-visible:outline-[#EA2533]', label: 'Google', icon: GoogleIcon },
  twitter: { style: 'bg-[#1D9BF0] focus-visible:outline-[#1D9BF0]', label: 'Twitter', icon: TwitterIcon },
  github: { style: 'bg-[#24292F] focus-visible:outline-[#24292F]', label: 'GitHub', icon: GitHubIcon },
};

type Props = {
  provider: keyof typeof PROVIDERS;
  onClick: (provider: string) => Promise<void>;
};

export function AuthProviderButton({ provider, onClick }: Props) {
  const Icon = PROVIDERS[provider].icon;

  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      className={cx(
        'flex w-full items-center justify-center gap-3 rounded-md px-3 py-1.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        PROVIDERS[provider].style,
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-semibold leading-6">{PROVIDERS[provider].label}</span>
    </button>
  );
}
