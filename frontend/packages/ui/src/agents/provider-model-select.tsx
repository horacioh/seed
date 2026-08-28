import * as stylex from '@stylexjs/stylex'
import type {AgentModelRef, ModelProviderInfo, ModelProviderType} from './client'
import {useModelProviders, useProviderModels} from './models'
import {Popover, PopoverContent, PopoverTrigger} from '@shm/ui/components/popover'
import {Input} from '@shm/ui/components/input'
import {SizableText} from '@shm/ui/text'
import {cn} from '@shm/ui/utils'
import {Check, ChevronsUpDown, Plus} from 'lucide-react'
import {useMemo, useState} from 'react'
import {curateProviderModels, modelLabel} from './model-utils'
import {ProviderIcon} from './provider-icons'

/**
 * Unified provider + model picker: one popover listing every configured
 * provider as a section with its model catalog inside, searchable across all
 * of them. Clicking a model selects the provider/model pair together; the
 * optional per-row checkboxes mark quick-switch choices (which may span
 * providers) without changing the active pair. Replaces the separate provider
 * dropdown + model dropdown in agent settings and agent creation.
 */
const styles_4 = stylex.create({
  s9dde61f: {
    borderColor: 'var(--border)',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: 'transparent',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    textAlign: 'left',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    transitionProperty: 'color, box-shadow, border-color',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
    outlineStyle: 'none',
    ':hover': {
      '@media (hover: hover)': {
        borderColor: 'color-mix(in oklab, var(--color-black) 10%, transparent)',
      },
    },
  },
  s1a523930: {
    ':disabled': {
      cursor: 'not-allowed',
      backgroundColor: 'var(--color-zinc-300)',
      color: 'var(--color-zinc-400)',
      borderColor: 'var(--color-zinc-100)',
      opacity: '50%',
    },
  },
  sbbf724af: {
    width: 'var(--radix-popover-trigger-width)',
    minWidth: '320px',
    padding: 'calc(var(--spacing) * 0)',
  },
  s1565db2: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    color: 'var(--muted-foreground)',
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1.5)',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1.5)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  sbe39dfcb: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
    borderRadius: 'calc(var(--radius) - 4px)',
  },
  se9ed621d: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    color: 'var(--muted-foreground)',
    width: '100%',
    borderRadius: 'calc(var(--radius) - 4px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 1)',
    textAlign: 'left',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
})
const styles_3 = stylex.create({
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s5fd609e3: {
    backgroundColor: 'var(--muted)',
  },
  sbf6d1735: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'var(--primary-foreground)',
  },
  s1ef74b5d: {
    borderColor: 'var(--border)',
    backgroundColor: 'transparent',
  },
  s54eab79d: {
    opacity: '50%',
  },
})
const styles_2 = stylex.create({
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sb0abbfc8: {
    maxHeight: 'calc(0.25rem * 80)',
    overflowY: 'auto',
    padding: 'calc(0.25rem * 1)',
  },
  s77ffb38b: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1.5)',
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s64fb8207: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  sf8eef924: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sccf39e3a: {
    color: 'var(--muted-foreground)',
    flexShrink: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  sf0768e89: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  s898dc4c9: {
    borderColor: 'var(--border)',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    padding: 'calc(0.25rem * 2)',
  },
  s333ff802: {
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s8a8b6bda: {
    borderColor: 'var(--border)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    padding: 'calc(0.25rem * 1)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s345f16: {
    paddingBottom: 'calc(0.25rem * 1)',
  },
  s96733437: {
    color: 'var(--muted-foreground)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingTop: 'calc(0.25rem * 2)',
    paddingBottom: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
  },
  s658e7cef: {
    color: 'var(--destructive)',
    display: 'block',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
  sc17542d: {
    display: 'block',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
  s8e73fafa: {
    marginLeft: 'calc(0.25rem * 2)',
    display: 'flex',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.125rem',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
})
export function ProviderModelSelect({
  serverUrl,
  accountUid,
  agentId,
  value,
  onChange,
  enabledModels,
  onToggleModel,
  onAddProvider,
  disabled,
}: {
  serverUrl: string | undefined
  accountUid: string | null | undefined
  /** Set when editing an existing agent so shared agents list the owner's providers. */
  agentId?: string
  /** Active pair; empty strings mean nothing is selected yet. */
  value: AgentModelRef
  onChange: (entry: AgentModelRef) => void
  /** Checked quick-switch pairs; the active pair counts as checked implicitly. */
  enabledModels?: AgentModelRef[]
  /** Enables the per-row checkboxes when provided. */
  onToggleModel?: (entry: AgentModelRef, enabled: boolean) => void
  onAddProvider?: () => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const providers = useModelProviders(serverUrl, accountUid, agentId)
  const trimmedQuery = query.trim().toLowerCase()
  const valueProvider = providers.data?.find((provider) => provider.name === value.provider)
  const triggerLabel = value.model || 'Select a model'
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={cn(
          stylex.props(styles_4.s9dde61f).className || '',
          stylex.props(styles_4.s1a523930).className || '',
        )}
      >
        <span className={stylex.props(styles_2.sa4681c45).className || ''}>
          {valueProvider ? (
            <ProviderIcon
              type={valueProvider.type as ModelProviderType}
              className={stylex.props(styles.sf8eef924).className || ''}
            />
          ) : null}
          <span
            className={cn(
              stylex.props(styles.s6e724d66).className || '',
              stylex.props(!value.model && styles_3.sf2718385).className || '',
            )}
          >
            {triggerLabel}
          </span>
          {value.model && (providers.data?.length ?? 0) > 1 ? (
            <span className={stylex.props(styles.sccf39e3a).className || ''}>{value.provider}</span>
          ) : null}
        </span>
        <ChevronsUpDown className={stylex.props(styles.sf0768e89).className || ''} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={stylex.props(styles_4.sbbf724af).className || ''}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className={stylex.props(styles.s898dc4c9).className || ''}>
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models…"
          />
        </div>
        <div className={stylex.props(styles_2.sb0abbfc8).className || ''}>
          {providers.isLoading ? (
            <div className={stylex.props(styles.s333ff802).className || ''}>
              <SizableText size="sm" color="muted">
                Loading providers…
              </SizableText>
            </div>
          ) : !providers.data?.length ? (
            <div className={stylex.props(styles.s333ff802).className || ''}>
              <SizableText size="sm" color="muted">
                No providers configured yet.
              </SizableText>
            </div>
          ) : (
            providers.data.map((provider) => (
              <ProviderModelSection
                key={provider.id}
                serverUrl={serverUrl}
                accountUid={accountUid}
                agentId={agentId}
                provider={provider}
                query={trimmedQuery}
                value={value}
                enabledModels={enabledModels}
                onToggleModel={onToggleModel}
                onSelect={(entry) => {
                  onChange(entry)
                  setOpen(false)
                }}
              />
            ))
          )}
        </div>
        {onAddProvider ? (
          <div className={stylex.props(styles.s8a8b6bda).className || ''}>
            <button
              type="button"
              className={stylex.props(styles_4.s1565db2).className || ''}
              onClick={() => {
                setOpen(false)
                onAddProvider()
              }}
            >
              <Plus className={stylex.props(styles.s3269316e).className || ''} />
              Add provider…
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

/** One provider's group in the unified picker: header, its model catalog, and a show-all toggle. */
function ProviderModelSection({
  serverUrl,
  accountUid,
  agentId,
  provider,
  query,
  value,
  enabledModels,
  onToggleModel,
  onSelect,
}: {
  serverUrl: string | undefined
  accountUid: string | null | undefined
  agentId?: string
  provider: ModelProviderInfo
  /** Lower-cased trimmed search text; empty shows the curated list. */
  query: string
  value: AgentModelRef
  enabledModels?: AgentModelRef[]
  onToggleModel?: (entry: AgentModelRef, enabled: boolean) => void
  onSelect: (entry: AgentModelRef) => void
}) {
  const models = useProviderModels(serverUrl, accountUid, provider.name, agentId)
  const [showAll, setShowAll] = useState(false)
  const curated = useMemo(() => curateProviderModels(models.data, provider.type), [models.data, provider.type])
  const visibleModels = useMemo(() => {
    if (query) {
      return curated.all.filter(
        (model) => model.id.toLowerCase().includes(query) || model.name.toLowerCase().includes(query),
      )
    }
    return showAll ? curated.all : curated.recommended
  }, [curated, query, showAll])

  // While searching, a provider with no matches drops out entirely instead of
  // showing an empty header.
  if (query && !visibleModels.length) return null
  return (
    <div className={stylex.props(styles.s345f16).className || ''}>
      <div className={stylex.props(styles.s96733437).className || ''}>
        <ProviderIcon
          type={provider.type as ModelProviderType}
          className={stylex.props(styles.s3269316e).className || ''}
        />
        <span className={stylex.props(styles.s6e724d66).className || ''}>{provider.name}</span>
      </div>
      {models.isError ? (
        <SizableText size="xs" className={stylex.props(styles.s658e7cef).className || ''}>
          {models.error instanceof Error ? models.error.message : 'Could not load models'}
        </SizableText>
      ) : models.isLoading ? (
        <SizableText size="xs" color="muted" className={stylex.props(styles.sc17542d).className || ''}>
          Loading models…
        </SizableText>
      ) : !visibleModels.length ? (
        <SizableText size="xs" color="muted" className={stylex.props(styles.sc17542d).className || ''}>
          No models found.
        </SizableText>
      ) : (
        visibleModels.map((model) => {
          const isActive = provider.name === value.provider && model.id === value.model
          const isEnabled =
            isActive || !!enabledModels?.some((entry) => entry.provider === provider.name && entry.model === model.id)
          return (
            <div
              key={model.id}
              className={cn(
                stylex.props(styles_4.sbe39dfcb).className || '',
                stylex.props(isActive && styles_3.s5fd609e3).className || '',
              )}
            >
              {onToggleModel ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isEnabled}
                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${modelLabel(model)} for quick switching`}
                  title={
                    isActive
                      ? 'The current model is always available'
                      : isEnabled
                        ? 'Remove from the model switcher'
                        : 'Add to the model switcher'
                  }
                  disabled={isActive}
                  className={cn(
                    stylex.props(styles.s8e73fafa).className || '',
                    stylex.props(isEnabled ? styles_3.sbf6d1735 : styles_3.s1ef74b5d).className || '',
                    stylex.props(isActive && styles_3.s54eab79d).className || '',
                  )}
                  onClick={() =>
                    onToggleModel(
                      {
                        provider: provider.name,
                        model: model.id,
                      },
                      !isEnabled,
                    )
                  }
                >
                  {isEnabled ? <Check className={stylex.props(styles.sca3de967).className || ''} /> : null}
                </button>
              ) : null}
              <button
                type="button"
                className={stylex.props(styles_2.s77ffb38b).className || ''}
                onClick={() =>
                  onSelect({
                    provider: provider.name,
                    model: model.id,
                  })
                }
              >
                <span className={stylex.props(styles_2.s64fb8207).className || ''}>{modelLabel(model)}</span>
                {isActive ? <Check className={stylex.props(styles.sf8eef924).className || ''} /> : null}
              </button>
            </div>
          )
        })
      )}
      {!query && curated.hasMore && !models.isLoading && !models.isError ? (
        <button
          type="button"
          className={stylex.props(styles_4.se9ed621d).className || ''}
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Show fewer models' : `Show all ${curated.all.length} models`}
        </button>
      ) : null}
    </div>
  )
}
