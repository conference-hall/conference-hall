import type { ShouldRevalidateFunctionArgs } from 'react-router';

export function shouldRevalidateEventLayout({
  currentUrl,
  nextUrl,
  currentParams,
  formAction,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  const proposalsPath = `/team/${currentParams.team}/${currentParams.event}/proposals`;
  const isProposalsPage = (url: URL) => url.pathname === proposalsPath || url.pathname.startsWith(`${proposalsPath}/`);
  const targetUrl = formAction ? new URL(formAction, currentUrl) : nextUrl;

  if (isProposalsPage(currentUrl) && isProposalsPage(targetUrl)) return false;
  return defaultShouldRevalidate;
}
