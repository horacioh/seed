import {cn} from '@/frontend/utils'

interface StepIndicatorProps {
  /** The current active step (1-based). */
  currentStep: number
  /** Total number of steps. Defaults to 4. */
  totalSteps?: number
}

/** Displays step progress with a non-visual step label. */
export function StepIndicator({currentStep, totalSteps = 4}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">
        Step {currentStep} of {totalSteps}
      </span>
      <div aria-hidden="true" className="flex items-center gap-1.5">
        {Array.from({length: totalSteps}, (_, i) => (
          <div
            key={i}
            className={cn(
              'size-2.5 rounded-full',
              i + 1 === currentStep
                ? 'bg-brand outline-foreground outline outline-2 outline-offset-2'
                : 'bg-muted-foreground',
            )}
          />
        ))}
      </div>
    </div>
  )
}
