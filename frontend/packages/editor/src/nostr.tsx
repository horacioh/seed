import * as stylex from '@stylexjs/stylex'
import {Block, BlockNoteEditor, defaultProps, getBlockInfoFromPos} from '@shm/editor/blocknote'
import {createReactBlockSpec} from './blocknote/react/ReactBlockSpec'
import {DAEMON_FILE_UPLOAD_URL, DAEMON_FILE_URL} from '@shm/shared/constants'
import {Button} from '@shm/ui/button'
import {Input} from '@shm/ui/components/input'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@shm/ui/components/tabs'
import {SizableText, Text} from '@shm/ui/text'
import {Tooltip} from '@shm/ui/tooltip'
import {cn} from '@shm/ui/utils'
import {Event as NostrEvent, nip19, nip21, relayInit, validateEvent, verifySignature} from 'nostr-tools'
import {useEffect, useState} from 'react'
import {HMBlockSchema} from './schema'
const styles_4 = stylex.create({
  se117420b: {
    ':is(.dark *)': {
      ':hover': {
        backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
      },
    },
  },
})
const styles_3 = stylex.create({
  s7c41759e: {
    ':is([data-state="active"])': {
      boxShadow: 'none',
    },
  },
})
const styles_2 = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
})
const styles = stylex.create({
  s2ffff9: {
    display: 'flex',
  },
  s67e351ac: {
    flexDirection: 'column',
  },
  s92852dd5: {
    overflow: 'hidden',
  },
  s67010d77: {
    position: 'absolute',
  },
  sa2668687: {
    right: 'calc(0.25rem * 1.5)',
  },
  sbbfc4140: {
    top: 'calc(0.25rem * 1.5)',
  },
  s382471: {
    zIndex: '20',
  },
  s347dc0f6: {
    width: '60px',
  },
  s1a01a0ed: {
    borderColor: 'var(--border)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sf79988b7: {
    borderRadius: 'calc(var(--radius) - 2px)',
  },
  sad8c742c: {
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sa1762f51: {
    fontFamily: 'var(--font-sans)',
  },
  s33458c: {
    marginTop: 'calc(0.25rem * 2)',
  },
  sc1a629cb: {
    justifyContent: 'space-between',
  },
  s33458e: {
    marginTop: 'calc(0.25rem * 4)',
  },
  sdef3facc: {
    position: 'relative',
  },
  s529492ad: {
    borderRadius: '0.25rem',
  },
  s47fbceb6: {
    borderStyle: 'solid',
    borderWidth: '2.5px',
  },
  sa602a1e3: {
    outlineStyle: 'none',
  },
  s11f8a88a: {
    borderColor: 'var(--muted)',
  },
  s436dc7b6: {
    backgroundColor: 'var(--background)',
  },
  s3301f9: {
    marginBottom: 'calc(0.25rem * 1)',
  },
  sb41ffff4: {
    height: 'auto',
  },
  scdbaf625: {
    width: '100%',
  },
  s775ae258: {
    borderRadius: '0',
  },
  s7c401f01: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
  },
  s1aa13: {
    padding: 'calc(0.25rem * 0)',
  },
  s6cb46864: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
  },
  s60f53bca: {
    backgroundColor: 'transparent',
  },
  s34b1af: {
    paddingInline: 'calc(0.25rem * 4)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sab7cc6fa: {
    fontSize: '0.875rem',
    lineHeight: 'var(--text-sm--line-height)',
  },
  s129e46b3: {
    fontWeight: '500',
  },
  s646c459b: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: 'color-mix(in oklab, #000 5%, transparent)',
      },
    },
  },
  s16e74d84: {
    borderColor: 'var(--foreground)',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s1aa17: {
    padding: 'calc(0.25rem * 4)',
  },
  s5d936fc: {
    gap: 'calc(0.25rem * 3)',
  },
  s34a2a9: {
    paddingTop: 'calc(0.25rem * 2)',
  },
})
export const RELAY_LIST = [
  'wss://relayable.org',
  'wss://brb.io',
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://soloco.nl',
]
export const NostrBlock = createReactBlockSpec({
  type: 'nostr',
  propSchema: {
    ...defaultProps,
    name: {
      default: '',
    },
    url: {
      default: '',
    },
    text: {
      default: '',
    },
    size: {
      default: '',
    },
    defaultOpen: {
      values: ['false', 'true'],
      default: 'true',
    },
  },
  containsInlineContent: true,
  // @ts-ignore
  render: ({block, editor}: {block: Block<HMBlockSchema>; editor: BlockNoteEditor<HMBlockSchema>}) =>
    Render(block, editor),
})
type NostrType = {
  id: string
  props: {
    url: string
    name: string
    text: string
    size: string
  }
  children: []
  content: []
  type: string
}
const boolRegex = new RegExp('true')
const Render = (block: Block<HMBlockSchema>, editor: BlockNoteEditor<HMBlockSchema>) => {
  const [selected, setSelected] = useState(false)
  const tiptapEditor = editor._tiptapEditor
  const selection = tiptapEditor.state.selection
  useEffect(() => {
    const selectedNode = getBlockInfoFromPos(tiptapEditor.state, tiptapEditor.state.selection.from)
    if (selectedNode && selectedNode.block.node.attrs.id) {
      if (selectedNode.block.node.attrs.id === block.id && selectedNode.block.beforePos === selection.$anchor.pos) {
        setSelected(true)
      } else if (selectedNode.block.node.attrs.id !== block.id) {
        setSelected(false)
      }
    }
  }, [selection])
  const assignNostr = (newNostr: NostrType) => {
    editor.updateBlock(block.id, {
      props: {
        ...block.props,
        ...newNostr.props,
      },
      content: newNostr.content,
    })
    editor.setTextCursorPosition(block.id, 'end')
  }
  const setSelection = (isSelected: boolean) => {
    setSelected(isSelected)
  }
  return (
    <div className={stylex.props(styles.s2ffff9, styles.s67e351ac, styles.s92852dd5).className || ''}>
      {block.props.name ? (
        <NostrComponent
          block={block}
          editor={editor}
          assign={assignNostr}
          selected={selected}
          setSelected={setSelection}
        />
      ) : editor.isEditable ? (
        <NostrForm block={block} editor={editor} assign={assignNostr} />
      ) : null}
    </div>
  )
}
function NostrComponent({
  block,
  editor,
  assign,
  selected,
  setSelected,
}: {
  block: Block<HMBlockSchema>
  editor: BlockNoteEditor<HMBlockSchema>
  assign: any
  selected: boolean
  setSelected: any
}) {
  // @ts-ignore
  const nostrNpud = nip19.npubEncode(block.props.name)
  const [replace, setReplace] = useState<boolean>(false)
  const [verified, setVerified] = useState<boolean>()
  const [content, setContent] = useState<string>()
  const uri = `nostr:${nostrNpud}`
  const header = `${nostrNpud.slice(0, 6)}…${nostrNpud.slice(-6)}`
  if (block.props.name && block.props.name !== '') {
    fetch(`${DAEMON_FILE_URL}/${block.props.url}`, {
      method: 'GET',
    }).then((response) => {
      if (response) {
        response.text().then((text) => {
          if (text) {
            const fileEvent = JSON.parse(text)
            if (content === undefined) setContent(fileEvent.content)
            if (verified === undefined && validateEvent(fileEvent)) {
              setVerified(verifySignature(fileEvent))
            }
          }
        })
      }
    })
  }
  return (
    <div
      // @ts-ignore
      contentEditable={false}
      className={stylex.props(styles_2.s2ffff9, styles_2.s67e351ac).className || ''}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setReplace(true)
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setReplace(false)
      }}
    >
      {replace && editor.isEditable ? (
        <Button
          className={
            stylex.props(styles.s67010d77, styles.sa2668687, styles.sbbfc4140, styles.s382471, styles.s347dc0f6)
              .className || ''
          }
          size="sm"
          onClick={() =>
            assign({
              props: {
                url: '',
                name: '',
                size: '0',
                text: '',
              },
              children: [],
              content: [],
              type: 'file',
            } as NostrType)
          }
        >
          replace
        </Button>
      ) : null}
      <div className={stylex.props(styles.s2ffff9).className || ''}>
        <div
          className={
            stylex.props(styles.s1a01a0ed, styles.sb42feb5d, styles.sf79988b7, styles.sad8c742c, styles.sa1762f51)
              .className || ''
          }
        >
          <SizableText className={stylex.props(styles.s33458c).className || ''} size="2xl">
            <div className={stylex.props(styles.s2ffff9, styles.sc1a629cb).className || ''}>
              <Text>
                {'Public Key: '}
                {nip21.test(uri) ? <a href={uri}>{header}</a> : header}
              </Text>
              <Tooltip content={verified ? 'Signature verified' : 'Invalid signature'}>
                <Button
                  disabled
                  variant={verified === undefined ? 'blue' : verified ? 'green' : 'orange'}
                  size="sm"
                ></Button>
              </Tooltip>
            </div>
          </SizableText>
          <p className={stylex.props(styles.s33458e).className || ''}>{content}</p>
        </div>
      </div>
    </div>
  )
}
function NostrForm({
  block,
  assign,
  editor,
}: {
  block: Block<HMBlockSchema>
  assign: any
  editor: BlockNoteEditor<HMBlockSchema>
}) {
  const [rawNote, setRawNote] = useState('')
  const [note, setNote] = useState<NostrEvent>()
  const [nevent, setNevent] = useState('')
  const [tabState, setTabState] = useState('search')
  const [state, setState] = useState<{
    name: string | undefined
    color: string | undefined
  }>({
    name: undefined,
    color: undefined,
  })
  useEffect(() => {
    if (note) ingestNote(note)
  }, [note])
  const delay = async (t = 100): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, t))
  }
  const searchRelay = async (relayUrl: string, noteId: string): Promise<void> => {
    const relay = relayInit(relayUrl)
    relay.on('connect', () => {
      setState({
        name: `Searching in ${relayUrl}`,
        color: 'green',
      })
    })
    relay.on('error', () => {
      throw new Error()
    })
    await relay.connect()
    await delay(1000)
    const sub = relay.sub([
      {
        ids: [noteId],
      },
    ])
    sub.on('event', async (event) => {
      if (event.id === noteId) {
        setNote(event)
        sub.unsub()
      }
    })
    sub.on('eose', () => {
      sub.unsub()
    })
    await delay(4000)
    if (!note) {
      sub.unsub()
      throw new Error()
    }
  }
  const searchNote = async () => {
    setState({
      name: 'Connecting…',
      color: 'green',
    })
    const decodedBech32 = nip19.decode(nevent)
    let noteId = ''
    let relayListIndex = 0
    let relays = RELAY_LIST.sort(() => Math.random() - 0.5)
    if (decodedBech32.type === 'nevent') {
      noteId = decodedBech32.data.id
      relays = [...(decodedBech32.data.relays ?? []), ...RELAY_LIST]
    } else if (decodedBech32.type === 'note') {
      noteId = decodedBech32.data
    }
    const tryRelay = async () => {
      // @ts-ignore
      searchRelay(RELAY_LIST[relayListIndex], noteId).catch(() => {
        relayListIndex = relayListIndex + 1
        if (relayListIndex < RELAY_LIST.length) {
          tryRelay()
        } else {
          setState({
            name: "Can't find the note in relays.",
            color: 'red',
          })
        }
      })
    }
    if (noteId !== '') tryRelay()
  }
  const submitNote = async (raw: string = rawNote) => {
    const event: NostrEvent = JSON.parse(raw)
    setNote(event)
  }
  const isValidEvent = (event: NostrEvent) => {
    try {
      return validateEvent(event) && verifySignature(event)
    } catch (e) {
      console.log(JSON.stringify(e))
      return false
    }
  }
  const ingestNote = async (event: NostrEvent): Promise<void> => {
    if (isValidEvent(event)) {
      const blobData = [JSON.stringify(event)]
      const blob = new Blob(blobData, {
        type: 'text/plain',
      })
      const formData = new FormData()
      formData.append('file', blob, event.id)
      const response = await fetch(DAEMON_FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })
      const data = await response.text()
      if (response.status !== 201) {
        throw new Error(data)
      }
      setState({
        name: undefined,
        color: undefined,
      })
      assign({
        props: {
          url: data,
          name: event.id,
          text: event.content,
          size: blob.size,
        },
      })
    } else {
      setState({
        name: 'The provided note is invalid or not supported.',
        color: 'red',
      })
    }
  }
  return (
    <div
      className={
        stylex.props(
          styles.s1a01a0ed,
          styles.sdef3facc,
          styles.s2ffff9,
          styles.s67e351ac,
          styles.s529492ad,
          styles.s47fbceb6,
          styles.sa1762f51,
          styles.sa602a1e3,
        ).className || ''
      }
      // @ts-ignore
      contentEditable={false}
    >
      <Tabs
        value={tabState}
        onValueChange={(value: string) => {
          setState({
            name: undefined,
            color: undefined,
          })
          setTabState(value)
        }}
        className={stylex.props(styles.s2ffff9, styles.s67e351ac).className || ''}
      >
        <TabsList
          className={
            stylex.props(
              styles.s11f8a88a,
              styles.s436dc7b6,
              styles.s3301f9,
              styles.sb41ffff4,
              styles.scdbaf625,
              styles.s775ae258,
              styles.s7c401f01,
              styles.s1aa13,
            ).className || ''
          }
        >
          <TabsTrigger
            value="search"
            className={cn(
              stylex.props(
                styles.sb41ffff4,
                styles.sb42feb5d,
                styles.s775ae258,
                styles.s6cb46864,
                styles.s60f53bca,
                styles.s34b1af,
                styles.s34b56e,
                styles.sab7cc6fa,
                styles.s129e46b3,
                styles.s646c459b,
              ).className || '',
              stylex.props(styles_3.s7c41759e).className || '',
              stylex.props(styles_4.se117420b).className || '',
              tabState === 'search'
                ? stylex.props(styles.s16e74d84, styles.s7c401f01).className || ''
                : stylex.props(styles.s6cb46864).className || '',
            )}
          >
            <SizableText size="sm">Search</SizableText>
          </TabsTrigger>
          <TabsTrigger
            value="manual"
            className={cn(
              stylex.props(
                styles.sb41ffff4,
                styles.sb42feb5d,
                styles.s775ae258,
                styles.s6cb46864,
                styles.s60f53bca,
                styles.s34b1af,
                styles.s34b56e,
                styles.sab7cc6fa,
                styles.s129e46b3,
                styles.s646c459b,
              ).className || '',
              stylex.props(styles_3.s7c41759e).className || '',
              stylex.props(styles_4.se117420b).className || '',
              tabState === 'manual'
                ? stylex.props(styles.s16e74d84, styles.s7c401f01).className || ''
                : stylex.props(styles.s6cb46864).className || '',
            )}
          >
            <SizableText size="sm">Manual</SizableText>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          <div
            className={
              stylex.props(styles.s436dc7b6, styles.s2ffff9, styles.sc6ed1702, styles.s529492ad, styles.s1aa17)
                .className || ''
            }
          >
            <form className={stylex.props(styles.scdbaf625).className || ''} onSubmit={() => searchNote()}>
              <div className={stylex.props(styles.s2ffff9, styles.sb42feb5d, styles.s5d936fc).className || ''}>
                <Input
                  className={stylex.props(styles.scdbaf625).className || ''}
                  placeholder="Input nevent or note1"
                  onChange={(e) => setNevent(e.target.value)}
                  autoFocus={true}
                />

                <Button type="submit">SEARCH</Button>
              </div>
              {state.name && (
                <SizableText
                  size="sm"
                  style={{
                    color: state.color,
                  }}
                  className={stylex.props(styles.s34a2a9).className || ''}
                >
                  {state.name}
                </SizableText>
              )}
            </form>
          </div>
        </TabsContent>
        <TabsContent value="manual">
          <div
            className={
              stylex.props(styles.s436dc7b6, styles.s2ffff9, styles.sc6ed1702, styles.s529492ad, styles.s1aa17)
                .className || ''
            }
          >
            <form className={stylex.props(styles.scdbaf625).className || ''} onSubmit={() => submitNote()}>
              <div className={stylex.props(styles.s2ffff9, styles.sb42feb5d, styles.s5d936fc).className || ''}>
                <Input
                  className={stylex.props(styles.scdbaf625).className || ''}
                  placeholder="Input JSON note"
                  onChange={(e) => setRawNote(e.target.value)}
                  autoFocus={true}
                />

                <Button type="submit">EMBED</Button>
              </div>
              {state.name && (
                <SizableText
                  size="sm"
                  style={{
                    color: state.color,
                  }}
                  className={stylex.props(styles.s34a2a9).className || ''}
                >
                  {state.name}
                </SizableText>
              )}
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
