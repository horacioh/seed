import groupBy from 'lodash/groupBy'

import {BlockSchema} from '../../../core'
import {SlashMenuItem} from './SlashMenuItem'
import {SlashMenuProps} from './SlashMenuPositioner'

export function DefaultSlashMenu<BSchema extends BlockSchema>(props: SlashMenuProps<BSchema>) {
  const groups = groupBy(props.filteredItems, (i) => i.group)
  const selectedItem = props.filteredItems[props.keyboardHoveredItemIndex]

  return (
    <div
      id={props.listboxId}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Slash menu keeps active-descendant focus in the editor
      role="listbox"
      aria-label="Block suggestions"
      aria-orientation="vertical"
      className="bg-popover text-popover-foreground max-h-72 w-full overflow-y-auto rounded-md border p-1 shadow-md"
    >
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          <div aria-hidden="true" className="text-muted-foreground px-2 py-1 text-xs">
            {group}
          </div>
          {items.map((item) => (
            <SlashMenuItem
              key={item.name}
              id={`${props.listboxId}-option-${encodeURIComponent(item.name)}`}
              icon={item.icon}
              name={item.name}
              hint={item.hint}
              shortcut={item.shortcut}
              isSelected={selectedItem?.name === item.name}
              onSelect={() => props.itemCallback(item)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
