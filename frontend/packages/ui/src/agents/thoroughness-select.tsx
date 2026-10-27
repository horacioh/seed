import {
  DEFAULT_THOROUGHNESS,
  THOROUGHNESS_DESCRIPTIONS,
  THOROUGHNESS_LABELS,
  THOROUGHNESS_LEVELS,
  THOROUGHNESS_PRESETS,
  type Thoroughness,
} from '@seed-hypermedia/agents-protocol'
import {Tooltip} from '@shm/ui/tooltip'
import {Layers} from 'lucide-react'
import {cn} from '@shm/ui/utils'
import {useId} from 'react'

/**
 * Segmented picker for a delegation preset: Quick / Normal / Deep, Normal being the default. It
 * always shows a concrete preset — the caller resolves "unset" to whatever applies (the agent's
 * own, or `normal`) before passing `value`.
 */
export function ThoroughnessPicker({
  value,
  onChange,
  disabled,
  compact,
}: {
  value: Thoroughness | undefined
  onChange: (value: Thoroughness) => void
  disabled?: boolean
  compact?: boolean
}) {
  const effective = value ?? DEFAULT_THOROUGHNESS
  const limits = THOROUGHNESS_PRESETS[effective]
  const groupName = useId()
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground flex items-center gap-1 text-xs">
          <Layers className="size-3" />
          Thoroughness
        </span>
        <span className="text-muted-foreground text-xs">
          depth {limits.maxDepth} · {limits.maxChildren}/turn
        </span>
      </div>
      <fieldset className="bg-muted/60 m-0 flex rounded-md border-0 p-0.5 text-xs">
        <legend className="sr-only">Thoroughness</legend>
        {THOROUGHNESS_LEVELS.map((level) => {
          const isActive = level === effective
          const preset = THOROUGHNESS_PRESETS[level]
          return (
            <Tooltip
              key={level}
              content={`${THOROUGHNESS_DESCRIPTIONS[level]} Depth ${preset.maxDepth}, ${preset.maxChildren} helpers per turn.`}
            >
              <label
                className={cn(
                  'focus-within:ring-ring relative flex-1 cursor-pointer rounded-sm px-2 py-1 text-center font-medium transition-colors focus-within:ring-2',
                  disabled && 'cursor-not-allowed opacity-50',
                  isActive ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={level}
                  checked={isActive}
                  disabled={disabled}
                  onChange={() => onChange(level)}
                  className="peer sr-only"
                />
                {THOROUGHNESS_LABELS[level]}
              </label>
            </Tooltip>
          )
        })}
      </fieldset>
      {!compact ? <span className="text-muted-foreground text-xs">{THOROUGHNESS_DESCRIPTIONS[effective]}</span> : null}
    </div>
  )
}
