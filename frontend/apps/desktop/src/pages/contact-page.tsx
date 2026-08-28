import * as stylex from '@stylexjs/stylex'
import {BookmarkButton} from '@/components/bookmarking'
import {useAllAccountsWithContacts, useContactList} from '@/models/contacts'
import {useSelectedAccount} from '@/selected-account'
import {useNavigate} from '@/utils/useNavigate'
import {zodResolver} from '@hookform/resolvers/zod'
import {
  HMAccount,
  HMAccountsMetadata,
  HMContact,
  HMContactRecord,
  UnpackedHypermediaId,
} from '@seed-hypermedia/client/hm-types'
import {getMetadataName, hmId} from '@shm/shared'
import {useContact, useDeleteContact, useSaveContact, useSelectedAccountContacts} from '@shm/shared/models/contacts'
import {useResources} from '@shm/shared/models/entity'
import {useNavRoute} from '@shm/shared/utils/navigation'
import {Button} from '@shm/ui/button'
import {DialogTitle} from '@shm/ui/components/dialog'
import {PanelContainer} from '@shm/ui/container'
import {FormInput} from '@shm/ui/form-input'
import {FormField} from '@shm/ui/forms'
import {HMIcon} from '@shm/ui/hm-icon'
import {OptionsDropdown} from '@shm/ui/options-dropdown'
import {Spinner} from '@shm/ui/spinner'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {cn} from '@shm/ui/utils'
import {ArrowUpRight, ChevronDown, ChevronRight, ChevronUp, Pencil, ShieldCheck, ShieldPlus, Trash} from 'lucide-react'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'
import {z} from 'zod'
const styles_5 = stylex.create({
  s1bd1f072: {
    visibility: 'visible',
  },
  s335490: {
    marginInline: 'calc(0.25rem * 2)',
  },
  sb41ffff4: {
    height: 'auto',
  },
  sc6ed1702: {
    alignItems: 'center',
  },
  s5d936fa: {
    gap: 'calc(0.25rem * 1)',
  },
  s34b56e: {
    paddingBlock: 'calc(0.25rem * 2)',
  },
  s13588c5b: {
    overflowWrap: 'break-word',
  },
  s1aa16: {
    padding: 'calc(0.25rem * 3)',
  },
  sa16ea943: {
    fontWeight: '700',
  },
})
const styles_4 = stylex.create({
  se7760e0d: {
    display: 'inline-block',
    flexShrink: '0',
    borderBottomStyle: 'solid',
    borderBottomWidth: '3px',
    padding: 'calc(var(--spacing) * 4)',
    whiteSpace: 'nowrap',
    color: 'var(--text-strong)',
  },
  s48408425: {
    borderColor: 'var(--primary)',
    borderRadius: '0',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-black)',
  },
  sfe731f15: {
    borderRadius: '0',
    borderColor: 'transparent',
    color: 'var(--color-gray-600)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--color-gray-800)',
      },
    },
  },
  se63f3915: {
    color: 'var(--primary-scheme)',
  },
  se6fabf9a: {
    borderColor: 'var(--border)',
    backgroundColor: 'var(--surface-app)',
    marginInline: 'auto',
    display: 'flex',
    width: '100%',
    maxWidth: 'var(--container-lg)',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 3)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(var(--spacing) * 4)',
    paddingBlock: 'calc(var(--spacing) * 7)',
  },
  sd6fb1733: {
    fontSize: 'var(--text-2xl)',
    lineHeight: 'var(--text-2xl--line-height)',
    color: 'var(--tone-gray-600)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--hover-gray-600)',
      },
    },
  },
  s30d14126: {
    borderColor: 'var(--border)',
    marginTop: 'calc(var(--spacing) * 4)',
    alignSelf: 'stretch',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: 'var(--surface)',
    padding: 'calc(var(--spacing) * 2)',
  },
  s3474df65: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 'calc(var(--spacing) * 2)',
    padding: 'calc(var(--spacing) * 2)',
    color: 'var(--tone-gray-700)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--contrast)',
      },
    },
  },
  s45da9ba: {
    color: 'var(--tone-gray-500-2)',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--hover-gray-500)',
      },
    },
  },
})
const styles_3 = stylex.create({
  s48408425: {
    borderColor: 'var(--primary)',
    borderRadius: '0',
    fontWeight: '700',
    color: '#000',
  },
  s765a26ee: {
    opacity: '0%',
  },
})
const styles_2 = stylex.create({
  sc920e66a: {
    display: 'flex',
    minHeight: '100%',
    flex: '1',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 4)',
  },
})
const styles = stylex.create({
  s1bc0c969: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  s71a8f402: {
    marginTop: 'calc(0.25rem * 4)',
    display: 'flex',
    flexShrink: '0',
    paddingInline: 'calc(0.25rem * 2)',
  },
  s33b9074e: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflowY: 'auto',
  },
  s2dbdd8a2: {
    color: 'var(--foreground)',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    paddingLeft: 'calc(0.25rem * 2)',
    textAlign: 'left',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfa3acb62: {
    height: '100%',
    overflowY: 'auto',
  },
  s20d4515d: {
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    wordBreak: 'break-all',
  },
  s942bdb85: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s3b6ba5e6: {
    color: 'var(--primary)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  sf640687b: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'calc(0.25rem * 2)',
  },
  sabcdd9c6: {
    borderColor: 'var(--border)',
    alignSelf: 'stretch',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '2px',
    padding: 'calc(0.25rem * 2)',
  },
  s78630139: {
    display: 'flex',
    justifyContent: 'center',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  sa16ea943: {
    fontWeight: '700',
  },
  s535dfa64: {
    color: 'var(--foreground)',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
  },
  sfbc6e292: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 6)',
  },
  s8a39cb0d: {
    color: 'var(--foreground)',
    fontStyle: 'italic',
  },
})
export default function ContactPage() {
  const route = useNavRoute()
  const contactRoute = route.key === 'contact' ? route : null
  if (!contactRoute) throw new Error('Invalid route for contact page')
  return <ContactListPage contactId={contactRoute.id} />
}
export function ContactListPage({contactId}: {contactId?: UnpackedHypermediaId | undefined}) {
  return (
    <PanelContainer>
      <PanelGroup direction="horizontal" autoSaveId="contact-page">
        <Panel defaultSize={30} minSize={20} maxSize={40}>
          <ContactPageSidebar contactId={contactId} />
        </Panel>
        <PanelResizeHandle className={stylex.props(styles_5.s1bd1f072).className || ''} />
        <Panel>{contactId ? <ContactPageMain contactId={contactId} /> : null}</Panel>
      </PanelGroup>
    </PanelContainer>
  )
}
function Tab({label, isActive, onPress}: {label: string; isActive: boolean; onPress: () => void}) {
  return (
    <button
      className={cn(
        stylex.props(styles_4.se7760e0d).className || '',
        stylex.props(isActive ? styles_4.s48408425 : styles_4.sfe731f15).className || '',
      )}
      onClick={onPress}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  )
}
function ContactPageSidebar({contactId}: {contactId?: UnpackedHypermediaId | undefined}) {
  const selectedAccountContacts = useSelectedAccountContacts()
  const [tab, setTab] = useState<'all' | 'saved'>('saved')
  const allAccounts = useAllAccountsWithContacts()
  let displayContacts =
    tab === 'all'
      ? allAccounts.data
      : allAccounts.data?.filter((account) => {
          return !!selectedAccountContacts.data?.find((c) => c.subject === account.id)
        })
  return (
    <div className={stylex.props(styles.s1bc0c969).className || ''}>
      <div className={stylex.props(styles.s71a8f402).className || ''}>
        <Tab label="Saved Contacts" isActive={tab === 'saved'} onPress={() => setTab('saved')} />
        <Tab label="All Contacts" isActive={tab === 'all'} onPress={() => setTab('all')} />
      </div>
      <div className={stylex.props(styles.s33b9074e).className || ''}>
        {displayContacts?.map((account) => {
          if (account.aliasAccount) return null
          return (
            <ContactListItem
              key={account.id}
              account={account}
              active={account.id === contactId?.uid}
              savedContact={selectedAccountContacts.data?.find((c) => c.subject === account.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
function ContactListItem({
  account,
  active,
  savedContact,
}: {
  account: HMAccount
  active: boolean
  savedContact: HMContactRecord | undefined
}) {
  const navigate = useNavigate()
  const id = hmId(account.id, {})
  return (
    <Button
      className={
        stylex.props(styles_5.s335490, styles_5.sb41ffff4, styles_5.sc6ed1702, styles_5.s5d936fa, styles_5.s34b56e)
          .className || ''
      }
      variant={active ? 'brand-12' : 'ghost'}
      onClick={() => {
        navigate({
          key: 'contact',
          id,
        })
      }}
    >
      <HMIcon size={28} id={id} name={account.metadata?.name} icon={account.metadata?.icon} />
      <span className={stylex.props(styles.s2dbdd8a2).className || ''}>
        {savedContact?.name ? savedContact.name : getMetadataName(account.metadata)}
      </span>

      <BookmarkButton active={active} hideUntilItemHover id={id} />

      <ShieldCheck
        className={cn(
          stylex.props(styles.sca3de968).className || '',
          stylex.props(styles_4.se63f3915).className || '',
          stylex.props(!savedContact && styles_3.s765a26ee).className || '',
        )}
      />
    </Button>
  )
}
function ContactPageMain({contactId}: {contactId: UnpackedHypermediaId}) {
  const contact = useContact(contactId)
  const contactFormDialog = useAppDialog(ContactFormDialog)
  const deleteContactDialog = useAppDialog(DeleteContactDialog)
  const navigate = useNavigate()
  const selectedAccountContacts = useSelectedAccountContacts()
  const accounts = useContactList()
  const myContact = selectedAccountContacts.data?.find((c) => c.subject === contactId?.uid)
  let primaryTitle = contact.data?.metadata?.name
  let primaryTooltip = 'Self-Published Name'
  let secondaryTitle = null
  let secondaryTooltip = ''
  if (myContact) {
    if (myContact.name === contact.data?.metadata?.name) {
      primaryTooltip = 'My Contact Name + Self-Published Name'
    } else {
      primaryTitle = myContact.name
      primaryTooltip = 'My Contact Name'
      secondaryTitle = contact.data?.metadata?.name
      secondaryTooltip = 'Self-Published Name'
    }
  }
  return (
    <div className={stylex.props(styles.sfa3acb62).className || ''}>
      <div className={stylex.props(styles_2.sc920e66a).className || ''}>
        <div className={stylex.props(styles_4.se6fabf9a).className || ''}>
          <HMIcon id={contactId} name={contact.data?.metadata?.name} icon={contact.data?.metadata?.icon} size={80} />
          <Tooltip content={primaryTooltip}>
            <h2 className={stylex.props(styles.s20d4515d).className || ''}>{primaryTitle}</h2>
          </Tooltip>
          {secondaryTitle && (
            <Tooltip content={secondaryTooltip}>
              <h3 className={stylex.props(styles_4.sd6fb1733).className || ''}>{secondaryTitle}</h3>
            </Tooltip>
          )}
          {contact.data ? <ContactEdgeNames contact={contact.data} accounts={accounts.data?.accountsMetadata} /> : null}
          <div className={stylex.props(styles.s942bdb85).className || ''}>
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  key: 'document',
                  id: contactId,
                })
              }
            >
              <ArrowUpRight className={stylex.props(styles.sca3de968).className || ''} />
              Open Space
            </Button>
            {myContact ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    contactFormDialog.open({
                      editId: myContact.id,
                      name: myContact.name,
                      subjectUid: contactId?.uid,
                    })
                  }}
                >
                  <Pencil className={stylex.props(styles.sca3de968).className || ''} />
                  Edit Contact
                </Button>
                <OptionsDropdown
                  menuItems={[
                    {
                      key: 'delete',
                      icon: <Trash className={stylex.props(styles.sca3de968).className || ''} />,
                      label: 'Delete Contact',
                      onClick: () => {
                        deleteContactDialog.open({
                          contact: myContact,
                        })
                      },
                    },
                  ]}
                />
              </>
            ) : (
              <Button
                onClick={() => {
                  contactFormDialog.open({
                    name: contact.data?.metadata?.name || '?',
                    subjectUid: contactId?.uid,
                  })
                }}
              >
                <ShieldPlus className={stylex.props(styles.s3b6ba5e6).className || ''} />
                Save Contact
              </Button>
            )}
          </div>
          {contact.data ? <AccountContacts contact={contact.data} ownerLabel={primaryTitle || 'Untitled'} /> : null}
          {contactFormDialog.content}
          {deleteContactDialog.content}
        </div>
      </div>
    </div>
  )
}
function DeleteContactDialog({
  input,
  onClose,
}: {
  input: {
    contact: HMContactRecord
  }
  onClose: () => void
}) {
  const deleteContact = useDeleteContact()
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      <DialogTitle>Delete Contact?</DialogTitle>
      <div>You will publicly delete this contact named "{input.contact.name}".</div>
      <div className={stylex.props(styles.sf640687b).className || ''}>
        <Spinner hide={!deleteContact.isLoading} />
        <Button
          variant="destructive"
          onClick={() => {
            console.log('~ will deleteContact', input.contact)
            deleteContact.mutateAsync(input.contact).then(() => {
              onClose()
            })
          }}
        >
          <Trash className={stylex.props(styles.sca3de968).className || ''} />
          Confirm Delete
        </Button>
      </div>
    </div>
  )
}
function ContactEdgeNames({contact, accounts}: {contact: HMContact; accounts: HMAccountsMetadata}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()
  const buttonLabel = isExpanded ? 'Collapse List of Edge Names' : 'Expand List of Edge Names'
  const buttonIcon = isExpanded ? ChevronDown : ChevronRight
  return (
    <div className={stylex.props(styles.sabcdd9c6).className || ''}>
      {contact.subjectContacts?.length ? (
        <>
          <div className={stylex.props(styles.s78630139).className || ''}>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded((v) => !v)}>
              {isExpanded ? (
                <ChevronUp className={stylex.props(styles.sca3de968).className || ''} />
              ) : (
                <ChevronDown className={stylex.props(styles.sca3de968).className || ''} />
              )}
              {buttonLabel}
            </Button>
          </div>
          {isExpanded ? (
            <div className={stylex.props(styles.s783f19f3).className || ''}>
              {contact.subjectContacts?.map((contact) => {
                const account = accounts[contact.account]
                return (
                  <div className={stylex.props(styles.sf640687b).className || ''}>
                    <span className={stylex.props(styles.sa16ea943).className || ''}>{contact.name}</span>
                    {account ? (
                      <Tooltip content={account.metadata?.name || 'Unknown Account'}>
                        <button
                          onClick={() => {
                            navigate({
                              key: 'contact',
                              id: account.id,
                            })
                          }}
                        >
                          <HMIcon
                            id={account.id}
                            name={account.metadata?.name}
                            icon={account.metadata?.icon}
                            size={24}
                          />
                        </button>
                      </Tooltip>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </>
      ) : (
        <span className={stylex.props(styles.s535dfa64).className || ''}>No Edge Names</span>
      )}
    </div>
  )
}
function AccountContacts({contact, ownerLabel}: {contact: HMContact; ownerLabel: string}) {
  const subjectAccounts = useResources(contact.contacts?.map((c) => hmId(c.subject)) || [], {
    subscribed: true,
  })
  const navigate = useNavigate()
  return (
    <div className={stylex.props(styles_4.s30d14126).className || ''}>
      <h3 className={stylex.props(styles_5.s13588c5b, styles_5.s1aa16, styles_5.sa16ea943).className || ''}>
        {contact.contacts?.length ? `${ownerLabel}'s Contacts` : `${ownerLabel} has no Contacts`}
      </h3>
      <div className={stylex.props(styles.s783f19f3).className || ''}>
        {contact.contacts?.map((contact) => {
          const subjectAccountResult = subjectAccounts.find((a) => a.data?.id?.uid === contact.subject)
          const subjectAccount = subjectAccountResult?.data
          const isDiscovering = subjectAccountResult?.isDiscovering
          const contactName = contact.name
          const subjectName = subjectAccount?.type === 'document' ? subjectAccount.document?.metadata?.name : undefined
          return (
            <div
              className={stylex.props(styles_4.s3474df65).className || ''}
              onClick={() => {
                navigate({
                  key: 'contact',
                  id: hmId(contact.subject),
                })
              }}
            >
              {subjectAccount ? (
                <HMIcon
                  id={subjectAccount.id}
                  name={subjectAccount.type === 'document' ? subjectAccount.document?.metadata?.name : undefined}
                  icon={subjectAccount.type === 'document' ? subjectAccount.document?.metadata?.icon : undefined}
                  size={32}
                />
              ) : (
                <HMIcon id={hmId(contact.subject)} size={32} />
              )}
              <span className={stylex.props(styles.sa16ea943).className || ''}>
                {isDiscovering ? 'Loading…' : subjectName}
              </span>
              {subjectName !== contactName ? (
                <span className={stylex.props(styles_4.s45da9ba).className || ''}>| {contactName}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
const SaveContactSchema = z.object({
  name: z.string().min(1),
})
function ContactFormDialog({
  input,
  onClose,
}: {
  input: {
    editId?: string
    name: string
    subjectUid: string
  }
  onClose: () => void
}) {
  const saveContact = useSaveContact()
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<z.infer<typeof SaveContactSchema>>({
    resolver: zodResolver(SaveContactSchema),
    defaultValues: {
      name: input.name || '',
    },
  })
  const selectedAccount = useSelectedAccount()
  function onSubmit(data: z.infer<typeof SaveContactSchema>) {
    console.log('~ onSubmit', data)
    if (!selectedAccount?.id) {
      toast.error('No account selected')
      return
    }
    saveContact
      .mutateAsync({
        editId: input.editId,
        accountUid: selectedAccount.id.uid,
        name: data.name,
        subjectUid: input.subjectUid,
      })
      .then(() => {
        onClose()
      })
  }
  return (
    <div className={stylex.props(styles.sfbc6e292).className || ''}>
      <DialogTitle>Save Contact</DialogTitle>
      <p className={stylex.props(styles.s8a39cb0d).className || ''}>
        This contact will be saved publicly for others to see.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)()
        }}
        className={stylex.props(styles.sfbc6e290).className || ''}
      >
        <FormField name="name" label="New Name for this Contact" errors={errors}>
          <FormInput control={control} name="name" placeholder="What you will publicly name this contact" />
        </FormField>

        <Button type="submit" variant="default">
          {selectedAccount?.id ? (
            <HMIcon
              id={selectedAccount?.id}
              name={selectedAccount?.metadata?.name}
              icon={selectedAccount?.metadata?.icon}
              size={24}
            />
          ) : null}
          Save Contact
        </Button>
      </form>
    </div>
  )
}
