class TalkCoSpeakersActions {
  inviteSpeaker() {
    cy.findByRole('button', { name: 'Add a co-speaker' }).click();
    return cy.findByLabelText('Copy invitation link');
  }

  closeInviteSpeakerModal() {
    cy.findByRole('button', { name: 'Close' }).click();
  }

  speakersList() {
    return cy.findByRole('list', { name: 'Speakers' }).children();
  }

  speaker(name: string | RegExp) {
    if (typeof name === 'string') {
      return cy.findByRole('button', { name: `View ${name} profile` });
    } else {
      return cy.findByRole('button', { name });
    }
  }

  openSpeakerModal(name: string) {
    this.speaker(name).click();
    cy.findByText('Biography').should('exist');
  }

  withinSpeakerProfile(name: RegExp, callback: () => void) {
    this.speaker(name).click();
    return cy.findByRole('dialog', { name: name }).within(callback);
  }

  closeSpeakerModal() {
    cy.findByRole('button', { name: 'Close' }).click();
  }

  removeCoSpeaker(speakerName: string) {
    cy.findByRole('button', { name: `Remove "${speakerName}" from the talk` }).click();
  }
}

export default TalkCoSpeakersActions;
