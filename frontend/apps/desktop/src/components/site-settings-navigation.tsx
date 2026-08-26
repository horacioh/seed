import * as stylex from '@stylexjs/stylex'
import {HMDocURLInput} from '@/components/edit-navigation-popover'
import {useUpdateHomeDocument} from '@/models/site'
import {combine} from '@atlaskit/pragmatic-drag-and-drop/combine'
import {draggable, dropTargetForElements, monitorForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type {HMDocument, HMMetadata, HMNavigationItem, UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {useIsSiteOwner} from '@shm/shared/models/capabilities'
import {useResource} from '@shm/shared/models/entity'
import {Button} from '@shm/ui/button'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {Switch} from '@shm/ui/components/switch'
import {HMIcon} from '@shm/ui/hm-icon'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shm/ui/select-dropdown'
import {Spinner} from '@shm/ui/spinner'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {useResponsiveItems} from '@shm/ui/use-responsive-items'
import {cn} from '@shm/ui/utils'
import {ChevronDown, EllipsisVertical, HelpCircle, Pencil, Plus, Trash} from 'lucide-react'
import {nanoid} from 'nanoid'
import {useEffect, useMemo, useRef, useState} from 'react'

// UI values for the header-layout select.
const styles = stylex.create({
  s4c9e7ebc: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 10)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s196dae7f: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 10)',
  },
  se3309843: {
    height: 'calc(0.25rem * 9)',
    width: 'calc(0.25rem * 56)',
  },
  s4d733c9b: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    height: 'calc(0.25rem * 9)',
    width: 'calc(0.25rem * 72)',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    paddingInline: 'calc(0.25rem * 4)',
  },
  sac428cea: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
  },
  s76b0b3a9: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s380d63c9: {
    display: 'flex',
    alignItems: 'center',
  },
  sb9bd3a30: {
    fontStyle: 'italic',
  },
  sd2daac47: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    overflow: 'hidden',
  },
  s10514f6b: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    opacity: '0%',
  },
  sf8e652db: {
    whiteSpace: 'nowrap',
  },
  s13358127: {
    flexShrink: '0',
    whiteSpace: 'nowrap',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sb136bac9: {
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  scdbaf625: {
    width: '100%',
  },
})
const HEADER_LAYOUTS = [
  {
    value: 'horizontal',
    label: 'Horizontal',
    stored: '' as const,
  },
  {
    value: 'center',
    label: 'Center',
    stored: 'Center' as const,
  },
]

// Order aware equality for nav items (id/text/link).
function navItemsEqual(a: HMNavigationItem[], b: HMNavigationItem[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, i) => item.id === b[i].id && item.text === b[i].text && item.link === b[i].link)
}

// Published nav block.
function readPublishedNav(document: HMDocument): HMNavigationItem[] {
  return (
    document.detachedBlocks?.navigation?.children
      ?.map((child) => {
        const linkBlock = child.block?.type === 'Link' ? child.block : null
        if (!linkBlock) return null
        return {
          id: linkBlock.id,
          type: 'Link',
          text: linkBlock.text || '',
          link: linkBlock.link ?? '',
        } satisfies HMNavigationItem
      })
      .filter((item): item is HMNavigationItem => item !== null) ?? []
  )
}
export function NavigationSettings({siteId}: {siteId: UnpackedHypermediaId}) {
  const resource = useResource(siteId)
  const document = resource.data?.type === 'document' ? resource.data.document : undefined
  const {isSiteOwner, isLoading: isOwnerLoading} = useIsSiteOwner(siteId.uid)
  const updateHome = useUpdateHomeDocument(siteId.uid)
  const [navItems, setNavItems] = useState<HMNavigationItem[] | null>(null)
  const [headerLayout, setHeaderLayout] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState<boolean | null>(null)
  // Dialog: null = closed; {} = new item; {id} = editing existing.
  const [dialogItem, setDialogItem] = useState<HMNavigationItem | null>(null)
  const [dialogIsNew, setDialogIsNew] = useState(false)
  if (resource.isInitialLoading || isOwnerLoading) {
    return (
      <div className={stylex.props(styles.s4c9e7ebc).className || ''}>
        <Spinner />
      </div>
    )
  }
  if (!document) {
    return <SizableText color="muted">This account doesn't have a site yet.</SizableText>
  }
  if (!isSiteOwner) {
    return (
      <>
        <SizableText size="2xl" weight="bold">
          Navigation
        </SizableText>
        <SizableText color="muted">Only the site owner can edit these settings.</SizableText>
      </>
    )
  }
  const metadata = document.metadata
  const publishedNav = readPublishedNav(document)
  const navValue = navItems ?? publishedNav
  const storedLayout = metadata.theme?.headerLayout ?? ''
  const currentLayout = HEADER_LAYOUTS.find((l) => l.stored === storedLayout)?.value || 'horizontal'
  const layoutValue = headerLayout ?? currentLayout
  const currentShowActivity = metadata.showActivity ?? true
  const showActivityValue = showActivity ?? currentShowActivity

  // Dirty state is derived by comparing edits against the published values.
  // This lets it self clear once the save's refetch lands.
  const isDirty =
    (navItems !== null && !navItemsEqual(navItems, publishedNav)) ||
    (headerLayout !== null && headerLayout !== currentLayout) ||
    (showActivity !== null && showActivity !== currentShowActivity)
  const canSave = isDirty && !updateHome.isPending
  const setNav = (items: HMNavigationItem[]) => setNavItems(items)
  const openNewDialog = () => {
    setDialogItem({
      id: nanoid(),
      type: 'Link',
      text: '',
      link: '',
    })
    setDialogIsNew(true)
  }
  const openEditDialog = (item: HMNavigationItem) => {
    setDialogItem(item)
    setDialogIsNew(false)
  }
  const submitDialog = (item: HMNavigationItem) => {
    if (dialogIsNew) setNav([...navValue, item])
    else setNav(navValue.map((i) => (i.id === item.id ? item : i)))
    setDialogItem(null)
  }
  const removeItem = (id: string) => setNav(navValue.filter((i) => i.id !== id))
  async function handleSave() {
    try {
      const stored = HEADER_LAYOUTS.find((l) => l.value === layoutValue)?.stored ?? ''
      const nextMetadata: HMMetadata = {
        ...metadata,
        showActivity: showActivityValue,
        theme: {
          ...metadata.theme,
          headerLayout: stored,
        },
      }
      await updateHome.mutateAsync({
        metadata: nextMetadata,
        navigation: navItems ?? undefined,
      })
      toast.success('Navigation updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update navigation')
    }
  }
  return (
    <>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <SizableText size="2xl" weight="bold">
          Navigation
        </SizableText>
        <Button variant="default" disabled={!canSave} onClick={handleSave}>
          {updateHome.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Header preview */}
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <SizableText weight="medium">Header site preview</SizableText>
        <HeaderPreview
          siteId={siteId}
          name={metadata.name}
          icon={metadata.icon}
          items={navValue}
          isCenter={layoutValue === 'center'}
        />
      </div>

      {/* Nav item list */}
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <SizableText weight="medium">Create the navigation items shown in the top bar</SizableText>
        <NavItemList
          items={navValue}
          onReorder={setNav}
          onEdit={openEditDialog}
          onRemove={removeItem}
          onAdd={openNewDialog}
        />
        <div>
          <Button
            variant="outline"
            className="border-primary dark:border-primary text-primary hover:text-primary hover:bg-primary/10 bg-transparent"
            onClick={openNewDialog}
          >
            <Plus className={stylex.props(styles.sca3de968).className || ''} />
            Add navigation item
          </Button>
        </div>
      </div>

      {/* Layout and options */}
      <div className={stylex.props(styles.s196dae7f).className || ''}>
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <SizableText weight="medium">Header layout</SizableText>
          <Select value={layoutValue} onValueChange={setHeaderLayout}>
            <SelectTrigger className={stylex.props(styles.se3309843).className || ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEADER_LAYOUTS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <SizableText weight="medium">Options</SizableText>
          <div className={stylex.props(styles.s4d733c9b).className || ''}>
            <div className={stylex.props(styles.sac428cea).className || ''}>
              <SizableText>Show activity tabs</SizableText>
              <Tooltip content="Show the People, Comments, and Citations tabs on your site's pages.">
                <HelpCircle className={stylex.props(styles.s76b0b3a9).className || ''} />
              </Tooltip>
            </div>
            <Switch checked={showActivityValue} onCheckedChange={setShowActivity} />
          </div>
        </div>
      </div>

      {dialogItem ? (
        <NavItemDialog
          item={dialogItem}
          isNew={dialogIsNew}
          homeId={siteId}
          filterPresets={(candidate) => !navValue.some((i) => i.id !== dialogItem.id && i.link === candidate.link)}
          onSubmit={submitDialog}
          onClose={() => setDialogItem(null)}
        />
      ) : null}
    </>
  )
}

// Preview of the site header, reflecting the selected layout.
function HeaderPreview({
  siteId,
  name,
  icon,
  items,
  isCenter,
}: {
  siteId: UnpackedHypermediaId
  name?: string
  icon?: string
  items: HMNavigationItem[]
  isCenter: boolean
}) {
  const labelItems = useMemo(
    () =>
      items
        .filter((i) => i.text.trim())
        .map((i) => ({
          key: i.id,
          text: i.text,
        })),
    [items],
  )
  // Overflow items collapse into a caret dropdown instead of wrapping, mirroring
  // the real site header.
  const {containerRef, itemRefs, visibleItems, overflowItems} = useResponsiveItems({
    items: labelItems,
    gapWidth: 16,
    reservedWidth: 36,
  })
  const iconEl = (
    <HMIcon id={siteId} name={name} icon={icon} size={40} className={stylex.props(styles.sf032ed6c).className || ''} />
  )
  const navRow =
    labelItems.length === 0 ? (
      <div
        className={cn(
          stylex.props(styles.s380d63c9).className || '',
          isCenter ? 'justify-center' : 'flex-1 justify-end',
        )}
      >
        <SizableText color="muted" className={stylex.props(styles.sb9bd3a30).className || ''}>
          No navigations items added yet
        </SizableText>
      </div>
    ) : (
      <div
        ref={containerRef}
        className={cn(
          stylex.props(styles.sd2daac47).className || '',
          isCenter ? 'w-full justify-center' : 'flex-1 justify-end',
        )}
      >
        {/* Hidden measurement container (measures each item's natural width) */}
        <div className={stylex.props(styles.s10514f6b).className || ''}>
          {labelItems.map((item) => (
            <div
              key={`measure-${item.key}`}
              ref={(el) => {
                if (el) itemRefs.current.set(item.key, el)
                else itemRefs.current.delete(item.key)
              }}
            >
              <SizableText weight="medium" className={stylex.props(styles.sf8e652db).className || ''}>
                {item.text}
              </SizableText>
            </div>
          ))}
        </div>
        {visibleItems.map((item) => (
          <SizableText
            key={item.key}
            weight="medium"
            color="muted"
            className={stylex.props(styles.s13358127).className || ''}
          >
            {item.text}
          </SizableText>
        ))}
        {overflowItems.length > 0 ? (
          <OptionsDropdown
            side="bottom"
            align="end"
            ariaLabel="More navigation items"
            button={
              <button className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
                <ChevronDown className={stylex.props(styles.sca3de968).className || ''} />
              </button>
            }
            menuItems={overflowItems.map((item) => ({
              key: item.key,
              label: item.text,
              icon: <span className={stylex.props(styles.sca3de968).className || ''} />,
              onClick: () => {},
            }))}
          />
        ) : null}
      </div>
    )
  if (isCenter) {
    return (
      <div className="border-border bg-muted/30 flex flex-col items-center gap-3 rounded-md border p-4">
        <div className={stylex.props(styles.s86ff3e4).className || ''}>
          {iconEl}
          {name ? <SizableText weight="bold">{name}</SizableText> : null}
        </div>
        {navRow}
      </div>
    )
  }
  return (
    <div className="border-border bg-muted/30 flex items-center gap-3 rounded-md border p-4">
      {iconEl}
      {name ? <SizableText weight="bold">{name}</SizableText> : null}
      {navRow}
    </div>
  )
}
function NavItemList({
  items,
  onReorder,
  onEdit,
  onRemove,
  onAdd,
}: {
  items: HMNavigationItem[]
  onReorder: (items: HMNavigationItem[]) => void
  onEdit: (item: HMNavigationItem) => void
  onRemove: (id: string) => void
  onAdd: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null)
  useEffect(() => {
    return monitorForElements({
      onDrag: ({location}) => setDraggingOverId((location.current.dropTargets[0]?.data.id as string) ?? null),
      onDrop: ({source, location}) => {
        setDraggingOverId(null)
        const over = location.current.dropTargets[0]
        if (!over) return
        const from = items.findIndex((i) => i.id === source.data.id)
        const to = items.findIndex((i) => i.id === over.data.id)
        if (from === -1 || to === -1 || from === to) return
        const next = [...items]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        onReorder(next)
      },
    })
  }, [items, onReorder])
  if (!items.length) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="border-border text-muted-foreground flex w-full items-center gap-2 rounded-md border border-dashed px-4 py-5 transition-colors hover:border-neutral-400 dark:hover:border-neutral-500"
      >
        <Plus className={stylex.props(styles.sca3de968).className || ''} />
        <SizableText color="muted">Add navigation item</SizableText>
      </button>
    )
  }
  return (
    <div ref={containerRef} className={stylex.props(styles.sfbc6e28e).className || ''}>
      {items.map((item) => (
        <NavItemRow
          key={item.id}
          item={item}
          isDraggingOver={draggingOverId === item.id}
          onEdit={() => onEdit(item)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </div>
  )
}
function NavItemRow({
  item,
  isDraggingOver,
  onEdit,
  onRemove,
}: {
  item: HMNavigationItem
  isDraggingOver: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!rowRef.current || !handleRef.current) return
    return combine(
      draggable({
        element: rowRef.current,
        dragHandle: handleRef.current,
        getInitialData: () => ({
          id: item.id,
        }),
      }),
      dropTargetForElements({
        element: rowRef.current,
        getData: () => ({
          id: item.id,
        }),
      }),
    )
  }, [item.id])
  return (
    <div
      ref={rowRef}
      className={cn(
        'border-border flex items-center gap-3 rounded-md border bg-white px-3 py-2.5 dark:bg-black',
        isDraggingOver && 'ring-primary/60 ring-2',
      )}
    >
      <div
        ref={handleRef}
        className="text-muted-foreground hover:text-foreground cursor-grab p-1 active:cursor-grabbing"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <EllipsisVertical className={stylex.props(styles.sca3de968).className || ''} />
      </div>
      <SizableText
        className={cn(stylex.props(styles.sb136bac9).className || '', !item.text.trim() && 'text-muted-foreground')}
      >
        {item.text || 'Untitled item'}
      </SizableText>
      <OptionsDropdown
        menuItems={[
          {
            key: 'edit',
            label: 'Edit',
            icon: <Pencil className={stylex.props(styles.sca3de968).className || ''} />,
            onClick: onEdit,
          },
          {
            key: 'remove',
            label: 'Remove',
            icon: <Trash className={stylex.props(styles.sca3de968).className || ''} />,
            variant: 'destructive' as const,
            onClick: onRemove,
          },
        ]}
      />
    </div>
  )
}
function NavItemDialog({
  item,
  isNew,
  homeId,
  filterPresets,
  onSubmit,
  onClose,
}: {
  item: HMNavigationItem
  isNew: boolean
  homeId: UnpackedHypermediaId
  filterPresets: (candidate: {link: string}) => boolean
  onSubmit: (item: HMNavigationItem) => void
  onClose: () => void
}) {
  const [text, setText] = useState(item.text)
  const [link, setLink] = useState(item.link)
  const canAdd = text.trim().length > 0 && link.trim().length > 0
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create navigation item' : 'Edit navigation item'}</DialogTitle>
        </DialogHeader>
        <div className={stylex.props(styles.sfbc6e290).className || ''}>
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <SizableText size="sm" weight="medium">
              Item name (shown in the top bar)
            </SizableText>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add name" />
          </div>
          <div className={stylex.props(styles.sfbc6e28e).className || ''}>
            <SizableText size="sm" weight="medium">
              Link
            </SizableText>
            <HMDocURLInput
              link={link}
              homeId={homeId}
              filterPresets={filterPresets}
              onUpdate={(nextLink, title) => {
                setLink(nextLink)
                // Autofill the name from the selected doc's title if it isn't set.
                if (title) setText((current) => (current.trim() ? current : title))
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            className={stylex.props(styles.scdbaf625).className || ''}
            disabled={!canAdd}
            onClick={() =>
              onSubmit({
                ...item,
                text: text.trim(),
                link: link.trim(),
              })
            }
          >
            {isNew ? 'Add item' : 'Save item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
