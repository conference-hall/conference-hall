import { type SVGProps, useId } from 'react';

export function ConferenceHallLogo(props: SVGProps<SVGSVGElement>) {
  const clipPathId = useId();
  return (
    <svg
      role="presentation"
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${clipPathId})`}>
        <rect x="512" y="128" width="512" height="128" rx="64" transform="rotate(180 512 128)" />
        <path d="M256 328C216.235 328 184 295.765 184 256V256C184 216.235 216.235 184 256 184V184C295.764 184 328 216.235 328 256V256C328 295.764 295.765 328 256 328V328Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M241 512L271 512C404.101 512 512 412.025 512 288.701L512 243.299C512 210.549 483.346 184 448 184C412.654 184 384 210.549 384 243.299L384 274.802C384 340.303 326.692 393.401 256 393.401C185.308 393.401 128 340.303 128 274.802L128 243.299C128 210.549 99.3462 184 64 184C28.6537 184 -2.63537e-05 210.549 -2.34905e-05 243.299L-1.95215e-05 288.701C-8.74005e-06 412.025 107.899 512 241 512Z"
        />
      </g>
      <defs>
        <clipPath id={clipPathId}>
          <rect width="512" height="512" fill="white" transform="translate(512 512) rotate(180)" />
        </clipPath>
      </defs>
    </svg>
  );
}
