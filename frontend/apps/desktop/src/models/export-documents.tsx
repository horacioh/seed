import * as stylex from '@stylexjs/stylex'
import {useAppContext} from '@/app-context'
import {reportError} from '@/errors'
import {grpcClient} from '@/grpc-client'
import {convertBlocksToMarkdown} from '@/utils/blocks-to-markdown'
import {hmBlocksToEditorContent} from '@seed-hypermedia/client/hmblock-to-editorblock'
import {getDocumentTitle} from '@shm/shared/content'
import {EditorBlock} from '@seed-hypermedia/client/editor-types'
import {createResourceResolver} from '@shm/shared/resource-loader'
import {unpackHmId} from '@shm/shared/utils/entity-id-url'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
const styles = stylex.create({
  s13588c5b: {
    overflowWrap: 'break-word',
  },
  s375929f2: {
    cursor: 'pointer',
    textDecorationLine: 'underline',
  },
})
const resolveResource = createResourceResolver(grpcClient)
export function useExportDocuments() {
  const {exportDocuments, openDirectory} = useAppContext()
  return async (docIds: string[]) => {
    if (docIds.length == 0) {
      toast.error('No documents selected')
      return
    }
    const docsToExport = await Promise.all(
      docIds.map(async (idStr) => {
        const id = unpackHmId(idStr)
        if (!id) return null
        try {
          const resource = await resolveResource(id)
          if (resource.type !== 'document') return null
          const hmDoc = resource.document
          const editorBlocks: EditorBlock[] = hmBlocksToEditorContent(hmDoc.content)
          const markdown = await convertBlocksToMarkdown(editorBlocks, hmDoc)
          return {
            title: getDocumentTitle(hmDoc) || 'Untitled document',
            markdown,
          }
        } catch {
          return null
        }
      }),
    )
    await exportDocuments(docsToExport.filter((doc) => doc !== null))
      .then((res) => {
        const success = (
          <>
            <div className="flex max-w-[700px] flex-col gap-1.5">
              <SizableText className={stylex.props(styles.s13588c5b).className || ''}>
                Successfully exported documents to: <b>{`${res}`}</b>.
              </SizableText>
              <SizableText color="brand" asChild className={stylex.props(styles.s375929f2).className || ''}>
                <a
                  onClick={() => {
                    openDirectory(res)
                  }}
                >
                  Show directory
                </a>
              </SizableText>
            </div>
          </>
        )
        toast.custom(() => success)
      })
      .catch((err) => {
        toast.error(err)
        reportError(err, {
          feature: 'export-documents',
          operation: 'export',
          docIds,
        })
      })
  }
}
