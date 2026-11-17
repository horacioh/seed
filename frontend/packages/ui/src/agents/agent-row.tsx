import type {AgentActivity} from '@seed-hypermedia/apps-protocol'
import {useRouteLink} from '@shm/shared'
import {agentRowActivity, useAgentActivityReadState} from './activity'
import {SizableText} from '@shm/ui/text'

export function AgentListRow({
  agentId,
  name,
  status,
  serverUrl,
  accessRole,
  activity,
}: {
  agentId: string
  name: string
  status: string
  serverUrl: string
  accessRole?: 'owner' | 'reader' | 'writer' | 'chatter'
  /** The agent's latest-activity rollup, for its activity label beside the name. */
  activity?: AgentActivity
}) {
  const linkProps = useRouteLink({key: 'agent', agentId, serverUrl})
  const readState = useAgentActivityReadState()
  const row = agentRowActivity(activity, serverUrl, name, readState.data)
  return (
    <a
      {...linkProps}
      href={linkProps.href}
      className="border-border hover:bg-muted/60 flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-3 text-inherit no-underline transition-colors"
    >
      <div className="flex min-w-0 items-center gap-2">
        <SizableText weight="bold" className="min-w-0 truncate">
          {name}
        </SizableText>
        {row ? <span className="text-muted-foreground text-xs">{row.short}</span> : null}
        {status.toLowerCase().includes('error') || status.toLowerCase().includes('failed') ? (
          <span className="text-destructive text-xs">{status}</span>
        ) : null}
        {accessRole && accessRole !== 'owner' ? (
          <span className="bg-muted text-muted-foreground flex-none rounded-full px-2 py-0.5 text-xs font-medium tracking-wide uppercase">
            {accessRole}
          </span>
        ) : null}
      </div>
    </a>
  )
}
