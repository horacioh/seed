import {Alert, AlertDescription} from '@/frontend/components/ui/alert'

interface ErrorMessageProps {
  message: string
  className?: string
  id?: string
}

/**
 * Displays an error message in a styled alert box.
 */
export function ErrorMessage({message, className = '', id}: ErrorMessageProps) {
  if (!message) return null
  return (
    <Alert id={id} variant="destructive" className={`mb-4 ${className}`}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
