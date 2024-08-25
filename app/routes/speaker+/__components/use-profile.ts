import { type useLoaderData, useOutletContext } from '@remix-run/react';
import type { loader } from '../_layout.tsx';

type SpeakerProfileData = ReturnType<typeof useLoaderData<typeof loader>>;

export function useProfile() {
  return useOutletContext<{ profile: SpeakerProfileData }>();
}
