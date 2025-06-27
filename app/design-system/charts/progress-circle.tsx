// Tremor Raw ProgressCircle [v0.0.0]
import { cx } from 'class-variance-authority';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressCircleProps extends Omit<React.SVGProps<SVGSVGElement>, 'value'> {
  value?: number;
  max?: number;
  showAnimation?: boolean;
  radius?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export const ProgressCircle = ({
  value = 0,
  max = 100,
  radius = 32,
  strokeWidth = 6,
  showAnimation = true,
  className,
  children,
  ref,
  ...props
}: ProgressCircleProps) => {
  const { t } = useTranslation();
  const safeValue = Math.min(max, Math.max(value, 0));
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (safeValue / max) * circumference;

  const background = 'stroke-indigo-200';
  const circle = 'stroke-indigo-500';

  return (
    <div className={cx('relative')}>
      <svg
        role="img"
        ref={ref}
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        className={cx('-rotate-90 transform', className)}
        aria-label={t('common.progress-bar')}
        data-max={max}
        data-value={safeValue ?? null}
        {...props}
      >
        <circle
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke=""
          strokeLinecap="round"
          className={cx('transition-colors ease-linear', background)}
        />
        {safeValue >= 0 ? (
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            fill="transparent"
            stroke=""
            strokeLinecap="round"
            className={cx(
              'transition-colors ease-linear',
              circle,
              showAnimation && 'transform-gpu transition-all duration-300 ease-in-out',
            )}
          />
        ) : null}
      </svg>
      <div className={cx('absolute inset-0 flex items-center justify-center')}>{children}</div>
    </div>
  );
};
