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
  allow several, or none (`formatsRequired` / `formatsAllowMultiple`).

- **Category** — An organizer-defined **topic/track** for an event (e.g. Backend,
  Mobile, UX) — _what_ it's about. Same optional/multiple rules as Format. Format and
  Category are parallel but distinct taxonomies; don't conflate them.

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

- **Unread message** — For a Participant, a Message authored by someone else whose
  `createdAt` is later than the Participant's `lastSeenAt` (never-seen ⇒ all are
  unread). This is the same "new" set surfaced in-app; the digest reuses it.

- **Conversation digest** — A periodic email summarizing a recipient's unread
  messages, batched across all their conversations into a single message. It is a
  _catch-up_ notification (here's what you missed), not a per-message alert. Sending a
  digest does **not** mark messages read in-app; what's already been _digested_ is
  tracked separately from what's been _seen_.

## Schedule

- **Schedule** — An event's timetable, with its own timezone and display bounds.

- **Track** — A parallel stream within a schedule (e.g. a room or stage).

- **Session** — A time slot within a track. May be linked to a proposal (a scheduled
  talk) or be a non-talk slot (break, keynote) with just a name/color.
