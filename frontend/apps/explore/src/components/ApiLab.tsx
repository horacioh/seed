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
import {useDeferredValue, useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
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
} from '../api-lab'
import {useApiHost} from '../apiHostStore'
import DataViewer from './DataViewer'

/** Developer playground for the desktop TypeScript HTTP API. */
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
  s99f3c3c3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.4% 0.046 257.417)',
  },
  sc7c6263a: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)',
    padding: 'calc(0.25rem * 4)',
  },
  s155ffa56: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.9% 0.041 260.031)',
  },
  sc5293c96: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(20.8% 0.042 265.755)',
  },
  s4768be23: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(76.9% 0.188 70.08)',
  },
  s720ca7bb: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.6% 0.043 257.281)',
  },
  se228e976: {
    display: 'inline-flex',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(96.8% 0.007 247.896)',
    padding: 'calc(0.25rem * 1)',
  },
  sff93336e: {
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)',
  },
  s576f334c: {
    cursor: 'pointer',
    listStyleType: 'none',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(27.9% 0.041 260.031)',
  },
  s5e351f5f: {
    overflowX: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37.2% 0.044 257.287)',
  },
  s7d0eb007: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.4% 0.046 257.417)',
  },
  s9f5ea161: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(68.5% 0.169 237.323)',
  },
  sebadccac: {
    marginTop: 'calc(0.25rem * 4)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
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
  s59cb3585: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    color: 'oklch(70.4% 0.04 256.788)',
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s56ff61da: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(20.8% 0.042 265.755)',
  },
  s36d848a6: {
    marginTop: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
    color: 'oklch(55.4% 0.046 257.417)',
  },
  sb2d2baf0: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(20.8% 0.042 265.755)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    color: '#fff',
  },
  s149f498c: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.043 257.281)',
  },
  scbcc2085: {
    marginTop: 'calc(0.25rem * 3)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  s2aec4671: {
    marginLeft: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(92.9% 0.013 255.508)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0em',
    color: 'oklch(27.9% 0.041 260.031)',
    textTransform: 'none',
  },
  se2631900: {
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  s8b64edee: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
  },
  s7b2650b8: {
    marginTop: 'calc(0.25rem * 4)',
    overflowX: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37.2% 0.044 257.287)',
  },
  sdf14d023: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
    color: 'oklch(12.9% 0.042 264.695)',
  },
  sd77f856d: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.043 257.281)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sd0177a8a: {
    marginTop: 'calc(0.25rem * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(20.8% 0.042 265.755)',
  },
  sb3c7b34e: {
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s4a3ea40b: {
    marginTop: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.9% 0.041 260.031)',
  },
  s5f49acfc: {
    borderRadius: 'var(--radius)',
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
  s1300853f: {
    borderRadius: 'var(--radius)',
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
  s2a13436d: {
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)',
    padding: 'calc(0.25rem * 6)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(55.4% 0.046 257.417)',
  },
})
export default function ApiLab() {
  const apiHost = useApiHost()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedKey = searchParams.get('key')
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
    const firstRoute = routes[0]
    if (!firstRoute) {
      return
    }
    if (selectedKey && routes.some((route) => route.key === selectedKey)) {
      return
    }
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('key', firstRoute.key)
    setSearchParams(nextParams, {
      replace: true,
    })
  }, [schemaIndex, searchParams, selectedKey, setSearchParams])
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
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('key', route.key)
    setSearchParams(nextParams)
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
    <div>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-2 pb-10">
        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <Panel>
              <label className={stylex.props(styles.sd63a8a39).className || ''}>
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={routeFilter}
                  onChange={(event) => setRouteFilter(event.target.value)}
                  placeholder="Filter by key or path"
                  className="w-full rounded-md border border-slate-200 bg-white px-11 py-3 text-sm text-slate-900 transition outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </label>

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
            </Panel>
          </aside>

          <main className="space-y-6">
            {selectedDefinition ? (
              <>
                <Panel
                  eyebrow={selectedDefinition.kind}
                  title={selectedDefinition.key}
                  subtitle={`${selectedDefinition.method} ${selectedDefinition.path}`}
                  actions={
                    <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                      <StatusPill label={selectedDefinition.inputEncoding} tone="amber" />
                      <StatusPill label={selectedDefinition.outputSerialization} tone="sky" />
                      {selectedDefinition.usesParamMapping ? (
                        <StatusPill label="Mapped query params" tone="slate" />
                      ) : null}
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

                <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                  <Panel
                    eyebrow="Request Composer"
                    title="Input JSON"
                    subtitle="Edit the logical input payload. The lab will derive the real wire shape from the schema."
                    actions={
                      <div className={stylex.props(styles.se80bcbd2).className || ''}>
                        <ActionButton onClick={handleInputReset} disabled={!selectedDefinition}>
                          <RefreshCw className={stylex.props(styles.sca3de968).className || ''} />
                          Reset
                        </ActionButton>
                        <ActionButton onClick={handleFormatJson} disabled={!selectedDefinition || !!previewError}>
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
                      className="min-h-[25rem] w-full rounded-md border border-slate-900/10 bg-slate-950 px-4 py-4 font-mono text-sm leading-6 text-slate-100 transition outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                    />

                    {previewError ? <InlineAlert title="Preview unavailable" message={previewError} /> : null}
                    {runError ? <InlineAlert title="Request failed" message={runError} /> : null}

                    <div className={stylex.props(styles.se80bcbd3).className || ''}>
                      <button
                        type="button"
                        onClick={handleRunRequest}
                        disabled={!preview || isRunning}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {isRunning ? (
                          <RefreshCw className={stylex.props(styles.s2b64fb66).className || ''} />
                        ) : (
                          <TerminalSquare className={stylex.props(styles.sca3de968).className || ''} />
                        )}
                        {isRunning ? 'Running…' : 'Run request'}
                      </button>
                      <div className={stylex.props(styles.s99f3c3c3).className || ''}>
                        <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
                        Exact transport: {selectedDefinition.method}{' '}
                        {selectedDefinition.method === 'GET' ? 'query string' : 'CBOR body'}
                      </div>
                    </div>
                  </Panel>

                  <Panel
                    eyebrow="Wire Preview"
                    title="HTTP Request"
                    subtitle="The resolved request that will be sent to the desktop API."
                    actions={
                      <ActionButton onClick={handleCopyPreviewUrl} disabled={!preview}>
                        <Copy className={stylex.props(styles.sca3de968).className || ''} />
                        Copy URL
                      </ActionButton>
                    }
                  >
                    {preview ? (
                      <div className="space-y-5">
                        <div className={stylex.props(styles.sc7c6263a).className || ''}>
                          <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                            <StatusPill label={preview.method} tone="slate" />
                            <p className={stylex.props(styles.s155ffa56).className || ''}>{preview.url}</p>
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
                          <div className={stylex.props(styles.sc7c6263a).className || ''}>
                            <div className={stylex.props(styles.sc5293c96).className || ''}>
                              <Binary className={stylex.props(styles.s4768be23).className || ''} />
                              CBOR body
                            </div>
                            <p className={stylex.props(styles.s720ca7bb).className || ''}>
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
                  subtitle="Follow the schema tree while composing requests or inspecting response structure."
                  actions={
                    <div className={stylex.props(styles.se228e976).className || ''}>
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

                      <details className={stylex.props(styles.sff93336e).className || ''}>
                        <summary className={stylex.props(styles.s576f334c).className || ''}>Raw JSON Schema</summary>
                        <pre className={stylex.props(styles.s5e351f5f).className || ''}>
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
                        <p className={stylex.props(styles.s7d0eb007).className || ''}>
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
                        <div className={stylex.props(styles.sc7c6263a).className || ''}>
                          <div className={stylex.props(styles.sc5293c96).className || ''}>
                            <Braces className={stylex.props(styles.s9f5ea161).className || ''} />
                            Decoded Output
                          </div>
                          <div className={stylex.props(styles.sebadccac).className || ''}>
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
          </main>
        </div>
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
        <h2 className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">{title}</h2>
        <span className={stylex.props(styles.s59cb3585).className || ''}>{routes.length}</span>
      </div>

      <div className="space-y-2">
        {routes.map((route) => {
          const isSelected = route.key === selectedKey
          return (
            <button
              key={route.key}
              type="button"
              onClick={() => onSelect(route)}
              className={`group flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition ${
                isSelected
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="min-w-0">
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <span className={stylex.props(styles.s56ff61da).className || ''}>{route.key}</span>
                  <StatusPill label={route.method} tone={route.kind === 'query' ? 'sky' : 'amber'} compact />
                </div>
                <p className={stylex.props(styles.s36d848a6).className || ''}>{route.path}</p>
              </div>
              <ChevronRight
                className={`mt-1 h-4 w-4 shrink-0 transition ${
                  isSelected ? 'text-amber-500' : 'text-slate-300 group-hover:text-slate-500'
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
    <div className={`rounded-lg border border-slate-200 ${isRoot ? 'bg-white' : 'bg-slate-50'} p-4`}>
      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
        {name ? <code className={stylex.props(styles.sb2d2baf0).className || ''}>{name}</code> : null}
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
        <p className={stylex.props(styles.s149f498c).className || ''}>{resolvedSchema.description}</p>
      ) : null}

      {resolvedSchema.enum?.length ? (
        <div className={stylex.props(styles.scbcc2085).className || ''}>
          {resolvedSchema.enum.map((option, optionIndex) => (
            <SchemaBadge key={`${String(option)}-${optionIndex}`} label={formatInlineValue(option)} tone="emerald" />
          ))}
        </div>
      ) : null}

      {resolvedSchema.default !== undefined ? (
        <p className="mt-3 text-xs tracking-[0.18em] text-slate-500 uppercase">
          Default{' '}
          <span className={stylex.props(styles.s2aec4671).className || ''}>
            {formatInlineValue(resolvedSchema.default)}
          </span>
        </p>
      ) : null}

      {variants?.length ? (
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div key={`variant-${index}`} className={stylex.props(styles.se2631900).className || ''}>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Option {index + 1}</p>
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
        <div className={stylex.props(styles.s8b64edee).className || ''}>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Array Items</p>
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
        <div className={stylex.props(styles.s8b64edee).className || ''}>
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Additional Properties</p>
          <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.additionalProperties} name="*" />
        </div>
      ) : null}
    </div>
  )
}
function ResponseBlock({title, content}: {title: string; content: string}) {
  return (
    <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <div className={stylex.props(styles.sc5293c96).className || ''}>
        <Braces className={stylex.props(styles.s4768be23).className || ''} />
        {title}
      </div>
      <pre className={stylex.props(styles.s7b2650b8).className || ''}>{content}</pre>
    </div>
  )
}
function Panel({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/95 p-2 backdrop-blur sm:p-6">
      {eyebrow || title || subtitle ? (
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">{eyebrow}</p>
            ) : null}
            {title ? <h2 className={stylex.props(styles.sdf14d023).className || ''}>{title}</h2> : null}
            {subtitle ? <p className={stylex.props(styles.sd77f856d).className || ''}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{actions}</div> : null}
        </div>
      ) : null}
      <div className="space-y-4">{children}</div>
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
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
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
        isActive ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-slate-900'
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
    <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">{label}</p>
      <p className={stylex.props(styles.sd0177a8a).className || ''}>{value}</p>
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
    <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <div className={stylex.props(styles.sc5293c96).className || ''}>
        <ArrowRight className={stylex.props(styles.s9f5ea161).className || ''} />
        {title}
      </div>
      {rows.length ? (
        <div className="mt-4 space-y-2">
          {rows.map((row) => (
            <div key={`${row.key}-${row.value}`} className={stylex.props(styles.sb3c7b34e).className || ''}>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">{row.key}</p>
              <p className={stylex.props(styles.s4a3ea40b).className || ''}>{row.value}</p>
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
    <div className={stylex.props(styles.s5f49acfc).className || ''}>
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
    <div className={stylex.props(styles.s1300853f).className || ''}>
      <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em] uppercase">
        <Unplug className={stylex.props(styles.sca3de968).className || ''} />
        Error
      </div>
      <p className={stylex.props(styles.sd6b3e1b6).className || ''}>{message}</p>
    </div>
  )
}
function MutedState({message}: {message: string}) {
  return <div className={stylex.props(styles.s2a13436d).className || ''}>{message}</div>
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
      return 'bg-slate-200 text-slate-800'
  }
}
function getSchemaType(schema: JSONSchemaNode): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find((type) => type !== 'null') ?? schema.type[0]
  }
  return schema.type
}
