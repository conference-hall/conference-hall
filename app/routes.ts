import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Homepage
  index('./features/event-search/event-search.tsx'),

  // Authentication pages
  route('auth/login', './routes/auth/login.tsx'),
  route('auth/logout', './routes/auth/logout.tsx'),
  route('auth/signup', './routes/auth/signup.tsx'),
  route('auth/forgot-password', './routes/auth/forgot-password.tsx'),
  route('auth/reset-password', './routes/auth/reset-password.tsx'),
  route('auth/email-verification', './routes/auth/email-verification.tsx'),
  route('auth/verify-email', './routes/auth/verify-email.tsx'),

  // Event pages
  route(':event', './features/event-participation/layout.tsx', [
    index('./features/event-participation/event-page/event-page.tsx'),
    route('proposals', './features/event-participation/speaker-proposals/speaker-proposals.tsx'),
    route('proposals/:proposal', './features/event-participation/speaker-proposals/speaker-proposal.tsx'),
    route('survey', './features/event-participation/speaker-survey/speaker-survey.tsx'),

    // Event submission pages
    route('submission', './features/event-participation/cfp-submission/cfp-submission.tsx', [
      index('./features/event-participation/cfp-submission/1-selection.tsx'),
      route(':talk', './features/event-participation/cfp-submission/2-talk.tsx'),
      route(':talk/speakers', './features/event-participation/cfp-submission/3-speakers.tsx'),
      route(':talk/tracks', './features/event-participation/cfp-submission/4-tracks.tsx'),
      route(':talk/survey', './features/event-participation/cfp-submission/5-survey.tsx'),
      route(':talk/submit', './features/event-participation/cfp-submission/6-submit.tsx'),
    ]),
  ]),

  // Event legacy pages routing
  route('public/event/:legacyId', './features/event-participation/event-page/event-page.legacy.tsx'),

  // Invitation pages
  route('invite/proposal/:code', './routes/invite/proposal.$code.tsx'),
  route('invite/talk/:code', './routes/invite/talk.$code.tsx'),
  route('invite/team/:code', './routes/invite/team.$code.tsx'),

  // Notifications pages
  route('notifications', './routes/notifications/index.tsx'),

  // Speaker pages
  route('speaker', './features/speaker/layout.tsx', [
    index('./features/speaker/activity/activity.tsx'),
    route('settings', './features/speaker/settings/settings.tsx', [
      index('./features/speaker/settings/settings.account.tsx'),
      route('profile', './features/speaker/settings/settings.profile.tsx'),
      route('preferences', './features/speaker/settings/settings.preferences.tsx'),
    ]),
    route('talks', './features/speaker/talk-library/talks.tsx'),
    route('talks/new', './features/speaker/talk-library/talks.new.tsx'),
    route('talks/:talk', './features/speaker/talk-library/talk.tsx'),
  ]),

  // Team pages
  route('team/new', './features/team-management/creation/new.tsx'),
  route('team/request', './features/team-management/creation/request-access.tsx'),
  route('team/:team', './features/team-management/layout.tsx', [
    index('./features/team-management/event-list/event-list.tsx'),

    // Team settings pages
    route('settings', './features/team-management/settings/settings.tsx', [
      index('./features/team-management/settings/settings.general.tsx'),
      route('members', './features/team-management/settings/settings.members.tsx'),
    ]),

    // Team event creation pages
    route('new', './routes/team.event-creation/_layout.tsx', [
      index('./routes/team.event-creation/1-type-step.tsx'),
      route('type/:type', './routes/team.event-creation/2-event-step.tsx'),
      route(':event/details', './routes/team.event-creation/3-details-step.tsx'),
      route(':event/cfp', './routes/team.event-creation/4-cfp-step.tsx'),
    ]),

    // Team event pages
    route(':event', './routes/team.event-management/_layout.tsx', { id: 'team-current-event' }, [
      route('overview', './routes/team.event-management/overview.tsx', [
        index('./routes/team.event-management/overview/cfp-tab.tsx'),
        route('reviewers', './routes/team.event-management/overview/reviewers-tab.tsx'),
        route('reviews', './routes/team.event-management/overview/reviews-tab.tsx'),
      ]),

      // Event review pages
      route('reviews', './routes/team.event-management/proposals.tsx'),
      route('reviews/:proposal', './routes/team.event-management/proposals/$proposal.tsx'),
      route('reviews/autocomplete', './routes/team.event-management/proposals/autocomplete.tsx'),

      // Event speakers page
      route('speakers', './routes/team.event-management/speakers.tsx'),
      route('speakers/:speaker', './routes/team.event-management/speakers/$speaker.tsx'),

      // Event publication pages
      route('publication', './routes/team.event-management/publication.tsx'),

      // Event schedule pages
      route('schedule', './routes/team.event-management/schedule.tsx'),
      route('schedule/:day', './routes/team.event-management/schedule/$day.tsx'),
      route('schedule/export/json', './routes/team.event-management/schedule/export.json.tsx'),

      // Event settings pages
      route('settings', './routes/team.event-management/settings.tsx', [
        index('./routes/team.event-management/settings/general.tsx'),
        route('cfp', './routes/team.event-management/settings/cfp.tsx'),
        route('tracks', './routes/team.event-management/settings/tracks.tsx'),
        route('tags', './routes/team.event-management/settings/tags.tsx'),
        route('customize', './routes/team.event-management/settings/customize.tsx'),
        route('survey', './routes/team.event-management/settings/survey.tsx'),
        route('review', './routes/team.event-management/settings/review.tsx'),
        route('notifications', './routes/team.event-management/settings/notifications.tsx'),
        route('emails', './routes/team.event-management/settings/emails.tsx'),
        route('emails/:template', './routes/team.event-management/settings/emails.template.tsx'),
        route('integrations', './routes/team.event-management/settings/integrations.tsx'),
        route('api', './routes/team.event-management/settings/api.tsx'),
      ]),
    ]),
  ]),

  // Event reviews export routes
  route('team/:team/:event/export/json', './routes/team.event-management/proposals/exports/json.tsx'),
  route('team/:team/:event/export/csv', './routes/team.event-management/proposals/exports/csv.tsx'),
  route('team/:team/:event/export/cards', './routes/team.event-management/proposals/exports/cards.tsx'),
  route('team/:team/:event/export/open-planner', './routes/team.event-management/proposals/exports/open-planner.tsx'),

  // Admin pages
  route('admin', './features/admin/layout.tsx', [
    index('./features/admin/dashboard/dashboard.tsx'),
    route('users', './features/admin/users/users.tsx'),
    route('users/:user', './features/admin/users/user.tsx'),
    route('teams', './features/admin/teams/teams.tsx'),
    route('flags', './features/admin/feature-flags/feature-flags.tsx'),
    route('debug', './features/admin/debug/debug.tsx'),
    route('debug/heap-snapshot', './features/admin/debug/heap-snapshot.tsx'),
  ]),

  // Docs pages
  route('docs', './routes/docs/_layout.tsx', [
    route('terms', './routes/docs/terms.tsx'),
    route('privacy', './routes/docs/privacy.tsx'),
    route('license', './routes/docs/license.tsx'),
  ]),

  // Api pages
  route('api/v1/event/:event', './routes/api/v1.event.$event.tsx'),
  route('api/v1/event/:event/schedule', './routes/api/v1.event.$event.schedule.tsx'),

  // Locales route
  route('locales/:lng/:ns', './routes/_misc/locales.ts'),

  // SEO routes
  route('robots.txt', './routes/_misc/robots.txt.ts'),
  route('sitemap.xml', './routes/_misc/sitemap.xml.ts'),

  // File storage route
  route('storage/:filename', './routes/_misc/storage.$filename.ts'),

  // Healthcheck route
  route('healthcheck', './routes/_misc/healthcheck.ts'),

  // Catch-all route
  route('*', './routes/_misc/$.tsx'),
] satisfies RouteConfig;
