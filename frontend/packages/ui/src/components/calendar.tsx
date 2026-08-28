import * as stylex from '@stylexjs/stylex'
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon} from 'lucide-react'
import * as React from 'react'
import {DayButton, DayPicker, getDefaultClassNames} from 'react-day-picker'
import {Button, buttonVariants} from '../button'
import {cn} from '../utils'
const styles_6 = stylex.create({
  s7f43887e: {
    '--cell-size': 'calc(0.25rem * 8)',
  },
})
const styles_5 = stylex.create({
  sccc5bb1c: {
    ':has(:focus)': {
      borderColor: 'var(--ring)',
    },
  },
  sba4745f5: {
    ':has(:focus)': {
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
  },
  s174fdaa7: {
    ':is([class~="group/day"][data-focused="true"] *)': {
      borderColor: 'var(--ring)',
    },
  },
  sf1c5af08: {
    ':is(.dark *)': {
      ':hover': {
        color: 'var(--accent-foreground)',
      },
    },
  },
  sff411716: {
    ':is([class~="group/day"][data-focused="true"] *)': {
      position: 'relative',
    },
  },
  sb042f59c: {
    ':is([class~="group/day"][data-focused="true"] *)': {
      zIndex: 10,
    },
  },
  s1785890a: {
    ':is([class~="group/day"][data-focused="true"] *)': {
      boxShadow: '0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)',
    },
  },
})
const styles_4 = stylex.create({
  s6a2edbb: {
    width: 'fit-content',
  },
  s2ffff9: {
    display: 'flex',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  sd174fc89: {
    flexDirection: 'row',
  },
  sdef3facc: {
    position: 'relative',
  },
  scdbaf625: {
    width: '100%',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fa: {
    gap: '0.25rem',
  },
  s67010d77: {
    position: 'absolute',
  },
  s696c5b8: {
    top: '0px',
  },
  se911c76b: {
    insetInline: '0px',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s4402e919: {
    width: 'var(--cell-size)',
    height: 'var(--cell-size)',
  },
  sb7477897: {
    ':is([aria-disabled="true"])': {
      opacity: '50%',
    },
  },
  s1aa13: {
    padding: '0px',
  },
  sa145969: {
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s6edcc940: {
    height: 'var(--cell-size)',
  },
  sbc647ee0: {
    paddingInline: 'var(--cell-size)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s11bd0ee9: {
    borderColor: 'var(--input)',
  },
  s8a6c2ac8: {
    boxShadow: 'var(--shadow-xs)',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  s74a79380: {
    inset: '0px',
  },
  s765a26ee: {
    opacity: '0%',
  },
  s3484a1: {
    paddingLeft: 'calc(0.25rem * 2)',
  },
  s349b26: {
    paddingRight: '0.25rem',
  },
  s18c13: {
    height: 'calc(0.25rem * 8)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sb42feb5d: {
    flex: '1',
  },
  s14e67425: {
    fontWeight: '400',
  },
  sd2f73be2: {
    fontSize: '0.8rem',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  sb2b8030f: {
    width: 'var(--cell-size)',
  },
  sb42244d4: {
    height: '100%',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  sd91e9c32: {
    aspectRatio: '1 / 1',
  },
  s775901b8: {
    borderTopLeftRadius: 'calc(var(--radius) - 2px)',
    borderBottomLeftRadius: 'calc(var(--radius) - 2px)',
  },
  s856bab52: {
    backgroundColor: 'var(--accent)',
  },
  s775ae258: {
    borderRadius: '0',
  },
  s775bbbf2: {
    borderTopRightRadius: 'calc(var(--radius) - 2px)',
    borderBottomRightRadius: 'calc(var(--radius) - 2px)',
  },
  s830f1186: {
    color: 'var(--accent-foreground)',
  },
  s387c55ed: {
    ':is([data-selected="true"])': {
      borderRadius: '0',
    },
  },
  s55df892a: {
    ':is([aria-selected="true"])': {
      color: 'var(--muted-foreground)',
    },
  },
  s54eab79d: {
    opacity: '50%',
  },
  s8ea4bfad: {
    visibility: 'hidden',
  },
})
const styles_3 = stylex.create({
  s73cc0900: {
    ':is([data-selected-single="true"])': {
      backgroundColor: 'var(--primary)',
    },
  },
  s7c3c33c8: {
    ':is([data-selected-single="true"])': {
      color: 'var(--primary-foreground)',
    },
  },
  s75fc0167: {
    ':is([data-range-middle="true"])': {
      backgroundColor: 'var(--accent)',
    },
  },
  s56c0591: {
    ':is([data-range-middle="true"])': {
      color: 'var(--accent-foreground)',
    },
  },
  s9ec0efe8: {
    ':is([data-range-start="true"])': {
      backgroundColor: 'var(--primary)',
    },
  },
  sb1ebc5e0: {
    ':is([data-range-start="true"])': {
      color: 'var(--primary-foreground)',
    },
  },
  s52ad4e8f: {
    ':is([data-range-end="true"])': {
      backgroundColor: 'var(--primary)',
    },
  },
  s8536ae99: {
    ':is([data-range-end="true"])': {
      color: 'var(--primary-foreground)',
    },
  },
  seeceeecc: {
    ':is([data-range-end="true"])': {
      borderRadius: 'calc(var(--radius) - 2px)',
    },
  },
  s23ec5823: {
    ':is([data-range-middle="true"])': {
      borderRadius: '0',
    },
  },
  s3ae29025: {
    ':is([data-range-start="true"])': {
      borderRadius: 'calc(var(--radius) - 2px)',
    },
  },
  s76cff0c7: {
    ':is([data-range-end="true"])': {
      borderTopRightRadius: 'calc(var(--radius) - 2px)',
      borderBottomRightRadius: 'calc(var(--radius) - 2px)',
    },
  },
  sc7de5a6: {
    ':is([data-range-start="true"])': {
      borderTopLeftRadius: 'calc(var(--radius) - 2px)',
      borderBottomLeftRadius: 'calc(var(--radius) - 2px)',
    },
  },
})
const styles_2 = stylex.create({
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  s33bac594: {
    minWidth: 'var(--cell-size)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sd91e9c32: {
    aspectRatio: '1 / 1',
  },
  s1ad2f7fb: {
    width: 'auto',
    height: 'auto',
  },
  scdbaf625: {
    width: '100%',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s14e67425: {
    fontWeight: '400',
  },
  s8075599f: {
    lineHeight: '1',
  },
})
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s2f49e065: {
    display: 'flex',
    width: 'var(--cell-size)',
    height: 'var(--cell-size)',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
})
/** The calendar grid itself: full width with collapsed cell borders. */
const calendarTableStyles = stylex.create({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
})
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        stylex.props(styles_2.s436dc7b6, styles_2.s1aa16).className || '',
        stylex.props(styles_6.s7f43887e).className || '',
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', {
            month: 'short',
          }),
        ...formatters,
      }}
      classNames={{
        root: cn(stylex.props(styles_4.s6a2edbb).className || '', defaultClassNames.root),
        months: cn(
          stylex.props(styles_4.s2ffff9, styles_4.s5d936fd, styles_4.s67e351ac, styles_4.sd174fc89, styles_4.sdef3facc)
            .className || '',
          defaultClassNames.months,
        ),
        month: cn(
          stylex.props(styles_4.s2ffff9, styles_4.s67e351ac, styles_4.scdbaf625, styles_4.s5d936fd).className || '',
          defaultClassNames.month,
        ),
        nav: cn(
          stylex.props(
            styles_4.s2ffff9,
            styles_4.sc6ed1702,
            styles_4.s5d936fa,
            styles_4.scdbaf625,
            styles_4.s67010d77,
            styles_4.s696c5b8,
            styles_4.se911c76b,
            styles_4.sc1a629cb,
          ).className || '',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({
            variant: buttonVariant,
          }),
          stylex.props(styles_4.s4402e919, styles_4.sb7477897, styles_4.s1aa13, styles_4.sa145969).className || '',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({
            variant: buttonVariant,
          }),
          stylex.props(styles_4.s4402e919, styles_4.sb7477897, styles_4.s1aa13, styles_4.sa145969).className || '',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          stylex.props(
            styles_4.s2ffff9,
            styles_4.sc6ed1702,
            styles_4.sce22ca32,
            styles_4.s6edcc940,
            styles_4.scdbaf625,
            styles_4.sbc647ee0,
          ).className || '',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          stylex.props(
            styles_4.scdbaf625,
            styles_4.s2ffff9,
            styles_4.sc6ed1702,
            styles_4.sab7cc6fa,
            styles_4.s129e46b3,
            styles_4.sce22ca32,
            styles_4.s6edcc940,
            styles_4.sf4676641,
          ).className || '',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          stylex.props(
            styles_4.sdef3facc,
            styles_4.sad8c742c,
            styles_4.s11bd0ee9,
            styles_4.s8a6c2ac8,
            styles_4.sf79988b7,
          ).className || '',
          stylex.props(styles_5.sccc5bb1c, styles_5.sba4745f5).className || '',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          stylex.props(styles_4.s67010d77, styles_4.s74a79380, styles_4.s765a26ee).className || '',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          stylex.props(styles_4.sa145969, styles_4.s129e46b3).className || '',
          captionLayout === 'label'
            ? stylex.props(styles_4.sab7cc6fa).className || ''
            : stylex.props(
                styles_4.sf79988b7,
                styles_4.s3484a1,
                styles_4.s349b26,
                styles_4.s2ffff9,
                styles_4.sc6ed1702,
                styles_4.s5d936fa,
                styles_4.sab7cc6fa,
                styles_4.s18c13,
              ).className || '',
          defaultClassNames.caption_label,
        ),
        table: stylex.props(calendarTableStyles.table).className || '',
        weekdays: cn(stylex.props(styles_4.s2ffff9).className || '', defaultClassNames.weekdays),
        weekday: cn(
          stylex.props(
            styles_4.sf2718385,
            styles_4.sf79988b7,
            styles_4.sb42feb5d,
            styles_4.s14e67425,
            styles_4.sd2f73be2,
            styles_4.sa145969,
          ).className || '',
          defaultClassNames.weekday,
        ),
        week: cn(
          stylex.props(styles_4.s2ffff9, styles_4.scdbaf625, styles_4.s33458c).className || '',
          defaultClassNames.week,
        ),
        week_number_header: cn(
          stylex.props(styles_4.sa145969, styles_4.sb2b8030f).className || '',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          stylex.props(styles_4.sd2f73be2, styles_4.sa145969, styles_4.sf2718385).className || '',
          defaultClassNames.week_number,
        ),
        day: cn(
          stylex.props(
            styles_4.sdef3facc,
            styles_4.scdbaf625,
            styles_4.sb42244d4,
            styles_4.s1aa13,
            styles_4.s65e234f5,
            styles_4.sd91e9c32,
            styles_4.sa145969,
          ).className || '',
          'calendar-day group/day',
          defaultClassNames.day,
        ),
        range_start: cn(
          stylex.props(styles_4.s775901b8, styles_4.s856bab52).className || '',
          defaultClassNames.range_start,
        ),
        range_middle: cn(stylex.props(styles_4.s775ae258).className || '', defaultClassNames.range_middle),
        range_end: cn(
          stylex.props(styles_4.s775bbbf2, styles_4.s856bab52).className || '',
          defaultClassNames.range_end,
        ),
        today: cn(
          stylex.props(styles_4.s856bab52, styles_4.s830f1186, styles_4.sf79988b7, styles_4.s387c55ed).className || '',
          defaultClassNames.today,
        ),
        outside: cn(stylex.props(styles_4.sf2718385, styles_4.s55df892a).className || '', defaultClassNames.outside),
        disabled: cn(stylex.props(styles_4.sf2718385, styles_4.s54eab79d).className || '', defaultClassNames.disabled),
        hidden: cn(stylex.props(styles_4.s8ea4bfad).className || '', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({className, rootRef, ...props}) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({className, orientation, ...props}) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn(stylex.props(styles.sca3de968).className || '', className)} {...props} />
            )
          }
          if (orientation === 'right') {
            return (
              <ChevronRightIcon className={cn(stylex.props(styles.sca3de968).className || '', className)} {...props} />
            )
          }
          return (
            <ChevronDownIcon className={cn(stylex.props(styles.sca3de968).className || '', className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({children, ...props}) => {
          return (
            <td {...props}>
              <div className={stylex.props(styles.s2f49e065).className || ''}>{children}</div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}
function CalendarDayButton({className, day, modifiers, ...props}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-slot="calendar-day-button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        stylex.props(
          styles_2.s33bac594,
          styles_2.s2ffff9,
          styles_2.sd91e9c32,
          styles_2.s1ad2f7fb,
          styles_2.scdbaf625,
          styles_2.s67e351ac,
          styles_2.s5d936fa,
          styles_2.s14e67425,
          styles_2.s8075599f,
        ).className || '',
        stylex.props(
          styles_3.s73cc0900,
          styles_3.s7c3c33c8,
          styles_3.s75fc0167,
          styles_3.s56c0591,
          styles_3.s9ec0efe8,
          styles_3.sb1ebc5e0,
          styles_3.s52ad4e8f,
          styles_3.s8536ae99,
          styles_3.seeceeecc,
          styles_3.s23ec5823,
          styles_3.s3ae29025,
          styles_3.s76cff0c7,
          styles_3.sc7de5a6,
        ).className || '',
        stylex.props(styles_5.s174fdaa7, styles_5.sf1c5af08, styles_5.sff411716, styles_5.sb042f59c, styles_5.s1785890a)
          .className || '',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}
export {Calendar, CalendarDayButton}
