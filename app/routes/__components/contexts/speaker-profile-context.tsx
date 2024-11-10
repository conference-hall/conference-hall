import { type ReactNode, createContext, useContext } from 'react';
import type { loader } from '~/routes/speaker+/_layout.tsx';
import type { SerializeFrom } from '~/types/remix.types.ts';

type SpeakerProfile = SerializeFrom<typeof loader>;

const SpeakerProfileContext = createContext<SpeakerProfile | undefined>(undefined);

type SpeakerProfileProviderProps = {
  children: ReactNode;
  profile: SpeakerProfile;
};

export const SpeakerProfileProvider = ({ children, profile }: SpeakerProfileProviderProps) => {
  return <SpeakerProfileContext.Provider value={profile}>{children}</SpeakerProfileContext.Provider>;
};

/**
 * Returns the speaker profile under the route "speaker+"
 * @returns {SpeakerProfile}
 */
export function useSpeakerProfile(): SpeakerProfile {
  const context = useContext(SpeakerProfileContext);
  if (context === undefined) {
    throw new Error('useSpeakerProfile must be used within a SpeakerProfileProvider');
  }
  return context;
}
