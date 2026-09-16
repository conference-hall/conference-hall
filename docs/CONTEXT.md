# CONTEXT — Domain Glossary

The ubiquitous language of Conference Hall: a SaaS platform for managing **CFPs**
(Calls for Papers) and speaker submissions for conferences and meetups. Speakers
submit talks to events; organizers review, deliberate, schedule, and communicate.

This file is the domain dictionary — the terms a newcomer is most
likely to misread. It deliberately avoids tech and architecture; for those see
`CLAUDE.md` and the topic docs under `docs/` (`database.md`, `authorization.md`,
`routes.md`, …). When naming a domain concept in code, an issue, or a test, use the
term as defined here and don't drift to synonyms.

---

## Identity & Teams

- **User** — A global platform account (auth, email, profile: bio, company,
  socialLinks, locale). Email is unique platform-wide. A single User can act as a
  speaker, a reviewer, and an organizer depending on context.

- **Team** — A group of organizers that owns events. Has a unique `slug` and an
  invitation code for joining. All organizer work happens in the context of a team.

- **Team member / Team role** — A User's membership in a team, carrying one role:
  **OWNER**, **MEMBER**, or **REVIEWER** (roughly: full admin, organizer, read-only
  reviewer). See `docs/authorization.md` for the exact capability matrix — don't
  duplicate it elsewhere.

- **Team access request** — A pending request (PENDING/ACCEPTED/REJECTED) to be
  granted access to a team, approved out-of-band.

- **Admin** — Platform-level superuser (`User.admin`), distinct from team roles.
  Governs the `admin` feature area, not a team.

## Events & CFP

- **Event** — A conference or meetup (`EventType` = CONFERENCE | MEETUP) owned by a
  team. Has a unique `slug`, a `visibility` (PUBLIC | PRIVATE), a timezone, and CFP
  dates. The unit speakers submit to and organizers manage.

- **CFP** (Call for Papers) — The submission window, bounded by `cfpStart`/`cfpEnd`.
  **CFP-open semantics differ by event type**: a CONFERENCE is open only _between_
  start and end; a MEETUP is open from `cfpStart` onward with no end. Speakers cannot
  submit when the CFP is closed.

- **Format** — An organizer-defined **presentation mode** for an event (e.g. Talk,
  Workshop, Lightning, Panel) — _how_ it's delivered. A proposal may require one,
  allow several, or none (`formatsRequired` / `formatsAllowMultiple`). A format may
  carry an optional `durationInMinutes`, shown to speakers at submission. It is
  informational: the schedule does not read it.

- **Category** — An organizer-defined **topic/track** for an event (e.g. Backend,
  Mobile, UX) — _what_ it's about. Same optional/multiple rules as Format. Format and
  Category are parallel but distinct taxonomies; don't conflate them. A category may
  carry an optional free hex `color`, used organizer-side only: it fills the proposal
  badge, and linking a proposal to a schedule session copies the color of its first
  category (by `order`) onto that session.

- **Tag** (proposal tag) — An organizer-created, colored label applied to proposals
  for internal organization (e.g. "Keynote", "Needs review"). Per-event.

- **Survey** — A per-event questionnaire answered by a speaker; organizers configure
  the questions, speakers submit answers (free-form JSON). Distinct from reviews.

## Talks & Proposals

- **Talk** — A **reusable piece of content** authored by a User (the creator) and
  optionally shared with co-speakers. Lives in the speaker's talk library,
  independent of any event; can be archived. A Talk can exist without ever being
  submitted.

- **Proposal** — A Talk **submitted to a specific event** (the `[talkId, eventId]`
  pair is unique). Created as a **draft** (`isDraft = true`) and finalized on
  **submit**, which assigns a per-event `proposalNumber`. A Proposal carries its own
  copy of title/abstract/level plus event-specific data (formats, categories, tags).
  Organizers may also create a proposal directly, with no backing Talk (`talkId`
  null). Treat Talk = source content, Proposal = its event-scoped submission.

- **Speaker** — Overloaded term. In a **Talk** context it means a **User**; in a
  **Proposal** context it means an **EventSpeaker** (see below). Be explicit about
  which one when it matters.

- **EventSpeaker** — A **per-event copy of a speaker's profile**, synced from the
  User when a proposal is saved/submitted. It decouples a proposal's speaker info
  from later edits to the global User profile, can be edited per event, and may exist
  without a linked User (`userId` null), e.g. an invited co-speaker.

- **Invitation code** — A shareable code to grant co-editing/joining. Exists
  separately on **Talk** (invite co-speakers to a talk), **Proposal** (invite
  co-speakers to a submission), and **Team** (invite members). Don't assume one code
  type covers another.

## Review & Deliberation

- **Review** — One reviewer's assessment of one proposal (unique per
  reviewer+proposal). Carries a **feeling** (POSITIVE | NEGATIVE | NEUTRAL |
  NO_OPINION — a quick sentiment) and an optional numeric **note** (a score). The two
  are independent.

- **Dismiss (a review)** — An organizer action (`dismissedAt`) that excludes a
  reviewer's input from summaries and charts without deleting it — a soft removal,
  e.g. for a conflict of interest.

- **Deliberation** — The organizers' process of **deciding** a proposal's outcome.
  Captured by `deliberationStatus` (PENDING | ACCEPTED | REJECTED). "Deliberation" =
  the decision, not the speaker's response.

- **Publication** — The separate step of **revealing** the deliberation result to the
  speaker (`publicationStatus` = NOT_PUBLISHED | PUBLISHED). Organizers can decide
  privately, then publish selectively. A decision is not visible to the speaker until
  published.

- **Confirmation** — The **speaker's RSVP** after an accepted result is published
  (`confirmationStatus` = PENDING | CONFIRMED | DECLINED). Only meaningful once the
  proposal is ACCEPTED and PUBLISHED.

- **Proposal lifecycle** — These three status fields are independent, applied in
  order: _deliberation_ (decide) → _publication_ (reveal) → _confirmation_ (speaker
  responds). A draft sits before all of them.

- **Speaker-facing status** — A single status shown to the speaker (e.g. `Draft`,
  `Submitted`, `DeliberationPending`, `AcceptedByOrganizers`, `RejectedByOrganizers`,
  `ConfirmedBySpeaker`, `DeclinedBySpeaker`), **computed** from the three fields above
  plus CFP state. Derived, not stored.

## Conversations

- **Conversation** — A message thread attached to a proposal. Exactly one per
  `(proposal, type)`. Two types:
  - **Proposal–speaker conversation** (`PROPOSAL_SPEAKER_CONVERSATION`) — between
    speakers and organizers, visible to both. Toggled per event by
    `speakersConversationEnabled`.
  - **Proposal review comments** (`PROPOSAL_REVIEW_COMMENTS`) — organizer-only
    internal discussion during deliberation; speakers never see it.

- **Participant / Message / Reaction** — A Conversation has participants (role SPEAKER
  or ORGANIZER), messages (type TEXT or SYSTEM, the latter machine-generated), and
  emoji reactions on messages.

## Schedule

- **Schedule** — An event's timetable, with its own timezone and display bounds.

- **Schedule time**: The wall-clock time of a Schedule in its own timezone. The server
  and the wire speak UTC; everything an organizer sees or drags speaks Schedule time.

- **Track** — A parallel stream within a schedule (e.g. a room or stage). A Schedule
  always keeps at least one Track: a save that would leave it without one is refused.

- **Session** — A time slot within a track. May be linked to a proposal (a scheduled
  talk) or be a non-talk slot (break, keynote) with just a name/color.

- **Session conflict**: Two Sessions of the same Track whose time slots overlap. A
  Schedule never holds a conflict. Placing a new Session and swapping two Sessions are
  refused when they would create one. Moving a Session and resizing a Session are
  adjusted instead, and are refused only when the requested start leaves no room for a
  Session of minimum length.

- **Placement**: The result of positioning a Session in a Track. One of three: the
  Session is _placed_ where it was asked to go, it is _adjusted_, meaning placed with
  its end clamped to the start of the next Session in the Track or to a minimum length,
  or it is _refused_ because of a Session conflict.

- **Session mutation**: A change requested on a Session by an organizer: adding one,
  updating one, swapping two, or deleting one. A mutation is _pending_ from the moment
  it is requested until the Schedule confirms it; the Schedule is shown as if pending
  mutations were already applied.

- **Session draft**: A Session being drawn by an organizer over the free slots of a
  Track, extended slot by slot until the pointer is released, at which point it becomes
  a Session mutation.

- **Gesture**: A pointer-driven action of an organizer on the Schedule: moving a
  Session, resizing one, swapping two, or drawing a Session draft. While it lasts, a
  gesture points at a _gesture target_: the Track and the Schedule time the gesture
  designates, which is the top edge of the dragged Session (or of its resize handle)
  for a move or a resize, and the pointer for a draft. Releasing a move on a target
  occupied by another Session is a swap; on a free target it is a move. Each gesture
  ends as a Session mutation, or is refused by the Placement rule.

## Schedule autofill

- **Autofill**: Filling Sessions of a Schedule with Proposals in one operation,
  instead of placing them one by one. An Autofill never creates, moves, resizes or
  deletes a Session: it only links Proposals to Sessions that already exist.

- **Assignment**: The pairing of one Proposal with one Session. Distinct from a
  Placement: an Assignment says _which talk_ a Session holds, a Placement says _where
  and when_ that Session sits.

- **Vacant session**: A Session with neither a Proposal nor a name. Only a Vacant
  session receives an Assignment. A non-talk slot (a break, a named keynote) is never
  touched by an Autofill, even though it holds no Proposal.

- **Scheduled / unscheduled (a Proposal)**: A Proposal is _scheduled_ when a Session
  of the Schedule is linked to it, and _unscheduled_ otherwise.

- **Eligible proposal**: A Proposal an Autofill may assign: it is unscheduled and it
  matches the proposal states of the Autofill scope.

- **Autofill scope**: The organizer's choice of what one Autofill may write: the days,
  the Tracks, and the proposal states. It yields the two sets the operation works on,
  the Vacant sessions and the Eligible proposals. The scope bounds what an Autofill
  writes; it never bounds what an Assignment rule reads.

- **Assignment rule**: A rule that rejects a candidate Assignment. It is evaluated
  against the whole Schedule, days and Tracks outside the Autofill scope included. A
  rule is either _fixed_, always applied, or _optional_, enabled by the organizer for
  that Autofill. Two fixed rules exist:
  - **Single assignment**: a Proposal holds at most one Assignment in the Schedule.
  - **Speaker overlap**: one speaker never holds two Sessions whose time slots
    overlap, across Tracks included. Distinct from a Session conflict, which is about
    two Sessions of a single Track whoever their speakers are.

- **Autofill reset**: Clearing the Proposal of every filled Session of the Autofill
  scope before filling, so that the Autofill starts from Vacant sessions only. Without
  it, an Autofill leaves the Sessions already filled alone. A reset never touches a
  non-talk slot.

- **Autofill report**: The account of one Autofill: the Assignments written, the Vacant
  sessions left vacant, and the Eligible proposals left unscheduled. A partial result
  is the normal case, not a failure.
