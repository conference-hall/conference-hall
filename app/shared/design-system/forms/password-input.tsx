import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { Link } from '~/shared/design-system/links.tsx';
import { Label, Subtitle } from '~/shared/design-system/typography.tsx';
import type { SubmissionError } from '~/types/errors.types.ts';

type PasswordInputProps = {
  label?: string;
  name?: string;
  value: string;
  error?: SubmissionError;
  forgotPasswordPath?: string;
  isNewPassword?: boolean;
  onChange: (password: string) => void;
};

export function PasswordInput({
  label,
  name,
  value,
  error,
  forgotPasswordPath,
  isNewPassword,
  onChange,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const ToggleIcon = showPassword ? EyeSlashIcon : EyeIcon;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label htmlFor={name || 'password'}>{label || t('common.password.label')}</Label>
        {forgotPasswordPath ? (
          <Link to={forgotPasswordPath} weight="semibold">
            {t('common.password.forgot')}
          </Link>
        ) : null}
      </div>

      <Input
        name={name || 'password'}
        placeholder={t('common.password.placeholder')}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={isNewPassword ? 'new-password' : 'current-password'}
        description={isNewPassword ? t('common.password.description') : undefined}
        error={error}
        required
      >
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="rounded-full self-center size-7 cursor-pointer p-1 mr-1"
        >
          <span className="sr-only">{t('common.password.toggle-visibility')}</span>
          <ToggleIcon className="size-5 shrink-0" aria-hidden="true" />
        </button>
      </Input>

      {isNewPassword ? <StrengthMeter password={value} /> : null}
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  const strength = calculateStrength(password);
  if (!strength) return null;

  return (
    <div className="mt-2 flex items-center gap-4">
      <div className="h-1.5 bg-slate-200 rounded-md w-full">
        <div className={cx('h-full rounded-md', strength.bg)} style={{ width: password ? `${strength.value}%` : 0 }} />
      </div>
      <Subtitle size="xs" weight="semibold" className={cx('shrink-0', { [strength.text]: password })}>
        {t(`common.password.strength.${strength.key}`)}
      </Subtitle>
    </div>
  );
}

const defaultOptions = [
  { key: 'too-weak', value: 25, minDiversity: 0, minLength: 1, text: 'text-red-600', bg: 'bg-red-600' },
  { key: 'weak', value: 50, minDiversity: 2, minLength: 6, text: 'text-orange-600', bg: 'bg-orange-600' },
  { key: 'strong', value: 75, minDiversity: 4, minLength: 8, text: 'text-yellow-600', bg: 'bg-yellow-600' },
  { key: 'very-strong', value: 100, minDiversity: 4, minLength: 10, text: 'text-green-600', bg: 'bg-green-600' },
] as const;

const rules = [
  { key: 'lowercase', regex: /[a-z]/ },
  { key: 'uppercase', regex: /[A-Z]/ },
  { key: 'number', regex: /[0-9]/ },
  { key: 'symbol', regex: /[^a-zA-Z0-9]/ },
] as const;

function calculateStrength(password: string) {
  const length = password.length;
  if (length === 0) return defaultOptions[0];

  const contains = rules.filter((rule) => rule.regex.test(password)).map((rule) => rule.key);

  const result = defaultOptions
    .filter((option) => contains.length >= option.minDiversity)
    .filter((option) => length >= option.minLength);

  return result.at(-1);
}
