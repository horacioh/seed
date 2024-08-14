import {useAppContext} from '@/app-context'
import {createHypermediaDocLinkPlugin} from '@/editor'
import {useOpenUrl} from '@/open-url'
import {slashMenuItems} from '@/slash-menu-items'
import {client, trpc} from '@/trpc'
import {
  HMComment,
  HMCommentDraft,
  UnpackedHypermediaId,
  fromHMBlock,
  hmId,
  packHmId,
  toHMBlock,
  unpackHmId,
  writeableStateStream,
} from '@shm/shared'
import {toast} from '@shm/ui'
import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'
import {Extension} from '@tiptap/core'
import {useEffect, useMemo, useRef} from 'react'
import {useGRPCClient, useQueryInvalidator} from '../app-context'
import {hmBlockSchema, useBlockNote} from '../editor'
import type {Block, BlockNoteEditor} from '../editor/blocknote'
import appError from '../errors'
import {useNavigate} from '../utils/useNavigate'
import {getBlockGroup, setGroupTypes} from './editor-utils'
import {useGatewayUrlStream} from './gateway-settings'
import {queryKeys} from './query-keys'
import {useInlineMentions} from './search'

function serverBlockNodesFromEditorBlocks(
  editor: BlockNoteEditor,
  editorBlocks: Block[],
) {
  if (!editorBlocks) return []
  return editorBlocks.map((block: Block) => {
    const childGroup = getBlockGroup(editor, block.id) || {}
    const serverBlock = fromHMBlock(block)
    if (childGroup) {
      // @ts-expect-error
      serverBlock.attributes.childrenType = childGroup.type
        ? childGroup.type
        : 'group'
      // @ts-expect-error
      serverBlock.attributes.listLevel = childGroup.listLevel
      // @ts-expect-error
      if (childGroup.start)
        serverBlock.attributes.start = childGroup.start.toString()
    }
    return {
      block: serverBlock,
      children: serverBlockNodesFromEditorBlocks(editor, block.children),
    }
  })
}

export type CommentGroup = {
  comments: HMComment[]
  moreCommentsCount: number
  id: string
}

export function useCommentGroups(
  comments: HMComment[] | undefined,
  targetCommentId: string | null,
): CommentGroup[] {
  return useMemo(() => {
    const groups: CommentGroup[] = []
    comments?.forEach((comment) => {
      if (
        comment.repliedComment === targetCommentId ||
        (!targetCommentId && comment.repliedComment === '')
      ) {
        groups.push({
          comments: [comment],
          moreCommentsCount: 0,
          id: comment.id,
        })
      }
    })
    groups.forEach((group) => {
      let comment: HMComment | null = group.comments[0]
      while (comment) {
        const nextComments = comments?.filter(
          (c) => c.repliedComment === comment?.id,
        )
        if (nextComments?.length === 1) {
          comment = nextComments[0]
          group.comments.push(comment)
        } else {
          comment = null
        }
      }
      const lastGroupComment = group.comments.at(-1)
      if (!lastGroupComment || !comments) return
      const moreComments = new Set<string>()
      let walkMoreCommentIds = new Set<string>([lastGroupComment.id])
      while (walkMoreCommentIds.size) {
        walkMoreCommentIds.forEach((commentId) => moreComments.add(commentId))
        walkMoreCommentIds = new Set<string>(
          comments
            .filter(
              (c) =>
                c.repliedComment && walkMoreCommentIds.has(c.repliedComment),
            )
            .map((comment) => comment.id),
        )
      }
      group.moreCommentsCount = moreComments.size - 1
    })
    return groups
  }, [comments, targetCommentId])
}

export function useCommentReplies(
  targetCommentId: string,
  targetDocUid: string,
) {
  const comments = useAllDocumentComments(targetDocUid)
  return useMemo(() => {
    let comment = comments.data?.find((c) => c.id === targetCommentId)
    const thread = [comment]
    while (comment) {
      comment = comments.data?.find((c) => c.id === comment?.repliedComment)
      thread.unshift(comment)
    }
    return thread
  }, [comments.data, targetCommentId])
}

export function useCommentDraft(commentId: string, opts?: UseQueryOptions) {
  const comment = trpc.comments.getCommentDraft.useQuery(
    {
      commentDraftId: commentId,
    },
    opts,
  )
  return comment
}

export function useComment(
  id: UnpackedHypermediaId | null | undefined,
  opts?: UseQueryOptions<HMComment>,
) {
  const grpcClient = useGRPCClient()
  return useQuery({
    ...opts,
    enabled: opts?.enabled !== false && !!commentId,
    queryFn: async () => {
      if (!commentId) return null
      let res = await grpcClient.comments.getComment({
        id: commentId,
      })
      const comment = res as unknown as HMComment
      return comment
    },
    queryKey: [queryKeys.COMMENT, commentId],
  })
}

export function useCommentDraftId(docId: UnpackedHypermediaId | undefined) {
  if (!docId) return null
}

export function useAllDocumentComments(docUid: string | undefined) {
  const grpcClient = useGRPCClient()
  return useQuery({
    queryFn: async () => {
      if (!docUid) return []
      let res = await grpcClient.comments.listComments({
        target: packHmId(hmId('d', docUid)),
      })
      return res.comments as unknown as HMComment[]
    },
    enabled: !!docUid,
    refetchInterval: 10_000,
    queryKey: [queryKeys.PUBLICATION_COMMENTS, docUid],
  })
}

export function useDocumentCommentGroups(
  docUid: string | undefined,
  commentId: string | null = null,
) {
  const comments = useAllDocumentComments(docUid)
  return useCommentGroups(comments.data, commentId)
}

export function useCommentEditor(
  draftId: string,
  opts: {onDiscard?: () => void} = {},
) {
  const checkWebUrl = trpc.webImporting.checkWebUrl.useMutation()
  const showNostr = trpc.experiments.get.useQuery().data?.nostr
  const queryClient = useAppContext().queryClient
  const write = trpc.comments.writeCommentDraft.useMutation({
    onError: (err) => {
      toast.error(err.message)
    },
  })
  const removeDraft = trpc.comments.removeCommentDraft.useMutation({
    onError: (err) => {
      opts.onDiscard?.()
    },
  })
  const openUrl = useOpenUrl()
  const [setIsSaved, isSaved] = writeableStateStream<boolean>(true)
  const saveTimeoutRef = useRef<number | undefined>()
  const readyEditor = useRef<BlockNoteEditor>()
  const initCommentDraft = useRef<HMCommentDraft | null | undefined>()
  const streams = useRef<{
    targetCommentId: ReturnType<typeof writeableStateStream>
    targetDocId: ReturnType<typeof writeableStateStream>
  }>({
    targetCommentId: writeableStateStream<string | null>(null),
    targetDocId: writeableStateStream<string | null>(null),
  })
  const grpcClient = useGRPCClient()
  const replace = useNavigate('replace')
  const {inlineMentionsData, inlineMentionsQuery} = useInlineMentions()
  function initDraft() {
    const draft = initCommentDraft.current
    if (!readyEditor.current || !draft) return
    const editor = readyEditor.current
    const editorBlocks = toHMBlock(draft.blocks)
    editor.removeBlocks(editor.topLevelBlocks)
    editor.replaceBlocks(editor.topLevelBlocks, editorBlocks)
    setGroupTypes(editor._tiptapEditor, editorBlocks)
  }

  const gwUrl = useGatewayUrlStream()
  const editor = useBlockNote<typeof hmBlockSchema>({
    onEditorContentChange(editor: BlockNoteEditor<typeof hmBlockSchema>) {
      setIsSaved(false)
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        const blocks = serverBlockNodesFromEditorBlocks(
          editor,
          editor.topLevelBlocks,
        )
        write
          .mutateAsync({
            blocks,
            commentId: draftId,
          })
          .then((savedDraftId) => {
            clearTimeout(saveTimeoutRef.current)
            setIsSaved(true)
          })
      }, 500)
    },
    linkExtensionOptions: {
      openOnClick: false,
      queryClient,
      grpcClient,
      openUrl,
      gwUrl,
      checkWebUrl: checkWebUrl.mutate,
    },

    onEditorReady: (e) => {
      readyEditor.current = e
      initDraft()
    },
    blockSchema: hmBlockSchema,
    slashMenuItems: !showNostr
      ? slashMenuItems.filter((item) => item.name != 'Nostr')
      : slashMenuItems,
    onMentionsQuery: (query: string) => {
      inlineMentionsQuery(query)
    },
    _tiptapOptions: {
      extensions: [
        Extension.create({
          name: 'hypermedia-link',
          addProseMirrorPlugins() {
            return [
              createHypermediaDocLinkPlugin({
                queryClient,
              }).plugin,
            ]
          },
        }),
      ],
    },
  })

  useEffect(() => {
    if (inlineMentionsData) {
      editor?.setInlineEmbedOptions(inlineMentionsData)
    }
  }, [inlineMentionsData])

  trpc.comments.getCommentDraft.useQuery(
    {
      commentDraftId: draftId,
    },
    {
      onError: (err) =>
        appError(`Could not load comment draft: ${err.message}`),
      onSuccess: (draft) => {
        if (!draft)
          throw new Error('no valid draft in route for getCommentDraft')
        initCommentDraft.current = draft
        streams.current.targetCommentId[0](draft.targetCommentId)
        const docId = packHmId(hmId('d', draft.targetDocId))
        streams.current.targetDocId[0](docId)
        initDraft()
      },
    },
  )
  // useEffect(() => {
  //   if (!editCommentId) return
  //   client.comments.getCommentDraft
  //     .query({
  //       commentDraftId: editCommentId,
  //     })
  //     .then((draft) => {
  //       if (!draft)
  //         throw new Error('no valid draft in route for getCommentDraft')
  //       initCommentDraft.current = draft
  //       setTargetCommentId(draft.targetCommentId)
  //       setTargetDocId(packHmId(hmId('d', draft.targetDocUid)))
  //       initDraft()
  //     })
  // }, [editCommentId])
  const invalidate = useQueryInvalidator()
  const publishComment = useMutation({
    mutationFn: async ({
      content,
      targetDocId,
      targetCommentId,
    }: {
      content: any
      targetDocId: string
      targetCommentId: string | null
    }) => {
      const resultComment = await grpcClient.comments.createComment({
        content,
        target: targetDocId,
        repliedComment: targetCommentId || undefined,
      })
      if (!resultComment) throw new Error('no resultComment')
      return resultComment
    },
    onSuccess: (newComment: HMComment) => {
      const targetDocId = newComment.target
        ? unpackHmId(newComment.target)
        : null
      targetDocId &&
        invalidate([queryKeys.PUBLICATION_COMMENTS, targetDocId.uid])
      invalidate(['trpc.comments.getCommentDrafts'])
      invalidate([queryKeys.FEED_LATEST_EVENT])
      invalidate([queryKeys.RESOURCE_FEED_LATEST_EVENT])
      replace({
        key: 'comment',
        showThread: true,
        commentId: newComment.id,
      })
    },
  })
  return useMemo(() => {
    function onSubmit() {
      if (!draftId) throw new Error('no draftId')
      const draft = initCommentDraft.current
      if (!draft) throw new Error('no draft found to publish')
      const content = serverBlockNodesFromEditorBlocks(
        editor,
        editor.topLevelBlocks,
      )
      const contentWithoutLastEmptyBlock = content.filter((block, index) => {
        const isLast = index === content.length - 1
        if (!isLast) return true
        if (
          block.type === 'paragraph' &&
          block.text === '' &&
          block.children.length === 0
        )
          return false
        return true
      })
      publishComment.mutate({
        content: contentWithoutLastEmptyBlock,
        targetDocId: packHmId(
          hmId('d', draft.targetDocId, {
            version: draft.targetDocVersion,
          }),
        ),
        targetCommentId: draft.targetCommentId,
      })
    }
    function addReplyEmbed(replyBlockCommentId: string, blockId: string) {
      const editor = readyEditor.current
      const commentId = unpackHmId(replyBlockCommentId)
      if (!commentId) throw new Error('Invalid commentId')
      if (!editor) throw new Error('Editor not ready yet')
      editor.insertBlocks(
        [
          {
            type: 'embed',
            props: {
              ref: packHmId(
                hmId('comment', commentId.uid, {blockRef: blockId}),
              ),
              textAlignment: 'left',
              childrenType: 'group',
            },
          },
          {type: 'paragraph', text: '', props: {}},
        ],
        editor.topLevelBlocks.at(-1),
        'after',
      )
    }
    function onDiscard() {
      if (!draftId) throw new Error('no comment draftId')
      removeDraft
        .mutateAsync({
          commentId: draftId,
        })
        .then(() => {
          client.closeAppWindow.mutate(window.windowId)
        })
    }
    return {
      editor,
      onSubmit,
      onDiscard,
      isSaved,
      targetCommentId: streams.current.targetCommentId[1],
      targetDocId: streams.current.targetDocId[1],
      addReplyEmbed,
    }
  }, [])
}

export function useCreateComment() {
  const createComment = trpc.comments.createCommentDraft.useMutation()
  return (
    targetDocId: string,
    targetDocVersion: string,
    targetCommentId?: string,
    embedRef?: string,
  ) => {
    return createComment.mutateAsync({
      targetDocId,
      targetCommentId: targetCommentId || null,
      targetDocVersion,
      blocks: [],
    })
  }
}
