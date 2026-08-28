import * as stylex from '@stylexjs/stylex'
import {
  type AgentCollaboratorInfo,
  type AgentCollaboratorRole,
  type AgentDefinition,
  type AgentModelRef,
  type AgentToolInfo,
  type AgentToolInput,
  type AgentTriggerInfo,
  type AgentTriggerInput,
  type AgentTriggerSource,
  type SessionInfo,
  type SigningIdentity,
} from './client'
import {
  addOptimisticSessionMessage,
  addOptimisticSessionToCaches,
  type AgentSessionDraftMessage,
  getDefaultAgentServerUrl,
  isLocalAgentServer,
  useAgentCollaborators,
  useAgentDetail,
  useAgentList,
  useAgentAccountsSync,
  useAgentServerHealth,
  useAgentServerUrl,
  useLocalAgentServerUrl,
  useAgentTools,
  useAgentTrigger,
  useAgentTriggers,
  useAgentWebSocketSubscription,
  useCreateAgentSession,
  useCreateAgentTrigger,
  useCreateSigningIdentity,
  useDeleteAgent,
  useDeleteAgentTool,
  useDeleteAgentTrigger,
  useInviteAgentCollaborator,
  useMessageAgentSession,
  useModelProviders,
  useProviderModels,
  useRemoveAgentCollaborator,
  useSetAgentPublicChat,
  useSetAgentPublicRead,
  useSaveAgentTool,
  useSigningIdentities,
  useUpdateAgent,
  useUpdateAgentTrigger,
  useUpdateSigningIdentity,
} from './models'
import {SessionStatusDot, SubSessionsDisclosure} from './session-children'
import {useSelectedAccountId} from './account'
import {useClickNavigate, useNavigate} from './navigation'
import {markdownBlockNodesToHMBlockNodes, parseMarkdown} from '@seed-hypermedia/client'
import type {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {formattedDateMedium} from '@shm/shared/utils/date'
import {abbreviateUid} from '@shm/shared/utils/abbreviate'
import {useAccount} from '@shm/shared/models/entity'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {useRouteLink} from '@shm/shared/routing'
import {Button} from '@shm/ui/button'
import {copyTextToClipboard} from '../copy-to-clipboard'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@shm/ui/components/alert-dialog'
import {DialogDescription, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {Switch} from '@shm/ui/components/switch'
import {Textarea} from '@shm/ui/components/textarea'
import {AccountSearchInput, type SearchResult} from '@shm/ui/collaborators-page'
import {Container, PanelContainer} from '@shm/ui/container'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {SizableText} from '@shm/ui/text'
import {Spinner} from '@shm/ui/spinner'
import {toast} from '@shm/ui/toast'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {
  ArrowRight,
  ArrowRightLeft,
  ExternalLink,
  Globe,
  Info,
  KeyRound,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import {HMIcon} from '@shm/ui/hm-icon'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {getSeedTool} from '@seed-hypermedia/agents-protocol'
import {
  AGENT_EXECUTE_TOOL,
  AGENT_PUBLISH_GRANT,
  AGENT_SEARCH_TOOL,
  AGENT_WEB_SEARCH_TOOL,
  DEFAULT_AGENT_TOOLS,
  normalizeStoredAgentTools,
  getToolAvailability,
  type AgentServerWebCapabilities,
} from './agent-tools'
import {AgentMemoryTab} from './memory'
import {TriggerSourceFields, summarizeTriggerSource} from './trigger-types'
import {
  AddModelProviderDialog,
  EditAgentAccountDialog,
  EditAgentNameDialog,
  EnableWindowsHypervisorDialog,
  type AgentAccountRenameStatus,
} from './dialogs'
import {AgentHeader, AgentSubpageHeader, type AgentPageTab} from './header'
import {MoveAgentDialog} from './move-agent-dialog'
import {modelReasoningSupport, type ReasoningLevel} from '@seed-hypermedia/agents-protocol'
import {ProviderModelSelect} from './provider-model-select'
import {coerceReasoningLevel, ReasoningSlider} from './reasoning-select'
import {pickDefaultProviderModel} from './model-utils'
import {AgentPromptEditor, promptBlocksForRequest, promptBlocksToMarkdown} from './prompt-editor'
import {AgentsNoAccountPage} from './no-account'
import {agentAccessCanChat, agentAccessCanWrite} from './access'
import {AgentRichMessageComposer} from './rich-message-composer'
import {type AgentsRichEditorSubmitHandle} from './platform'
const styles_7 = stylex.create({
  scdbaf625: {
    width: '100%',
  },
  s9ccd4e68: {
    maxWidth: '48rem',
  },
})
const styles_6 = stylex.create({
  s18c0f: {
    height: 'calc(0.25rem * 4)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  sf28e7398: {
    backgroundColor: 'var(--card)',
  },
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  sf7998a14: {
    borderRadius: 'calc(var(--radius) + 4px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56f: {
    paddingBlock: 'calc(0.25rem * 3)',
  },
  s54eab7bc: {
    opacity: '60%',
  },
  s2cc20399: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--accent) 20%, transparent)',
      },
    },
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fb: {
    gap: 'calc(0.25rem * 2)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
})
const styles_5 = stylex.create({
  s765a26ee: {
    opacity: '0%',
  },
  s3731c254: {
    '@media ((max-width: 639px))': {
      width: 'calc(0.25rem * 10)',
      height: 'calc(0.25rem * 10)',
    },
  },
  sd5830f98: {
    '@media ((max-width: 639px))': {
      opacity: '100%',
    },
  },
  s2ffff9: {
    display: 'flex',
  },
  s3f58665f: {
    minWidth: 'calc(0.25rem * 0)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  sf4676641: {
    gap: 'calc(0.25rem * 1.5)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s5f101360: {
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--destructive)',
      },
    },
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  sf4676280: {
    gap: 'calc(0.25rem * 0.5)',
  },
})
const styles_4 = stylex.create({
  sf182d248: {
    borderColor: 'var(--input)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    color: 'var(--muted-foreground)',
    minHeight: 'calc(var(--spacing) * 80)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    whiteSpace: 'pre-wrap',
  },
  s93ff291a: {
    display: 'grid',
    gap: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 768px))': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  sfdf82496: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: '10px',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
  },
  s15fae92f: {
    display: 'flex',
    maxHeight: '78vh',
    width: '100%',
    maxWidth: 'var(--container-3xl)',
    minWidth: 'calc(var(--spacing) * 0)',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    overflowY: 'auto',
  },
  s454f5715: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 3)',
    '@media ((min-width: 640px))': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  },
  s7862b5a6: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 1.5)',
    '@media ((min-width: 640px))': {
      width: 'calc(var(--spacing) * 40)',
    },
  },
  s95e7623f: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--foreground)',
        backgroundColor: 'color-mix(in oklab, var(--color-black) 5%, transparent)',
        opacity: '100%',
      },
    },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s1f22c98c: {
    display: 'flex',
    maxHeight: '70vh',
    minWidth: 'calc(var(--spacing) * 0)',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 4)',
    overflowY: 'auto',
  },
  s709ffd81: {
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 2)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(var(--spacing) * 3)',
  },
  sa112639a: {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    flexShrink: '0',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: '10px',
    fontWeight: 'var(--font-weight-medium)',
    letterSpacing: 'var(--tracking-wide)',
    textTransform: 'uppercase',
  },
  s3c9d925b: {
    color: 'var(--muted-foreground)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--destructive)',
        opacity: '100%',
      },
    },
  },
  sb06f525c: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 3)',
  },
  s90532d8c: {
    borderColor: 'var(--border)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    minHeight: 'calc(var(--spacing) * 40)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    whiteSpace: 'pre-wrap',
  },
  s15b067b5: {
    borderColor: 'var(--border)',
    display: 'grid',
    gap: 'calc(var(--spacing) * 3)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(var(--spacing) * 5)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    '@media ((min-width: 768px))': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
  s5f7fffe: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
      },
    },
    display: 'flex',
    cursor: 'pointer',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderRadius: 'var(--radius)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    textAlign: 'left',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  sda0606fa: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--muted)',
      },
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderRadius: 'var(--radius)',
    paddingInline: 'calc(var(--spacing) * 3)',
    paddingBlock: 'calc(var(--spacing) * 2)',
    transitionProperty: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    transitionTimingFunction: 'var(--default-transition-timing-function)',
    transitionDuration: 'var(--default-transition-duration)',
  },
  s8ebd925d: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: 'calc(var(--spacing) * 0.5)',
    textAlign: 'left',
    '@media ((max-width: 639px))': {
      minHeight: 'calc(var(--spacing) * 10)',
    },
  },
  s239b1dd5: {
    backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)',
    color: 'var(--primary)',
    marginTop: 'calc(var(--spacing) * 2)',
    borderRadius: 'calc(infinity * 1px)',
    paddingInline: 'calc(var(--spacing) * 2)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    fontWeight: 'var(--font-weight-bold)',
  },
})
const styles_3 = stylex.create({
  s26068628: {
    borderColor: 'var(--border)',
    flex: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  sde2f5b1a: {
    display: 'contents',
  },
  sb7febe14: {
    maxWidth: '56rem',
    gap: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 4)',
  },
  s70333b2b: {
    minHeight: 'calc(0.25rem * 0)',
    maxWidth: '56rem',
    flex: '1',
    gap: 'calc(0.25rem * 4)',
    paddingTop: 'calc(0.25rem * 4)',
    paddingBottom: 'calc(0.25rem * 0)',
  },
})
const styles_2 = stylex.create({
  s4fcd49d8: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
  },
  s7d7fb0a5: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    overflowY: 'auto',
    paddingRight: 'calc(0.25rem * 1)',
  },
  s7a8d2b4: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  s35cc9ee: {
    minHeight: 'calc(0.25rem * 0)',
    flex: '1',
    overflowY: 'auto',
    paddingRight: 'calc(0.25rem * 1)',
    paddingBottom: 'calc(0.25rem * 4)',
  },
  s7bb98069: {
    display: 'flex',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s1c7eef48: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
  },
  s945d5f9e: {
    minHeight: 'calc(0.25rem * 24)',
    resize: 'vertical',
  },
  sc2c0d05b: {
    minHeight: 'calc(0.25rem * 56)',
    resize: 'vertical',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s9c9145b5: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
  },
  s7b12fa98: {
    minHeight: 'calc(0.25rem * 48)',
    resize: 'vertical',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  scfc6b2f2: {
    borderColor: 'var(--border)',
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 3)',
  },
  s2b96d687: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1.5)',
    paddingBlock: 'calc(0.25rem * 0.5)',
    paddingRight: 'calc(0.25rem * 2)',
    paddingLeft: 'calc(0.25rem * 0.5)',
  },
  sb2646ddb: {
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    maxWidth: '48rem',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    overflowY: 'auto',
    paddingRight: 'calc(0.25rem * 1)',
  },
  sdf91ad19: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sa4681c45: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sc95eeaf4: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 'calc(0.25rem * 3)',
    rowGap: 'calc(0.25rem * 1)',
    paddingLeft: 'calc(0.25rem * 1)',
  },
  s8fe12dbc: {
    display: 'flex',
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    textAlign: 'left',
  },
  sb96da372: {
    marginInline: 'auto',
    display: 'flex',
    minHeight: 'calc(0.25rem * 0)',
    width: '100%',
    maxWidth: '56rem',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 5)',
    overflowY: 'auto',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
  },
  s32572229: {
    display: 'flex',
    width: '100%',
    maxWidth: '100%',
    minWidth: 'calc(0.25rem * 0)',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 5)',
  },
  s10483f08: {
    minWidth: 'calc(0.25rem * 0)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
})
const styles = stylex.create({
  s6ebbda8: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  s3b59b99: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 12)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s597c48d: {
    display: 'block',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  s66bdc38b: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 1)',
  },
  sfbc6e28e: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
  },
  s82587a56: {
    borderColor: 'var(--border)',
    display: 'flex',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  s8327cc80: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    outlineStyle: 'none',
  },
  s13678fbc: {
    height: 'auto',
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
  },
  scf14d8e7: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  se4bfffa8: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    flexShrink: '0',
  },
  sb0c158fd: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 0.5)',
    overflow: 'hidden',
  },
  sf032ed6c: {
    flexShrink: '0',
  },
  s9d6af5a9: {
    borderColor: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 3)',
  },
  s7026dbcb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: 'calc(0.25rem * 8)',
  },
  sca3de96c: {
    width: 'calc(0.25rem * 8)',
    height: 'calc(0.25rem * 8)',
  },
  sadecf8c8: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    padding: 'calc(0.25rem * 3)',
  },
  s95536c4e: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    overflow: 'hidden',
  },
  se0969a8c: {
    marginLeft: 'auto',
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s789b823d: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1.5)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s750a469d: {
    marginLeft: 'auto',
    flexShrink: '0',
    textTransform: 'capitalize',
  },
  s2b00eca2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  sa173a9a1: {
    fontFamily: 'var(--font-mono)',
  },
  sd18edfa0: {
    borderColor: 'var(--input)',
    backgroundColor: 'var(--background)',
    height: 'calc(0.25rem * 9)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  s25987914: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1.5)',
  },
  sd272840a: {
    color: 'var(--muted-foreground)',
    fontWeight: '400',
  },
  sb87f7412: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 2)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  sdb1fda99: {
    backgroundColor: 'var(--muted)',
    overflowX: 'auto',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    whiteSpace: 'pre',
  },
  s9141e77: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  s3566be63: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s6e724d66: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sd1c4c9a1: {
    display: 'grid',
    gap: 'calc(0.25rem * 2)',
  },
  s3269316e: {
    width: 'calc(0.25rem * 3.5)',
    height: 'calc(0.25rem * 3.5)',
  },
  s3484a6: {
    paddingLeft: 'calc(0.25rem * 7)',
  },
  s7a992289: {
    color: 'var(--primary)',
    cursor: 'pointer',
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
  },
  sf0768e89: {
    color: 'var(--muted-foreground)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    flexShrink: '0',
  },
  s7778dfe9: {
    display: 'flex',
    flexShrink: '0',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s94e66deb: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  s8e4be3ed: {
    flexShrink: '0',
    fontFamily: 'var(--font-mono)',
  },
  scfedb87c: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
    paddingInline: 'calc(0.25rem * 1)',
  },
  sea5bafd9: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  sd1c4c9a3: {
    display: 'grid',
    gap: 'calc(0.25rem * 4)',
  },
  s5661d341: {
    display: 'flex',
    height: 'calc(0.25rem * 9)',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '1rem',
    lineHeight: 'calc(1.5 / 1)',
  },
  s911c1714: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    paddingTop: 'calc(0.25rem * 5)',
  },
  sc182243e: {
    borderColor: 'var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'calc(var(--radius) + 4px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 6)',
  },
  s592e123d: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 3)',
  },
  scc9904d2: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s6b2af047: {
    flex: 'none',
    whiteSpace: 'nowrap',
  },
  s8c3d1867: {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '3',
    width: '100%',
    paddingLeft: 'calc(0.25rem * 5)',
  },
  sd39686aa: {
    marginTop: 'calc(0.25rem * 1)',
    width: '100%',
    paddingLeft: 'calc(0.25rem * 5)',
  },
})
function AgentDetailPage({
  agentId,
  routeServerUrl,
  tab = 'sessions',
  triggerId,
  memoryPath,
}: {
  agentId: string
  routeServerUrl?: string
  tab?: AgentPageTab
  triggerId?: string
  /** Memory file the route asked to open, set when a tool row linked to it. */
  memoryPath?: string
}) {
  const selectedAccountId = useSelectedAccountId()
  const navigate = useNavigate()
  const replaceRoute = useNavigate('replace')
  const clickNavigate = useClickNavigate()
  const serverUrlQuery = useAgentServerUrl()
  const localServerUrl = useLocalAgentServerUrl()
  const serverUrl = routeServerUrl || serverUrlQuery.data || getDefaultAgentServerUrl() || ''
  const serverHealth = useAgentServerHealth(serverUrl)
  const agent = useAgentDetail(serverUrl, selectedAccountId, agentId)
  // GetAgent returns every session including sub-sessions; the tab renders children nested under
  // their parent's disclosure, so the flat list must hold top-level rows only or they show twice.
  const topLevelSessions = useMemo(
    () => (agent.data?.sessions ?? []).filter((session) => !session.parentSessionId),
    [agent.data?.sessions],
  )
  const triggers = useAgentTriggers(serverUrl, selectedAccountId, agentId)
  const createSession = useCreateAgentSession(serverUrl, selectedAccountId)
  const messageSession = useMessageAgentSession(serverUrl, selectedAccountId)
  const updateAgent = useUpdateAgent(serverUrl, selectedAccountId)
  const updateSigningIdentity = useUpdateSigningIdentity(serverUrl, selectedAccountId)
  const deleteAgentDialog = useAppDialog(DeleteAgentDialog, {
    isAlert: true,
  })
  const moveAgentDialog = useAppDialog(MoveAgentDialog)
  const signingIdentities = useSigningIdentities(serverUrl, selectedAccountId, agentId)
  const createSigningIdentity = useCreateSigningIdentity(serverUrl, selectedAccountId)
  const createTriggerDialog = useAppDialog(CreateAgentTriggerDialog)
  const editNameDialog = useAppDialog(EditAgentNameDialog)
  const modelProviders = useModelProviders(serverUrl, selectedAccountId, agentId)
  const collaborators = useAgentCollaborators(serverUrl, selectedAccountId, agentId)
  const allAgents = useAgentList(serverUrl, selectedAccountId)
  const addProviderDialog = useAppDialog(AddModelProviderDialog)
  useAgentWebSocketSubscription(serverUrl, selectedAccountId, `agents/${agentId}`)
  const accessRole = agent.data?.agent.accessRole ?? 'owner'
  const canWrite = agentAccessCanWrite(accessRole)
  // Chatters (public chat) can start sessions here but cannot edit the agent or run session tools.
  const canChat = agentAccessCanChat(accessRole)
  const isOwner = accessRole === 'owner'
  const [name, setName] = useState('')
  const [modelProvider, setModelProvider] = useState('')
  const [model, setModel] = useState('')
  const [reasoningLevel, setReasoningLevel] = useState<ReasoningLevel | undefined>(undefined)
  const [enabledModels, setEnabledModels] = useState<AgentModelRef[]>([])
  const providerModels = useProviderModels(serverUrl, selectedAccountId, modelProvider, agentId)
  const selectedProviderType = modelProviders.data?.find((provider) => provider.name === modelProvider)?.type
  const [systemPrompt, setSystemPrompt] = useState<HMBlockNode[]>([])
  const [promptEditorKey, setPromptEditorKey] = useState(0)
  const [nameModelDirty, setNameModelDirty] = useState(false)
  const [promptDirty, setPromptDirty] = useState(false)
  const [settingsSaveState, setSettingsSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [promptSaveState, setPromptSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const settingsSaveIdRef = useRef(0)
  const promptSaveIdRef = useRef(0)
  const loadedPromptKeyRef = useRef<string | null>(null)
  const startComposerRef = useRef<AgentsRichEditorSubmitHandle | null>(null)
  useEffect(() => {
    if (!agent.data) return
    if (!nameModelDirty) {
      setName(agent.data.agent.definition.name)
      setModel(agent.data.agent.definition.model)
      setModelProvider(agent.data.agent.definition.modelProvider)
      setReasoningLevel(agent.data.agent.definition.reasoningLevel)
      setEnabledModels(agent.data.agent.definition.enabledModels ?? [])
    }
    if (!promptDirty) {
      const nextPromptKey = agentPromptStableKey(agent.data.agent.definition.systemPrompt)
      if (loadedPromptKeyRef.current !== nextPromptKey) {
        loadedPromptKeyRef.current = nextPromptKey
        setSystemPrompt(agentPromptToBlocks(agent.data.agent.definition.systemPrompt))
        setPromptEditorKey((key) => key + 1)
      }
    }
  }, [agent.data, nameModelDirty, promptDirty])

  // After the user switches provider (which clears the model), pick a sensible
  // default from the new provider's curated list once it loads.
  useEffect(() => {
    if (!nameModelDirty || model || !providerModels.data?.length) return
    const nextModel = pickDefaultProviderModel(providerModels.data, selectedProviderType)?.id
    if (nextModel) setModel(nextModel)
  }, [nameModelDirty, model, providerModels.data, selectedProviderType])
  function handleProviderChange(nextProvider: string) {
    if (nextProvider === modelProvider) return
    setModelProvider(nextProvider)
    setModel('') // belongs to the previous provider; the effect above picks a new default
    setReasoningLevel(undefined)
    // Checked quick-switch models survive provider switches: they carry their own provider.
    setNameModelDirty(true)
  }

  // A provider that disappears (deleted, or the account's provider list changed) must not linger:
  // if it was the active provider, fall back to the empty state — no provider, no model — until
  // the user picks a provider again, and prune checked quick-switch entries that referenced it.
  // Marking the draft dirty keeps background refetches of the stale definition from resurrecting
  // the deleted name, and the autosave effect never submits a draft without a provider and model,
  // so nothing is saved until a real provider is chosen.
  useEffect(() => {
    // While a refetch is in flight the list may be stale — e.g. right after adding a provider that
    // was just auto-selected — so only a settled list is trusted to declare a provider gone.
    // Read-only viewers keep the stale display: they cannot save the cleanup anyway.
    if (!modelProviders.data || modelProviders.isFetching || !canWrite) return
    const providerNames = new Set(modelProviders.data.map((provider) => provider.name))
    const prunedEnabled = enabledModels.filter((entry) => providerNames.has(entry.provider))
    const activeGone = !!modelProvider && !providerNames.has(modelProvider)
    if (!activeGone && prunedEnabled.length === enabledModels.length) return
    if (activeGone) {
      setModelProvider('')
      setModel('')
      setReasoningLevel(undefined)
    }
    if (prunedEnabled.length !== enabledModels.length) setEnabledModels(prunedEnabled)
    setNameModelDirty(true)
  }, [modelProvider, enabledModels, modelProviders.data, modelProviders.isFetching, canWrite])

  // The agent's primary signing account, and whether other agents also use it.
  const agentSigningKey =
    agent.data?.agent.definition.signingKeys?.[0] || agent.data?.agent.definition.signingKey || undefined
  const isAccountShared =
    !!agentSigningKey &&
    (allAgents.data || []).some((other) => {
      if (other.id === agentId) return false
      const otherKeys =
        other.definition.signingKeys || (other.definition.signingKey ? [other.definition.signingKey] : [])
      return otherKeys.includes(agentSigningKey)
    })
  const agentAccountStatus: AgentAccountRenameStatus = !agentSigningKey
    ? {
        kind: 'none',
      }
    : isAccountShared
      ? {
          kind: 'shared',
        }
      : {
          kind: 'own',
        }
  async function handleRenameAgent(nextName: string) {
    if (!agent.data) throw new Error('Agent not loaded')
    const trimmed = nextName.trim()
    if (!trimmed) throw new Error('Agent name is required')
    const definition = agent.data.agent.definition
    const result = await updateAgent.mutateAsync({
      agentId,
      definition: {
        ...definition,
        name: trimmed,
      },
    })
    if (result._ !== 'GetAgentResponse') throw new Error('Unexpected update response')
    // Keep the dedicated account's profile name in sync; leave shared accounts alone.
    if (isOwner && agentSigningKey && !isAccountShared) {
      await updateSigningIdentity.mutateAsync({
        name: agentSigningKey,
        label: trimmed,
      })
    }
    if (!nameModelDirty) setName(trimmed)
  }

  // The session only exists once the user actually does something: the bottom composer drafts
  // against no session, and the first send — or the first user tool run — creates one and
  // delivers that action in the same motion, so abandoning the draft leaves no empty session
  // behind.
  async function startDraftSession(): Promise<string> {
    if (!selectedAccountId) throw new Error('Select an account first')
    // No title at creation: the agent names the session, with a server-side fallback from the
    // first user message — 'Untitled session' is a display placeholder, never data.
    const result = await createSession.mutateAsync({
      agentId,
    })
    if (result._ !== 'CreateSessionResponse') throw new Error('Unexpected session response')
    // Seed the caches before navigating so the session page renders the optimistic first
    // message immediately instead of an empty transcript while the real fetch lands.
    const now = Date.now()
    addOptimisticSessionToCaches(serverUrl, selectedAccountId, {
      id: result.sessionId,
      account: selectedAccountId,
      agentId,
      status: 'idle',
      createdAt: now,
      updatedAt: now,
    })
    return result.sessionId
  }
  const startSessionSendingRef = useRef(false)
  async function handleStartSession(message: AgentSessionDraftMessage) {
    // The composer already cleared itself; a second send racing the create must not open a second
    // session.
    if (!selectedAccountId || startSessionSendingRef.current) return
    startSessionSendingRef.current = true
    try {
      const sessionId = await startDraftSession()
      // Send the stamped drafts, so the durable echo replaces the optimistic row by identity.
      const messages = addOptimisticSessionMessage(serverUrl, selectedAccountId, sessionId, [message])
      messageSession.mutate({
        sessionId,
        message: messages,
      })
      navigate({
        key: 'agent-session',
        agentId,
        sessionId,
        serverUrl,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create session')
    } finally {
      startSessionSendingRef.current = false
    }
  }
  useEffect(() => {
    if (!agent.data) return
    const draftName = name.trim()
    if (!draftName || !model || !modelProvider) return
    const currentDefinition = agent.data.agent.definition
    const persistedName = currentDefinition.name
    const persistedModel = currentDefinition.model
    const persistedProvider = currentDefinition.modelProvider
    const draftReasoningLevel = coerceReasoningLevel(selectedProviderType, model, reasoningLevel)
    if (
      draftName === persistedName &&
      model === persistedModel &&
      modelProvider === persistedProvider &&
      draftReasoningLevel === currentDefinition.reasoningLevel &&
      sameModelRefs(enabledModels, currentDefinition.enabledModels ?? [])
    ) {
      setSettingsSaveState('idle')
      return
    }
    const saveId = settingsSaveIdRef.current + 1
    settingsSaveIdRef.current = saveId
    const timer = setTimeout(
      () => {
        setSettingsSaveState('saving')
        const nextDefinition = {
          ...currentDefinition,
          name: draftName,
          model,
          modelProvider,
        }
        // Avoid an explicit-undefined key: CBOR-encoding it would not equal an absent field.
        if (draftReasoningLevel) nextDefinition.reasoningLevel = draftReasoningLevel
        else delete nextDefinition.reasoningLevel
        if (enabledModels.length) nextDefinition.enabledModels = enabledModels
        else delete nextDefinition.enabledModels
        void updateAgent
          .mutateAsync({
            agentId,
            definition: nextDefinition,
          })
          .then((result) => {
            if (settingsSaveIdRef.current !== saveId) return
            if (result._ !== 'GetAgentResponse') throw new Error('Unexpected update response')
            setName(result.agent.definition.name)
            setModel(result.agent.definition.model)
            setModelProvider(result.agent.definition.modelProvider)
            setReasoningLevel(result.agent.definition.reasoningLevel)
            setEnabledModels(result.agent.definition.enabledModels ?? [])
            if (!promptDirty) {
              loadedPromptKeyRef.current = agentPromptStableKey(result.agent.definition.systemPrompt)
              setSystemPrompt(agentPromptToBlocks(result.agent.definition.systemPrompt))
              setPromptEditorKey((key) => key + 1)
            }
            setNameModelDirty(false)
            setSettingsSaveState('saved')
            setTimeout(() => {
              if (settingsSaveIdRef.current === saveId) setSettingsSaveState('idle')
            }, 1800)
          })
          .catch((error) => {
            if (settingsSaveIdRef.current !== saveId) return
            setSettingsSaveState('error')
            toast.error(error instanceof Error ? error.message : 'Could not update agent')
          })
      },
      model === persistedModel ? 600 : 0,
    )
    return () => clearTimeout(timer)
  }, [
    agent.data,
    agentId,
    model,
    modelProvider,
    name,
    reasoningLevel,
    enabledModels,
    selectedProviderType,
    promptDirty,
    updateAgent.mutateAsync,
  ])
  const promptEditorDisabled = !selectedAccountId || serverHealth.isError || agent.isError || !canWrite
  useEffect(() => {
    if (!agent.data || !promptDirty || promptEditorDisabled) return
    if (!hasPromptContent(systemPrompt)) {
      setPromptSaveState('error')
      return
    }
    const currentDefinition = agent.data.agent.definition
    const nextPromptKey = agentPromptStableKey(systemPrompt)
    if (nextPromptKey === agentPromptStableKey(currentDefinition.systemPrompt)) {
      setPromptDirty(false)
      setPromptSaveState('idle')
      return
    }
    const saveId = promptSaveIdRef.current + 1
    promptSaveIdRef.current = saveId
    const timer = setTimeout(() => {
      setPromptSaveState('saving')
      void updateAgent
        .mutateAsync({
          agentId,
          definition: {
            ...currentDefinition,
            systemPrompt: promptBlocksForRequest(systemPrompt),
          },
        })
        .then((result) => {
          if (promptSaveIdRef.current !== saveId) return
          if (result._ !== 'GetAgentResponse') throw new Error('Unexpected update response')
          loadedPromptKeyRef.current = agentPromptStableKey(result.agent.definition.systemPrompt)
          setPromptDirty(false)
          setPromptSaveState('saved')
          setTimeout(() => {
            if (promptSaveIdRef.current === saveId) setPromptSaveState('idle')
          }, 1800)
        })
        .catch((error) => {
          if (promptSaveIdRef.current !== saveId) return
          setPromptSaveState('error')
          const message = error instanceof Error ? error.message : 'Could not save prompt'
          if (message !== 'System prompt is required') toast.error(message)
        })
    }, 800)
    return () => clearTimeout(timer)
  }, [agent.data, agentId, promptDirty, promptEditorDisabled, systemPrompt, updateAgent.mutateAsync])
  const selectedTriggerName = triggerId ? triggers.data?.find((trigger) => trigger.id === triggerId)?.name : undefined
  const isTriggerDetail = tab === 'triggers' && !!triggerId
  const breadcrumbItems = isTriggerDetail
    ? [
        {
          label: 'Triggers',
          route: {
            key: 'agent' as const,
            agentId,
            serverUrl,
            tab: 'triggers' as const,
          },
        },
        {
          label: selectedTriggerName || 'Trigger',
        },
      ]
    : undefined
  return (
    <PanelContainer className={stylex.props(styles.s6ebbda8).className || ''}>
      <div className={stylex.props(isTriggerDetail ? styles_3.s26068628 : styles_3.sde2f5b1a).className || ''}>
        <Container className={stylex.props(isTriggerDetail ? styles_3.sb7febe14 : styles_3.s70333b2b).className || ''}>
          {agent.isLoading ? (
            <div className={stylex.props(styles.s3b59b99).className || ''}>
              <Spinner size="large" className={stylex.props(styles.sf2718385).className || ''} />
            </div>
          ) : null}
          {agent.isError ? (
            <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
              {agent.error instanceof Error ? agent.error.message : 'Could not load agent'}
            </SizableText>
          ) : null}
          {agent.data ? (
            <>
              <AgentHeader
                agent={agent.data.agent}
                agentName={name}
                onEditName={
                  canWrite
                    ? () =>
                        editNameDialog.open({
                          currentName: name,
                          accountStatus: agentAccountStatus,
                          onRename: handleRenameAgent,
                        })
                    : undefined
                }
                agentId={agentId}
                serverUrl={serverUrl}
                activeTab={tab}
                sessionsCount={topLevelSessions.length}
                triggersCount={triggers.data?.length}
                // The session is only created when the first message is sent, so "New session"
                // just puts the cursor in the composer that will do it.
                onCreateSession={
                  canChat
                    ? () =>
                        startComposerRef.current?.focus({
                          moveCursorToEnd: true,
                        })
                    : undefined
                }
                creatingSession={createSession.isLoading}
                onCreateTrigger={
                  canWrite
                    ? () =>
                        createTriggerDialog.open({
                          serverUrl,
                          selectedAccountId,
                          agentId,
                        })
                    : undefined
                }
                canCreateTrigger={!!selectedAccountId && canWrite}
                menuItems={
                  isOwner
                    ? [
                        {
                          key: 'move-server',
                          label: 'Move to another server…',
                          icon: <ArrowRightLeft className={stylex.props(styles.sca3de968).className || ''} />,
                          disabled: !selectedAccountId,
                          onClick: () =>
                            moveAgentDialog.open({
                              sourceServerUrl: serverUrl,
                              selectedAccountId,
                              agentId,
                              agentName: name,
                              modelProvider: agent.data?.agent.definition.modelProvider ?? '',
                              sessionsCount: topLevelSessions.length,
                              onMoved: ({serverUrl: movedServerUrl, agentId: movedAgentId}) =>
                                navigate({
                                  key: 'agent',
                                  agentId: movedAgentId,
                                  serverUrl: movedServerUrl,
                                }),
                            }),
                        },
                        {
                          key: 'delete-agent',
                          label: 'Delete agent…',
                          icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
                          variant: 'destructive' as const,
                          disabled: !selectedAccountId,
                          onClick: () =>
                            deleteAgentDialog.open({
                              serverUrl,
                              selectedAccountId: selectedAccountId ?? null,
                              agentId,
                              agentName: name,
                              onDeleted: () =>
                                navigate({
                                  key: 'agents',
                                }),
                            }),
                        },
                      ]
                    : undefined
                }
                breadcrumbItems={breadcrumbItems}
              />

              {createTriggerDialog.content}
              {deleteAgentDialog.content}
              {moveAgentDialog.content}
              {addProviderDialog.content}
              {editNameDialog.content}

              {tab === 'sessions' ? (
                <section className={stylex.props(styles_2.s4fcd49d8).className || ''}>
                  <div className={stylex.props(styles_2.s7d7fb0a5).className || ''}>
                    {!topLevelSessions.length ? <SizableText color="muted">No sessions yet.</SizableText> : null}
                    {topLevelSessions.map((session) => (
                      <SessionListItem
                        key={session.id}
                        session={session}
                        serverUrl={serverUrl}
                        accountUid={selectedAccountId}
                        onOpen={(event) =>
                          clickNavigate(
                            {
                              key: 'agent-session',
                              agentId,
                              sessionId: session.id,
                              serverUrl,
                            },
                            event,
                          )
                        }
                        onOpenSession={(child, event) =>
                          clickNavigate(
                            {
                              key: 'agent-session',
                              agentId: child.agentId,
                              sessionId: child.id,
                              serverUrl,
                            },
                            event,
                          )
                        }
                        onOpenTrigger={() =>
                          session.startedByTrigger
                            ? navigate({
                                key: 'agent',
                                agentId,
                                serverUrl,
                                tab: 'triggers',
                                triggerId: session.startedByTrigger.triggerId,
                              })
                            : undefined
                        }
                      />
                    ))}
                  </div>
                  {canChat ? (
                    // No sessionId: this is a draft composer — the first send creates the session
                    // and delivers the message in one motion (see handleStartSession).
                    <AgentRichMessageComposer
                      isBusy={createSession.isLoading || messageSession.isLoading}
                      isStreaming={false}
                      stopPending={false}
                      disabledMessage={!selectedAccountId ? 'Select an account to start a session.' : undefined}
                      serverUrl={serverUrl}
                      accountId={selectedAccountId ?? null}
                      agentTools={agent.data.agent.definition.tools}
                      agentToolsLoading={agent.isLoading}
                      focusOnMount={false}
                      canInvokeTools={canWrite}
                      composerHandleRef={startComposerRef}
                      onToolStartSession={startDraftSession}
                      onToolSessionStarted={(sessionId) =>
                        navigate({
                          key: 'agent-session',
                          agentId,
                          sessionId,
                          serverUrl,
                        })
                      }
                      onSend={(message) => void handleStartSession(message)}
                      onStop={() => {}}
                    />
                  ) : null}
                </section>
              ) : null}

              {tab === 'triggers' && !isTriggerDetail ? (
                <AgentTriggersTab
                  agentId={agentId}
                  serverUrl={serverUrl}
                  selectedAccountId={selectedAccountId}
                  selectedTriggerId={triggerId}
                  triggers={triggers.data || []}
                  isLoading={triggers.isLoading}
                  readOnly={!canWrite}
                />
              ) : null}

              {tab === 'memory' ? (
                <AgentMemoryTab
                  serverUrl={serverUrl}
                  accountUid={selectedAccountId ?? null}
                  agentId={agentId}
                  openPath={memoryPath}
                  onOpenPathChange={(path) =>
                    replaceRoute({
                      key: 'agent',
                      agentId,
                      serverUrl,
                      tab: 'memory',
                      memoryPath: path,
                    })
                  }
                  readOnly={!canWrite}
                />
              ) : null}

              {tab === 'tools' ? (
                <AgentToolsTab
                  serverUrl={serverUrl}
                  accountUid={selectedAccountId ?? null}
                  agentId={agentId}
                  definition={agent.data.agent.definition}
                  identities={signingIdentities.data || []}
                  identitiesLoading={signingIdentities.isLoading}
                  webCapabilities={
                    serverHealth.data
                      ? {
                          ...(serverHealth.data.webTools ?? {
                            search: true,
                            readBrowser: true,
                          }),
                          codeExec: serverHealth.data.codeExec,
                          codeExecReason: serverHealth.data.codeExecReason,
                          codeExecReasonCode: serverHealth.data.codeExecReasonCode,
                          local: isLocalAgentServer(serverUrl, localServerUrl.data),
                        }
                      : undefined
                  }
                  onSave={(definition) =>
                    updateAgent.mutateAsync({
                      agentId,
                      definition,
                    })
                  }
                  onCreateIdentity={(label) => createSigningIdentity.mutateAsync(label)}
                  saving={updateAgent.isLoading || createSigningIdentity.isLoading}
                  readOnly={!canWrite}
                  canManageIdentities={isOwner}
                />
              ) : null}

              {tab === 'prompt' ? (
                <section className={stylex.props(styles_2.s7a8d2b4).className || ''}>
                  <div>
                    <SizableText weight="bold">System prompt</SizableText>
                    <SizableText size="sm" color="muted" className={stylex.props(styles.s597c48d).className || ''}>
                      Use the rich editor for formatting, links, embeds, lists, media, and code. The server converts
                      these blocks to markdown before sending them to the model. Changes autosave.
                      {promptSaveState === 'saving'
                        ? ' Saving…'
                        : promptSaveState === 'saved'
                          ? ' Saved.'
                          : promptSaveState === 'error'
                            ? hasPromptContent(systemPrompt)
                              ? ' Save failed.'
                              : ' System prompt is required.'
                            : ''}
                    </SizableText>
                  </div>
                  {promptEditorDisabled ? (
                    <pre className={stylex.props(styles_4.sf182d248).className || ''}>
                      {!canWrite
                        ? promptBlocksToMarkdown(systemPrompt) || 'No system prompt configured.'
                        : 'Connect to the agent server to edit this prompt.'}
                    </pre>
                  ) : (
                    <div className={stylex.props(styles_2.s35cc9ee).className || ''}>
                      <AgentPromptEditor
                        key={promptEditorKey}
                        initialBlocks={systemPrompt}
                        onChange={(blocks) => {
                          setSystemPrompt(blocks)
                          setPromptDirty(true)
                        }}
                      />
                    </div>
                  )}
                </section>
              ) : null}

              {tab === 'collaborators' ? (
                <AgentCollaboratorsTab
                  serverUrl={serverUrl}
                  accountUid={selectedAccountId ?? null}
                  agentId={agentId}
                  ownerAccountId={agent.data.agent.account}
                  collaborators={collaborators.data?.collaborators || []}
                  publicRead={collaborators.data?.publicRead ?? agent.data.agent.publicRead ?? false}
                  publicChat={collaborators.data?.publicChat ?? agent.data.agent.publicChat ?? false}
                  loading={collaborators.isLoading}
                  isOwner={isOwner}
                />
              ) : null}

              {tab === 'settings' ? (
                <section className={stylex.props(styles_2.s7bb98069).className || ''}>
                  <div className={stylex.props(styles_4.s93ff291a).className || ''}>
                    <label className={stylex.props(styles.sfbc6e28d).className || ''}>
                      <SizableText size="sm" weight="bold">
                        Model
                      </SizableText>
                      <ProviderModelSelect
                        serverUrl={serverUrl}
                        accountUid={selectedAccountId}
                        agentId={agentId}
                        disabled={!canWrite}
                        value={{
                          provider: modelProvider,
                          model,
                        }}
                        onChange={(entry) => {
                          setModelProvider(entry.provider)
                          setModel(entry.model)
                          // Selecting implicitly checks the model, so anything the agent has
                          // used stays in the header switcher until explicitly unchecked.
                          setEnabledModels((current) =>
                            current.some((item) => item.provider === entry.provider && item.model === entry.model)
                              ? current
                              : [...current, entry],
                          )
                          const nextType = modelProviders.data?.find((provider) => provider.name === entry.provider)
                            ?.type
                          setReasoningLevel((level) => coerceReasoningLevel(nextType, entry.model, level))
                          setNameModelDirty(true)
                        }}
                        enabledModels={enabledModels}
                        onToggleModel={(entry, enabled) => {
                          setEnabledModels((current) => [
                            ...current.filter(
                              (item) => !(item.provider === entry.provider && item.model === entry.model),
                            ),
                            ...(enabled ? [entry] : []),
                          ])
                          setNameModelDirty(true)
                        }}
                        onAddProvider={
                          isOwner
                            ? () =>
                                addProviderDialog.open({
                                  serverUrl,
                                  selectedAccountId,
                                  onSaved: handleProviderChange,
                                })
                            : undefined
                        }
                      />
                    </label>
                    {selectedProviderType && model && modelReasoningSupport(selectedProviderType, model) ? (
                      <div className={stylex.props(styles.s66bdc38b).className || ''}>
                        <ReasoningSlider
                          providerType={selectedProviderType}
                          disabled={!canWrite}
                          model={model}
                          value={reasoningLevel}
                          onChange={(level) => {
                            setReasoningLevel(level)
                            setNameModelDirty(true)
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className={stylex.props(styles.sfbc6e28e).className || ''}>
                    <SizableText
                      size="xs"
                      className={
                        (stylex.props(styles_6.s18c0f).className || '') +
                        ' ' +
                        (settingsSaveState === 'error' ? stylex.props(styles_6.s8a2570e2).className || '' : '')
                      }
                      color={settingsSaveState === 'error' ? undefined : 'muted'}
                    >
                      {settingsSaveState === 'saving'
                        ? 'Saving settings…'
                        : settingsSaveState === 'saved'
                          ? 'Settings saved'
                          : settingsSaveState === 'error'
                            ? 'Settings save failed'
                            : ''}
                    </SizableText>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </Container>
      </div>
      {isTriggerDetail && agent.data ? (
        <AgentTriggersTab
          agentId={agentId}
          serverUrl={serverUrl}
          selectedAccountId={selectedAccountId}
          selectedTriggerId={triggerId}
          triggers={triggers.data || []}
          isLoading={triggers.isLoading}
          readOnly={!canWrite}
        />
      ) : null}
    </PanelContainer>
  )
}
function sameModelRefs(a: AgentModelRef[], b: AgentModelRef[]): boolean {
  return (
    a.length === b.length &&
    a.every((entry, index) => entry.provider === b[index]?.provider && entry.model === b[index]?.model)
  )
}
function agentPromptToBlocks(prompt: AgentDefinition['systemPrompt']): HMBlockNode[] {
  if (Array.isArray(prompt)) return prompt as HMBlockNode[]
  return markdownBlockNodesToHMBlockNodes(parseMarkdown(prompt || '').tree)
}
function agentPromptStableKey(prompt: AgentDefinition['systemPrompt']): string {
  return typeof prompt === 'string' ? prompt : JSON.stringify(prompt)
}
function hasPromptContent(blocks: HMBlockNode[]): boolean {
  return blocks.some((node) => {
    const block = node.block as {
      text?: unknown
      type?: unknown
      link?: unknown
      url?: unknown
    }
    const type = typeof block.type === 'string' ? block.type.toLowerCase() : ''
    if (typeof block.text === 'string' && block.text.trim()) return true
    if (typeof block.link === 'string' && block.link.trim()) return true
    if (typeof block.url === 'string' && block.url.trim()) return true
    if (type && type !== 'paragraph' && type !== 'heading' && type !== 'code' && type !== 'math') return true
    return node.children ? hasPromptContent(node.children) : false
  })
}

/**
 * The Collaborators tab, mirroring the document collaborators page: an invite row on top, then
 * the owner and members as one flat list with the role reading quietly on the right. The agent
 * API keeps roles explicit (reader/writer), so the invite row carries a role select the document
 * page does not need.
 */
function AgentCollaboratorsTab({
  serverUrl,
  accountUid,
  agentId,
  ownerAccountId,
  collaborators,
  publicRead,
  publicChat,
  loading,
  isOwner,
}: {
  serverUrl: string
  accountUid: string | null
  agentId: string
  ownerAccountId: string
  collaborators: AgentCollaboratorInfo[]
  publicRead: boolean
  publicChat: boolean
  loading: boolean
  isOwner: boolean
}) {
  const invite = useInviteAgentCollaborator(serverUrl, accountUid)
  const remove = useRemoveAgentCollaborator(serverUrl, accountUid)
  const setPublicRead = useSetAgentPublicRead(serverUrl, accountUid)
  const setPublicChat = useSetAgentPublicChat(serverUrl, accountUid)
  const [selected, setSelected] = useState<SearchResult[]>([])
  const [role, setRole] = useState<AgentCollaboratorRole>('writer')
  const excludedAccountIds = [ownerAccountId, ...collaborators.map((member) => member.accountId)]
  async function handleInvite() {
    if (!selected.length) return
    try {
      await Promise.all(
        selected.map((member) =>
          invite.mutateAsync({
            agentId,
            collaboratorAccountId: member.id.uid,
            role,
          }),
        ),
      )
      toast.success(selected.length === 1 ? 'Invitation sent' : `${selected.length} invitations sent`)
      setSelected([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not invite collaborator')
    }
  }
  return (
    <section className={stylex.props(styles_2.s7bb98069).className || ''}>
      {isOwner ? (
        <div className={stylex.props(styles.sfbc6e28e).className || ''}>
          <div className={stylex.props(styles.s82587a56).className || ''}>
            <AccountSearchInput
              label="Collaborators"
              placeholder="Invite collaborators"
              values={selected}
              onValuesChange={setSelected}
              excludeUids={excludedAccountIds}
            />
            <select
              aria-label="Collaborator role"
              value={role}
              onChange={(event) => setRole(event.currentTarget.value as AgentCollaboratorRole)}
              className={stylex.props(styles.s8327cc80).className || ''}
            >
              <option value="reader">Can read</option>
              <option value="writer">Can write</option>
            </select>
            {selected.length ? (
              <Button
                size="sm"
                className={stylex.props(styles.s13678fbc).className || ''}
                onClick={() => void handleInvite()}
                disabled={invite.isLoading}
                aria-label="Send collaborator invitation"
              >
                <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
              </Button>
            ) : null}
          </div>
          <SizableText size="xs" color="muted">
            Readers can view everything. Writers can also change settings, memory, tools, triggers, and sessions.
          </SizableText>
        </div>
      ) : null}

      <div className={stylex.props(styles.scf14d8e7).className || ''}>
        <div className={stylex.props(styles.s86ff3e5).className || ''}>
          <Globe className={stylex.props(styles.se4bfffa8).className || ''} />
          <div className={stylex.props(styles.sb0c158fd).className || ''}>
            <SizableText size="sm" weight="medium">
              Public access
            </SizableText>
            <SizableText size="xs" color="muted">
              {publicRead
                ? 'This agent is public: anyone with a link can view its settings, memory, tools, and sessions.'
                : 'This agent is private: only the owner and collaborators can view it.'}
            </SizableText>
          </div>
          {isOwner ? (
            <Switch
              aria-label="Public access"
              checked={publicRead}
              disabled={setPublicRead.isLoading}
              onCheckedChange={(checked) =>
                setPublicRead.mutate(
                  {
                    agentId,
                    publicRead: checked,
                  },
                  {
                    onError: (error) =>
                      toast.error(error instanceof Error ? error.message : 'Could not change public access'),
                  },
                )
              }
            />
          ) : publicRead ? (
            <SizableText size="xs" color="muted" className={stylex.props(styles.sf032ed6c).className || ''}>
              Public
            </SizableText>
          ) : null}
        </div>
        {/* Public chat only exists on top of public read: the server clears it when read is turned
            off, and the row is hidden with it. Chat is narrower than collaborator "write" access —
            it covers creating and messaging sessions, nothing that edits the agent. */}
        {publicRead ? (
          <div className={stylex.props(styles.s9d6af5a9).className || ''}>
            <MessageSquare className={stylex.props(styles.se4bfffa8).className || ''} />
            <div className={stylex.props(styles.sb0c158fd).className || ''}>
              <SizableText size="sm" weight="medium">
                Public chat
              </SizableText>
              <SizableText size="xs" color="muted">
                {publicChat
                  ? 'Anyone signed in can start sessions and send messages. Only collaborators can change settings, memory, tools, or triggers.'
                  : 'Only the owner and collaborators can start sessions or send messages.'}
              </SizableText>
            </div>
            {isOwner ? (
              <Switch
                aria-label="Public chat"
                checked={publicChat}
                disabled={setPublicChat.isLoading}
                onCheckedChange={(checked) =>
                  setPublicChat.mutate(
                    {
                      agentId,
                      publicChat: checked,
                    },
                    {
                      onError: (error) =>
                        toast.error(error instanceof Error ? error.message : 'Could not change public chat'),
                    },
                  )
                }
              />
            ) : publicChat ? (
              <SizableText size="xs" color="muted" className={stylex.props(styles.sf032ed6c).className || ''}>
                Open
              </SizableText>
            ) : null}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className={stylex.props(styles.s7026dbcb).className || ''}>
          <Spinner className={stylex.props(styles.sca3de96c).className || ''} />
        </div>
      ) : (
        <div className={stylex.props(styles.sfbc6e28d).className || ''}>
          {collaborators.map((member) => (
            <AgentCollaboratorRow
              key={member.accountId}
              member={member}
              isOwner={isOwner}
              changing={invite.isLoading || remove.isLoading}
              onRoleChange={(nextRole) =>
                invite.mutate(
                  {
                    agentId,
                    collaboratorAccountId: member.accountId,
                    role: nextRole,
                  },
                  {
                    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not change role'),
                  },
                )
              }
              onRemove={() =>
                remove.mutate(
                  {
                    agentId,
                    collaboratorAccountId: member.accountId,
                  },
                  {
                    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not remove member'),
                  },
                )
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}
function AgentCollaboratorRow({
  member,
  isOwner,
  changing,
  onRoleChange,
  onRemove,
}: {
  member: AgentCollaboratorInfo
  isOwner: boolean
  changing: boolean
  onRoleChange: (role: AgentCollaboratorRole) => void
  onRemove: () => void
}) {
  const account = useAccount(member.accountId, {
    subscribe: true,
  })
  const metadata = account.data?.metadata
  const canManage = isOwner && member.role !== 'owner'
  return (
    <div className={stylex.props(styles.sadecf8c8).className || ''}>
      <HMIcon id={hmId(member.accountId)} name={metadata?.name} icon={metadata?.icon} size={32} />
      <div className={stylex.props(styles.s95536c4e).className || ''}>
        <SizableText
          size="sm"
          className={
            (stylex.props(styles_6.s6e724d66).className || '') +
            ' ' +
            (metadata?.name ? '' : stylex.props(styles_6.sf2718385).className || '')
          }
        >
          {metadata?.name || abbreviateUid(member.accountId)}
        </SizableText>
        {member.status === 'pending' ? (
          <span className={stylex.props(styles_4.sfdf82496).className || ''}>Pending</span>
        ) : null}
        {canManage ? (
          <span className={stylex.props(styles.se0969a8c).className || ''}>
            <select
              aria-label={`Role for ${metadata?.name || member.accountId}`}
              value={member.role}
              onChange={(event) => onRoleChange(event.currentTarget.value as AgentCollaboratorRole)}
              disabled={changing}
              className={stylex.props(styles.s789b823d).className || ''}
            >
              <option value="reader">Can read</option>
              <option value="writer">Can write</option>
            </select>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onRemove}
              disabled={changing}
              aria-label={member.status === 'pending' ? 'Cancel invitation' : 'Remove collaborator'}
            >
              <X className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
          </span>
        ) : (
          <SizableText size="xs" color="muted" className={stylex.props(styles.s750a469d).className || ''}>
            {member.role}
          </SizableText>
        )}
      </div>
    </div>
  )
}
function DeleteAgentDialog({
  input,
  onClose,
}: {
  input: {
    serverUrl: string
    selectedAccountId: string | null
    agentId: string
    agentName: string
    onDeleted: () => void
  }
  onClose: () => void
}) {
  const deleteAgent = useDeleteAgent(input.serverUrl, input.selectedAccountId)
  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    try {
      const result = await deleteAgent.mutateAsync(input.agentId)
      if (result._ !== 'DeleteAgentResponse') throw new Error('Unexpected delete response')
      toast.success('Agent deleted')
      onClose()
      input.onDeleted()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete agent')
    }
  }
  return (
    <div className={stylex.props(styles.s2b00eca2).className || ''}>
      <AlertDialogTitle>Delete agent?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete “{input.agentName}” and its sessions, triggers, and drafts from the agent server.
        This action cannot be undone.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={(event) => void handleDelete(event)} disabled={deleteAgent.isLoading}>
            <Trash2 className={stylex.props(styles.sca3de968).className || ''} />
            Delete agent
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  )
}

/** One create/edit surface for every authored-tool document field. */
function AuthoredToolDialog({
  input,
  onClose,
}: {
  input: {
    serverUrl?: string
    accountUid: string | null
    agentId: string
    tool?: AgentToolInfo
    readOnly?: boolean
  }
  onClose: () => void
}) {
  const {tool, readOnly = false} = input
  const saveTool = useSaveAgentTool(input.serverUrl, input.accountUid)
  const [name, setName] = useState(tool?.name ?? '')
  const [summary, setSummary] = useState(tool?.summary ?? '')
  const [description, setDescription] = useState(tool?.description ?? '')
  const [runtime, setRuntime] = useState<'typescript' | 'python'>(tool?.runtime ?? 'typescript')
  const [source, setSource] = useState(tool?.source ?? 'export default async function (input) {\n  return {}\n}\n')
  const [inputSchema, setInputSchema] = useState(
    JSON.stringify(
      tool?.input ?? {
        type: 'object',
        properties: {},
      },
      null,
      2,
    ),
  )
  const [outputSchema, setOutputSchema] = useState(tool?.output ? JSON.stringify(tool.output, null, 2) : '')
  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    try {
      const parsedInput = JSON.parse(inputSchema) as unknown
      const parsedOutput = outputSchema.trim() ? (JSON.parse(outputSchema) as unknown) : undefined
      if (!parsedInput || typeof parsedInput !== 'object' || Array.isArray(parsedInput)) {
        throw new Error('Input schema must be a JSON object')
      }
      if (
        parsedOutput !== undefined &&
        (!parsedOutput || typeof parsedOutput !== 'object' || Array.isArray(parsedOutput))
      ) {
        throw new Error('Output schema must be a JSON object or left blank')
      }
      const nextTool: AgentToolInput = {
        name: name.trim(),
        ...(summary.trim()
          ? {
              summary: summary.trim(),
            }
          : {}),
        description,
        input: parsedInput as Record<string, unknown>,
        ...(parsedOutput
          ? {
              output: parsedOutput as Record<string, unknown>,
            }
          : {}),
        source,
        runtime,
      }
      await saveTool.mutateAsync({
        agentId: input.agentId,
        tool: nextTool,
        previousName: tool?.name,
      })
      toast.success(tool ? 'Tool updated' : 'Tool created')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save tool')
    }
  }
  return (
    <form className={stylex.props(styles_4.s15fae92f).className || ''} onSubmit={handleSave}>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <DialogTitle>{tool ? 'Edit authored tool' : 'Add authored tool'}</DialogTitle>
        <DialogDescription>
          Define the name, model-facing contract, runtime, and executable source. Tool names use lowercase letters,
          numbers, underscores, and hyphens.
        </DialogDescription>
      </div>

      <div className={stylex.props(styles_4.s454f5715).className || ''}>
        <label className={stylex.props(styles_2.s1c7eef48).className || ''}>
          <SizableText size="sm" weight="bold">
            Name
          </SizableText>
          <Input
            className={stylex.props(styles.sa173a9a1).className || ''}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="weather_lookup"
            pattern="[a-z][a-z0-9_-]{1,63}"
            minLength={2}
            maxLength={64}
            required
            disabled={readOnly || saveTool.isLoading}
            autoFocus={!tool}
          />
        </label>
        <label className={stylex.props(styles_4.s7862b5a6).className || ''}>
          <SizableText size="sm" weight="bold">
            Runtime
          </SizableText>
          <select
            className={stylex.props(styles.sd18edfa0).className || ''}
            value={runtime}
            onChange={(event) => setRuntime(event.target.value === 'python' ? 'python' : 'typescript')}
            disabled={readOnly || saveTool.isLoading}
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </label>
      </div>

      <label className={stylex.props(styles.s25987914).className || ''}>
        <SizableText size="sm" weight="bold">
          List summary
        </SizableText>
        <Input
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="One short sentence; derived from the description when blank"
          maxLength={140}
          disabled={readOnly || saveTool.isLoading}
        />
      </label>

      <label className={stylex.props(styles.s25987914).className || ''}>
        <SizableText size="sm" weight="bold">
          Description sent to the model
        </SizableText>
        <Textarea
          className={stylex.props(styles_2.s945d5f9e).className || ''}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Explain what the tool does and when to call it."
          required
          disabled={readOnly || saveTool.isLoading}
        />
      </label>

      <label className={stylex.props(styles.s25987914).className || ''}>
        <SizableText size="sm" weight="bold">
          Source
        </SizableText>
        <Textarea
          className={stylex.props(styles_2.sc2c0d05b).className || ''}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          required
          disabled={readOnly || saveTool.isLoading}
        />
      </label>

      <div className={stylex.props(styles_4.s93ff291a).className || ''}>
        <label className={stylex.props(styles_2.s9c9145b5).className || ''}>
          <SizableText size="sm" weight="bold">
            Input schema
          </SizableText>
          <Textarea
            className={stylex.props(styles_2.s7b12fa98).className || ''}
            value={inputSchema}
            onChange={(event) => setInputSchema(event.target.value)}
            spellCheck={false}
            required
            disabled={readOnly || saveTool.isLoading}
          />
        </label>
        <label className={stylex.props(styles_2.s9c9145b5).className || ''}>
          <SizableText size="sm" weight="bold">
            Output schema <span className={stylex.props(styles.sd272840a).className || ''}>(optional)</span>
          </SizableText>
          <Textarea
            className={stylex.props(styles_2.s7b12fa98).className || ''}
            value={outputSchema}
            onChange={(event) => setOutputSchema(event.target.value)}
            placeholder="Leave blank for any output"
            spellCheck={false}
            disabled={readOnly || saveTool.isLoading}
          />
        </label>
      </div>

      {tool ? (
        <div className={stylex.props(styles_2.scfc6b2f2).className || ''}>
          <SizableText size="xs" color="muted">
            Current version
          </SizableText>
          <button
            type="button"
            className={stylex.props(styles_4.s95e7623f).className || ''}
            title="Copy content address"
            onClick={() => {
              copyTextToClipboard(tool.cid)
              toast.success('Content address copied')
            }}
          >
            {tool.cid}
          </button>
        </div>
      ) : null}

      <div className={stylex.props(styles.sb87f7412).className || ''}>
        <Button type="button" variant="ghost" onClick={onClose}>
          {readOnly ? 'Close' : 'Cancel'}
        </Button>
        {!readOnly ? (
          <Button type="submit" disabled={saveTool.isLoading}>
            {saveTool.isLoading ? <Spinner /> : null}
            {tool ? 'Save changes' : 'Create tool'}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
function DeleteAuthoredToolDialog({
  input,
  onClose,
}: {
  input: {
    serverUrl?: string
    accountUid: string | null
    agentId: string
    tool: AgentToolInfo
  }
  onClose: () => void
}) {
  const deleteTool = useDeleteAgentTool(input.serverUrl, input.accountUid)
  async function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    try {
      await deleteTool.mutateAsync({
        agentId: input.agentId,
        name: input.tool.name,
      })
      toast.success('Tool deleted')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete tool')
    }
  }
  return (
    <div className={stylex.props(styles.s2b00eca2).className || ''}>
      <AlertDialogTitle>Delete authored tool?</AlertDialogTitle>
      <AlertDialogDescription>
        This permanently deletes{' '}
        <span className={stylex.props(styles.sa173a9a1).className || ''}>{input.tool.name}</span>. Calls and workflows
        that refer to this name will stop working. This action cannot be undone.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={(event) => void handleDelete(event)} disabled={deleteTool.isLoading}>
            <Trash2 className={stylex.props(styles.sca3de968).className || ''} />
            Delete tool
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </div>
  )
}

/** Shows the exact model-facing prompt and JSON schemas for a single tool, for agent-owner transparency. */
function ToolInfoDialog({
  input,
  onClose,
}: {
  input: {
    toolName: string
  }
  onClose: () => void
}) {
  const meta = getSeedTool(input.toolName)
  if (!meta) {
    return (
      <div className={stylex.props(styles.sfbc6e28f).className || ''}>
        <DialogTitle>Unknown tool</DialogTitle>
        <SizableText size="sm" color="muted">
          No metadata is registered for "{input.toolName}".
        </SizableText>
      </div>
    )
  }
  return (
    <div className={stylex.props(styles_4.s1f22c98c).className || ''}>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <DialogTitle>{meta.label}</DialogTitle>
        <SizableText size="xs" color="muted" className={stylex.props(styles.sa173a9a1).className || ''}>
          {meta.name}
        </SizableText>
      </div>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="sm" weight="bold">
          Description sent to the model
        </SizableText>
        <SizableText size="sm" color="muted">
          {meta.description}
        </SizableText>
      </div>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="sm" weight="bold">
          Input schema
        </SizableText>
        <pre className={stylex.props(styles.sdb1fda99).className || ''}>
          {JSON.stringify(meta.inputSchema, null, 2)}
        </pre>
      </div>
      {meta.outputSchema ? (
        <div className={stylex.props(styles.sfbc6e28d).className || ''}>
          <SizableText size="sm" weight="bold">
            Output schema
          </SizableText>
          <pre className={stylex.props(styles.sdb1fda99).className || ''}>
            {JSON.stringify(meta.outputSchema, null, 2)}
          </pre>
        </div>
      ) : null}
      <div className={stylex.props(styles.s9141e77).className || ''}>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

// Reading, memory, publishing, delegation, and plans are verbs — always on, not configuration.
// What the user toggles here is the CALLABLE tool set dispatched through the call verb.
const AGENT_TOOL_OPTIONS: {
  names: string[]
  title: string
  infoTool?: string
}[] = [
  {
    names: [AGENT_SEARCH_TOOL],
    title: 'Search Seed content',
  },
  {
    names: [AGENT_WEB_SEARCH_TOOL],
    title: 'Search the web',
  },
  {
    names: [AGENT_EXECUTE_TOOL],
    title: 'Execute code',
  },
  // The publish grant is not a registry tool — publishing runs through the always-on `write`
  // verb, so its info dialog shows the write verb's model-facing contract.
  {
    names: [AGENT_PUBLISH_GRANT],
    title: 'Publish Seed content',
    infoTool: 'write',
  },
]
/** Layout and hover styling for the "Author as" identity chip. */
const authorChipStyles = stylex.create({
  chip: {
    display: 'flex',
    minWidth: 0,
    alignItems: 'center',
    gap: '0.375rem',
    borderRadius: '9999px',
    paddingBlock: '0.125rem',
    paddingRight: '0.5rem',
    paddingLeft: '0.125rem',
    cursor: {
      default: 'pointer',
      ':disabled': 'default',
    },
    backgroundColor: {
      default: null,
      ':hover': 'color-mix(in oklab, var(--accent) 40%, transparent)',
      ':disabled:hover': 'transparent',
    },
  },
})
const AUTHOR_CHIP_CLASS = stylex.props(authorChipStyles.chip).className || ''

/** One "Author as" identity chip. Owners get a dropdown (open / edit profile); everyone else gets a
 * plain profile link. Key-only identities with no account have no profile to open. */
function AuthorIdentityChip({
  identity,
  displayName,
  canEdit,
  onEdit,
}: {
  identity: SigningIdentity
  displayName: string
  canEdit: boolean
  onEdit: () => void
}) {
  const profileRoute = identity.accountId
    ? ({
        key: 'site-profile',
        id: hmId(identity.accountId),
        tab: 'profile',
      } as const)
    : null
  const linkProps = useRouteLink(profileRoute)
  const content = (
    <>
      {identity.accountId ? (
        <HMIcon id={hmId(identity.accountId)} name={displayName} icon={identity.icon} size={24} />
      ) : (
        <KeyRound className={stylex.props(styles.s3566be63).className || ''} />
      )}
      <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
        {displayName}
      </SizableText>
    </>
  )
  if (canEdit) {
    return (
      <OptionsDropdown
        ariaLabel={`Options for ${displayName}`}
        button={
          <button type="button" className={AUTHOR_CHIP_CLASS}>
            {content}
          </button>
        }
        menuItems={[
          profileRoute
            ? {
                key: 'open',
                label: 'Open profile',
                icon: <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />,
                onClick: (e) => linkProps.onClick?.(e),
              }
            : null,
          {
            key: 'edit',
            label: 'Edit profile',
            icon: <Pencil className={stylex.props(styles.sca3de968).className || ''} />,
            onClick: onEdit,
          },
        ]}
      />
    )
  }
  if (!profileRoute) {
    return (
      <div className={stylex.props(styles_2.s2b96d687).className || ''} title={displayName}>
        {content}
      </div>
    )
  }
  return (
    <a {...linkProps} className={AUTHOR_CHIP_CLASS} aria-label={`Open ${displayName}'s profile`}>
      {content}
    </a>
  )
}
function AgentToolsTab({
  serverUrl,
  accountUid,
  agentId,
  definition,
  identities,
  identitiesLoading,
  webCapabilities,
  onSave,
  onCreateIdentity,
  saving,
  readOnly = false,
  canManageIdentities = false,
}: {
  serverUrl: string | undefined
  accountUid: string | null
  agentId: string
  definition: AgentDefinition
  identities: SigningIdentity[]
  identitiesLoading: boolean
  webCapabilities: AgentServerWebCapabilities | undefined
  onSave: (definition: AgentDefinition) => Promise<unknown>
  onCreateIdentity: (label: string) => Promise<unknown>
  saving: boolean
  readOnly?: boolean
  /** Owner-only: granting/removing signing accounts and creating new ones. Writers can toggle
   * tools but must never see or manage the owner's identity list. */
  canManageIdentities?: boolean
}) {
  const toolInfoDialog = useAppDialog(ToolInfoDialog)
  const authoredToolDialog = useAppDialog(AuthoredToolDialog, {
    className: stylex.props(styles_7.scdbaf625, styles_7.s9ccd4e68).className || '',
  })
  const deleteAuthoredToolDialog = useAppDialog(DeleteAuthoredToolDialog, {
    isAlert: true,
  })
  const editAccountDialog = useAppDialog(EditAgentAccountDialog)
  const agentTools = useAgentTools(serverUrl, accountUid, agentId)
  const authoredTools = (agentTools.data?.tools ?? []).filter((tool) => tool.kind === 'lambda')
  const enableWhpDialog = useAppDialog(EnableWindowsHypervisorDialog)
  const definitionSigningKeys = definition.signingKeys || (definition.signingKey ? [definition.signingKey] : [])
  const defaultTools = [...DEFAULT_AGENT_TOOLS]
  const [enabledTools, setEnabledTools] = useState<string[]>(
    definition.tools ? normalizeStoredAgentTools(definition.tools) : defaultTools,
  )
  const [signingKeys, setSigningKeys] = useState<string[]>(definitionSigningKeys)
  const [showNewIdentityPanel, setShowNewIdentityPanel] = useState(false)
  const [newIdentityName, setNewIdentityName] = useState('Agent publisher')
  useEffect(() => {
    setEnabledTools(definition.tools ? normalizeStoredAgentTools(definition.tools) : defaultTools)
    setSigningKeys(definition.signingKeys || (definition.signingKey ? [definition.signingKey] : []))
  }, [definition])
  async function saveTools(nextTools: string[], nextSigningKeys: string[]) {
    setEnabledTools(nextTools)
    setSigningKeys(nextSigningKeys)
    try {
      const nextDefinition: AgentDefinition = {
        ...definition,
        tools: nextTools,
        signingKeys: nextSigningKeys,
        signingKey: nextSigningKeys[0],
      }
      await onSave(nextDefinition)
    } catch (error) {
      setEnabledTools(definition.tools ? normalizeStoredAgentTools(definition.tools) : defaultTools)
      setSigningKeys(definition.signingKeys || (definition.signingKey ? [definition.signingKey] : []))
      toast.error(error instanceof Error ? error.message : 'Could not update agent tools')
    }
  }
  async function handleCreateIdentity() {
    try {
      const label = newIdentityName.trim()
      if (!label) throw new Error('Account name is required')
      const response = await onCreateIdentity(label)
      if (
        response &&
        typeof response === 'object' &&
        '_' in response &&
        response._ === 'CreateSigningIdentityResponse'
      ) {
        const identityName = (
          response as unknown as {
            identity: SigningIdentity
          }
        ).identity.name
        await saveTools(enabledTools, Array.from(new Set([...signingKeys, identityName])))
      }
      setNewIdentityName('Agent publisher')
      setShowNewIdentityPanel(false)
      toast.success('Agent account created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create agent account')
    }
  }
  const grantedIdentities = identities.filter((identity) => signingKeys.includes(identity.name))
  const ungrantedIdentities = identities.filter((identity) => !signingKeys.includes(identity.name))
  return (
    <section className={stylex.props(styles_2.sb2646ddb).className || ''}>
      <div>
        <SizableText weight="bold">Tools</SizableText>
      </div>

      <div className={stylex.props(styles.sd1c4c9a1).className || ''}>
        {AGENT_TOOL_OPTIONS.map((group) => {
          const availability = group.names.map((name) => getToolAvailability(name, webCapabilities))
          const groupAvailable = availability.some((entry) => entry.available)
          // Unavailability the user can fix locally (e.g. turn on a Windows feature): keep the
          // checkbox clickable and answer the click with setup instructions instead of a save.
          const setupAction = availability.find((entry) => entry.action)?.action
          const note = availability.find((entry) => entry.note)?.note
          const checked = group.names.some((name) => enabledTools.includes(name))
          const isPublishGroup = group.names.includes(AGENT_PUBLISH_GRANT)
          return (
            <div
              key={group.names.join('|')}
              className={
                (stylex.props(
                  styles_6.s1a01a0ed,
                  styles_6.sf28e7398,
                  styles_6.s2ffff9,
                  styles_6.s67e351ac,
                  styles_6.s5d936fc,
                  styles_6.sf7998a14,
                  styles_6.sad8c742c,
                  styles_6.s34b1af,
                  styles_6.s34b56f,
                ).className || '') +
                ' ' +
                (groupAvailable || setupAction ? '' : stylex.props(styles_6.s54eab7bc).className || '')
              }
            >
              <div className={stylex.props(styles.s86ff3e5).className || ''}>
                <label className={stylex.props(styles_2.sdf91ad19).className || ''}>
                  <input
                    type="checkbox"
                    className={stylex.props(styles.sca3de968).className || ''}
                    checked={checked}
                    disabled={readOnly || (!groupAvailable && !setupAction)}
                    onChange={(event) => {
                      // Enabling an unavailable-but-fixable tool answers with setup help instead of
                      // a save; disabling always saves so users can still remove the tool.
                      if (!groupAvailable && event.target.checked) {
                        if (setupAction === 'enable-whp') enableWhpDialog.open({})
                        return
                      }
                      const nextTools = event.target.checked
                        ? Array.from(new Set([...enabledTools, ...group.names]))
                        : enabledTools.filter((item) => !group.names.includes(item))
                      void saveTools(nextTools, signingKeys)
                    }}
                  />
                  <SizableText size="sm" weight="bold" className={stylex.props(styles.s6e724d66).className || ''}>
                    {group.title}
                  </SizableText>
                  {!groupAvailable ? (
                    <span className={stylex.props(styles_4.sfdf82496).className || ''}>
                      {setupAction ? 'Setup required' : 'Unavailable'}
                    </span>
                  ) : null}
                </label>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className={stylex.props(styles_5.s765a26ee, styles_5.s3731c254, styles_5.sd5830f98).className || ''}
                  aria-label={`About ${group.title}`}
                  onClick={() =>
                    toolInfoDialog.open({
                      toolName: group.infoTool ?? group.names[0]!,
                    })
                  }
                >
                  <Info className={stylex.props(styles.s3269316e).className || ''} />
                </Button>
              </div>
              {!groupAvailable && note ? (
                <SizableText size="xs" color="muted" className={stylex.props(styles.s3484a6).className || ''}>
                  {note}{' '}
                  {setupAction === 'enable-whp' ? (
                    <button
                      type="button"
                      className={stylex.props(styles.s7a992289).className || ''}
                      onClick={() => enableWhpDialog.open({})}
                    >
                      Show me how
                    </button>
                  ) : null}
                </SizableText>
              ) : null}
              {isPublishGroup && checked ? (
                <div className={stylex.props(styles_4.s709ffd81).className || ''}>
                  <div className={stylex.props(styles_2.sa4681c45).className || ''}>
                    <KeyRound className={stylex.props(styles.sf0768e89).className || ''} />
                    <SizableText size="sm" weight="bold" className={stylex.props(styles.sf032ed6c).className || ''}>
                      Author as:
                    </SizableText>
                    <div className={stylex.props(styles_2.sc95eeaf4).className || ''}>
                      {grantedIdentities.map((identity) => {
                        const displayName = identity.label || identity.accountId || identity.name
                        return (
                          <div
                            key={identity.id}
                            className={
                              stylex.props(styles_5.s2ffff9, styles_5.s3f58665f, styles_5.sc6ed1702, styles_5.sf4676641)
                                .className || ''
                            }
                          >
                            <AuthorIdentityChip
                              identity={identity}
                              displayName={displayName}
                              canEdit={canManageIdentities}
                              onEdit={() =>
                                editAccountDialog.open({
                                  serverUrl,
                                  selectedAccountId: accountUid,
                                  identity,
                                })
                              }
                            />
                            {canManageIdentities ? (
                              <Button
                                variant="ghost"
                                size="iconSm"
                                className={
                                  stylex.props(styles_5.sf2718385, styles_5.s5f101360, styles_5.s765a26ee).className ||
                                  ''
                                }
                                aria-label={`Remove ${displayName}`}
                                disabled={saving || identitiesLoading}
                                onClick={() =>
                                  void saveTools(
                                    enabledTools,
                                    signingKeys.filter((name) => name !== identity.name),
                                  )
                                }
                              >
                                <X className={stylex.props(styles.s3269316e).className || ''} />
                              </Button>
                            ) : null}
                          </div>
                        )
                      })}
                      {grantedIdentities.length === 0 ? (
                        <SizableText size="sm" color="muted">
                          None
                        </SizableText>
                      ) : null}
                    </div>
                    {canManageIdentities ? (
                      <div className={stylex.props(styles.s7778dfe9).className || ''}>
                        {ungrantedIdentities.length > 0 ? (
                          <OptionsDropdown
                            ariaLabel="Grant a signing identity"
                            button={
                              <Button variant="outline" size="xs" disabled={saving || identitiesLoading}>
                                Grant
                              </Button>
                            }
                            menuItems={ungrantedIdentities.map((identity) => ({
                              key: identity.id,
                              label: identity.label || identity.accountId || identity.name,
                              icon: identity.accountId ? (
                                <HMIcon
                                  id={hmId(identity.accountId)}
                                  name={identity.label}
                                  icon={identity.icon}
                                  size={20}
                                />
                              ) : (
                                <KeyRound className={stylex.props(styles.sca3de968).className || ''} />
                              ),
                              onClick: () =>
                                void saveTools(enabledTools, Array.from(new Set([...signingKeys, identity.name]))),
                            }))}
                          />
                        ) : null}
                        {!showNewIdentityPanel && identities.length > 0 ? (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setShowNewIdentityPanel(true)}
                            disabled={saving}
                          >
                            <Plus className={stylex.props(styles.s3269316e).className || ''} />
                            New Account
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  {canManageIdentities && !identitiesLoading && identities.length === 0 ? (
                    <div className={stylex.props(styles.s94e66deb).className || ''}>
                      <SizableText size="sm" color="muted">
                        No agent accounts are available on this server yet. Create a new server-side HM account key,
                        then enable it for this agent.
                      </SizableText>
                      <NewAgentAccountPanel
                        name={newIdentityName}
                        onNameChange={setNewIdentityName}
                        onCreate={() => void handleCreateIdentity()}
                        disabled={saving}
                      />
                    </div>
                  ) : canManageIdentities && showNewIdentityPanel ? (
                    <NewAgentAccountPanel
                      name={newIdentityName}
                      onNameChange={setNewIdentityName}
                      onCreate={() => void handleCreateIdentity()}
                      onCancel={() => setShowNewIdentityPanel(false)}
                      disabled={saving}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
        {authoredTools.map((tool) => (
          <div
            key={tool.name}
            className={
              (stylex.props(
                styles_6.s1a01a0ed,
                styles_6.sf28e7398,
                styles_6.s2cc20399,
                styles_6.s2ffff9,
                styles_6.sc6ed1702,
                styles_6.s5d936fb,
                styles_6.sf7998a14,
                styles_6.sad8c742c,
                styles_6.s34b1af,
                styles_6.s34b56e,
              ).className || '') +
              ' ' +
              (tool.enabled ? '' : stylex.props(styles_6.s54eab7bc).className || '')
            }
          >
            <button
              type="button"
              className={stylex.props(styles_2.s8fe12dbc).className || ''}
              onClick={() =>
                authoredToolDialog.open({
                  serverUrl,
                  accountUid,
                  agentId,
                  tool,
                  readOnly,
                })
              }
            >
              <SizableText size="sm" weight="bold" className={stylex.props(styles.s8e4be3ed).className || ''}>
                {tool.name}
              </SizableText>
              <span className={stylex.props(styles_4.sa112639a).className || ''}>
                {tool.runtime === 'python' ? 'Python' : 'TypeScript'}
              </span>
              {!tool.enabled ? (
                <span className={stylex.props(styles_4.sa112639a).className || ''}>Disabled</span>
              ) : null}
              <SizableText size="sm" color="muted" className={stylex.props(styles.s6e724d66).className || ''}>
                {tool.summary}
              </SizableText>
            </button>
            {!readOnly ? (
              <div
                className={
                  stylex.props(
                    styles_5.s2ffff9,
                    styles_5.sf032ed6c,
                    styles_5.sc6ed1702,
                    styles_5.sf4676280,
                    styles_5.s765a26ee,
                  ).className || ''
                }
              >
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`Edit ${tool.name}`}
                  onClick={() =>
                    authoredToolDialog.open({
                      serverUrl,
                      accountUid,
                      agentId,
                      tool,
                    })
                  }
                >
                  <Pencil className={stylex.props(styles.s3269316e).className || ''} />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  className={stylex.props(styles_4.s3c9d925b).className || ''}
                  aria-label={`Delete ${tool.name}`}
                  onClick={() =>
                    deleteAuthoredToolDialog.open({
                      serverUrl,
                      accountUid,
                      agentId,
                      tool,
                    })
                  }
                >
                  <Trash2 className={stylex.props(styles.s3269316e).className || ''} />
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        <div className={stylex.props(styles.scfedb87c).className || ''}>
          {agentTools.isLoading && authoredTools.length === 0 ? (
            <SizableText size="sm" color="muted">
              Loading custom tools…
            </SizableText>
          ) : authoredTools.length === 0 ? (
            <SizableText size="sm" color="muted">
              No custom tools yet — add one here or ask the agent to write one for itself.
            </SizableText>
          ) : (
            <span />
          )}
          {!readOnly ? (
            <Button
              variant="ghost"
              size="sm"
              className={stylex.props(styles.sf032ed6c).className || ''}
              onClick={() =>
                authoredToolDialog.open({
                  serverUrl,
                  accountUid,
                  agentId,
                })
              }
            >
              <Plus className={stylex.props(styles.sca3de968).className || ''} />
              Add tool
            </Button>
          ) : null}
        </div>
      </div>

      {toolInfoDialog.content}
      {authoredToolDialog.content}
      {deleteAuthoredToolDialog.content}
      {enableWhpDialog.content}
      {editAccountDialog.content}

      {saving ? (
        <SizableText size="xs" color="muted">
          Saving changes…
        </SizableText>
      ) : null}
    </section>
  )
}
function NewAgentAccountPanel({
  name,
  onNameChange,
  onCreate,
  onCancel,
  disabled,
}: {
  name: string
  onNameChange: (name: string) => void
  onCreate: () => void
  onCancel?: () => void
  disabled: boolean
}) {
  return (
    <div className={stylex.props(styles.sea5bafd9).className || ''}>
      <div>
        <SizableText size="sm" weight="bold">
          New agent account
        </SizableText>
        <SizableText size="xs" color="muted">
          This profile name is published to the HM server with the generated public key.
        </SizableText>
      </div>
      <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Profile name" />
      <div className={stylex.props(styles.sb87f7412).className || ''}>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        ) : null}
        <Button onClick={onCreate} disabled={disabled || !name.trim()}>
          Create account
        </Button>
      </div>
    </div>
  )
}
function AgentTriggersTab({
  agentId,
  serverUrl,
  selectedAccountId,
  selectedTriggerId,
  triggers,
  isLoading,
  readOnly = false,
}: {
  agentId: string
  serverUrl: string
  selectedAccountId: string | null | undefined
  selectedTriggerId?: string
  triggers: AgentTriggerInfo[]
  isLoading: boolean
  readOnly?: boolean
}) {
  const navigate = useNavigate()
  const trigger = useAgentTrigger(serverUrl, selectedAccountId, selectedTriggerId)
  const updateTrigger = useUpdateAgentTrigger(serverUrl, selectedAccountId)
  const deleteTrigger = useDeleteAgentTrigger(serverUrl, selectedAccountId)
  const selected = trigger.data?.trigger
  const [name, setName] = useState('')
  const [nameDirty, setNameDirty] = useState(false)
  const [nameSaveState, setNameSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const nameSaveIdRef = useRef(0)
  const [enabled, setEnabled] = useState(true)
  const [prompt, setPrompt] = useState<HMBlockNode[]>([])
  const [source, setSource] = useState<AgentTriggerSource>({
    type: 'document-comment',
    resource: '',
  })
  const [detailsDirty, setDetailsDirty] = useState(false)
  const [detailsSaveState, setDetailsSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const detailsSaveIdRef = useRef(0)
  const selectedTriggerRef = useRef<string | null>(null)
  const lastSavedDetailsKeyRef = useRef('')
  const currentDetailsKey = useMemo(() => {
    return JSON.stringify({
      prompt,
      source,
    })
  }, [prompt, source])
  const currentDetailsKeyRef = useRef(currentDetailsKey)
  currentDetailsKeyRef.current = currentDetailsKey
  const nextScheduledFire = useMemo(
    () =>
      selected
        ? nextScheduleFire({
            source,
            createdAt: selected.createdAt,
            lastFiredAt: selected.lastFiredAt,
            enabled,
          })
        : null,
    [enabled, selected, source],
  )
  useEffect(() => {
    if (!selected) return
    const triggerChanged = selectedTriggerRef.current !== selected.id
    selectedTriggerRef.current = selected.id
    if (triggerChanged || !nameDirty) setName(selected.name)
    if (!triggerChanged) return
    const nextPrompt = agentPromptToBlocks(selected.prompt)
    const nextSource = selected.source
    setEnabled(selected.enabled)
    setPrompt(nextPrompt)
    setSource(nextSource)
    lastSavedDetailsKeyRef.current = JSON.stringify({
      prompt: nextPrompt,
      source: nextSource,
    })
    setDetailsDirty(false)
    setDetailsSaveState('idle')
  }, [nameDirty, selected])
  useEffect(() => {
    if (readOnly || !selectedTriggerId || !selected || !nameDirty) return
    const draftName = name.trim()
    if (!draftName) return
    if (draftName === selected.name) {
      setNameSaveState('idle')
      setNameDirty(false)
      return
    }
    const saveId = nameSaveIdRef.current + 1
    nameSaveIdRef.current = saveId
    const timer = setTimeout(() => {
      setNameSaveState('saving')
      void updateTrigger
        .mutateAsync({
          triggerId: selectedTriggerId,
          patch: {
            name: draftName,
          },
        })
        .then((result) => {
          if (nameSaveIdRef.current !== saveId) return
          if (result._ !== 'UpdateAgentTriggerResponse') throw new Error('Unexpected trigger update response')
          setName(draftName)
          setNameDirty(false)
          setNameSaveState('saved')
          setTimeout(() => {
            if (nameSaveIdRef.current === saveId) setNameSaveState('idle')
          }, 1800)
        })
        .catch((error) => {
          if (nameSaveIdRef.current !== saveId) return
          setNameSaveState('error')
          toast.error(error instanceof Error ? error.message : 'Could not rename trigger')
        })
    }, 600)
    return () => clearTimeout(timer)
  }, [name, nameDirty, readOnly, selected, selectedTriggerId, updateTrigger])
  async function handleEnabledChange(nextEnabled: boolean) {
    if (!selectedTriggerId || !selected) return
    const previousEnabled = enabled
    setEnabled(nextEnabled)
    try {
      const result = await updateTrigger.mutateAsync({
        triggerId: selectedTriggerId,
        patch: {
          enabled: nextEnabled,
        },
      })
      if (result._ !== 'UpdateAgentTriggerResponse') throw new Error('Unexpected trigger update response')
    } catch (error) {
      setEnabled(previousEnabled)
      toast.error(error instanceof Error ? error.message : 'Could not update trigger enabled state')
    }
  }
  useEffect(() => {
    if (readOnly || !selectedTriggerId || !selected || !detailsDirty || detailsSaveState === 'saving') return
    const detailsKey = currentDetailsKey
    if (detailsKey === lastSavedDetailsKeyRef.current) {
      setDetailsDirty(false)
      setDetailsSaveState('idle')
      return
    }
    const saveId = detailsSaveIdRef.current + 1
    detailsSaveIdRef.current = saveId
    const timer = setTimeout(() => {
      setDetailsSaveState('saving')
      void updateTrigger
        .mutateAsync({
          triggerId: selectedTriggerId,
          patch: {
            prompt: promptBlocksForRequest(prompt),
            source,
          },
        })
        .then((result) => {
          if (detailsSaveIdRef.current !== saveId) return
          if (result._ !== 'UpdateAgentTriggerResponse') throw new Error('Unexpected trigger update response')
          lastSavedDetailsKeyRef.current = detailsKey
          if (currentDetailsKeyRef.current === detailsKey) {
            setDetailsDirty(false)
            setDetailsSaveState('saved')
            setTimeout(() => {
              if (detailsSaveIdRef.current === saveId) setDetailsSaveState('idle')
            }, 1800)
          } else {
            setDetailsDirty(true)
            setDetailsSaveState('idle')
          }
        })
        .catch((error) => {
          if (detailsSaveIdRef.current !== saveId) return
          setDetailsSaveState('error')
          toast.error(error instanceof Error ? error.message : 'Could not save trigger')
        })
    }, 800)
    return () => clearTimeout(timer)
  }, [currentDetailsKey, detailsDirty, detailsSaveState, prompt, readOnly, selected, selectedTriggerId, source])
  async function handleDeleteTrigger() {
    if (!selectedTriggerId) return
    try {
      const result = await deleteTrigger.mutateAsync(selectedTriggerId)
      if (result._ !== 'DeleteAgentTriggerResponse') throw new Error('Unexpected trigger delete response')
      toast.success('Trigger deleted')
      navigate({
        key: 'agent',
        agentId,
        serverUrl,
        tab: 'triggers',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete trigger')
    }
  }
  if (selectedTriggerId) {
    return (
      <>
        <AgentSubpageHeader
          title={name}
          placeholder="Untitled trigger"
          onTitleChange={(value) => {
            setName(value)
            setNameDirty(true)
          }}
          saveState={nameSaveState}
          disabled={!selected || readOnly}
          backLabel="Back to agent triggers"
          onBack={() =>
            navigate({
              key: 'agent',
              agentId,
              serverUrl,
              tab: 'triggers',
            })
          }
          actions={
            !readOnly ? (
              <OptionsDropdown
                align="end"
                menuItems={[
                  {
                    key: 'delete-trigger',
                    icon: <Trash2 className={stylex.props(styles.sca3de968).className || ''} />,
                    label: 'Delete trigger',
                    variant: 'destructive',
                    onClick: () => void handleDeleteTrigger(),
                  },
                ]}
              />
            ) : null
          }
        />
        <div className={stylex.props(styles_2.sb96da372).className || ''}>
          {trigger.isLoading ? <SizableText color="muted">Loading trigger…</SizableText> : null}
          {trigger.isError ? (
            <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
              {trigger.error instanceof Error ? trigger.error.message : 'Could not load trigger'}
            </SizableText>
          ) : null}
          {selected ? (
            <>
              {readOnly ? (
                <div className={stylex.props(styles.sd1c4c9a3).className || ''}>
                  <div className={stylex.props(styles_4.sb06f525c).className || ''}>
                    <SizableText size="sm" weight="bold" className={stylex.props(styles.s597c48d).className || ''}>
                      Source
                    </SizableText>
                    <SizableText size="sm" color="muted">
                      {summarizeTriggerSource(source)}
                    </SizableText>
                  </div>
                  <div className={stylex.props(styles.sfbc6e28d).className || ''}>
                    <SizableText size="sm" weight="bold">
                      Prompt
                    </SizableText>
                    <pre className={stylex.props(styles_4.s90532d8c).className || ''}>
                      {promptBlocksToMarkdown(prompt) || 'No prompt configured.'}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className={stylex.props(styles.sd1c4c9a3).className || ''}>
                  <TriggerSourceFields
                    source={source}
                    onChange={(nextSource) => {
                      setSource(nextSource)
                      setDetailsDirty(true)
                    }}
                    trailing={
                      <label className={stylex.props(styles.s5661d341).className || ''}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          disabled={updateTrigger.isLoading}
                          onChange={(event) => void handleEnabledChange(event.target.checked)}
                        />
                        Enable Trigger
                      </label>
                    }
                  />
                  <div className={stylex.props(styles.sfbc6e28d).className || ''}>
                    <SizableText size="sm" weight="bold">
                      Prompt
                    </SizableText>
                    <AgentPromptEditor
                      key={selected.id}
                      initialBlocks={prompt}
                      onChange={(blocks) => {
                        setPrompt(blocks)
                        setDetailsDirty(true)
                      }}
                    />
                    <SizableText size="xs" color={detailsSaveState === 'error' ? undefined : 'muted'}>
                      {detailsSaveState === 'saving'
                        ? 'Saving…'
                        : detailsSaveState === 'saved'
                          ? 'Saved.'
                          : detailsSaveState === 'error'
                            ? 'Save failed.'
                            : ''}
                    </SizableText>
                  </div>
                </div>
              )}
              <div className={stylex.props(styles.s911c1714).className || ''}>
                <SizableText weight="bold">Sessions created by this trigger</SizableText>
                {!trigger.data?.sessions.length ? (
                  <SizableText color="muted">No sessions created yet.</SizableText>
                ) : null}
                {trigger.data?.sessions.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    serverUrl={serverUrl}
                    accountUid={selectedAccountId}
                    onOpen={() =>
                      navigate({
                        key: 'agent-session',
                        agentId,
                        sessionId: session.id,
                        serverUrl,
                      })
                    }
                    onOpenSession={(child) =>
                      navigate({
                        key: 'agent-session',
                        agentId: child.agentId,
                        sessionId: child.id,
                        serverUrl,
                      })
                    }
                    onOpenTrigger={() =>
                      navigate({
                        key: 'agent',
                        agentId,
                        serverUrl,
                        tab: 'triggers',
                        triggerId: selected.id,
                      })
                    }
                  />
                ))}
              </div>
              <div className={stylex.props(styles_4.s15b067b5).className || ''}>
                <TriggerMeta label="Last checked" value={selected.lastCheckedAt} />
                <TriggerMeta label="Last fired" value={selected.lastFiredAt} />
                {source.type === 'schedule' ? <TriggerMeta label="Next fire" value={nextScheduledFire} /> : null}
                <div className={stylex.props(styles.sfbc6e28d).className || ''}>
                  <SizableText size="sm" weight="bold">
                    Last error
                  </SizableText>
                  <SizableText size="sm" color={selected.lastError ? undefined : 'muted'}>
                    {selected.lastError || 'None'}
                  </SizableText>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </>
    )
  }
  return (
    <section className={stylex.props(styles.sfbc6e28e).className || ''}>
      {isLoading ? <SizableText color="muted">Loading triggers…</SizableText> : null}
      {!isLoading && !triggers.length ? (
        <div className={stylex.props(styles.sc182243e).className || ''}>
          <SizableText weight="bold">No triggers yet.</SizableText>
          <SizableText size="sm" color="muted">
            Create a trigger to start sessions when matching Seed activity appears.
          </SizableText>
        </div>
      ) : null}
      {triggers.map((item) => (
        <button
          key={item.id}
          className={stylex.props(styles_4.s5f7fffe).className || ''}
          onClick={() =>
            navigate({
              key: 'agent',
              agentId,
              serverUrl,
              tab: 'triggers',
              triggerId: item.id,
            })
          }
        >
          <div className={stylex.props(styles.s592e123d).className || ''}>
            <SizableText weight="bold">{item.name}</SizableText>
            <SizableText size="xs" color={item.enabled ? undefined : 'muted'}>
              {item.enabled ? 'Enabled' : 'Disabled'}
            </SizableText>
          </div>
          <SizableText size="sm" color="muted">
            {summarizeTriggerSource(item.source)}
          </SizableText>
          <SizableText size="xs" color="muted">
            Updated {new Date(item.updatedAt).toLocaleString()}
          </SizableText>
        </button>
      ))}
    </section>
  )
}
function TriggerMeta({label, value}: {label: string; value?: number | string | null}) {
  return (
    <div className={stylex.props(styles.sfbc6e28d).className || ''}>
      <SizableText size="sm" weight="bold">
        {label}
      </SizableText>
      <SizableText size="sm" color="muted">
        {typeof value === 'number' ? new Date(value).toLocaleString() : value || 'Never'}
      </SizableText>
    </div>
  )
}
function CreateAgentTriggerDialog({
  input,
  onClose,
}: {
  input: {
    serverUrl: string
    selectedAccountId: string | null | undefined
    agentId: string
  }
  onClose: () => void
}) {
  const createTrigger = useCreateAgentTrigger(input.serverUrl, input.selectedAccountId)
  const [name, setName] = useState('New activity trigger')
  const [source, setSource] = useState<AgentTriggerSource>({
    type: 'document-comment',
    resource: '',
  })
  const [prompt, setPrompt] = useState<HMBlockNode[]>(() =>
    agentPromptToBlocks('Respond to the mention, performing the action requested.'),
  )
  async function handleCreateTrigger() {
    try {
      const trigger: AgentTriggerInput = {
        name,
        enabled: true,
        source,
        prompt: promptBlocksForRequest(prompt),
      }
      const result = await createTrigger.mutateAsync({
        agentId: input.agentId,
        trigger,
      })
      if (result._ !== 'CreateAgentTriggerResponse') throw new Error('Unexpected trigger create response')
      toast.success('Trigger created')
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create trigger')
    }
  }
  return (
    <div className={stylex.props(styles_2.s32572229).className || ''}>
      <div>
        <DialogTitle>New trigger</DialogTitle>
        <DialogDescription>Start a new agent session when matching Seed activity appears.</DialogDescription>
      </div>
      <label className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="sm" weight="bold">
          Name
        </SizableText>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <TriggerSourceFields source={source} onChange={setSource} />
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText size="sm" weight="bold">
          Prompt
        </SizableText>
        <AgentPromptEditor initialBlocks={prompt} onChange={setPrompt} />
      </div>
      <div className={stylex.props(styles.sb87f7412).className || ''}>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => void handleCreateTrigger()} disabled={createTrigger.isLoading}>
          Create trigger
        </Button>
      </div>
    </div>
  )
}
function nextScheduleFire(input: {
  source: AgentTriggerSource
  createdAt: number
  lastFiredAt?: number
  enabled: boolean
}): number | string | null {
  if (!input.enabled) return 'Disabled'
  if (input.source.type !== 'schedule') return null
  const schedule = input.source.schedule
  const now = Date.now()
  const after = input.lastFiredAt ?? input.createdAt
  if (schedule.kind === 'interval') {
    const intervalMs = schedule.every * (schedule.unit === 'hours' ? 60 * 60_000 : 60_000)
    return after + intervalMs
  }
  if (schedule.kind === 'once') return input.lastFiredAt ? 'Already fired' : schedule.runAt
  return nextWeeklyScheduleFire(schedule, now, after)
}
function nextWeeklyScheduleFire(
  schedule: Extract<
    Extract<
      AgentTriggerSource,
      {
        type: 'schedule'
      }
    >['schedule'],
    {
      kind: 'weekly'
    }
  >,
  now: number,
  after: number,
): number | null {
  const nowParts = zonedParts(now, schedule.timezone)
  const [hourRaw, minuteRaw] = schedule.timeOfDay.split(':')
  const hour = Number(hourRaw)
  const minute = Number(minuteRaw)
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || !schedule.daysOfWeek.length) return null
  let next: number | null = null
  for (let offset = 0; offset <= 14; offset += 1) {
    const utcNoon = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day + offset, 12, 0)
    const parts = zonedParts(utcNoon, schedule.timezone)
    if (!schedule.daysOfWeek.includes(parts.weekday)) continue
    const candidate = zonedTimeToUtcMs(parts.year, parts.month, parts.day, hour, minute, schedule.timezone)
    if (candidate <= now || candidate <= after) continue
    if (next === null || candidate < next) next = candidate
  }
  return next
}
function zonedTimeToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  let guess = Date.UTC(year, month - 1, day, hour, minute)
  for (let i = 0; i < 3; i += 1) {
    const parts = zonedParts(guess, timeZone)
    const desired = Date.UTC(year, month - 1, day, hour, minute)
    const actual = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    const diff = desired - actual
    if (diff === 0) break
    guess += diff
  }
  return guess
}
function zonedParts(
  ms: number,
  timeZone: string,
): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  weekday: number
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const values = Object.fromEntries(formatter.formatToParts(new Date(ms)).map((part) => [part.type, part.value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf((values.weekday || 'Sun').slice(0, 3)),
  }
}
function SessionListItem({
  session,
  serverUrl,
  accountUid,
  onOpen,
  onOpenSession,
  onOpenTrigger,
}: {
  session: SessionInfo
  serverUrl: string
  accountUid: string | null | undefined
  onOpen: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Opens a sub-session listed under this one. */
  onOpenSession?: (session: SessionInfo, event: React.MouseEvent<HTMLButtonElement>) => void
  onOpenTrigger?: () => void
}) {
  return (
    <div className={stylex.props(styles_4.sda0606fa).className || ''}>
      <button type="button" className={stylex.props(styles_4.s8ebd925d).className || ''} onClick={onOpen}>
        <span className={stylex.props(styles.scc9904d2).className || ''}>
          <SessionStatusDot status={session.status} />
          <SizableText weight="bold" className={stylex.props(styles_2.s10483f08).className || ''}>
            {session.title || 'Untitled session'}
          </SizableText>
          <SizableText size="sm" color="muted" className={stylex.props(styles.s6b2af047).className || ''}>
            {formattedDateMedium(new Date(session.updatedAt))}
          </SizableText>
        </span>
        {session.description ? (
          <SizableText size="sm" color="muted" className={stylex.props(styles.s8c3d1867).className || ''}>
            {session.description}
          </SizableText>
        ) : null}
      </button>
      {session.startedByTrigger ? (
        <button
          type="button"
          className={stylex.props(styles_4.s239b1dd5).className || ''}
          onClick={(event) => {
            event.stopPropagation()
            onOpenTrigger?.()
          }}
        >
          Triggered by {session.startedByTrigger.triggerName}
        </button>
      ) : null}
      {session.childSessionCount && onOpenSession ? (
        <div className={stylex.props(styles.sd39686aa).className || ''}>
          <SubSessionsDisclosure
            serverUrl={serverUrl}
            accountUid={accountUid}
            parentSessionId={session.id}
            childSessionCount={session.childSessionCount}
            onOpenSession={onOpenSession}
          />
        </div>
      ) : null}
    </div>
  )
}
export default function AgentDetailRoutePage() {
  const route = useNavRoute()
  const selectedAccountId = useSelectedAccountId()
  // Keep every account this account's agents can author as synced locally, so they are
  // immediately mentionable and openable elsewhere in the app.
  useAgentAccountsSync()
  if (route.key !== 'agent') return null
  // Agent servers reject unauthenticated requests, so without an active account this page cannot
  // load the agent — gate it entirely (the back stack can land here after a sign-out).
  if (!selectedAccountId) return <AgentsNoAccountPage />
  return (
    <AgentDetailPage
      agentId={route.agentId}
      routeServerUrl={route.serverUrl}
      tab={route.tab}
      triggerId={route.triggerId}
      memoryPath={route.memoryPath}
    />
  )
}
