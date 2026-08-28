import * as stylex from '@stylexjs/stylex'
import {type AgentSessionTriggerContext, type AgentTriggerSource} from './client'
import {useNavigate} from './navigation'
import {AccountSearchInput, type SearchResult} from '@shm/ui/collaborators-page'
import {Input} from '@shm/ui/components/input'
import {SelectDropdown} from '@shm/ui/select-dropdown'
import {SizableText} from '@shm/ui/text'
import type {LoadedEvent} from '@shm/shared/models/activity-service'
import {useSearch} from '@shm/shared/models/search'
import type {NavRoute} from '@shm/shared/routes'
import {getEventRoute} from '@shm/ui/feed'
import {abbreviateUid} from '@shm/shared/utils/abbreviate'
import {formattedDateMedium} from '@shm/shared/utils/date'
import {hmId, packHmId, unpackHmId} from '@shm/shared/utils/entity-id-url'
import {AtSign, CalendarClock, ChevronDown, ChevronRight, FileText, MessageSquare, Workflow} from 'lucide-react'
import React, {useMemo, useState} from 'react'

/**
 * Canonical per-trigger-type frontend definitions.
 *
 * Each trigger type (`AgentTriggerSource['type']`) keeps its option label, default config, summary,
 * configuration form, and triggered-session context rendering in one place so the four trigger types
 * stay in sync. The session UI renders {@link TriggerContextView} instead of the raw `<trigger_context>`
 * block that is sent to the model.
 */
const styles_4 = stylex.create({
  sae6a97a5: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
      },
    },
  },
  sbf63b0a7: {
    textAlign: 'left',
  },
  sd30dd60e: {
    ':hover': {
      '@media (hover: hover)': {
        textDecorationLine: 'underline',
      },
    },
  },
})
const styles_3 = stylex.create({
  s93ff291a: {
    display: 'grid',
    gap: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 768px))': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  s943f2834: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    textAlign: 'left',
  },
  sdc3fca4e: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    marginRight: 'calc(var(--spacing) * 6)',
    marginLeft: 'calc(var(--spacing) * 6)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s863380b5: {
    backgroundColor: 'color-mix(in oklab, var(--background) 60%, transparent)',
    color: 'var(--foreground)',
    maxHeight: 'calc(var(--spacing) * 72)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 2)',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
  },
  s8c95c59e: {
    backgroundColor: 'color-mix(in oklab, var(--background) 60%, transparent)',
    color: 'var(--foreground)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 2)',
    fontSize: '11px',
    whiteSpace: 'pre-wrap',
  },
  se477dfeb: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
        textDecorationLine: 'underline',
      },
    },
    marginTop: 'calc(var(--spacing) * 1.5)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 1)',
  },
})
const styles_2 = stylex.create({
  sc7fb7e12: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
    position: 'absolute',
    top: '100%',
    right: 'calc(0.25rem * 0)',
    left: 'calc(0.25rem * 0)',
    zIndex: '20',
    marginTop: 'calc(0.25rem * 1)',
    maxHeight: 'calc(0.25rem * 64)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 1)',
    boxShadow: 'var(--shadow-lg)',
  },
  s95a555ef: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--input)',
    display: 'flex',
    minHeight: 'calc(0.25rem * 9)',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s11c50038: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 1.5)',
  },
  s5e669942: {
    color: 'var(--muted-foreground)',
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  sd1c4c9a2: {
    display: 'grid',
    gap: 'calc(0.25rem * 3)',
  },
  s56a6d2ee: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  s731a65c2: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  se80bcbd2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)',
  },
  s853f1ce0: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s41184b39: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  scf771367: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
  },
  s8bf4c15d: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
    flexShrink: '0',
    opacity: '70%',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s2a511dff: {
    flexShrink: '0',
    fontWeight: '500',
  },
  s641fc4c4: {
    color: 'var(--muted-foreground)',
    marginTop: 'calc(0.25rem * 1)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 3)',
    rowGap: 'calc(0.25rem * 0.5)',
  },
  sa75e0209: {
    color: 'var(--destructive)',
    marginTop: 'calc(0.25rem * 1)',
  },
  sca3de967: {
    width: 'calc(0.25rem * 3)',
    height: 'calc(0.25rem * 3)',
  },
  sc0781492: {
    marginTop: 'calc(0.25rem * 1.5)',
  },
})
export const TRIGGER_TYPE_OPTIONS: {
  value: AgentTriggerSource['type']
  label: string
}[] = [
  {
    value: 'document-comment',
    label: 'Comment in a document',
  },
  {
    value: 'user-mention',
    label: 'User mention',
  },
  {
    value: 'site-update',
    label: 'Space update',
  },
  {
    value: 'schedule',
    label: 'Schedule',
  },
]
const SCHEDULE_MODE_OPTIONS = [
  {
    value: 'interval',
    label: 'Every interval',
  },
  {
    value: 'weekly',
    label: 'Days of week',
  },
  {
    value: 'once',
    label: 'One time',
  },
] as const
const SCHEDULE_UNIT_OPTIONS = [
  {
    value: 'minutes',
    label: 'Minutes',
  },
  {
    value: 'hours',
    label: 'Hours',
  },
] as const
export function defaultSourceForType(type: AgentTriggerSource['type']): AgentTriggerSource {
  if (type === 'user-mention')
    return {
      type,
      mentionedAccounts: [],
    }
  if (type === 'site-update')
    return {
      type,
      resourcePrefix: '',
      eventTypes: ['doc-update', 'comment'],
    }
  if (type === 'schedule')
    return {
      type,
      schedule: {
        kind: 'interval',
        every: 1,
        unit: 'hours',
      },
    }
  return {
    type: 'document-comment',
    resource: '',
  }
}

/** Reads the mentioned account list, tolerating legacy triggers that stored a single `mentionedAccount`. */
export function mentionedAccountsOf(
  source: Extract<
    AgentTriggerSource,
    {
      type: 'user-mention'
    }
  >,
): string[] {
  const legacy = (
    source as {
      mentionedAccount?: string
    }
  ).mentionedAccount
  return source.mentionedAccounts ?? (legacy ? [legacy] : [])
}

/** Compact human-readable description of how a trigger is configured. */
export function summarizeTriggerSource(source: AgentTriggerSource): string {
  if (source.type === 'document-comment') {
    return `Comment in ${source.resource}${source.author ? ` by ${source.author}` : ''}`
  }
  if (source.type === 'user-mention') {
    const accounts = mentionedAccountsOf(source)
    const mention = accounts.length ? accounts.map(abbreviateUid).join(', ') : 'anyone'
    return `Mention of ${mention}${source.resourcePrefix ? ` in ${source.resourcePrefix}` : ''}`
  }
  if (source.type === 'site-update') {
    return `Update in ${source.resourcePrefix}${source.eventTypes?.length ? ` (${source.eventTypes.join(', ')})` : ''}`
  }
  if (source.type === 'run-completed') {
    const whose = source.agentId ? ' by this agent' : ''
    const named = source.titleMatch ? ` named like “${source.titleMatch}”` : ''
    return `When a run${named}${whose} ${source.status ?? 'finishes'}`
  }
  if (source.schedule.kind === 'interval') return `Every ${source.schedule.every} ${source.schedule.unit}`
  if (source.schedule.kind === 'once') return `Once at ${formattedDateMedium(new Date(source.schedule.runAt))}`
  return `${source.schedule.daysOfWeek.map(dayName).join(', ')} at ${source.schedule.timeOfDay} ${
    source.schedule.timezone
  }`
}

// ---------------------------------------------------------------------------
// Configuration form
// ---------------------------------------------------------------------------

export function TriggerSourceFields({
  source,
  onChange,
  trailing,
}: {
  source: AgentTriggerSource
  onChange: (source: AgentTriggerSource) => void
  trailing?: React.ReactNode
}) {
  return (
    <div className={stylex.props(styles.sd1c4c9a2).className || ''}>
      <div className={stylex.props(styles.s56a6d2ee).className || ''}>
        <label className={stylex.props(styles.s731a65c2).className || ''}>
          <SizableText size="sm" weight="bold">
            Trigger Session on:
          </SizableText>
          <SelectDropdown
            options={TRIGGER_TYPE_OPTIONS}
            value={source.type}
            onValue={(value) => onChange(defaultSourceForType(value as AgentTriggerSource['type']))}
          />
        </label>
        {trailing}
      </div>
      {source.type === 'document-comment' ? (
        <div className={stylex.props(styles_3.s93ff291a).className || ''}>
          <DocumentAutocompleteField
            label="Document"
            value={source.resource}
            onChange={(value) =>
              onChange({
                ...source,
                resource: value,
              })
            }
            placeholder="Search documents or enter hm:// URL"
          />
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Author filter
            </SizableText>
            <Input
              value={source.author || ''}
              onChange={(event) =>
                onChange({
                  ...source,
                  author: event.target.value || undefined,
                })
              }
              placeholder="optional account ID"
            />
          </label>
        </div>
      ) : null}
      {source.type === 'user-mention' ? (
        <div className={stylex.props(styles.sd1c4c9a2).className || ''}>
          <MentionedAccountsField
            accounts={mentionedAccountsOf(source)}
            onChange={(accounts) =>
              onChange({
                ...source,
                mentionedAccounts: accounts,
              })
            }
          />
        </div>
      ) : null}
      {source.type === 'site-update' ? (
        <div className={stylex.props(styles_3.s93ff291a).className || ''}>
          <AccountAutocompleteField
            label="Resource/space prefix"
            value={source.resourcePrefix}
            onChange={(value) =>
              onChange({
                ...source,
                resourcePrefix: value,
              })
            }
            placeholder="Search space/account or enter hm:// prefix"
            valueFormat="hm-url"
          />
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Event types
            </SizableText>
            <Input
              value={(source.eventTypes || []).join(', ')}
              onChange={(event) =>
                onChange({
                  ...source,
                  eventTypes: event.target.value
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
              placeholder="doc-update, comment"
            />
          </label>
        </div>
      ) : null}
      {source.type === 'schedule' ? <ScheduleTriggerFields source={source} onChange={onChange} /> : null}
    </div>
  )
}
function ScheduleTriggerFields({
  source,
  onChange,
}: {
  source: Extract<
    AgentTriggerSource,
    {
      type: 'schedule'
    }
  >
  onChange: (source: AgentTriggerSource) => void
}) {
  const schedule = source.schedule
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  const setSchedule = (
    next: Extract<
      AgentTriggerSource,
      {
        type: 'schedule'
      }
    >['schedule'],
  ) =>
    onChange({
      type: 'schedule',
      schedule: next,
    })
  return (
    <div className={stylex.props(styles.sd1c4c9a2).className || ''}>
      <label className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="sm" weight="bold">
          Schedule mode
        </SizableText>
        <SelectDropdown
          options={SCHEDULE_MODE_OPTIONS}
          value={schedule.kind}
          onValue={(kind) => {
            if (kind === 'weekly')
              setSchedule({
                kind,
                daysOfWeek: [1, 2, 3, 4, 5],
                timeOfDay: '09:00',
                timezone,
              })
            else if (kind === 'once')
              setSchedule({
                kind,
                runAt: Date.now() + 60 * 60 * 1000,
                timezone,
              })
            else
              setSchedule({
                kind: 'interval',
                every: 1,
                unit: 'hours',
              })
          }}
        />
      </label>
      {schedule.kind === 'interval' ? (
        <div className={stylex.props(styles_3.s93ff291a).className || ''}>
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Every
            </SizableText>
            <Input
              type="number"
              min={1}
              value={schedule.every}
              onChange={(event) =>
                setSchedule({
                  ...schedule,
                  every: Number(event.target.value) || 1,
                })
              }
            />
          </label>
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Unit
            </SizableText>
            <SelectDropdown
              options={SCHEDULE_UNIT_OPTIONS}
              value={schedule.unit}
              onValue={(value) =>
                setSchedule({
                  ...schedule,
                  unit: value as 'minutes' | 'hours',
                })
              }
            />
          </label>
        </div>
      ) : null}
      {schedule.kind === 'weekly' ? (
        <div className={stylex.props(styles.sd1c4c9a2).className || ''}>
          <div className={stylex.props(styles.se80bcbd2).className || ''}>
            {[
              ['Mon', 1],
              ['Tue', 2],
              ['Wed', 3],
              ['Thu', 4],
              ['Fri', 5],
              ['Sat', 6],
              ['Sun', 0],
            ].map(([day, dayIndex]) => (
              <label key={day} className={stylex.props(styles.s853f1ce0).className || ''}>
                <input
                  type="checkbox"
                  checked={schedule.daysOfWeek.includes(dayIndex as number)}
                  onChange={(event) => {
                    const dayNumber = dayIndex as number
                    const daysOfWeek = event.target.checked
                      ? [...schedule.daysOfWeek, dayNumber].sort()
                      : schedule.daysOfWeek.filter((item) => item !== dayNumber)
                    setSchedule({
                      ...schedule,
                      daysOfWeek,
                    })
                  }}
                />
                {day}
              </label>
            ))}
          </div>
          <div className={stylex.props(styles_3.s93ff291a).className || ''}>
            <label className={stylex.props(styles.sfbc6e28d).className || ''}>
              <SizableText size="sm" weight="bold">
                Time of day
              </SizableText>
              <Input
                type="time"
                value={schedule.timeOfDay}
                onChange={(event) =>
                  setSchedule({
                    ...schedule,
                    timeOfDay: event.target.value,
                  })
                }
              />
            </label>
            <label className={stylex.props(styles.sfbc6e28d).className || ''}>
              <SizableText size="sm" weight="bold">
                Timezone
              </SizableText>
              <Input
                value={schedule.timezone}
                onChange={(event) =>
                  setSchedule({
                    ...schedule,
                    timezone: event.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>
      ) : null}
      {schedule.kind === 'once' ? (
        <div className={stylex.props(styles_3.s93ff291a).className || ''}>
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Date and time
            </SizableText>
            <Input
              type="datetime-local"
              value={dateTimeLocalValue(schedule.runAt)}
              onChange={(event) =>
                setSchedule({
                  ...schedule,
                  runAt: new Date(event.target.value).getTime(),
                  timezone,
                })
              }
            />
          </label>
          <label className={stylex.props(styles.sfbc6e28d).className || ''}>
            <SizableText size="sm" weight="bold">
              Timezone
            </SizableText>
            <Input
              value={schedule.timezone || timezone}
              onChange={(event) =>
                setSchedule({
                  ...schedule,
                  timezone: event.target.value,
                })
              }
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
function DocumentAutocompleteField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  const search = useSearch(value, {
    enabled: focused && value.trim().length > 0,
    pageSize: 12,
  })
  const documents = useMemo(
    () => (search.data?.entities || []).filter((item) => item.type === 'document').slice(0, 8),
    [search.data?.entities],
  )
  return (
    <label className={stylex.props(styles.s41184b39).className || ''}>
      <SizableText size="sm" weight="bold">
        {label}
      </SizableText>
      <Input
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {focused && documents.length ? (
        <div className={stylex.props(styles_2.sc7fb7e12).className || ''}>
          {documents.map((document) => {
            const nextValue = packHmId(document.id)
            return (
              <button
                key={document.id.id}
                type="button"
                className={stylex.props(styles_3.s943f2834).className || ''}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(nextValue)
                  setFocused(false)
                }}
              >
                <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
                  {document.title || nextValue}
                </SizableText>
                <SizableText size="xs" color="muted" className={stylex.props(styles.scf771367).className || ''}>
                  {nextValue}
                </SizableText>
              </button>
            )
          })}
        </div>
      ) : null}
    </label>
  )
}
function AccountAutocompleteField({
  label,
  value,
  onChange,
  placeholder,
  valueFormat,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  valueFormat: 'uid' | 'hm-url'
}) {
  const [focused, setFocused] = useState(false)
  const search = useSearch(value, {
    enabled: focused && value.trim().length > 0,
    pageSize: 12,
  })
  const accounts = useMemo(
    () => (search.data?.entities || []).filter((item) => item.type === 'contact' || !item.id.path?.length).slice(0, 8),
    [search.data?.entities],
  )
  return (
    <label className={stylex.props(styles.s41184b39).className || ''}>
      <SizableText size="sm" weight="bold">
        {label}
      </SizableText>
      <Input
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {focused && accounts.length ? (
        <div className={stylex.props(styles_2.sc7fb7e12).className || ''}>
          {accounts.map((account) => {
            const nextValue = valueFormat === 'hm-url' ? `hm://${account.id.uid}` : account.id.uid
            return (
              <button
                key={`${account.id.id}:${account.type}`}
                type="button"
                className={stylex.props(styles_3.s943f2834).className || ''}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(nextValue)
                  setFocused(false)
                }}
              >
                <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
                  {account.title || account.id.uid}
                </SizableText>
                <SizableText size="xs" color="muted" className={stylex.props(styles.scf771367).className || ''}>
                  {nextValue}
                </SizableText>
              </button>
            )
          })}
        </div>
      ) : null}
    </label>
  )
}
function MentionedAccountsField({accounts, onChange}: {accounts: string[]; onChange: (accounts: string[]) => void}) {
  const accountsKey = accounts.join('|')
  const values = useMemo<SearchResult[]>(
    () =>
      accounts.map((uid) => ({
        id: hmId(uid),
        label: abbreviateUid(uid),
        unresolved: true,
      })),
    // accountsKey captures the contents of `accounts` for memoization
    [accountsKey],
  )
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <SizableText size="sm" weight="bold">
        Mentioned accounts
      </SizableText>
      <div className={stylex.props(styles_2.s95a555ef).className || ''}>
        <AccountSearchInput
          label="Mentioned accounts"
          placeholder="Search or paste accounts"
          values={values}
          onValuesChange={(next) => onChange(next.map((value) => value.id.uid))}
        />
      </div>
    </div>
  )
}
function dateTimeLocalValue(ms: number): string {
  if (!Number.isFinite(ms)) return ''
  const date = new Date(ms)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}
function dayName(day: number): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] || String(day)
}

// ---------------------------------------------------------------------------
// Triggered-session context rendering
// ---------------------------------------------------------------------------

/** Resolves the in-app route that opens the comment, document, or activity that fired a trigger. */
export function getTriggerActivityRoute(context: AgentSessionTriggerContext): NavRoute | null {
  // The stored activity is a resolved LoadedEvent (the shape `/api/ListEvents` returns), so reuse the
  // activity feed's own routing. This links to the exact comment, the document where a mention was made,
  // or the document at the specific version that fired the trigger.
  const resolvedRoute = getEventRoute(context.activity as unknown as LoadedEvent)
  if (resolvedRoute) return resolvedRoute

  // Raw ActivityFeed events (`newBlob`) used by tests and callers that bypass the resolving endpoint.
  const blob = recordField(context.activity, 'newBlob')
  if (blob) {
    const blobType = stringField(blob, 'blobType') || stringField(blob, 'blob_type')
    const resource = stringField(blob, 'resource')
    const resourceId = resource ? unpackHmId(resource) : null
    if (blobType === 'Comment' && resourceId) {
      return {
        key: 'comments',
        id: resourceId,
        openComment: stringField(blob, 'blobId') || stringField(blob, 'blob_id'),
      }
    }
    if ((blobType === 'Ref' || blobType === 'Change') && resourceId) {
      return {
        key: 'document',
        id: resourceId,
      }
    }
  }

  // Last resort: fall back to the configured trigger source location.
  if (context.source.type === 'document-comment') {
    const id = unpackHmId(context.source.resource)
    return id
      ? {
          key: 'comments',
          id,
        }
      : null
  }
  if (context.source.type === 'site-update') {
    const id = unpackHmId(context.source.resourcePrefix)
    return id
      ? {
          key: 'activity',
          id,
        }
      : null
  }
  return null
}
const TRIGGER_TYPE_ICONS: Record<
  AgentTriggerSource['type'],
  React.ComponentType<{
    className?: string
  }>
> = {
  'document-comment': MessageSquare,
  'user-mention': AtSign,
  'site-update': FileText,
  schedule: CalendarClock,
  'run-completed': Workflow,
}

/**
 * Friendly card shown at the top of a triggered session in place of the raw `<trigger_context>` /
 * `<trigger_instructions>` text. The headline and icon depend on the trigger type; the full activity
 * payload that was sent to the model stays available behind the collapsible details.
 */
export function TriggerContextView({
  context,
  instructions,
  serverUrl,
  agentId,
}: {
  context: AgentSessionTriggerContext
  instructions?: string
  serverUrl: string
  agentId?: string
}) {
  const navigate = useNavigate()
  const Icon = TRIGGER_TYPE_ICONS[context.source.type]
  const activityRoute = useMemo(() => getTriggerActivityRoute(context), [context])
  const triggerRoute: NavRoute | null = agentId
    ? {
        key: 'agent',
        agentId,
        serverUrl,
        tab: 'triggers',
        triggerId: context.triggerId,
      }
    : null
  return (
    <div className={stylex.props(styles_3.sdc3fca4e).className || ''}>
      <div className={stylex.props(styles_2.s11c50038).className || ''}>
        <Icon className={stylex.props(styles.s8bf4c15d).className || ''} />
        <span className={stylex.props(styles.sf032ed6c).className || ''}>Triggered by</span>
        <ContextLink
          route={triggerRoute}
          onNavigate={navigate}
          title="Open this trigger"
          className={stylex.props(styles.s2a511dff).className || ''}
        >
          {context.triggerName}
        </ContextLink>
        <ContextLink
          route={activityRoute}
          onNavigate={navigate}
          title="Open the comment, document, or update that started this session"
          className={stylex.props(styles_2.s5e669942).className || ''}
        >
          {context.activitySummary}
        </ContextLink>
      </div>
      <div className={stylex.props(styles.s641fc4c4).className || ''}>
        <span>{summarizeTriggerSource(context.source)}</span>
        <span>Fired {formattedDateMedium(new Date(context.firedAt))}</span>
        {context.status && context.status !== 'fired' ? <span>Status: {context.status}</span> : null}
      </div>
      {context.error ? <div className={stylex.props(styles.sa75e0209).className || ''}>{context.error}</div> : null}
      <TriggerDisclosure label="Activity details">
        <pre className={stylex.props(styles_3.s863380b5).className || ''}>
          {JSON.stringify(context.activity, null, 2)}
        </pre>
      </TriggerDisclosure>
      {instructions ? (
        <TriggerDisclosure label="Trigger instructions">
          <p className={stylex.props(styles_3.s8c95c59e).className || ''}>{instructions}</p>
        </TriggerDisclosure>
      ) : null}
    </div>
  )
}

/** Renders text that navigates to `route` when present, or plain text when there is nowhere to link. */
function ContextLink({
  route,
  onNavigate,
  title,
  className,
  children,
}: {
  route: NavRoute | null
  onNavigate: (route: NavRoute) => void
  title: string
  className?: string
  children: React.ReactNode
}) {
  if (!route) return <span className={className}>{children}</span>
  return (
    <button
      type="button"
      title={title}
      onClick={() => onNavigate(route)}
      className={stylex.props(styles_4.sae6a97a5, styles_4.sbf63b0a7, styles_4.sd30dd60e).className || ''}
    >
      {children}
    </button>
  )
}

/** Inline collapsible row used for the trigger card's "Activity details" / "Trigger instructions" sections. */
function TriggerDisclosure({label, children}: {label: string; children: React.ReactNode}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={stylex.props(styles_3.se477dfeb).className || ''}
      >
        {open ? (
          <ChevronDown className={stylex.props(styles.sca3de967).className || ''} />
        ) : (
          <ChevronRight className={stylex.props(styles.sca3de967).className || ''} />
        )}
        {label}
      </button>
      {open ? <div className={stylex.props(styles.sc0781492).className || ''}>{children}</div> : null}
    </>
  )
}
function recordField(value: unknown, key: string): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const field = (value as Record<string, unknown>)[key]
  return field && typeof field === 'object' ? (field as Record<string, unknown>) : null
}
function stringField(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key]
  return typeof field === 'string' && field ? field : undefined
}
