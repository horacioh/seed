import * as stylex from '@stylexjs/stylex'
import {roleCanWrite, useSelectedAccountCapability} from '@/models/access-control'
import {useMyAccountIds} from '@/models/daemon'
import {useCreateDraft} from '@/models/documents'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {Button} from '@shm/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shm/ui/components/dropdown-menu'
import {Add} from '@shm/ui/icons'
import {MenuItemType} from '@shm/ui/options-dropdown'
import {FilePlus2, Import, Lock} from 'lucide-react'
import {ReactNode, useCallback, useMemo} from 'react'
import {useImportDialog, useImporting} from './import-doc-button'

/** Builds the document creation submenu item and its dialog content for the document options menu. */
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sce22ca32: {
    justifyContent: 'center',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  s36c7b7: {
    width: 'calc(0.25rem * 56)',
  },
})
export function useCreateDocumentMenuItem({
  locationId,
  canCreateChildren = true,
}: {
  locationId: UnpackedHypermediaId
  canCreateChildren?: boolean
}): {
  menuItem: MenuItemType | null
  content: ReactNode
} {
  const capability = useSelectedAccountCapability(locationId)
  const canEdit = roleCanWrite(capability?.role)
  const createDraft = useCreateDraft({
    locationPath: locationId.path || undefined,
    locationUid: locationId.uid,
  })
  const myAccountIds = useMyAccountIds()
  const importing = useImporting(locationId)
  const importDialog = useImportDialog()
  const openImportDialog = useCallback(() => {
    importDialog.open({
      onImportFile: importing.importFile,
      onImportDirectory: importing.importDirectory,
      onImportLatexFile: importing.importLatexFile,
      onImportLatexDirectory: importing.importLatexDirectory,
      onImportWebSite: importing.importWebSite,
      onImportWordPress: importing.importWordPress,
    })
  }, [importDialog, importing])
  const menuItem = useMemo<MenuItemType | null>(() => {
    if (!myAccountIds.data?.length) return null
    if (!canEdit || !canCreateChildren) return null
    return {
      key: 'new',
      label: 'New',
      icon: <Add className={stylex.props(styles.sca3de968).className || ''} />,
      children: [
        {
          key: 'new-document',
          label: 'New Document',
          icon: <FilePlus2 className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: () => {
            void createDraft()
          },
        },
        {
          key: 'new-private-document',
          label: 'New Private Document',
          icon: <Lock className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: () => {
            void createDraft({
              visibility: 'PRIVATE',
            })
          },
        },
        {
          key: 'import',
          label: 'Import',
          icon: <Import className={stylex.props(styles.sca3de968).className || ''} />,
          onClick: openImportDialog,
        },
      ],
    }
  }, [canCreateChildren, canEdit, createDraft, myAccountIds.data?.length, openImportDialog])
  return {
    menuItem,
    content: (
      <>
        {importDialog.content}
        {importing.content}
      </>
    ),
  }
}
function CreateDocumentButtonContent({locationId}: {locationId: UnpackedHypermediaId}) {
  const {menuItem, content} = useCreateDocumentMenuItem({
    locationId,
  })
  if (!menuItem) return null
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className={stylex.props(styles.sce22ca32).className || ''}>
            <Add className={stylex.props(styles.sca3de968).className || ''} />
            <span className={stylex.props(styles.s6e724d66).className || ''}>New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={stylex.props(styles.s36c7b7).className || ''}>
          {menuItem.children?.map((item, index) => (
            <div key={item.key}>
              {index === 2 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem onClick={(event) => item.onClick?.(event as any)}>
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {content}
    </>
  )
}

/** Renders the standalone document creation dropdown used outside the document top bar. */
export function CreateDocumentButton({locationId}: {locationId?: UnpackedHypermediaId}) {
  if (!locationId) return null
  return <CreateDocumentButtonContent locationId={locationId} />
}
