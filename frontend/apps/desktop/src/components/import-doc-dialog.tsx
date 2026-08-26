import * as stylex from '@stylexjs/stylex'
import {HMResourceVisibility} from '@seed-hypermedia/client/hm-types'
import {Button} from '@shm/ui/button'
import {SizableText, Text} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {Globe, Info, Lock} from 'lucide-react'
import {useState} from 'react'
const styles = stylex.create({
  s2c8b7ebe: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 'calc(0.25rem * 4)',
  },
  saf49316c: {
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '600',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s56cab6b3: {
    cursor: 'default',
    opacity: '50%',
  },
  s3566be62: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  s21753906: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    padding: 'calc(0.25rem * 4)',
  },
  sb87f7413: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
})
export type ImportedDocument = {
  markdownContent?: string
  latexContent?: string
  title: string
  directoryPath: string
}
export function useImportConfirmDialog() {
  return useAppDialog(ImportConfirmDialog, {
    isAlert: true,
  })
}
function ImportConfirmDialog({
  onClose,
  input,
}: {
  onClose: () => void
  input: {
    documents: ImportedDocument[]
    documentCount: number
    docMap: Map<
      string,
      {
        name: string
        path: string
      }
    >
    canCreatePrivateDoc: boolean
    onSuccess: (
      documents: ImportedDocument[],
      docMap: Map<
        string,
        {
          name: string
          path: string
        }
      >,
      visibility: HMResourceVisibility,
    ) => Promise<void>
  }
}) {
  const {documents, documentCount, docMap, canCreatePrivateDoc, onSuccess} = input
  const [visibility, setVisibility] = useState<HMResourceVisibility>('PUBLIC')
  return (
    <div className={stylex.props(styles.s2c8b7ebe).className || ''}>
      <Text className={stylex.props(styles.saf49316c).className || ''}>
        <Text weight="bold">{`${documentCount} documents found.`}</Text>
      </Text>
      <Text className={stylex.props(styles.sa56e915f).className || ''}>
        <Text>Do you want to continue with the import?</Text>
      </Text>
      <div className={stylex.props(styles.sfbc6e28e).className || ''}>
        <SizableText size="sm" weight="bold">
          Visibility
        </SizableText>
        <div className={stylex.props(styles.se658ac14).className || ''}>
          <Button
            variant={visibility === 'PUBLIC' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVisibility('PUBLIC')}
          >
            <Globe className={stylex.props(styles.s3269316e).className || ''} />
            Public
          </Button>
          {canCreatePrivateDoc ? (
            <Button
              variant={visibility === 'PRIVATE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisibility('PRIVATE')}
            >
              <Lock className={stylex.props(styles.s3269316e).className || ''} />
              Private
            </Button>
          ) : (
            <Tooltip
              content="To import private documents, you need to configure a web domain and import into the home document."
              side="bottom"
              asChild
            >
              <Button variant="outline" size="sm" className={stylex.props(styles.s56cab6b3).className || ''}>
                <Lock className={stylex.props(styles.s3269316e).className || ''} />
                Private
                <Info className={stylex.props(styles.s3566be62).className || ''} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className={stylex.props(styles.s21753906).className || ''}>
        <div className={stylex.props(styles.sb87f7413).className || ''}>
          <Button
            onClick={() => {
              onClose()
            }}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onSuccess(documents, docMap, visibility)
              onClose()
            }}
          >
            Continue Import
          </Button>
        </div>
      </div>
    </div>
  )
}
