export type CfpState = 'CLOSED' | 'OPENED' | 'FINISHED';

type CallForPaperEvent = {
  type: 'CONFERENCE' | 'MEETUP';
  cfpStart: Date | null;
  cfpEnd: Date | null;
};

export class CallForPaper {
  constructor(public event: CallForPaperEvent) {}

  get isOpen() {
    return this.state === 'OPENED';
  }

  get isClosed() {
    return this.state !== 'OPENED';
  }

  get state(): CfpState {
    const { type } = this.event;
    if (type === 'MEETUP' && this.isMeetupOpened()) return 'OPENED';
    if (type === 'CONFERENCE' && this.isConferenceOpened()) return 'OPENED';
    if (type === 'CONFERENCE' && this.isConferenceFinished()) return 'FINISHED';
    return 'CLOSED';
  }

  private isConferenceOpened() {
    const { cfpStart, cfpEnd } = this.event;

    if (!cfpStart || !cfpEnd) return false;
    const today = new Date();
    return today >= cfpStart && today <= cfpEnd;
  }

  private isConferenceFinished() {
    const { cfpEnd } = this.event;
    if (!cfpEnd) return false;
    const today = new Date();
    return today > cfpEnd;
  }

  private isMeetupOpened() {
    const { cfpStart } = this.event;
    if (!cfpStart) return false;
    const today = new Date();
    return today >= cfpStart;
  }
}
