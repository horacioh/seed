import {DialogTitle, useAppDialog} from '@/components/dialog'
import {FormInput} from '@/components/form-input'
import {FormField} from '@/components/forms'
import {ImportButton} from '@/components/import-doc-button'
import {useDraft} from '@/models/accounts'
import {useDraftList, useListDirectory} from '@/models/documents'
import {pathNameify} from '@/utils/path'
import {useNavigate} from '@/utils/useNavigate'
import {zodResolver} from '@hookform/resolvers/zod'
import {
  formattedDate,
  formattedDateLong,
  HMDocument,
  hmId,
  packHmId,
  UnpackedHypermediaId,
  unpackHmId,
} from '@shm/shared'
import {
  Button,
  DataTable,
  Form,
  SizableText,
  Tooltip,
  XStack,
  YStack,
} from '@shm/ui'
import {Copy, FilePlus} from '@tamagui/lucide-icons'
import {useMemo} from 'react'
import {SubmitHandler, useForm} from 'react-hook-form'
import {z} from 'zod'
import {Thumbnail} from './thumbnail'

export function Directory({docId}: {docId: UnpackedHypermediaId}) {
  const navigate = useNavigate()
  const dir = useListDirectory(docId)
  const backendDrafts = useDraftList()

  const {drafts, directory} = useMemo(() => {
    let draftsForShow = backendDrafts.data || []
    return {
      directory: dir.data
        ? dir.data
            .filter((item) => {
              const level = docId.path?.length || 0
              if (item.path.length !== level + 1) return false
              let pathPrefix = (docId.path || []).join('/')
              return item.path.join('/').startsWith(pathPrefix)
            })
            .map((dirItem) => {
              const id = hmId(docId.type, docId.uid, {
                path: dirItem.path,
              })
              const hasDraft = draftsForShow?.includes(id.id)
              if (hasDraft) {
                draftsForShow = draftsForShow?.filter(
                  (draftId) => draftId !== id.id,
                )
              }
              return {
                ...dirItem,
                id,
                hasDraft,
              }
            })
        : [],
      drafts: draftsForShow
        ?.map((draftId) => {
          const id = unpackHmId(draftId)
          if (!id) return null
          return id
        })
        .filter((id) => {
          if (!id) return false
          const level = docId.path?.length || 0
          if (id.path?.length !== level + 1) return false
          let pathPrefix = (docId.path || []).join('/')
          return id.path.join('/').startsWith(pathPrefix)
        }),
    }
  }, [dir.data, backendDrafts.data])

  return (
    <YStack paddingVertical="$4">
      <DataTable.Root>
        <DataTable.Head>
          <DataTable.Row borderBottomWidth={10}>
            <DataTable.HeaderCell width="50%">
              <SizableText size="$1" f={1} textAlign="left">
                Document name
              </SizableText>
            </DataTable.HeaderCell>
            <DataTable.HeaderCell>
              <SizableText size="$1" f={1} textAlign="left">
                Path
              </SizableText>
            </DataTable.HeaderCell>
            <DataTable.HeaderCell>
              <SizableText size="$1" f={1} textAlign="left">
                Last update
              </SizableText>
            </DataTable.HeaderCell>
            <DataTable.HeaderCell>
              <SizableText size="$1" f={1} textAlign="left">
                Authors
              </SizableText>
            </DataTable.HeaderCell>
          </DataTable.Row>
        </DataTable.Head>
        <DataTable.Body>
          {drafts.length ? (
            <DataTable.Row bg="$color5">
              <DataTable.Cell colSpan={4}>
                <SizableText size="$1" color="$color9" fontWeight="600">
                  Drafts
                </SizableText>
              </DataTable.Cell>
            </DataTable.Row>
          ) : null}
          {drafts.map((id) => {
            if (!id) return null
            return <DraftListItem key={id.id} id={id} />
          })}
          {drafts.length && directory.length ? (
            <DataTable.Row bg="$color5">
              <DataTable.Cell colSpan={4}>
                <SizableText size="$1" color="$color9" fontWeight="600">
                  Documents
                </SizableText>
              </DataTable.Cell>
            </DataTable.Row>
          ) : null}
          {directory.map((item) => (
            <DirectoryItem item={item} />
          ))}
        </DataTable.Body>
      </DataTable.Root>
      <XStack paddingVertical="$4" gap="$3">
        <NewSubDocumentButton parentDocId={docId} />
        <ImportButton input={docId} />
      </XStack>
    </YStack>
  )
}

function DraftListItem({id}: {id: UnpackedHypermediaId}) {
  const navigate = useNavigate()

  const draft = useDraft(packHmId(id))

  function goToDraft() {
    navigate({key: 'draft', id})
  }

  return (
    <DataTable.Row>
      <DataTable.Cell onPress={goToDraft}>
        <XStack gap="$2">
          <Thumbnail size={20} id={id} document={draft.data} />
          <SizableText fontWeight="600">
            {draft.data?.metadata.name || 'Untitled'}
          </SizableText>
        </XStack>
      </DataTable.Cell>
      <DataTable.Cell onPress={goToDraft}>
        <PathButton path={id.path || []} onCopy={() => {}} />
      </DataTable.Cell>
      <DataTable.Cell onPress={goToDraft}>
        <Tooltip
          content={
            draft.data?.lastUpdateTime
              ? `Last update: ${formattedDateLong(
                  new Date(draft.data.lastUpdateTime),
                )}`
              : ''
          }
        >
          <SizableText size="$1">
            {formattedDate(new Date(draft.data?.lastUpdateTime))}
          </SizableText>
        </Tooltip>
      </DataTable.Cell>
      <DataTable.Cell onPress={goToDraft}>
        <SizableText>Authors...</SizableText>
      </DataTable.Cell>
    </DataTable.Row>
  )
}

// TODO: update types
function DirectoryItem({
  item,
}: {
  item: HMDocument & {id: UnpackedHypermediaId; hasDraft: boolean}
}) {
  const navigate = useNavigate('push')

  function goToDocument() {
    navigate({key: 'document', id: item.id})
  }
  return (
    <DataTable.Row>
      <DataTable.Cell onPress={goToDocument}>
        <XStack gap="$2">
          <Thumbnail size={20} id={item.id} document={item} />
          <SizableText fontWeight="600">{item.metadata.name}</SizableText>
          {item.hasDraft ? (
            <Button
              size="$1"
              theme="yellow"
              onPress={(e) => {
                e.stopPropagation()
                navigate({key: 'draft', id: item.id})
              }}
            >
              Resume Editing
            </Button>
          ) : null}
        </XStack>
      </DataTable.Cell>
      <DataTable.Cell noPadding onPress={goToDocument}>
        <PathButton path={item.path} onCopy={() => {}} />
      </DataTable.Cell>
      <DataTable.Cell onPress={goToDocument}>
        <Tooltip content={`Last update: ${formattedDateLong(item.updateTime)}`}>
          <SizableText size="$1">{formattedDate(item.updateTime)}</SizableText>
        </Tooltip>
      </DataTable.Cell>
      <DataTable.Cell onPress={goToDocument}>
        <SizableText>Authors...</SizableText>
      </DataTable.Cell>
    </DataTable.Row>
  )
}

const newSubDocumentSchema = z.object({
  name: z.string(),
})
type NewSubDocumentFields = z.infer<typeof newSubDocumentSchema>

function NewDocumentDialog({
  input,
  onClose,
}: {
  input: UnpackedHypermediaId
  onClose: () => void
}) {
  const navigate = useNavigate()
  const onSubmit: SubmitHandler<NewSubDocumentFields> = (data) => {
    const path = pathNameify(data.name)
    onClose()
    navigate({
      key: 'draft',
      id: {...input, path: [...(input.path || []), path]},
      name: data.name,
    })
  }
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<NewSubDocumentFields>({
    resolver: zodResolver(newSubDocumentSchema),
    defaultValues: {
      name: '',
    },
  })
  return (
    <>
      <DialogTitle>New Document</DialogTitle>
      {/* <DialogDescription>description</DialogDescription> */}
      <Form onSubmit={handleSubmit(onSubmit)} gap="$4">
        <FormField name="name" label="Title" errors={errors}>
          <FormInput
            control={control}
            name="name"
            placeholder="Document Title"
          />
        </FormField>
        <XStack space="$3" justifyContent="flex-end">
          <Form.Trigger asChild>
            <Button>Create Document</Button>
          </Form.Trigger>
        </XStack>
      </Form>
    </>
  )
}

function NewSubDocumentButton({
  parentDocId,
}: {
  parentDocId: UnpackedHypermediaId
}) {
  const {open, content} = useAppDialog<UnpackedHypermediaId>(NewDocumentDialog)
  return (
    <>
      <Button
        icon={FilePlus}
        onPress={() => {
          open(parentDocId)
        }}
        size="$3"
      >
        Create Document
      </Button>
      {content}
    </>
  )
}

function PathButton({
  path,
  onCopy,
}: {
  path: UnpackedHypermediaId['path'] | HMDocument['path']
  onCopy: () => void
}) {
  return (
    <XStack
      group="pathitem"
      ai="center"
      gap="$2"
      f={1}
      onPress={(e) => {
        e.stopPropagation()
        onCopy()
      }}
    >
      <SizableText
        color="$blue10"
        size="$2"
        fontWeight="500"
        $group-pathitem-hover={{
          color: '$blue11',
        }}
      >
        {path ? `/${path.at(-1)}` : ''}
      </SizableText>
      <Copy
        size={12}
        color="$blue10"
        opacity={0}
        $group-pathitem-hover={{
          opacity: 1,
          color: '$blue11',
        }}
      />
    </XStack>
  )
}
