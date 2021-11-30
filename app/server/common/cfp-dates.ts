export type CfpState = 'CLOSED' | 'OPENED' | 'FINISHED'

function isConferenceOpened(start?: Date | null, end?: Date | null) {
  if (!start || !end) return false
  const today = new Date()
  return today >= start && today <= end
}

function isConferenceFinished(end?: Date | null) {
  if (!end) return false
  const today = new Date()
  return today > end
}

function isMeetupOpened(start?: Date | null) {
  if (!start) return false
  const today = new Date()
  return today >= start
}

export function getCfpState(type: string, start?: Date | null, end?: Date | null) : CfpState {
  if (type === 'MEETUP') {
    if (isMeetupOpened(start)) return 'OPENED'
  }
  if (type === 'CONFERENCE') {
    if (isConferenceOpened(start, end)) return 'OPENED'
    if (isConferenceFinished(end)) return 'FINISHED'
  }
  return 'CLOSED'
}