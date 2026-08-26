import * as stylex from '@stylexjs/stylex'
import {
  AlertCircle,
  ArrowRight,
  Binary,
  Braces,
  ChevronRight,
  Copy,
  RefreshCw,
  Search,
  Sparkles,
  TerminalSquare,
  Unplug,
} from 'lucide-react'
import {type ReactNode, useDeferredValue, useEffect, useState} from 'react'
import {
  buildApiRequestPreview,
  createStarterPayload,
  executeApiRequest,
  resolveSchemaNode,
  type ApiExecutionResult,
  type ApiSchemaDefinition,
  type ApiSchemaIndex,
  type ApiSchemaRouteSummary,
  type JSONSchemaNode,
} from '@shm/shared/api-lab'
import DataViewer from './data-viewer'
import {cn} from './utils'
const styles = stylex.create({
  sd63a8a39: {
    position: 'relative',
    display: 'block',
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  se80bcbd2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  se80bcbd3: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 3)',
  },
  s2b64fb66: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    animation: 'spin 1s linear infinite',
  },
  sa5279f8a: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  s46c30091: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(98.5% 0 0)',
    padding: 'calc(0.25rem * 4)',
  },
  sa0e0d57d: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  s8dc64edf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.006 285.885)',
  },
  s4768be23: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(76.9% 0.188 70.08)',
  },
  sc4e66034: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  sf4bc5bd8: {
    display: 'inline-flex',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(96.7% 0.001 286.375)',
    padding: 'calc(0.25rem * 1)',
  },
  sf4b54005: {
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    backgroundColor: 'oklch(98.5% 0 0)',
  },
  s482ba5c7: {
    cursor: 'pointer',
    listStyleType: 'none',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  sb5fcaba7: {
    overflowX: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92% 0.004 286.32)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37% 0.013 285.805)',
  },
  s309c1ac6: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  s9f5ea161: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(68.5% 0.169 237.323)',
  },
  s3ffc2aef: {
    marginTop: 'calc(0.25rem * 4)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sb399e9e6: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    color: 'oklch(70.5% 0.015 286.067)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s79b4711b: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(21% 0.006 285.885)',
  },
  sc2fd7247: {
    marginTop: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
    color: 'oklch(55.2% 0.016 285.938)',
  },
  sf8d612f7: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(21% 0.006 285.885)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    color: '#fff',
  },
  s357fc043: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  scbcc2085: {
    marginTop: 'calc(0.25rem * 3)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  sd71515ff: {
    marginLeft: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(92% 0.004 286.32)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0em',
    color: 'oklch(27.4% 0.006 286.033)',
    textTransform: 'none',
  },
  s3a19df69: {
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  sd432b4bb: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  sf67243d5: {
    marginTop: 'calc(0.25rem * 4)',
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37% 0.013 285.805)',
  },
  s2b839648: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
    color: 'oklch(14.1% 0.005 285.823)',
  },
  sb7a80442: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.2% 0.017 285.786)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s85de826b: {
    marginTop: 'calc(0.25rem * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(21% 0.006 285.885)',
  },
  s2c815aea: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sbb5ba128: {
    marginTop: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.4% 0.006 286.033)',
  },
  s5ab913f5: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 4)',
    color: 'oklch(45.5% 0.188 13.697)',
  },
  s69f644cf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
  },
  s9097ff5: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
  },
  se6fec38: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 6)',
    color: 'oklch(41% 0.159 10.272)',
  },
  sd6b3e1b6: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
  },
  s44342515: {
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(87.1% 0.006 286.286)',
    backgroundColor: 'oklch(98.5% 0 0)',
    padding: 'calc(0.25rem * 6)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(55.2% 0.016 285.938)',
  },
})
type ApiInspectorProps = {
  apiHost: string
}

/** Renders a desktop-friendly API lab for inspecting and executing every local API endpoint. */
export function ApiInspector({apiHost}: ApiInspectorProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [routeFilter, setRouteFilter] = useState('')
  const deferredRouteFilter = useDeferredValue(routeFilter)
  const [schemaIndex, setSchemaIndex] = useState<ApiSchemaIndex | null>(null)
  const [isIndexLoading, setIsIndexLoading] = useState(true)
  const [indexError, setIndexError] = useState<string | null>(null)
  const [schemaDefinitions, setSchemaDefinitions] = useState<Record<string, ApiSchemaDefinition>>({})
  const [loadingDefinitionKey, setLoadingDefinitionKey] = useState<string | null>(null)
  const [definitionError, setDefinitionError] = useState<string | null>(null)
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, ApiExecutionResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [schemaTab, setSchemaTab] = useState<'input' | 'output'>('input')
  useEffect(() => {
    setResults({})
    setRunError(null)
  }, [apiHost])
  useEffect(() => {
    const abortController = new AbortController()
    setIsIndexLoading(true)
    setIndexError(null)
    setDefinitionError(null)
    setSchemaDefinitions({})
    setSelectedKey(null)
    fetch(buildAbsoluteUrl(apiHost, '/api/schema'), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading /api/schema`)
        }
        return (await response.json()) as ApiSchemaIndex
      })
      .then((nextIndex) => {
        setSchemaIndex(nextIndex)
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }
        setSchemaIndex(null)
        setIndexError(getErrorMessage(error))
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsIndexLoading(false)
        }
      })
    return () => abortController.abort()
  }, [apiHost])
  useEffect(() => {
    const routes = schemaIndex?.routes ?? []
    if (!routes.length) {
      return
    }
    if (selectedKey && routes.some((route) => route.key === selectedKey)) {
      return
    }
    setSelectedKey(routes[0]?.key ?? null)
  }, [schemaIndex, selectedKey])
  useEffect(() => {
    if (!selectedKey || schemaDefinitions[selectedKey]) {
      return
    }
    const abortController = new AbortController()
    setLoadingDefinitionKey(selectedKey)
    setDefinitionError(null)
    setSchemaTab('input')
    fetch(buildAbsoluteUrl(apiHost, `/api/schema?key=${encodeURIComponent(selectedKey)}`), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading schema for ${selectedKey}`)
        }
        return (await response.json()) as ApiSchemaDefinition
      })
      .then((definition) => {
        setSchemaDefinitions((currentDefinitions) => ({
          ...currentDefinitions,
          [definition.key]: definition,
        }))
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return
        }
        setDefinitionError(getErrorMessage(error))
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoadingDefinitionKey(null)
        }
      })
    return () => abortController.abort()
  }, [apiHost, schemaDefinitions, selectedKey])
  const selectedDefinition = selectedKey ? schemaDefinitions[selectedKey] : undefined
  useEffect(() => {
    if (!selectedDefinition) {
      return
    }
    setDraftInputs((currentDrafts) => {
      if (currentDrafts[selectedDefinition.key] !== undefined) {
        return currentDrafts
      }
      return {
        ...currentDrafts,
        [selectedDefinition.key]: formatJsonValue(
          createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema),
        ),
      }
    })
  }, [selectedDefinition])
  const filteredRoutes = (schemaIndex?.routes ?? []).filter((route) => {
    const query = deferredRouteFilter.trim().toLowerCase()
    if (!query) {
      return true
    }
    return (
      route.key.toLowerCase().includes(query) ||
      route.path.toLowerCase().includes(query) ||
      route.kind.toLowerCase().includes(query)
    )
  })
  const selectedInput = selectedKey ? draftInputs[selectedKey] ?? '' : ''
  const selectedResult = selectedKey ? results[selectedKey] : undefined
  let previewError: string | null = null
  let preview: ReturnType<typeof buildApiRequestPreview> | undefined
  if (selectedDefinition && selectedInput) {
    try {
      preview = buildApiRequestPreview(apiHost, selectedDefinition, selectedInput)
    } catch (error) {
      previewError = getErrorMessage(error)
    }
  }
  const activeSchema =
    selectedDefinition && schemaTab === 'input' ? selectedDefinition.inputSchema : selectedDefinition?.outputSchema
  async function handleRunRequest() {
    if (!selectedDefinition || !selectedKey) {
      return
    }
    setIsRunning(true)
    setRunError(null)
    try {
      const result = await executeApiRequest(apiHost, selectedDefinition, draftInputs[selectedKey] ?? '')
      setResults((currentResults) => ({
        ...currentResults,
        [selectedKey]: result,
      }))
    } catch (error) {
      setRunError(getErrorMessage(error))
    } finally {
      setIsRunning(false)
    }
  }
  function handleRouteSelection(route: ApiSchemaRouteSummary) {
    setSelectedKey(route.key)
  }
  function handleInputReset() {
    if (!selectedDefinition) {
      return
    }
    setDraftInputs((currentDrafts) => ({
      ...currentDrafts,
      [selectedDefinition.key]: formatJsonValue(
        createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema),
      ),
    }))
    setRunError(null)
  }
  function handleFormatJson() {
    if (!selectedKey) {
      return
    }
    try {
      setDraftInputs((currentDrafts) => ({
        ...currentDrafts,
        [selectedKey]: formatJsonValue(JSON.parse(currentDrafts[selectedKey] ?? '')),
      }))
      setRunError(null)
    } catch (error) {
      setRunError(getErrorMessage(error))
    }
  }
  function handleCopyPreviewUrl() {
    if (!preview) {
      return
    }
    navigator.clipboard.writeText(preview.url)
  }
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col">
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="min-h-0">
          <Panel className="flex h-full min-h-0 flex-col" contentClassName="flex min-h-0 flex-1 flex-col">
            <label className={stylex.props(styles.sd63a8a39).className || ''}>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={routeFilter}
                onChange={(event) => setRouteFilter(event.target.value)}
                placeholder="Filter by key or path"
                className="w-full rounded-xl border border-zinc-200 bg-white px-11 py-3 text-sm text-zinc-900 transition outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
              />
            </label>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {isIndexLoading ? (
                <MutedState message="Loading /api/schema…" />
              ) : indexError ? (
                <ErrorState message={indexError} />
              ) : filteredRoutes.length ? (
                <div className="space-y-4">
                  <RouteGroup
                    title="Queries"
                    routes={filteredRoutes.filter((route) => route.kind === 'query')}
                    selectedKey={selectedKey}
                    onSelect={handleRouteSelection}
                  />
                  <RouteGroup
                    title="Actions"
                    routes={filteredRoutes.filter((route) => route.kind === 'action')}
                    selectedKey={selectedKey}
                    onSelect={handleRouteSelection}
                  />
                </div>
              ) : (
                <MutedState message="No endpoints match the current filter." />
              )}
            </div>
          </Panel>
        </aside>

        <main className="min-h-0 overflow-y-auto pr-1">
          <div className="space-y-4 pb-4">
            {selectedDefinition ? (
              <>
                <Panel
                  eyebrow="Endpoint"
                  title={selectedDefinition.key}
                  subtitle={`${selectedDefinition.method} ${selectedDefinition.path}`}
                  actions={
                    <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                      <StatusPill label={selectedDefinition.inputEncoding} tone="amber" />
                      <StatusPill label={selectedDefinition.outputSerialization} tone="sky" />
                      {selectedDefinition.usesParamMapping ? <StatusPill label="Mapped Params" tone="slate" /> : null}
                    </div>
                  }
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <MetaBlock label="Method" value={selectedDefinition.method} />
                    <MetaBlock label="Request Body" value={selectedDefinition.inputEncoding} />
                    <MetaBlock
                      label="Response"
                      value={`${selectedDefinition.outputEncoding} + ${selectedDefinition.outputSerialization}`}
                    />
                  </div>
                </Panel>

                <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                  <Panel
                    eyebrow="Request Composer"
                    title="Input JSON"
                    subtitle="Edit the logical request payload. The API inspector derives the exact wire format from the schema."
                    actions={
                      <div className={stylex.props(styles.se80bcbd2).className || ''}>
                        <ActionButton onClick={handleInputReset} disabled={!selectedDefinition}>
                          <RefreshCw className={stylex.props(styles.sca3de968).className || ''} />
                          Reset
                        </ActionButton>
                        <ActionButton onClick={handleFormatJson} disabled={!selectedDefinition}>
                          <Sparkles className={stylex.props(styles.sca3de968).className || ''} />
                          Format JSON
                        </ActionButton>
                      </div>
                    }
                  >
                    <textarea
                      value={selectedInput}
                      onChange={(event) => {
                        if (!selectedKey) {
                          return
                        }
                        setDraftInputs((currentDrafts) => ({
                          ...currentDrafts,
                          [selectedKey]: event.target.value,
                        }))
                        setRunError(null)
                      }}
                      spellCheck={false}
                      className="min-h-[24rem] w-full rounded-xl border border-zinc-900/10 bg-zinc-950 px-4 py-4 font-mono text-sm leading-6 text-zinc-100 transition outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200"
                    />

                    {previewError ? <InlineAlert title="Preview unavailable" message={previewError} /> : null}
                    {runError ? <InlineAlert title="Request failed" message={runError} /> : null}

                    <div className={stylex.props(styles.se80bcbd3).className || ''}>
                      <button
                        type="button"
                        onClick={handleRunRequest}
                        disabled={!preview || isRunning}
                        className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                      >
                        {isRunning ? (
                          <RefreshCw className={stylex.props(styles.s2b64fb66).className || ''} />
                        ) : (
                          <TerminalSquare className={stylex.props(styles.sca3de968).className || ''} />
                        )}
                        {isRunning ? 'Running…' : 'Run request'}
                      </button>
                      <div className={stylex.props(styles.sa5279f8a).className || ''}>
                        <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
                        Exact transport: {selectedDefinition.method}{' '}
                        {selectedDefinition.method === 'GET' ? 'query string' : 'CBOR body'}
                      </div>
                    </div>
                  </Panel>

                  <Panel
                    eyebrow="Wire Preview"
                    title="HTTP Request"
                    subtitle="The exact request the desktop API will receive."
                    actions={
                      <ActionButton onClick={handleCopyPreviewUrl} disabled={!preview}>
                        <Copy className={stylex.props(styles.sca3de968).className || ''} />
                        Copy URL
                      </ActionButton>
                    }
                  >
                    {preview ? (
                      <div className="space-y-5">
                        <div className={stylex.props(styles.s46c30091).className || ''}>
                          <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                            <StatusPill label={preview.method} tone="slate" />
                            <p className={stylex.props(styles.sa0e0d57d).className || ''}>{preview.url}</p>
                          </div>
                        </div>

                        <KeyValueList
                          title="Headers"
                          rows={Object.entries(preview.headers).map(([key, value]) => ({
                            key,
                            value,
                          }))}
                        />

                        {preview.method === 'GET' ? (
                          <KeyValueList
                            title="Query Params"
                            rows={preview.queryParams ?? []}
                            emptyMessage="No query params are required for this request."
                          />
                        ) : (
                          <div className={stylex.props(styles.s46c30091).className || ''}>
                            <div className={stylex.props(styles.s8dc64edf).className || ''}>
                              <Binary className={stylex.props(styles.s4768be23).className || ''} />
                              CBOR body
                            </div>
                            <p className={stylex.props(styles.sc4e66034).className || ''}>
                              {preview.cborByteLength ?? 0} bytes generated from the current JSON payload.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <MutedState message="Select an endpoint and enter valid JSON to generate a request preview." />
                    )}
                  </Panel>
                </div>

                <Panel
                  eyebrow="Schema Guide"
                  title={schemaTab === 'input' ? 'Input Schema' : 'Output Schema'}
                  subtitle="Use the schema tree while composing requests and inspecting response structure."
                  actions={
                    <div className={stylex.props(styles.sf4bc5bd8).className || ''}>
                      <SchemaTabButton
                        label="Input"
                        isActive={schemaTab === 'input'}
                        onClick={() => setSchemaTab('input')}
                      />
                      <SchemaTabButton
                        label="Output"
                        isActive={schemaTab === 'output'}
                        onClick={() => setSchemaTab('output')}
                      />
                    </div>
                  }
                >
                  {loadingDefinitionKey === selectedDefinition.key ? (
                    <MutedState message="Loading schema detail…" />
                  ) : definitionError ? (
                    <ErrorState message={definitionError} />
                  ) : activeSchema ? (
                    <div className="space-y-4">
                      <SchemaNodeView
                        rootSchema={activeSchema}
                        schema={activeSchema}
                        name={schemaTab === 'input' ? 'input' : 'output'}
                        isRoot
                      />

                      <details className={stylex.props(styles.sf4b54005).className || ''}>
                        <summary className={stylex.props(styles.s482ba5c7).className || ''}>Raw JSON Schema</summary>
                        <pre className={stylex.props(styles.sb5fcaba7).className || ''}>
                          {formatJsonValue(activeSchema)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <MutedState message="Schema details are not available yet." />
                  )}
                </Panel>

                <Panel
                  eyebrow="Response"
                  title="Result"
                  subtitle="Status, raw payload, and decoded output from the last request for this endpoint."
                >
                  {selectedResult ? (
                    <div className="space-y-5">
                      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                        <StatusPill
                          label={`${selectedResult.status} ${selectedResult.statusText}`.trim()}
                          tone={selectedResult.ok ? 'emerald' : 'rose'}
                        />
                        <p className={stylex.props(styles.s309c1ac6).className || ''}>
                          {selectedResult.ok ? 'Decoded with superjson.' : 'Non-2xx responses are shown raw.'}
                        </p>
                      </div>

                      <KeyValueList
                        title="Headers"
                        rows={Object.entries(selectedResult.headers).map(([key, value]) => ({
                          key,
                          value,
                        }))}
                      />

                      <div className="grid gap-4 xl:grid-cols-2">
                        <ResponseBlock
                          title="Raw Body"
                          content={
                            selectedResult.rawBody ? prettyRawBody(selectedResult.rawBody) : '(empty response body)'
                          }
                        />
                        <div className={stylex.props(styles.s46c30091).className || ''}>
                          <div className={stylex.props(styles.s8dc64edf).className || ''}>
                            <Braces className={stylex.props(styles.s9f5ea161).className || ''} />
                            Decoded Output
                          </div>
                          <div className={stylex.props(styles.s3ffc2aef).className || ''}>
                            {selectedResult.decodedBody !== undefined ? (
                              <DataViewer data={selectedResult.decodedBody} />
                            ) : (
                              <MutedState message="No decoded payload for this response." />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <MutedState message="Run a request to populate the response panel." />
                  )}
                </Panel>
              </>
            ) : definitionError ? (
              <ErrorState message={definitionError} />
            ) : loadingDefinitionKey ? (
              <MutedState message={`Loading schema for ${loadingDefinitionKey}…`} />
            ) : (
              <MutedState message="Choose an endpoint from the schema index to start exploring." />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
function RouteGroup({
  title,
  routes,
  selectedKey,
  onSelect,
}: {
  title: string
  routes: ApiSchemaRouteSummary[]
  selectedKey: string | null
  onSelect: (route: ApiSchemaRouteSummary) => void
}) {
  if (!routes.length) {
    return null
  }
  return (
    <section className="space-y-2">
      <div className={stylex.props(styles.s78289774).className || ''}>
        <h2 className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase">{title}</h2>
        <span className={stylex.props(styles.sb399e9e6).className || ''}>{routes.length}</span>
      </div>

      <div className="space-y-2">
        {routes.map((route) => {
          const isSelected = route.key === selectedKey
          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onSelect(route)}
              className={`group flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? 'border-zinc-300 bg-zinc-100'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <div className="min-w-0">
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <span className={stylex.props(styles.s79b4711b).className || ''}>{route.key}</span>
                  <StatusPill label={route.method} tone={route.kind === 'query' ? 'sky' : 'amber'} compact />
                </div>
                <p className={stylex.props(styles.sc2fd7247).className || ''}>{route.path}</p>
              </div>
              <ChevronRight
                className={`mt-1 h-4 w-4 shrink-0 transition ${
                  isSelected ? 'text-zinc-600' : 'text-zinc-300 group-hover:text-zinc-500'
                }`}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
function SchemaNodeView({
  rootSchema,
  schema,
  name,
  required = false,
  isRoot = false,
}: {
  rootSchema: JSONSchemaNode
  schema: JSONSchemaNode
  name?: string
  required?: boolean
  isRoot?: boolean
}) {
  const resolvedSchema = resolveSchemaNode(rootSchema, schema)
  const schemaType = getSchemaType(resolvedSchema)
  const variants = resolvedSchema.oneOf ?? resolvedSchema.anyOf
  return (
    <div className={`rounded-xl border border-zinc-200 ${isRoot ? 'bg-white' : 'bg-zinc-50'} p-4`}>
      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
        {name ? <code className={stylex.props(styles.sf8d612f7).className || ''}>{name}</code> : null}
        {required ? (
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-rose-700 uppercase">
            required
          </span>
        ) : null}
        {schemaType ? <SchemaBadge label={schemaType} tone="slate" /> : null}
        {resolvedSchema['x-js-type'] ? <SchemaBadge label={resolvedSchema['x-js-type']} tone="amber" /> : null}
        {resolvedSchema.contentEncoding ? (
          <SchemaBadge label={`encoding: ${resolvedSchema.contentEncoding}`} tone="sky" />
        ) : null}
      </div>

      {resolvedSchema.description ? (
        <p className={stylex.props(styles.s357fc043).className || ''}>{resolvedSchema.description}</p>
      ) : null}

      {resolvedSchema.enum?.length ? (
        <div className={stylex.props(styles.scbcc2085).className || ''}>
          {resolvedSchema.enum.map((option, optionIndex) => (
            <SchemaBadge key={`${String(option)}-${optionIndex}`} label={formatInlineValue(option)} tone="emerald" />
          ))}
        </div>
      ) : null}

      {resolvedSchema.default !== undefined ? (
        <p className="mt-3 text-xs tracking-[0.18em] text-zinc-500 uppercase">
          Default{' '}
          <span className={stylex.props(styles.sd71515ff).className || ''}>
            {formatInlineValue(resolvedSchema.default)}
          </span>
        </p>
      ) : null}

      {variants?.length ? (
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div key={`variant-${index}`} className={stylex.props(styles.s3a19df69).className || ''}>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Option {index + 1}</p>
              <SchemaNodeView rootSchema={rootSchema} schema={variant} name={undefined} />
            </div>
          ))}
        </div>
      ) : null}

      {(schemaType === 'object' || (!schemaType && resolvedSchema.properties)) && resolvedSchema.properties ? (
        <div className="mt-4 space-y-3">
          {Object.entries(resolvedSchema.properties).map(([propertyName, propertySchema]) => (
            <SchemaNodeView
              key={propertyName}
              rootSchema={rootSchema}
              schema={propertySchema}
              name={propertyName}
              required={resolvedSchema.required?.includes(propertyName)}
            />
          ))}
        </div>
      ) : null}

      {schemaType === 'array' ? (
        <div className={stylex.props(styles.sd432b4bb).className || ''}>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Array Items</p>
          {Array.isArray(resolvedSchema.items) ? (
            resolvedSchema.items.map((itemSchema, index) => (
              <SchemaNodeView
                key={`array-item-${index}`}
                rootSchema={rootSchema}
                schema={itemSchema}
                name={`item ${index + 1}`}
              />
            ))
          ) : resolvedSchema.items ? (
            <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.items} name="item" />
          ) : (
            <MutedState message="Array item schema is not specified." />
          )}
        </div>
      ) : null}

      {resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object' ? (
        <div className={stylex.props(styles.sd432b4bb).className || ''}>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Additional Properties</p>
          <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.additionalProperties} name="*" />
        </div>
      ) : null}
    </div>
  )
}
function ResponseBlock({title, content}: {title: string; content: string}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <div className={stylex.props(styles.s8dc64edf).className || ''}>
        <Braces className={stylex.props(styles.s4768be23).className || ''} />
        {title}
      </div>
      <pre className={stylex.props(styles.sf67243d5).className || ''}>{content}</pre>
    </div>
  )
}
function Panel({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6', className)}>
      {eyebrow || title || subtitle ? (
        <div className="mb-5 flex flex-col gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.28em] text-zinc-500 uppercase">{eyebrow}</p>
            ) : null}
            {title ? <h2 className={stylex.props(styles.s2b839648).className || ''}>{title}</h2> : null}
            {subtitle ? <p className={stylex.props(styles.sb7a80442).className || ''}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </section>
  )
}
function ActionButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-100 disabled:text-zinc-400"
    >
      {children}
    </button>
  )
}
function SchemaTabButton({label, isActive, onClick}: {label: string; isActive: boolean; onClick: () => void}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        isActive ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
      }`}
    >
      {label}
    </button>
  )
}
function StatusPill({
  label,
  tone,
  compact = false,
}: {
  label: string
  tone: 'amber' | 'sky' | 'slate' | 'emerald' | 'rose'
  compact?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-[0.16em] uppercase ${getPillClasses(
        tone,
      )} ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'}`}
    >
      {label}
    </span>
  )
}
function SchemaBadge({label, tone}: {label: string; tone: 'amber' | 'sky' | 'slate' | 'emerald'}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${getPillClasses(
        tone,
      )}`}
    >
      {label}
    </span>
  )
}
function MetaBlock({label, value}: {label: string; value: string}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">{label}</p>
      <p className={stylex.props(styles.s85de826b).className || ''}>{value}</p>
    </div>
  )
}
function KeyValueList({
  title,
  rows,
  emptyMessage = 'Nothing to show.',
}: {
  title: string
  rows: Array<{
    key: string
    value: string
  }>
  emptyMessage?: string
}) {
  return (
    <div className={stylex.props(styles.s46c30091).className || ''}>
      <div className={stylex.props(styles.s8dc64edf).className || ''}>
        <ArrowRight className={stylex.props(styles.s9f5ea161).className || ''} />
        {title}
      </div>
      {rows.length ? (
        <div className="mt-4 space-y-2">
          {rows.map((row) => (
            <div key={`${row.key}-${row.value}`} className={stylex.props(styles.s2c815aea).className || ''}>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">{row.key}</p>
              <p className={stylex.props(styles.sbb5ba128).className || ''}>{row.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <MutedState message={emptyMessage} />
      )}
    </div>
  )
}
function InlineAlert({title, message}: {title: string; message: string}) {
  return (
    <div className={stylex.props(styles.s5ab913f5).className || ''}>
      <div className={stylex.props(styles.s69f644cf).className || ''}>
        <AlertCircle className={stylex.props(styles.sca3de968).className || ''} />
        {title}
      </div>
      <p className={stylex.props(styles.s9097ff5).className || ''}>{message}</p>
    </div>
  )
}
function ErrorState({message}: {message: string}) {
  return (
    <div className={stylex.props(styles.se6fec38).className || ''}>
      <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase">
        <Unplug className={stylex.props(styles.sca3de968).className || ''} />
        Error
      </div>
      <p className={stylex.props(styles.sd6b3e1b6).className || ''}>{message}</p>
    </div>
  )
}
function MutedState({message}: {message: string}) {
  return <div className={stylex.props(styles.s44342515).className || ''}>{message}</div>
}
function buildAbsoluteUrl(apiHost: string, path: string): string {
  return `${apiHost.replace(/\/+$/, '')}${path}`
}
function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
function formatInlineValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return String(value)
}
function prettyRawBody(rawBody: string): string {
  try {
    return JSON.stringify(JSON.parse(rawBody), null, 2)
  } catch {
    return rawBody
  }
}
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
function getPillClasses(tone: 'amber' | 'sky' | 'slate' | 'emerald' | 'rose'): string {
  switch (tone) {
    case 'amber':
      return 'bg-amber-100 text-amber-800'
    case 'sky':
      return 'bg-sky-100 text-sky-800'
    case 'emerald':
      return 'bg-emerald-100 text-emerald-800'
    case 'rose':
      return 'bg-rose-100 text-rose-800'
    case 'slate':
      return 'bg-zinc-200 text-zinc-800'
  }
}
function getSchemaType(schema: JSONSchemaNode): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== 'null') ?? schema.type[0]
  }
  return schema.type
}
