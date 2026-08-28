import * as stylex from '@stylexjs/stylex'
import {
  isReasoningLevel,
  modelReasoningSupport,
  REASONING_LEVELS,
  REASONING_LEVEL_DESCRIPTIONS,
  REASONING_LEVEL_LABELS,
  type ReasoningLevel,
} from '@seed-hypermedia/agents-protocol'
import {Tooltip} from '@shm/ui/tooltip'
import {Brain} from 'lucide-react'
const styles_3 = stylex.create({
  sf032ed6c: {
    flexShrink: '0',
  },
})
const styles_2 = stylex.create({
  sdb37c6ff: {
    accentColor: 'var(--primary)',
    height: 'calc(var(--spacing) * 4)',
    width: '100%',
    cursor: 'pointer',
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: 'var(--color-zinc-300)',
      color: 'var(--color-zinc-400)',
      borderColor: 'var(--color-zinc-100)',
      opacity: '50%',
    },
  },
  s50b2d8ba: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
  },
})
const styles = stylex.create({
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sbbe27b4f: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  sf9dfefc3: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s9db229ae: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
  },
})
const OFF_VALUE = '__off__'

/**
 * Discrete reasoning-level slider: leftmost is off (or the provider default
 * when reasoning cannot be disabled), then each level the model accepts.
 * Renders nothing for models without reasoning support. `onChange` fires per
 * step while dragging, so callers that persist should debounce.
 */
export function ReasoningSlider({
  providerType,
  model,
  value,
  onChange,
  disabled,
}: {
  providerType: string | undefined
  model: string
  value: ReasoningLevel | undefined
  onChange: (level: ReasoningLevel | undefined) => void
  disabled?: boolean
}) {
  const support = providerType ? modelReasoningSupport(providerType, model) : null
  if (!support) return null
  const offLabel = support.offBehavior === 'default' ? 'Default' : 'Off'
  const steps: (ReasoningLevel | undefined)[] = [undefined, ...support.levels]
  const index = value && support.levels.includes(value) ? steps.indexOf(value) : 0
  const current = steps[index]
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <div className={stylex.props(styles.sbbe27b4f).className || ''}>
        <span className={stylex.props(styles.sf9dfefc3).className || ''}>
          <Brain className={stylex.props(styles.sca3de967).className || ''} />
          Reasoning
        </span>
        <Tooltip
          content={
            current
              ? REASONING_LEVEL_DESCRIPTIONS[current]
              : support.offBehavior === 'default'
                ? 'The provider decides how much this model reasons.'
                : 'The model answers directly without extra reasoning.'
          }
        >
          <span className={stylex.props(styles.s9db229ae).className || ''}>
            {current ? REASONING_LEVEL_LABELS[current] : offLabel}
          </span>
        </Tooltip>
      </div>
      <input
        type="range"
        aria-label="Reasoning level"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        disabled={disabled}
        onChange={(event) => onChange(steps[Number(event.currentTarget.value)])}
        className={stylex.props(styles_2.sdb37c6ff).className || ''}
      />
      <div className={stylex.props(styles_2.s50b2d8ba).className || ''}>
        {steps.map((step) => (
          <span key={step ?? OFF_VALUE}>{step ? REASONING_LEVEL_LABELS[step] : offLabel}</span>
        ))}
      </div>
    </div>
  )
}

/**
 * Tiny pie-chart glyph encoding the reasoning level as the filled fraction of
 * a circle on the global level scale: off is an empty ring, `xhigh` a full
 * disc. Rendered inline inside the model tag; wrap in a Tooltip where hover
 * help is wanted.
 */
export function ReasoningPie({level, className: _className}: {level: ReasoningLevel | undefined; className?: string}) {
  const rank = level && isReasoningLevel(level) ? REASONING_LEVELS.indexOf(level) + 1 : 0
  const fraction = rank / REASONING_LEVELS.length
  const label = level && isReasoningLevel(level) ? `Reasoning ${REASONING_LEVEL_LABELS[level]}` : 'Reasoning off'
  const c = 7
  const r = 5.5
  let wedge: string | null = null
  if (fraction > 0 && fraction < 1) {
    const angle = 2 * Math.PI * fraction
    const x = c + r * Math.sin(angle)
    const y = c - r * Math.cos(angle)
    wedge = `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`
  }
  return (
    <svg
      viewBox="0 0 14 14"
      width={12}
      height={12}
      role="img"
      aria-label={label}
      className={stylex.props(styles_3.sf032ed6c).className || ''}
    >
      <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth={1.25} opacity={0.45} />
      {fraction >= 1 ? (
        <circle cx={c} cy={c} r={r} fill="currentColor" />
      ) : wedge ? (
        <path d={wedge} fill="currentColor" />
      ) : null}
    </svg>
  )
}

/** Drops a stored reasoning level the newly selected model cannot honor. */
export function coerceReasoningLevel(
  providerType: string | undefined,
  model: string,
  level: ReasoningLevel | undefined,
): ReasoningLevel | undefined {
  if (!level) return undefined
  const support = providerType ? modelReasoningSupport(providerType, model) : null
  if (!support || !support.levels.includes(level)) return undefined
  return level
}
