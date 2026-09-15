export type ThemeName = 'red' | 'graphite';

const THEMES: readonly ThemeName[] = ['red', 'graphite'] as const;

/**
 * Resolves the active colour variant from NEXT_PUBLIC_THEME.
 * Defaults to 'red' when unset or unrecognised so a misconfigured
 * deployment renders a complete site rather than an unthemed one.
 */
export function resolveTheme(): ThemeName {
  const raw = process.env.NEXT_PUBLIC_THEME;
  return THEMES.includes(raw as ThemeName) ? (raw as ThemeName) : 'red';
}

export function logoPath(theme: ThemeName): string {
  return theme === 'red' ? '/assets/logo-red-hero.png' : '/assets/logo-blue-hero.png';
}

export function logoNavPath(theme: ThemeName): string {
  return theme === 'red' ? '/assets/logo-red-nav.png' : '/assets/logo-blue-nav.png';
}
