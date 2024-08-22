import {useAppContext} from '@/app-context'
import {EmbedComment, EmbedDocument, EmbedInline} from '@/components/app-embeds'
import {useExperiments} from '@/models/experiments'
import {useOpenUrl} from '@/open-url'
import {trpc} from '@/trpc'
import {
  BlockRange,
  DAEMON_FILE_URL,
  ExpandedBlockRange,
  UnpackedHypermediaId,
} from '@shm/shared'
import {
  DocContentContextValue,
  DocContentProvider,
  contentLayoutUnit,
  contentTextUnit,
} from '@shm/ui'
import {useDocumentUrl} from '../components/titlebar-common'

export function AppDocContentProvider({
  children,
  docId,
  isBlockFocused = false,
  ...overrides
}: React.PropsWithChildren<Partial<DocContentContextValue>> & {
  docId?: UnpackedHypermediaId
  isBlockFocused?: boolean
}) {
  const {saveCidAsFile} = useAppContext()
  const openUrl = useOpenUrl()
  const reference = useDocumentUrl({docId, isBlockFocused})
  const experiments = useExperiments()
  const importWebFile = trpc.webImporting.importWebFile.useMutation()
  return (
    <>
      <DocContentProvider
        showDevMenu={experiments.data?.pubContentDevMenu}
        layoutUnit={contentLayoutUnit}
        importWebFile={importWebFile}
        textUnit={contentTextUnit}
        debug={false}
        entityComponents={{
          Document: EmbedDocument,
          Comment: EmbedComment,
          Inline: EmbedInline,
        }}
        onLinkClick={(href, e) => {
          e.preventDefault()
          e.stopPropagation()
          openUrl(href, e.metaKey)
        }}
        onCopyBlock={
          reference
            ? (
                blockId: string,
                blockRange: BlockRange | ExpandedBlockRange | undefined,
              ) => {
                if (blockId && reference) {
                  reference.onCopy(blockId, blockRange || {expanded: true})
                }
              }
            : null
        }
        ipfsBlobPrefix={`${DAEMON_FILE_URL}/`}
        saveCidAsFile={saveCidAsFile}
        routeParams={{}}
        {...overrides}
      >
        {children}
      </DocContentProvider>
      {reference?.content}
    </>
  )
}
