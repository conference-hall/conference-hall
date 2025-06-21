import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  // Homepage
  index('./routes/index.tsx'),

  // Authentication pages
  route('auth/login', './routes/auth/login.tsx'),
  route('auth/logout', './routes/auth/logout.tsx'),
  route('auth/signup', './routes/auth/signup.tsx'),
  route('auth/forgot-password', './routes/auth/forgot-password.tsx'),
  route('auth/reset-password', './routes/auth/reset-password.tsx'),
  route('auth/email-verification', './routes/auth/email-verification.tsx'),
  route('auth/verify-email', './routes/auth/verify-email.tsx'),

  // Event pages
  route(':event', './routes/$event/_layout.tsx', [
    index('./routes/$event/index.tsx'),
    route('proposals', './routes/$event/proposals.index.tsx'),
    route('proposals/:proposal', './routes/$event/proposals.$proposal.index.tsx'),
    route('survey', './routes/$event/survey.tsx'),

    // Event submission pages
    route('submission', './routes/$event/submission/_layout.tsx', [
      index('./routes/$event/submission/index.tsx'),
      route(':talk', './routes/$event/submission/$talk.index.tsx'),
      route(':talk/speakers', './routes/$event/submission/$talk.speakers.tsx'),
      route(':talk/tracks', './routes/$event/submission/$talk.tracks.tsx'),
      route(':talk/survey', './routes/$event/submission/$talk.survey.tsx'),
      route(':talk/submit', './routes/$event/submission/$talk.submit.tsx'),
    ]),
  ]),

  // Event legacy pages routing
  route('public/event/:legacyId', './routes/_misc/public.event.$legacyId.tsx'),

  // Invitation pages
  route('invite/proposal/:code', './routes/invite/proposal.$code.tsx'),
  route('invite/talk/:code', './routes/invite/talk.$code.tsx'),
  route('invite/team/:code', './routes/invite/team.$code.tsx'),

  // Notifications pages
  route('notifications', './routes/notifications/index.tsx'),

  // Speaker pages
  route('speaker', './routes/speaker/_layout.tsx', [
    index('./routes/speaker/index.tsx'),
    route('settings', './routes/speaker/settings/layout.tsx', [
      index('./routes/speaker/settings/account.route.tsx'),
      route('profile', './routes/speaker/settings/profile.route.tsx'),
      route('preferences', './routes/speaker/settings/preferences.route.tsx'),
    ]),
    route('talks', './routes/speaker/talks.index.tsx'),
    route('talks/new', './routes/speaker/talks.new.tsx'),
    route('talks/:talk', './routes/speaker/talks.$talk.index.tsx'),
  ]),

  // Team pages
  route('team/new', './routes/team/new.tsx'),
  route('team/request', './routes/team/request.tsx'),
  route('team/:team', './routes/team/$team.tsx', [
    index('./routes/team/$team/index.tsx'),

    // Team settings pages
    route('settings', './routes/team/$team/settings.tsx', [
      index('./routes/team/$team/settings.index.tsx'),
      route('members', './routes/team/$team/settings.members.tsx'),
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
      index('./routes/team.event-management/overview.tsx'),

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
      route('schedule/ai/generate', './routes/team.event-management/schedule/ai.tsx'),
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
  route('admin', './routes/admin/_layout.tsx', [
    index('./routes/admin/index.tsx'),
    route('users', './routes/admin/users.tsx'),
    route('users/:user', './routes/admin/users.$user.tsx'),
    route('teams', './routes/admin/teams.tsx'),
    route('flags', './routes/admin/flags.tsx'),
    route('debug', './routes/admin/debug.tsx'),
    route('debug/heap-snapshot', './routes/admin/debug.heap-snapshot.tsx'),
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
