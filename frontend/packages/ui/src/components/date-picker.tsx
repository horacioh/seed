'use client'

import * as stylex from '@stylexjs/stylex'
import {Calendar as CalendarIcon, X} from 'lucide-react'
import * as React from 'react'
import {Button} from '../button'
import {cn} from '../utils'
import {Calendar} from './calendar'
import {Popover, PopoverContent, PopoverTrigger} from './popover'
const styles = stylex.create({
  scdbaf625: {
    width: '100%',
  },
  se1f6a2b6: {
    width: '100%',
    justifyContent: 'flex-start',
    textAlign: 'left',
    fontWeight: '400',
  },
  sef1c143e: {
    marginRight: 'calc(0.25rem * 2)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sf3d4bcb8: {
    width: 'auto',
    padding: 'calc(0.25rem * 0)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
export interface DatePickerProps {
  value: string
  onValue: (value: string) => void
  onReset: () => void
  placeholder?: string
  className?: string
}
export function DatePicker({value, onValue, onReset, placeholder = 'Select date', className}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse the input value to a Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }, [value])

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onReset()
    } else {
      // Convert to the same format as the original SimpleDatePicker
      // Adjust the local date to UTC date (maintaining the original behavior)
      const adjustedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      onValue(adjustedDate.toISOString().slice(0, 10))
    }
    setOpen(false)
  }
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    onReset()
  }
  return (
    <div className={cn('flex w-full min-w-full items-center sm:min-w-0', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className={stylex.props(styles.scdbaf625).className || ''}>
          <Button
            className={cn(stylex.props(styles.se1f6a2b6).className || '', !selectedDate && 'text-muted-foreground')}
          >
            <CalendarIcon className={stylex.props(styles.sef1c143e).className || ''} />
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={stylex.props(styles.sf3d4bcb8).className || ''} align="start">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} captionLayout="dropdown" />
        </PopoverContent>
      </Popover>
      {selectedDate && (
        <Button onClick={handleReset}>
          <X className={stylex.props(styles.sca3de968).className || ''} />
        </Button>
      )}
    </div>
  )
}
