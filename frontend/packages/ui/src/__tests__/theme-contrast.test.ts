import {parse, wcagContrast} from 'culori'
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe, expect, it} from 'vitest'

const css = readFileSync(resolve(__dirname, '../theme.css'), 'utf8')

function getDeclarations(selector: string) {
  const rule = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))
  expect(rule).not.toBeNull()
  return rule![1]!
}

const declarations = {
  light: getDeclarations(':root'),
  dark: getDeclarations('\\.dark'),
}

function resolveToken(name: string, mode: keyof typeof declarations, resolving = new Set<string>()): string {
  if (resolving.has(name)) {
    throw new Error(`Circular theme token reference: --${name}`)
  }

  const declaration =
    declarations[mode].match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim() ??
    (mode === 'dark' ? declarations.light.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim() : undefined)

  if (!declaration) {
    throw new Error(`Theme token --${name} is not defined for ${mode} mode`)
  }

  const reference = declaration.match(/^var\((--[\w-]+)\)$/)
  if (!reference) {
    return declaration
  }

  resolving.add(name)
  return resolveToken(reference[1]!.slice(2), mode, resolving)
}

const requirements = [
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

const cases = (['light', 'dark'] as const).flatMap((mode) =>
  requirements.map((requirement) => ({mode, ...requirement})),
)

describe('theme token contrast', () => {
  it.each(cases)('$mode --$foreground / --$background ≥ $minimum:1', ({mode, foreground, background, minimum}) => {
    const foregroundColor = parse(resolveToken(foreground, mode))
    const backgroundColor = parse(resolveToken(background, mode))

    if (!foregroundColor || !backgroundColor) {
      throw new Error(`Could not parse --${foreground} or --${background} as a color`)
    }

    expect(wcagContrast(foregroundColor, backgroundColor)).toBeGreaterThanOrEqual(minimum)
  })
})
