/**
 * The site ships a single colour scheme.
 *
 * Two alternatives (a neutral graphite base, and a blue-black base with a
 * transparent cutout logo) were built and deployed for comparison, then
 * retired when this one was chosen. They remain in git history up to commit
 * ecbc098 if either is ever wanted again.
 *
 * The indirection here is kept deliberately: the theme resolves through one
 * function and colour lives entirely in CSS custom properties, so re-theming
 * later is a token change rather than a component rewrite.
 */
export type ThemeName = 'red';

export function resolveTheme(): ThemeName {
  return 'red';
}

export function logoPath(_theme: ThemeName = 'red'): string {
  return '/assets/logo-red-hero.png';
}

export function logoNavPath(_theme: ThemeName = 'red'): string {
  return '/assets/logo-red-nav.png';
}

export function faviconPath(_theme: ThemeName = 'red'): string {
  return '/assets/favicon-red.png';
}
