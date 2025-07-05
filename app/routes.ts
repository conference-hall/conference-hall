import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Homepage
  index('./features/event-search/event-search.tsx'),

  // Authentication pages
  route('auth/login', './features/auth/signin.tsx'),
  route('auth/logout', './features/auth/signout.tsx'),
  route('auth/signup', './features/auth/signup.tsx'),
  route('auth/reset-password', './features/auth/reset-password.tsx'),
  route('auth/forgot-password', './features/auth/reset-password-sent.tsx'),
  route('auth/email-verification', './features/auth/email-verification-sent.tsx'),
  route('auth/verify-email', './features/auth/email-verification-link.tsx'),

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
  route('invite/proposal/:code', './features/event-participation/proposal-invitation/proposal-invitation.tsx'),
  route('invite/talk/:code', './features/speaker/talk-invitation/talk-invitation.tsx'),
  route('invite/team/:code', './features/team-management/team-invitation/team-invitation.tsx'),

  // Notifications pages
  route('notifications', './features/notifications/notifications.tsx'),

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
    route('new', './features/event-management/creation/layout.tsx', [
      index('./features/event-management/creation/1-type-step.tsx'),
      route('type/:type', './features/event-management/creation/2-event-step.tsx'),
      route(':event/details', './features/event-management/creation/3-details-step.tsx'),
      route(':event/cfp', './features/event-management/creation/4-cfp-step.tsx'),
    ]),

    // Team event pages
    route(':event', './features/event-management/layout.tsx', { id: 'team-current-event' }, [
      route('overview', './features/event-management/overview/overview.tsx', [
        index('./features/event-management/overview/overview.cfp.tsx'),
        route('reviewers', './features/event-management/overview/overview.reviewers.tsx'),
        route('reviews', './features/event-management/overview/overview.reviews.tsx'),
      ]),

      // Event review pages
      route('reviews', './features/event-management/proposals/proposals.tsx'),
      route('reviews/:proposal', './features/event-management/proposals/proposal.tsx'),
      route('reviews/autocomplete', './features/event-management/proposals/autocomplete.tsx'),

      // Event speakers page
      route('speakers', './features/event-management/speakers/speakers.tsx'),
      route('speakers/:speaker', './features/event-management/speakers/speaker.tsx'),

      // Event publication pages
      route('publication', './features/event-management/publication/publication.tsx'),

      // Event schedule pages
      route('schedule', './features/event-management/schedule/new.tsx'),
      route('schedule/:day', './features/event-management/schedule/schedule.tsx'),
      route('schedule/export/json', './features/event-management/schedule/export.json.tsx'),

      // Event settings pages
      route('settings', './features/event-management/settings/settings.tsx', [
        index('./features/event-management/settings/general.tsx'),
        route('cfp', './features/event-management/settings/cfp.tsx'),
        route('tracks', './features/event-management/settings/tracks.tsx'),
        route('tags', './features/event-management/settings/tags.tsx'),
        route('customize', './features/event-management/settings/customize.tsx'),
        route('survey', './features/event-management/settings/survey.tsx'),
        route('review', './features/event-management/settings/review.tsx'),
        route('notifications', './features/event-management/settings/notifications.tsx'),
        route('emails', './features/event-management/settings/emails.tsx'),
        route('emails/:template', './features/event-management/settings/emails.template.tsx'),
        route('integrations', './features/event-management/settings/integrations.tsx'),
        route('api', './features/event-management/settings/api.tsx'),
      ]),
    ]),
  ]),

  // Event reviews export routes
  route('team/:team/:event/export/json', './features/event-management/proposals-export/json.tsx'),
  route('team/:team/:event/export/csv', './features/event-management/proposals-export/csv.tsx'),
  route('team/:team/:event/export/cards', './features/event-management/proposals-export/cards.tsx'),
  route('team/:team/:event/export/open-planner', './features/event-management/proposals-export/open-planner.tsx'),

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
  route('docs', './app-platform/legal/layout.tsx', [
    route('terms', './app-platform/legal/terms.tsx'),
    route('privacy', './app-platform/legal/privacy.tsx'),
    route('license', './app-platform/legal/license.tsx'),
  ]),

  // Api pages
  route('api/v1/event/:event', './features/event-management/proposals-api/proposals-api.tsx'),
  route('api/v1/event/:event/schedule', './features/event-management/schedule-api/schedule-api.tsx'),

  // Locales route
  route('locales/:lng/:ns', './app-platform/locales.ts'),

  // SEO routes
  route('robots.txt', './app-platform/seo/robots.txt.ts'),
  route('sitemap.xml', './app-platform/seo/sitemap.xml.ts'),

  // File storage route
  route('storage/:filename', './app-platform/storage/storage.ts'),

  // Healthcheck route
  route('healthcheck', './app-platform/healthcheck.ts'),

  // Catch-all route
  route('*', './app-platform/404.tsx'),
] satisfies RouteConfig;
