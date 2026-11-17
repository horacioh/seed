import {emailTheme} from './components/EmailLayout'

/** Accessible foreground and background colors shared by email templates, checked against WCAG AA in tests. */
export const EMAIL_PALETTE = {
  brand: emailTheme.primary,
  muted: emailTheme.muted,
  text: emailTheme.heading,
  subtleText: emailTheme.body,
  bodyBackground: emailTheme.pageBackground,
  surface: emailTheme.cardBackground,
  subtleSurface: emailTheme.quoteBackground,
  commentSurface: '#f9f9f9',
  codeBackground: '#f2f2f2',
  footerBackground: emailTheme.footerBackground,
  accentBlue: '#275c9d',
  accentRed: '#c62828',
} as const
