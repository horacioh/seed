import * as stylex from '@stylexjs/stylex'
import {reportError} from '@/errors'
import {useCurrencyComparisons} from '@/models/compare-currencies'
import {
  useCreateLocalInvoice,
  useCreateWallet,
  useDecodedInvoice,
  useDeleteWallet,
  useExportWallet,
  useListInvoices,
  useListWallets,
  usePayInvoice,
  useWallet,
} from '@/models/payments'
import {PlainMessage} from '@bufbuild/protobuf'
import {HMInvoice, HMWallet} from '@seed-hypermedia/client/hm-types'
import {Invoice} from '@shm/shared/client/.generated/payments/v1alpha/invoices_pb'
import {getAccountName} from '@shm/shared/content'
import {useResource} from '@shm/shared/models/entity'
import {useInvoiceStatus} from '@shm/shared/models/payments'
import {formattedDateMedium} from '@shm/shared/utils/date'
import {hmId} from '@shm/shared/utils/entity-id-url'
import {Button} from '@shm/ui/button'
import {Badge} from '@shm/ui/components/badge'
import {DialogDescription, DialogTitle} from '@shm/ui/components/dialog'
import {Input} from '@shm/ui/components/input'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {Field} from '@shm/ui/form-fields'
import {
  AlertCircle,
  ChevronDown,
  Back as ChevronLeft,
  Forward as ChevronRight,
  ChevronUp,
  Copy,
  Download,
  Upload,
} from '@shm/ui/icons'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shm/ui/select-dropdown'
import {Spinner} from '@shm/ui/spinner'
import {InfoListHeader, TableList} from '@shm/ui/table-list'
import {SizableText} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {useState} from 'react'
import QRCode from 'react-qr-code'
const styles_2 = stylex.create({
  s5305ac91: {
    width: '180px',
  },
})
const styles = stylex.create({
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s2ffff9: {
    display: 'flex',
  },
  s760cfea1: {
    alignSelf: 'flex-start',
  },
  s407d9e9: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  s86ff3e5: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s51ab7e66: {
    color: 'var(--destructive)',
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
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
  s5f6cd3a4: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  se658ac15: {
    display: 'flex',
    gap: 'calc(0.25rem * 3)',
  },
  sd4bc3b8d: {
    color: 'var(--primary)',
    borderColor: 'var(--primary)',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  sf38169a7: {
    margin: 'calc(0.25rem * 4)',
    display: 'flex',
    flexDirection: 'column',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  s52a78f35: {
    margin: 'calc(0.25rem * 4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  s2d27f4cb: {
    color: 'var(--muted)',
  },
  s783f19f3: {
    display: 'flex',
    flexDirection: 'column',
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  s86ff3e6: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  sbf63c09a: {
    color: 'var(--link)',
  },
  s71e968d9: {
    color: 'currentcolor',
  },
  se658ac16: {
    display: 'flex',
    gap: 'calc(0.25rem * 4)',
  },
  sb42feb5d: {
    flex: '1',
  },
  sff4cbdec: {
    marginBlock: 'calc(0.25rem * 4)',
    display: 'flex',
    justifyContent: 'center',
  },
  s78630139: {
    display: 'flex',
    justifyContent: 'center',
  },
  s21fb93ac: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  saa1b63c3: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 2)',
  },
  sfbc6e28d: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  se658ac14: {
    display: 'flex',
    gap: 'calc(0.25rem * 2)',
  },
})
export function AccountWallet({
  accountUid,
  onOpenWallet,
}: {
  accountUid: string
  onOpenWallet: (walletId: string) => void
}) {
  const createWallet = useCreateWallet()
  const wallets = useListWallets(accountUid)
  if (!wallets.data?.wallets) return null
  if (wallets.isLoading)
    return (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
      </div>
    )
  if (createWallet.isLoading)
    return (
      <div className={stylex.props(styles.s9a378369).className || ''}>
        <Spinner />
      </div>
    )
  if (wallets.data.wallets.length) {
    return wallets.data.wallets.map((wallet) => (
      <WalletButton walletId={wallet.id} onOpen={() => onOpenWallet(wallet.id)} />
    ))
  }
  return (
    <div className={stylex.props(styles.s2ffff9).className || ''}>
      <Button
        variant="inverse"
        size="sm"
        className={stylex.props(styles.s760cfea1).className || ''}
        onClick={() => {
          createWallet
            .mutateAsync({
              accountUid,
            })
            .catch((e) => {
              console.error(e)
              toast.error(`Failed to create wallet: ${e.message}`)
              reportError(e, {
                feature: 'payments',
                operation: 'create-wallet',
                accountUid,
              })
            })
        }}
      >
        Create Account Wallet
      </Button>
    </div>
  )
}
function WalletButton({walletId, onOpen}: {walletId: string; onOpen: () => void}) {
  const wallet = useWallet(walletId)
  return (
    <Button onClick={onOpen}>
      <div className={stylex.props(styles.s407d9e9).className || ''}>
        <SizableText family="mono">x{walletId.slice(-8).toUpperCase()}</SizableText>
        <div className={stylex.props(styles.s86ff3e5).className || ''}>
          <Badge variant="outline">Account Wallet</Badge>
          {wallet.isLoading ? (
            <div className={stylex.props(styles.s9a378369).className || ''}>
              <Spinner />
            </div>
          ) : wallet.data ? (
            <SizableText family="mono" weight="bold">{`${wallet.data?.balance} SAT`}</SizableText>
          ) : wallet.isError ? (
            <AlertCircle className={stylex.props(styles.s51ab7e66).className || ''} />
          ) : null}
          <ChevronRight className={stylex.props(styles.s3b6ba5e6).className || ''} />
        </div>
      </div>
    </Button>
  )
}
export function WalletPage({
  walletId,
  accountUid,
  onClose,
}: {
  walletId: string
  accountUid: string
  onClose: () => void
}) {
  const wallet = useWallet(walletId)
  const accountDoc = useResource(hmId(accountUid))
  const invoices = useListInvoices(walletId)
  const exportDialog = useAppDialog(ExportWalletDialog)
  const exportWallet = useExportWallet(walletId)
  const document = accountDoc.data?.type === 'document' ? accountDoc.data.document : undefined
  const walletName = `${getAccountName(document)} Main Wallet`
  return (
    <div className={stylex.props(styles.sfbc6e290).className || ''}>
      <div className={stylex.props(styles.s5f6cd3a4).className || ''}>
        <Button size="sm" onClick={onClose}>
          <ChevronLeft className={stylex.props(styles.sca3de968).className || ''} />
          Profile
        </Button>
        <div className={stylex.props(styles.se658ac15).className || ''}>
          {/* <DeleteWalletButton
            walletId={walletId}
            accountUid={accountUid}
            onDeleted={onClose}
            /> */}
          <Button
            size="sm"
            onClick={() =>
              exportWallet.mutateAsync().then((exportedWallet) => {
                // toast.success('Wallet exported: ' + exportedWallet)
                exportDialog.open(exportedWallet)
              })
            }
            variant="outline"
            className={stylex.props(styles.sd4bc3b8d).className || ''}
          >
            Export
          </Button>
          {exportDialog.content}
        </div>
      </div>
      {
        wallet.isLoading ? (
          <div className={stylex.props(styles.s9a378369).className || ''}>
            <Spinner />
          </div>
        ) : wallet.isError ? (
          <div className={stylex.props(styles.sf38169a7).className || ''}>
            <SizableText weight="bold" size="2xl" className={stylex.props(styles.s8a2570e2).className || ''}>
              Error Loading Wallet
            </SizableText>
          </div>
        ) : wallet.data ? (
          <WalletDetails wallet={wallet.data} walletName={walletName} walletId={walletId} accountUid={accountUid} />
        ) : null // todo error view
      }
      <TableList>
        <InfoListHeader title="Transaction History" />
        {invoices.data ? (
          <WalletTransactions invoices={invoices.data} />
        ) : invoices.isError ? (
          <div className={stylex.props(styles.sf38169a7).className || ''}>
            <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
              Error Loading Transaction History. May be disconnected from Seed Lightning Server.
            </SizableText>
          </div>
        ) : (
          <div className={stylex.props(styles.s52a78f35).className || ''}>
            <Spinner />
          </div>
        )}
      </TableList>
    </div>
  )
}
function WalletTransactions({
  invoices,
}: {
  invoices: {
    all: PlainMessage<Invoice>[]
    received: PlainMessage<Invoice>[]
    paid: PlainMessage<Invoice>[]
  }
}) {
  if (invoices.all.length === 0)
    return (
      <div className={stylex.props(styles.sf38169a7).className || ''}>
        <SizableText className={stylex.props(styles.s2d27f4cb).className || ''}>No transactions yet.</SizableText>
      </div>
    )
  return (
    <div className={stylex.props(styles.s783f19f3).className || ''}>
      {invoices.all.map((invoice) => (
        <InvoiceRow invoice={invoice} />
      ))}
    </div>
  )
}
function WalletDetails({
  wallet,
  walletName,
  walletId,
  accountUid,
}: {
  wallet: HMWallet
  walletName: string
  walletId: string
  accountUid: string
}) {
  const withdrawDialog = useAppDialog(WithdrawDialog)
  const addFundsDialog = useAppDialog(AddFundsDialog)
  return (
    <>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <SizableText weight="bold" size="2xl">
          {walletName}
        </SizableText>
        <div className={stylex.props(styles.s86ff3e6).className || ''}>
          <WalletValue amount={Number(wallet.balance)} />
        </div>
      </div>
      <div className={stylex.props(styles.s5f6cd3a4).className || ''}>
        <Tooltip content="Click to Copy Lightning Address">
          <Button
            size="sm"
            onClick={() => {
              copyTextToClipboard(walletId)
              toast.success('Copied Lightning Address to Clipboard')
            }}
            className={stylex.props(styles.sbf63c09a).className || ''}
          >
            <Copy className={stylex.props(styles.sca3de968).className || ''} />
            <SizableText family="mono" className={stylex.props(styles.s71e968d9).className || ''}>{`x${wallet.id
              .slice(-8)
              .toUpperCase()}`}</SizableText>
          </Button>
        </Tooltip>
        <SizableText family="mono" size="2xl">
          {wallet.balance ? Number(wallet.balance) : '0'} SATS
        </SizableText>
      </div>
      <div className={stylex.props(styles.se658ac16).className || ''}>
        <Button
          className={stylex.props(styles.sb42feb5d).className || ''}
          size="sm"
          onClick={() => {
            addFundsDialog.open({
              walletId,
              accountUid,
              walletName,
            })
          }}
        >
          <Download className={stylex.props(styles.sca3de968).className || ''} />
          Add Funds
        </Button>
        {addFundsDialog.content}
        <Button
          className={stylex.props(styles.sb42feb5d).className || ''}
          size="sm"
          onClick={() => {
            withdrawDialog.open({
              walletId,
              accountUid,
              walletName,
            })
          }}
        >
          <Upload className={stylex.props(styles.sca3de968).className || ''} />
          Withdraw
        </Button>
        {withdrawDialog.content}
      </div>
    </>
  )
}
function WithdrawDialog({
  input,
  onClose,
}: {
  input: {
    walletId: string
    walletName: string
    accountUid: string
  }
  onClose: () => void
}) {
  const {walletId, accountUid, walletName} = input
  const [payreqInput, setPayreqInput] = useState('')
  const [invoice, reset] = useDecodedInvoice(payreqInput)
  const payInvoice = usePayInvoice()
  const [isComplete, setIsComplete] = useState(false)
  if (isComplete && invoice) {
    return (
      <>
        <DialogTitle>
          Successfully sent <AmountSats amount={invoice.amount} /> to{' '}
          <DestWallet walletIds={Object.keys(invoice.share)} />
        </DialogTitle>
      </>
    )
  }
  if (invoice) {
    return (
      <>
        <DialogTitle>Send {walletName}</DialogTitle>
        <DialogDescription>
          Send <AmountSats amount={invoice.amount} /> to <DestWallet walletIds={Object.keys(invoice.share)} />
        </DialogDescription>
        <DialogDescription color="$color10">{invoice.description}</DialogDescription>
        <div className={stylex.props(styles.sff4cbdec).className || ''}>
          <Spinner hide={!payInvoice.isLoading} />
        </div>
        <div className={stylex.props(styles.se658ac16).className || ''}>
          <Button
            className={stylex.props(styles.sb42feb5d).className || ''}
            onClick={() => {
              reset()
              setPayreqInput('')
            }}
          >
            Cancel
          </Button>
          <Button
            className={stylex.props(styles.sb42feb5d).className || ''}
            onClick={() => {
              payInvoice
                .mutateAsync({
                  walletId,
                  accountUid,
                  invoice,
                })
                .then(() => {
                  setIsComplete(true)
                })
                .catch((e) => {
                  console.error(e)
                  toast.error(`Failed to send funds: ${e.message}`)
                })
            }}
          >
            Send Funds
          </Button>
        </div>
      </>
    )
  }
  return (
    <>
      <DialogTitle>Withdraw from {walletName}</DialogTitle>
      <DialogDescription>
        Paste the invoice payment request here, and this wallet will send the funds.
      </DialogDescription>
      <Field id="payreq" label="Payment Request">
        <Input value={payreqInput} onChangeText={setPayreqInput} />
      </Field>
      <div className={stylex.props(styles.se658ac16).className || ''}>
        <Button className={stylex.props(styles.sb42feb5d).className || ''} onClick={onClose}>
          Cancel
        </Button>
        <Button className={stylex.props(styles.sb42feb5d).className || ''} disabled>
          Send Funds
        </Button>
      </div>
    </>
  )
}
function AmountSats({amount}: {amount: number}) {
  return <SizableText family="mono">{amount} SATS</SizableText>
}
function DestWallet({walletIds}: {walletIds: string[]}) {
  return (
    <Tooltip content="Copy Wallet Address">
      <Button
        variant="link"
        onClick={() => {
          copyTextToClipboard(walletIds.join(', '))
          toast.success('Copied Destination Wallet Address to Clipboard')
        }}
      >
        {walletIds.map((walletId) => `x${walletId.slice(-8).toUpperCase()}`).join(', ')}
      </Button>
    </Tooltip>
  )
}
function AddFundsDialog({
  input,
  onClose,
}: {
  input: {
    walletId: string
    walletName: string
    accountUid: string
  }
  onClose: () => void
}) {
  const {walletId, accountUid, walletName} = input
  const createInvoice = useCreateLocalInvoice()
  const [invoice, setInvoice] = useState<HMInvoice | null>(null)
  const [amount, setAmount] = useState(1000)
  if (invoice)
    return (
      <InvoiceInfo
        accountUid={accountUid}
        invoice={invoice}
        onCancel={onClose}
        walletName={walletName}
        walletId={walletId}
      />
    )
  function submit() {
    createInvoice
      .mutateAsync({
        walletId,
        amount: BigInt(amount),
        description: `Add Funds to ${walletName}`,
      })
      .then((localInvoice) => {
        setInvoice(localInvoice)
      })
  }
  return (
    <>
      <DialogTitle>Add Funds to {walletName}</DialogTitle>
      <form onSubmit={submit}>
        <div className={stylex.props(styles.sfbc6e290).className || ''}>
          <Field id="amount" label="Amount (Sats)">
            <Input
              // type="number"
              id="amount"
              value={`${amount}`}
              onChangeText={(text) => {
                if (Number.isNaN(Number(text))) return
                setAmount(Number(text))
              }}
              // onSubmitEditing={submit}
            />
          </Field>
          <div className={stylex.props(styles.s78630139).className || ''}>
            <Spinner hide={!createInvoice.isLoading} />
          </div>
          <div className={stylex.props(styles.se658ac16).className || ''}>
            <Button className={stylex.props(styles.sb42feb5d).className || ''} onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" className={stylex.props(styles.sb42feb5d).className || ''} onClick={submit}>
              Create Invoice
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
function InvoiceInfo({
  invoice,
  accountUid,
  onCancel,
  walletName,
  walletId,
}: {
  invoice: HMInvoice
  accountUid: string
  onCancel: () => void
  walletName: string
  walletId: string
}) {
  const invoicePaid = useInvoiceStatus(invoice)
  if (invoicePaid.data?.isSettled) {
    return (
      <>
        <DialogTitle>Invoice Complete</DialogTitle>
        <DialogDescription>
          {invoice.amount} SATS have been transferred to {walletName}.
        </DialogDescription>
        <Button onClick={onCancel}>Done</Button>
      </>
    )
  }
  return (
    <>
      <DialogTitle>Add Funds with External Wallet</DialogTitle>
      <DialogDescription>
        Scan this code to pay with your lightning wallet, or copy and paste the invoice text.
      </DialogDescription>
      <div className={stylex.props(styles.s21fb93ac).className || ''}>
        <QRCode value={invoice.payload} />
        <Tooltip content="Click to Copy Invoice Text">
          <Button
            onClick={() => {
              copyTextToClipboard(invoice.payload)
              toast.success('Copied Invoice to Clipboard')
            }}
            size="sm"
          >
            <Copy className={stylex.props(styles.sca3de968).className || ''} />
            Copy Invoice
          </Button>
        </Tooltip>
      </div>
      <Button onClick={onCancel}>Cancel</Button>
    </>
  )
}
function ExportWalletDialog({input, onClose}: {input: string; onClose: () => void}) {
  return (
    <>
      <DialogTitle>Wallet Exported</DialogTitle>
      <DialogDescription>Your wallet has been exported. Here is the credentials: {input}</DialogDescription>
      <Button onClick={onClose}>Done</Button>
    </>
  )
}
function DeleteWalletButton({
  walletId,
  accountUid,
  onDeleted,
}: {
  walletId: string
  accountUid: string
  onDeleted: () => void
}) {
  const deleteWallet = useDeleteWallet()
  return (
    <Button
      variant="destructive"
      onClick={() =>
        deleteWallet
          .mutateAsync({
            walletId,
            accountUid,
          })
          .then(() => {
            onDeleted()
            toast.success('Wallet deleted')
          })
          .catch((e) => {
            console.error(e)
            toast.error('Failed to delete wallet')
          })
      }
    >
      Delete Wallet
    </Button>
  )
}
function InvoiceRow({invoice}: {invoice: PlainMessage<Invoice>}) {
  const isPaid = invoice.type === 'paid_invoice'
  const Chevron = isPaid ? ChevronUp : ChevronDown
  const paymentColor = isPaid ? '$red9' : '$green9'
  return (
    <div className={stylex.props(styles.saa1b63c3).className || ''}>
      <div className={stylex.props(styles.sfbc6e28d).className || ''}>
        <SizableText>{formattedDateMedium(new Date(invoice.settledAt))}</SizableText>
        <SizableText>
          {invoice.description ? <SizableText weight="bold">{invoice.description} </SizableText> : null}
          <Tooltip content="Click to Copy Destination Address">
            <Button
              variant="blue"
              onClick={() => {
                copyTextToClipboard(invoice.destination)
                toast.success('Copied Destination Address to Clipboard')
              }}
            >
              {`x${invoice.destination.slice(-8).toUpperCase()}`}
            </Button>
          </Tooltip>
        </SizableText>
      </div>
      <div className={stylex.props(styles.sfbc6e28f).className || ''}>
        <div className={stylex.props(styles.se658ac14).className || ''}>
          <SizableText
            family="mono"
            style={{
              color: paymentColor,
            }}
          >
            {Number(invoice.amount)} SATS
          </SizableText>
          <Chevron color={paymentColor} size={18} />
        </div>
      </div>
    </div>
  )
}
function WalletValue({amount}: {amount: number}) {
  const currencies = useCurrencyComparisons(amount || 0)
  const [activeCurrency, setActiveCurrency] = useState<(typeof currencies)[number]['code']>('usd')
  if (!currencies.length) return null
  const currency = currencies.find(({code}) => code === activeCurrency)
  const {value, precision, character} = currency || {
    value: 0,
    precision: 0,
  }
  const displayValue = precision === 0 ? Math.round(value) : value.toFixed(precision)
  return (
    <div className={stylex.props(styles.s86ff3e5).className || ''}>
      <SizableText size="2xl" family="mono">{`${character}${displayValue}`}</SizableText>
      <Select onValueChange={(value) => setActiveCurrency(value as typeof activeCurrency)} value={activeCurrency}>
        <SelectTrigger className={stylex.props(styles_2.s5305ac91).className || ''}>
          <SelectValue placeholder="Select a currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies?.map(({code, value, name, precision}) => {
            return (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
