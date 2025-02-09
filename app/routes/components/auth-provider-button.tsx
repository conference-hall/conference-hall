import { cx } from 'class-variance-authority';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { GoogleIcon } from '~/design-system/icons/google-icon.tsx';
import { XIcon } from '~/design-system/icons/x-icon';

const PROVIDERS = {
  google: { style: 'bg-[#EA2533] focus-visible:outline-[#EA2533] text-white', label: 'Google', icon: GoogleIcon },
  x: { style: 'bg-white focus-visible:outline-black text-black border-1 border-black', label: 'X.com', icon: XIcon },
  github: { style: 'bg-[#24292F] focus-visible:outline-[#24292F] text-white', label: 'GitHub', icon: GitHubIcon },
};

export type AuthProvider = keyof typeof PROVIDERS;

type Props = {
  provider: AuthProvider;
  onClick: (provider: AuthProvider) => Promise<void>;
};

export function AuthProviderButton({ provider, onClick }: Props) {
  const Icon = PROVIDERS[provider].icon;

  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      className={cx(
        'flex w-full items-center justify-center gap-3 rounded-md px-3 py-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2',
        PROVIDERS[provider].style,
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-semibold leading-6">{PROVIDERS[provider].label}</span>
    </button>
  );
}
