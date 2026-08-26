import * as stylex from '@stylexjs/stylex'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {ArrowRight, Lock} from 'lucide-react'
import {ReactNode} from 'react'
import {Button} from './button'
import {Spinner} from './spinner'
import {SizableText} from './text'

// Re-export PageLayout from its own file for backwards compatibility
const styles = stylex.create({
  s4f426e02: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
  },
  se7022aa5: {
    marginInline: 'auto',
    paddingInline: 'calc(0.25rem * 8)',
    paddingBlock: 'calc(0.25rem * 10)',
  },
  sa2c8dace: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  s88546f06: {
    fill: 'var(--link)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sdc925449: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
})
export {PageLayout} from './page-layout'

/**
 * Generic message box for page-level states (loading, errors, not found, etc.)
 * Used by document, feed, and directory pages.
 */
export function PageMessageBox({
  title,
  message,
  children,
  spinner,
}: {
  title: string
  message: string
  children?: ReactNode
  spinner?: boolean
}) {
  return (
    <div className={stylex.props(styles.s4f426e02).className || ''}>
      <div className={stylex.props(styles.se7022aa5).className || ''}>
        <div className="border-border bg-background flex w-full max-w-lg flex-none flex-col gap-4 rounded-lg border p-6 shadow-lg dark:bg-black">
          {spinner ? (
            <div className={stylex.props(styles.sa2c8dace).className || ''}>
              <Spinner className={stylex.props(styles.s88546f06).className || ''} />
            </div>
          ) : null}
          <SizableText size="2xl" weight="bold">
            {title}
          </SizableText>

          <SizableText asChild className={stylex.props(styles.sf2718385).className || ''}>
            <p>{message}</p>
          </SizableText>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Shown when a document has been redirected to a new location.
 */
export function PageRedirected({
  redirectTarget,
  onNavigate,
}: {
  docId?: UnpackedHypermediaId
  redirectTarget: UnpackedHypermediaId
  onNavigate: (target: UnpackedHypermediaId) => void
}) {
  return (
    <PageMessageBox title="Redirected" message="This document has been redirected to a new location.">
      <Button
        onClick={() => {
          onNavigate(redirectTarget)
        }}
      >
        <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
        Go to New Location
      </Button>
    </PageMessageBox>
  )
}

/**
 * Shown when discovering/loading a document or profile from the network.
 */
export function PageDiscovery({entityType = 'document'}: {entityType?: 'document' | 'profile'}) {
  const labels = {
    document: {
      title: 'Looking for this document…',
      message: 'This document is not on your node yet. Now finding a peer who can provide it.',
    },
    profile: {
      title: 'Looking for this profile…',
      message: 'This profile is not on your node yet. Now finding a peer who can provide it.',
    },
  }
  const {title, message} = labels[entityType]
  return <PageMessageBox title={title} spinner message={message} />
}

/**
 * Shown when a document or profile is not found.
 */
export function PageNotFound({entityType = 'document'}: {entityType?: 'document' | 'profile'}) {
  const labels = {
    document: {
      title: 'Document Not Found',
      message: 'This document could not be found on the network.',
    },
    profile: {
      title: 'Profile Not Found',
      message: 'This profile could not be found on the network.',
    },
  }
  const {title, message} = labels[entityType]
  return <PageMessageBox title={title} message={message} />
}

/**
 * Shown when a document or comment has been deleted (tombstone).
 */
export function PageDeleted({entityType = 'document'}: {entityType?: 'document' | 'comment'}) {
  const labels = {
    document: {
      title: 'Document Deleted',
      message: 'This document has been deleted by its owner.',
    },
    comment: {
      title: 'Comment Deleted',
      message: 'This comment has been deleted by its author.',
    },
  }
  const {title, message} = labels[entityType]
  return <PageMessageBox title={title} message={message} />
}

/**
 * Shown when a document is private and the current user doesn't have access.
 */
export function PagePrivate() {
  return (
    <PageMessageBox title="Private Document" message="This document is private. You don't have permission to view it.">
      <div className={stylex.props(styles.sdc925449).className || ''}>
        <Lock className={stylex.props(styles.sca3de968).className || ''} />
        <SizableText size="sm">Contact the document owner to request access.</SizableText>
      </div>
    </PageMessageBox>
  )
}
