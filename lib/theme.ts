export type ThemeName = 'red' | 'graphite' | 'chrome';

const THEMES: readonly ThemeName[] = ['red', 'graphite', 'chrome'] as const;

/**
 * Resolves the active colour variant from NEXT_PUBLIC_THEME.
 * Defaults to 'red' when unset or unrecognised so a misconfigured
 * deployment renders a complete site rather than an unthemed one.
 */
export function resolveTheme(): ThemeName {
  const raw = process.env.NEXT_PUBLIC_THEME;
  return THEMES.includes(raw as ThemeName) ? (raw as ThemeName) : 'red';
}

const HERO_LOGO: Record<ThemeName, string> = {
  red: '/assets/logo-red-hero.png',
  graphite: '/assets/logo-blue-hero.png',
  // Transparent cutout: the badge floats on the page rather than sitting on
  // its own navy tile.
  chrome: '/assets/logo-clear-hero.png',
};

const NAV_LOGO: Record<ThemeName, string> = {
  red: '/assets/logo-red-nav.png',
  graphite: '/assets/logo-blue-nav.png',
  chrome: '/assets/logo-clear-nav.png',
};

const FAVICON: Record<ThemeName, string> = {
  red: '/assets/favicon-red.png',
  graphite: '/assets/favicon-graphite.png',
  chrome: '/assets/favicon-clear.png',
};

export function logoPath(theme: ThemeName): string {
  return HERO_LOGO[theme];
}

export function logoNavPath(theme: ThemeName): string {
  return NAV_LOGO[theme];
}

export function faviconPath(theme: ThemeName): string {
  return FAVICON[theme];
}

/**
 * The transparent-logo themes need no rounded tile behind the mark; the
 * tiled variants do, so the baked-in navy square reads as deliberate.
 */
export function logoNeedsPlate(theme: ThemeName): boolean {
  return theme !== 'chrome';
}
