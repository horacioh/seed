import type {ReactNode} from 'react'

const spacing = {
  '0': 'p-0',
  '1': 'p-1',
  '2': 'p-2',
  '3': 'p-3',
  '4': 'p-4',
  '6': 'p-6',
  '8': 'p-8',
  '12': 'p-12',
} as const
const gaps = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
  '12': 'gap-12',
} as const
const backgrounds = {
  none: '',
  background: 'bg-background',
  muted: 'bg-muted',
  card: 'bg-card',
  accent: 'bg-accent',
  'primary-tint': 'bg-primary/10',
} as const
const textColors = {
  default: '',
  'muted-foreground': 'text-muted-foreground',
  primary: 'text-primary',
} as const
const fontSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
} as const
const weights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const
const radii = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
} as const
const borders = {none: '', default: 'border border-border'} as const
const maxWidths = {
  none: '',
  prose: 'max-w-prose',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
} as const

type StyleOverrides = {
  padding?: keyof typeof spacing
  gap?: keyof typeof gaps
  background?: keyof typeof backgrounds
  textColor?: keyof typeof textColors
  fontSize?: keyof typeof fontSizes
  weight?: keyof typeof weights
  radius?: keyof typeof radii
  border?: keyof typeof borders
  maxWidth?: keyof typeof maxWidths
}

function classesForStyle(style: StyleOverrides = {}) {
  return [
    style.padding ? spacing[style.padding] : '',
    style.gap ? gaps[style.gap] : '',
    style.background ? backgrounds[style.background] : '',
    style.textColor ? textColors[style.textColor] : '',
    style.fontSize ? fontSizes[style.fontSize] : '',
    style.weight ? weights[style.weight] : '',
    style.radius ? radii[style.radius] : '',
    style.border ? borders[style.border] : '',
    style.maxWidth ? maxWidths[style.maxWidth] : '',
  ]
    .filter(Boolean)
    .join(' ')
}

const options = <T extends string>(values: readonly T[]) => values.map((value) => ({label: value, value}))
const styleOptions = {
  padding: options(['0', '1', '2', '3', '4', '6', '8', '12']),
  gap: options(['0', '1', '2', '3', '4', '6', '8', '12']),
  background: options(['none', 'background', 'muted', 'card', 'accent', 'primary-tint']),
  textColor: options(['default', 'muted-foreground', 'primary']),
  fontSize: options(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']),
  weight: options(['normal', 'medium', 'semibold', 'bold']),
  radius: options(['none', 'sm', 'md', 'lg', 'xl']),
  border: options(['none', 'default']),
  maxWidth: options(['none', 'prose', '2xl', '4xl']),
} as const

function StyleField({value = {}, onChange}: {value?: StyleOverrides; onChange: (value: StyleOverrides) => void}) {
  const count = Object.values(value).filter((item) => item && item !== 'none' && item !== 'default').length
  const fields = Object.entries(styleOptions) as Array<[keyof StyleOverrides, Array<{label: string; value: string}>]>
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs">{count} style overrides</span>
      {fields.map(([key, options]) => (
        <label key={key} className="flex items-center justify-between gap-2 text-xs">
          <span className="capitalize">{key === 'textColor' ? 'Text colour' : key}</span>
          <select
            className="bg-background max-w-32 rounded border px-2 py-1 text-xs"
            value={value[key] ?? ''}
            onChange={(event) => onChange({...value, [key]: event.target.value || undefined})}
          >
            <option value="">Default</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  )
}

/** Shared Puck inspector field for theme-token overrides. */
export const styleField = {type: 'custom', label: 'Style', render: StyleField} as any

/** Adds the selected theme-token classes to a component wrapper. */
export function styledRender<P extends {style?: StyleOverrides}>(
  render: (props: Omit<P, 'style'>) => ReactNode,
  fullHeight = false,
): (props: P) => ReactNode {
  return ({style, ...props}) => (
    <div className={[fullHeight ? 'h-full min-h-0' : '', classesForStyle(style)].filter(Boolean).join(' ')}>
      {render(props as Omit<P, 'style'>)}
    </div>
  )
}

/** Adds a shared Style inspector field and wrapper to a Puck component. */
export function withStyle(component: any, fullHeight = false) {
  return {
    ...component,
    fields: {...component.fields, style: styleField},
    defaultProps: {...component.defaultProps, style: {}},
    render: styledRender(component.render, fullHeight),
  }
}
