import { HeartIcon } from '@heroicons/react/24/outline';

export function SponsorLink() {
  return (
    <a
      href="https://github.com/sponsors/conference-hall"
      target="_blank"
      className="group flex items-center gap-x-3 rounded-md p-2 px-3 text-sm leading-6 shadow-xs bg-white font-medium text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      rel="noreferrer"
    >
      <HeartIcon
        className="h-6 w-6 shrink-0 fill-red-300 group-hover:fill-red-400 text-transparent"
        aria-hidden="true"
      />
      Support Conference Hall
    </a>
  );
}
