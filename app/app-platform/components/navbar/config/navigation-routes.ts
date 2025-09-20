import type { TFunction } from 'i18next';

type NavigationRoute = { path: string; back: string; title?: string };
type NavigationConfig = Array<NavigationRoute>;

export function getTeamManagementRoutes(t: TFunction): NavigationConfig {
  return [
    // team management routes
    { path: '/team/:team/settings/*', back: '/team/:team', title: t('common.settings') },
    // event management routes
    { path: '/team/:team/:event/reviews', back: '/team/:team/:event', title: t('event-management.nav.proposals') },
    {
      path: '/team/:team/:event/reviews/new',
      back: '/team/:team/:event/reviews',
      title: t('event-management.proposals.new.title'),
    },
    { path: '/team/:team/:event/reviews/*', back: '/team/:team/:event/reviews', title: t('common.review') },
    { path: '/team/:team/:event/speakers', back: '/team/:team/:event', title: t('event-management.nav.speakers') },
    {
      path: '/team/:team/:event/speakers/new',
      back: '/team/:team/:event/speakers',
      title: t('event-management.speakers.new.title'),
    },
    { path: '/team/:team/:event/speakers/*', back: '/team/:team/:event/speakers', title: t('common.speaker') },
    {
      path: '/team/:team/:event/publication',
      back: '/team/:team/:event',
      title: t('event-management.nav.publication'),
    },
    { path: '/team/:team/:event/settings/*', back: '/team/:team/:event', title: t('common.settings') },
  ];
}

export function getSpeakerRoutes(t: TFunction): NavigationConfig {
  return [
    { path: '/speaker', back: '/', title: t('speaker.nav.activity') },
    { path: '/speaker/talks', back: '/', title: t('speaker.nav.talks') },
    { path: '/speaker/talks/new', back: '/speaker/talks', title: t('talk.library.new') },
    { path: '/speaker/talks/*', back: '/speaker/talks', title: t('common.talk') },
    { path: '/speaker/settings/*', back: '/', title: t('speaker.nav.settings') },
    { path: '/notifications', back: '/', title: t('navbar.user-menu.notifications') },
    { path: '/*', back: '/' },
  ];
}

export function getEventParticipationRoutes(t: TFunction): NavigationConfig {
  return [
    { path: '/:event/survey', back: '/:event', title: t('event.nav.survey') },
    { path: '/:event/proposals', back: '/:event', title: t('event.nav.proposals') },
    { path: '/:event/submission/*', back: '/:event', title: t('event.nav.submit-proposal') },
    { path: '/:event/proposals/*', back: '/:event/proposals', title: t('common.proposal') },
    { path: '/*', back: '/' },
  ];
}

export function getFullscreenRoutes(): NavigationConfig {
  return [
    { path: '/team/:team/new/*', back: '/team/:team' },
    { path: '/*', back: '/' },
  ];
}
