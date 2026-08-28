import * as stylex from '@stylexjs/stylex'
import {useNavigate} from './navigation'
import {SizableText} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
const styles_4 = stylex.create({
  s5ac553fa: {
    backgroundColor: 'var(--destructive)',
  },
  sbe30149c: {
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 60%, transparent)',
  },
  s460ef3a3: {
    backgroundColor: 'oklch(72.3% 0.219 149.579)',
  },
})
const styles_3 = stylex.create({
  s32692dad: {
    width: 'calc(0.25rem * 2.5)',
    height: 'calc(0.25rem * 2.5)',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s775755af: {
    borderRadius: 'calc(infinity * 1px)',
  },
})
const styles_2 = stylex.create({
  s6b1b4677: {
    borderColor: 'var(--border)',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(var(--spacing) * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 3)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s4d9d9faa: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    flex: 'none',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: '10px',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
  },
})
const styles = stylex.create({
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s64fb8207: {
    minWidth: 'calc(0.25rem * 0)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
export function getAgentStatusIndicator(status: string): {
  label: string
  className: string
} {
  const normalizedStatus = status.toLowerCase()
  if (normalizedStatus.includes('error') || normalizedStatus.includes('failed')) {
    return {
      label: status || 'Error',
      className: stylex.props(styles_4.s5ac553fa).className || '',
    }
  }
  if (
    normalizedStatus.includes('thinking') ||
    normalizedStatus.includes('streaming') ||
    normalizedStatus.includes('running') ||
    normalizedStatus.includes('busy')
  ) {
    return {
      label: status || 'Thinking',
      className: stylex.props(styles_4.sbe30149c).className || '',
    }
  }
  return {
    label: status || 'Idle',
    className: stylex.props(styles_4.s460ef3a3).className || '',
  }
}
export function AgentListRow({
  agentId,
  name,
  status,
  serverUrl,
  accessRole,
}: {
  agentId: string
  name: string
  status: string
  serverUrl: string
  accessRole?: 'owner' | 'reader' | 'writer' | 'chatter'
}) {
  const navigate = useNavigate()
  const statusIndicator = getAgentStatusIndicator(status)
  return (
    <div
      className={stylex.props(styles_2.s6b1b4677).className || ''}
      onClick={() =>
        navigate({
          key: 'agent',
          agentId,
          serverUrl,
        })
      }
    >
      <div className={stylex.props(styles.sa4681c45).className || ''}>
        <SizableText weight="bold" className={stylex.props(styles.s64fb8207).className || ''}>
          {name}
        </SizableText>
        {accessRole && accessRole !== 'owner' ? (
          <span className={stylex.props(styles_2.s4d9d9faa).className || ''}>{accessRole}</span>
        ) : null}
      </div>
      <Tooltip content={statusIndicator.label} asChild>
        <span className={stylex.props(styles_3.s32692dad, styles_3.sf032ed6c, styles_3.s775755af).className || ''} />
      </Tooltip>
    </div>
  )
}
