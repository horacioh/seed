import * as stylex from '@stylexjs/stylex'
import type {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {Braces, Check} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {Button} from './button'
import {Textarea} from './components/textarea'
import {Tooltip} from './tooltip'
import {cn} from './utils'
import {
  AddFieldForm,
  canonicalEntries,
  FIELD_LABEL_CLASS,
  FieldRow,
  findInvalidValue,
  isPlainObject,
  METADATA_VALUE_RULES,
  toCanonicalOrder,
  useValueHistory,
  ValueDisplay,
  ValueEditorProvider,
} from './value-editor'

/**
 * A staged partial update: top-level keys map to their new value, or `null`
 * to remove the field (publishes a nullValue attribute op).
 */
const styles = stylex.create({
  see7dd02: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 6)',
  },
  sd36a4a47: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sa56e915f: {
    color: 'var(--muted-foreground)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s9c95321: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s9266db7b: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s11c1d25d: {
    color: 'var(--destructive)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
export type MetadataPatch = Record<string, unknown>

/**
 * Publish ops are generated from the draft metadata without a base document,
 * so a nested key that simply disappears emits no op and its old value would
 * survive. Removed nested object keys therefore become explicit `null`
 * tombstones, which publish as nullValue ops and clear the attribute.
 */
function withNestedTombstones(prev: unknown, next: unknown): unknown {
  if (!isPlainObject(prev) || !isPlainObject(next)) return next
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(next)) {
    result[key] = withNestedTombstones(prev[key], value)
  }
  // Keys absent from `next` become (or remain) null tombstones.
  for (const [key, value] of Object.entries(prev)) {
    if (value !== undefined && !(key in next)) result[key] = null
  }
  return result
}

/**
 * Compute the staged patch that turns `prev` into `next` (removed keys → null
 * tombstones). `prev` must be the raw draft metadata including existing null
 * tombstones so they survive unrelated edits.
 */
export function diffMetadata(prev: Record<string, unknown>, next: Record<string, unknown>): MetadataPatch {
  const patch: MetadataPatch = {}
  for (const [key, value] of Object.entries(next)) {
    const merged = withNestedTombstones(prev[key], value)
    if (JSON.stringify(prev[key]) !== JSON.stringify(merged)) patch[key] = merged
  }
  for (const [key, value] of Object.entries(prev)) {
    if (value !== undefined && !(key in next)) patch[key] = null
  }
  return patch
}

/**
 * Metadata view for the `:metadata` document route. Read-only without edit
 * permission; with `canEdit` + `onMetadata` it becomes a recursive editor
 * where every change is staged as a draft patch and published via the
 * standard publish flow. A raw JSON mode allows full editing in one place.
 */
export function DocumentMetadataView({
  metadata,
  canEdit = false,
  onMetadata,
  fileUpload,
  openFile,
  onCreateBlob,
}: {
  metadata?: HMMetadata | null
  canEdit?: boolean
  onMetadata?: (patch: MetadataPatch) => void
  /** Uploads a file dropped onto a string field to IPFS, returning its CID. */
  fileUpload?: (file: File) => Promise<string>
  /** Opens an uploaded IPFS file (by CID) in its own dedicated viewer window. */
  openFile?: (cid: string) => void
  /** Opens a blank blob editor (new IPFS object) in its own window. */
  onCreateBlob?: () => void
}) {
  const [jsonMode, setJsonMode] = useState(false)
  const current = useMemo(() => (metadata ?? {}) as Record<string, unknown>, [metadata])
  const entries = canonicalEntries(current, {
    hideNull: true,
  })
  const editable = canEdit && !!onMetadata

  // Undo/redo over snapshots of the merged metadata: `record()` before each
  // staged patch; undo/redo apply the diff back to the snapshot.
  const history = useValueHistory(current)
  const stage = (patch: MetadataPatch) => {
    history.record()
    onMetadata!(patch)
  }
  const handleUndo = () => {
    const snapshot = history.undo()
    if (snapshot) onMetadata!(diffMetadata(current, snapshot.value))
  }
  const handleRedo = () => {
    const snapshot = history.redo()
    if (snapshot) onMetadata!(diffMetadata(current, snapshot.value))
  }
  return (
    <ValueEditorProvider
      onUndo={editable ? handleUndo : undefined}
      onRedo={editable ? handleRedo : undefined}
      fileUpload={editable ? fileUpload : undefined}
      openFile={openFile}
      onCreateBlob={editable ? onCreateBlob : undefined}
    >
      <div className={stylex.props(styles.see7dd02).className || ''}>
        {/* No title here — the tab/breadcrumb (main view) and the panel header
            already label this "Attributes". */}
        {editable && (
          <div className={stylex.props(styles.sd36a4a47).className || ''}>
            <Tooltip content={jsonMode ? 'Edit as fields' : 'Edit as JSON'}>
              <Button
                variant={jsonMode ? 'secondary' : 'ghost'}
                size="icon"
                aria-label={jsonMode ? 'Edit as fields' : 'Edit as JSON'}
                onClick={() => setJsonMode((mode) => !mode)}
              >
                <Braces className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            </Tooltip>
          </div>
        )}
        {jsonMode ? (
          <MetadataJsonEditor metadata={current} editable={editable} onMetadata={editable ? stage : undefined} />
        ) : editable ? (
          <>
            {entries.length === 0 ? (
              <p className={stylex.props(styles.sa56e915f).className || ''}>This document has no attributes.</p>
            ) : (
              <div className={stylex.props(styles.s783f19f3).className || ''}>
                {entries.map(([key, value]) => (
                  <FieldRow
                    key={key}
                    className={stylex.props(styles.s34b56e).className || ''}
                    fieldKey={key}
                    value={value}
                    siblingKeys={entries.map(([k]) => k).filter((k) => k !== key)}
                    onValue={(newValue) =>
                      stage({
                        [key]: newValue,
                      })
                    }
                    onEditField={(newKey, newValue) =>
                      stage(
                        newKey === key
                          ? {
                              [key]: newValue,
                            }
                          : {
                              [key]: null,
                              [newKey]: newValue,
                            },
                      )
                    }
                    onRemove={() =>
                      stage({
                        [key]: null,
                      })
                    }
                    rules={METADATA_VALUE_RULES}
                    path={[key]}
                  />
                ))}
              </div>
            )}
            <AddFieldForm
              rules={METADATA_VALUE_RULES}
              existingKeys={entries.map(([key]) => key)}
              onAdd={(key, value) =>
                stage({
                  [key]: value,
                })
              }
            />
          </>
        ) : entries.length === 0 ? (
          <p className={stylex.props(styles.sa56e915f).className || ''}>This document has no attributes.</p>
        ) : (
          <dl className={stylex.props(styles.s783f19f3).className || ''}>
            {entries.map(([key, value]) => (
              <div key={key} className={stylex.props(styles.s9c95321).className || ''}>
                <dt className={FIELD_LABEL_CLASS}>{key}</dt>
                <dd>
                  <ValueDisplay value={value} rules={METADATA_VALUE_RULES} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </ValueEditorProvider>
  )
}

/** Whole-metadata JSON editor: full editing in one textarea, applied as a diff. */
function MetadataJsonEditor({
  metadata,
  editable,
  onMetadata,
}: {
  metadata: Record<string, unknown>
  editable: boolean
  onMetadata?: (patch: MetadataPatch) => void
}) {
  const currentVisible = useMemo(
    () =>
      toCanonicalOrder(metadata, {
        hideNull: true,
      }) as Record<string, unknown>,
    [metadata],
  )
  const serialized = useMemo(() => JSON.stringify(currentVisible, null, 2), [currentVisible])
  const [text, setText] = useState(serialized)
  useEffect(() => setText(serialized), [serialized])
  const validation = useMemo(() => {
    if (text === serialized)
      return {
        dirty: false as const,
      }
    try {
      const parsed: unknown = JSON.parse(text)
      if (!isPlainObject(parsed))
        return {
          dirty: true as const,
          error: 'Attributes must be a JSON object',
        }
      const problem = findInvalidValue(parsed, METADATA_VALUE_RULES)
      if (problem)
        return {
          dirty: true as const,
          error: problem,
        }
      return {
        dirty: true as const,
        value: parsed,
      }
    } catch (e) {
      return {
        dirty: true as const,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      }
    }
  }, [text, serialized])
  if (!editable) {
    return <pre className="bg-muted/50 overflow-x-auto rounded-md p-4 font-mono text-sm">{serialized}</pre>
  }
  return (
    <div className={stylex.props(styles.sfbc6e28e).className || ''}>
      <Textarea
        value={text}
        rows={Math.max(8, Math.min(28, text.split('\n').length + 1))}
        spellCheck={false}
        className={cn(
          stylex.props(styles.s9266db7b).className || '',
          validation.dirty && 'error' in validation && 'border-destructive',
        )}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex min-h-8 items-center gap-2">
        {validation.dirty ? (
          'error' in validation ? (
            <p className={stylex.props(styles.s11c1d25d).className || ''}>{validation.error}</p>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => {
                  onMetadata!(diffMetadata(metadata, validation.value!))
                }}
              >
                <Check className={stylex.props(styles.sca3de968).className || ''} />
                Apply changes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setText(serialized)}>
                Reset
              </Button>
            </>
          )
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
