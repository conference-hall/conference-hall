import { createContext, type ReactNode, useContext } from 'react';
import type { loader } from '~/features/speaker/layout.tsx';
import type { SerializeFrom } from '~/shared/types/react-router.types.ts';

type SpeakerProfile = SerializeFrom<typeof loader>;
type SpeakerProfileProviderProps = { children: ReactNode; profile: SpeakerProfile };

const SpeakerProfileContext = createContext<SpeakerProfile | undefined>(undefined);

export const SpeakerProfileProvider = ({ children, profile }: SpeakerProfileProviderProps) => {
  return <SpeakerProfileContext.Provider value={profile}>{children}</SpeakerProfileContext.Provider>;
};

/**
 * Returns the speaker profile
 * @returns {SpeakerProfile}
 */
export function useSpeakerProfile(): SpeakerProfile {
  const context = useContext(SpeakerProfileContext);
  if (context === undefined) {
    throw new Error('useSpeakerProfile must be used within a SpeakerProfileProvider');
  }
  return context;
}
