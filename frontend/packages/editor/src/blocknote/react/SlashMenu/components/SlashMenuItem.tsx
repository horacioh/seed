import {ReactNode} from 'react'

export type SlashMenuItemProps = {
  id: string
  icon: ReactNode
  name: string
  hint: string | undefined
  shortcut?: string
  isSelected: boolean
  onSelect: () => void
}

export function SlashMenuItem(props: SlashMenuItemProps) {
  const label = [props.name, props.hint, props.shortcut].filter(Boolean).join(' ')

  return (
    <div
      id={props.id}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Slash options insert blocks while editor focus remains active
      role="option"
      aria-selected={props.isSelected}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={props.onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          props.onSelect()
        }
      }}
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
      data-selected={props.isSelected || undefined}
      title={label}
    >
      <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
        {props.icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{props.name}</span>
      {props.hint && <span className="text-muted-foreground truncate">{props.hint}</span>}
      {props.shortcut && <span className="text-muted-foreground">{props.shortcut}</span>}
    </div>
  )
}
