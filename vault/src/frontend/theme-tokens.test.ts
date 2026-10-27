import {parse, wcagContrast} from 'culori'
import {describe, expect, test} from 'bun:test'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

/**
 * Guards against theme drift between the vault, desktop, and web apps.
 *
 * Shared @shm/ui components are styled with Tailwind utilities that resolve
 * to theme tokens. The palette lives in a single shared file,
 * `@shm/ui/theme.css` (variants and base styles in `@shm/ui/base.css`), and
 * every app imports both — that is what keeps the apps visually identical.
 * These tests fail if an app stops importing the shared files, if an app
 * redefines a token the shared theme owns (which is how the palettes drifted
 * apart in the first place), or if the vault's `file:` dependency copy of the
 * shared files has gone stale (run `bun install` in vault/).
 */

const dir = import.meta.dir // vault/src/frontend
const uiSrc = resolve(dir, '../../../frontend/packages/ui/src')

const appStylesheets = {
  vault: resolve(dir, 'styles.css'),
  desktop: resolve(dir, '../../../frontend/apps/desktop/src/tailwind.css'),
  web: resolve(dir, '../../../frontend/apps/web/app/tailwind.css'),
}

const themeCss = readFileSync(resolve(uiSrc, 'theme.css'), 'utf8')
const themeDeclarations = {
  light: themeCss.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '',
  dark: themeCss.match(/\.dark\s*\{([^}]*)\}/)?.[1] ?? '',
}

/** Custom-property definitions (`--name:`), as opposed to `var(--name)` usages. */
function definedTokens(css: string): Set<string> {
  const names = new Set<string>()
  for (const match of css.matchAll(/(^|[{;\s])(--[a-z0-9-]+)\s*:/gm)) {
    names.add(match[2]!)
  }
  return names
}

function resolveThemeToken(name: string, mode: keyof typeof themeDeclarations, resolving = new Set<string>()): string {
  if (resolving.has(name)) {
    throw new Error(`Circular theme token reference: --${name}`)
  }

  const declaration =
    themeDeclarations[mode].match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim() ??
    (mode === 'dark' ? themeDeclarations.light.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim() : undefined)

  if (!declaration) {
    throw new Error(`Theme token --${name} is not defined for ${mode} mode`)
  }

  const reference = declaration.match(/^var\((--[\w-]+)\)$/)
  if (!reference) {
    return declaration
  }

  resolving.add(name)
  return resolveThemeToken(reference[1]!.slice(2), mode, resolving)
}

describe('theme token contract', () => {
  const ownedTokens = definedTokens(themeCss)

  test('the shared theme defines the tokens', () => {
    expect(ownedTokens.size).toBeGreaterThan(50)
    expect(ownedTokens.has('--input')).toBe(true)
  })

  for (const [app, cssPath] of Object.entries(appStylesheets)) {
    const css = readFileSync(cssPath, 'utf8')

    test(`the ${app} app imports the shared theme and base styles`, () => {
      expect(css).toContain("@import '@shm/ui/theme.css'")
      expect(css).toContain("@import '@shm/ui/base.css'")
    })

    test(`the ${app} app does not redefine tokens the shared theme owns`, () => {
      const redefined = [...definedTokens(css)].filter((token) => ownedTokens.has(token)).sort()
      expect(redefined).toEqual([])
    })
  }

  for (const file of ['theme.css', 'base.css']) {
    test(`the vault's node_modules copy of ${file} matches the source`, () => {
      const source = readFileSync(resolve(uiSrc, file), 'utf8')
      const copy = readFileSync(resolve(dir, `../../node_modules/@shm/ui/src/${file}`), 'utf8')
      expect(copy).toBe(source)
    })
  }

  const contrastRequirements = [
    {foreground: 'foreground', background: 'background', minimum: 4.5},
    {foreground: 'primary-foreground', background: 'primary', minimum: 4.5},
    {foreground: 'sidebar-primary-foreground', background: 'sidebar-primary', minimum: 4.5},
    {foreground: 'destructive-foreground', background: 'destructive', minimum: 4.5},
    {foreground: 'muted-foreground', background: 'background', minimum: 4.5},
    {foreground: 'muted-foreground', background: 'card', minimum: 4.5},
    {foreground: 'link', background: 'background', minimum: 4.5},
    {foreground: 'link', background: 'card', minimum: 4.5},
    {foreground: 'primary', background: 'background', minimum: 4.5},
    {foreground: 'primary', background: 'card', minimum: 4.5},
    {foreground: 'ring', background: 'background', minimum: 3},
    {foreground: 'ring', background: 'card', minimum: 3},
    {foreground: 'input-border', background: 'background', minimum: 3},
    {foreground: 'input-border', background: 'card', minimum: 3},
  ]

  for (const mode of ['light', 'dark'] as const) {
    for (const {foreground, background, minimum} of contrastRequirements) {
      test(`${mode} --${foreground} / --${background} ≥ ${minimum}:1`, () => {
        const foregroundColor = parse(resolveThemeToken(foreground, mode))
        const backgroundColor = parse(resolveThemeToken(background, mode))

        if (!foregroundColor || !backgroundColor) {
          throw new Error(`Could not parse --${foreground} or --${background} as a color`)
        }

        expect(wcagContrast(foregroundColor, backgroundColor)).toBeGreaterThanOrEqual(minimum)
      })
    }
  }
})
