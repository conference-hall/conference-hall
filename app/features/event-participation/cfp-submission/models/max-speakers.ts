export function isMaxSpeakersReached(speakersCount: number, maxSpeakers: number | null) {
  return maxSpeakers !== null && speakersCount >= maxSpeakers;
}

export function isMaxSpeakersExceeded(speakersCount: number, maxSpeakers: number | null) {
  return maxSpeakers !== null && speakersCount > maxSpeakers;
}
