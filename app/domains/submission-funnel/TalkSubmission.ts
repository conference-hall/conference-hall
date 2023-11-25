export class TalkSubmission {
  constructor(
    private speakerId: string,
    private eventSlug: string,
    private talkId: string,
  ) {}

  static for(speakerId: string, eventSlug: string, talkId: string) {
    return new TalkSubmission(speakerId, eventSlug, talkId);
  }
}
