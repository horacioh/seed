import * as stylex from '@stylexjs/stylex'
import {fetchResource} from '@/models/entities'
import {HostInfoResponse, useHostSession} from '@/models/host'
import {useRemoveSite, useSiteRegistration} from '@/models/site'
import {useNavigate} from '@/utils/useNavigate'
import {zodResolver} from '@hookform/resolvers/zod'
import {UnpackedHypermediaId} from '@seed-hypermedia/client/hm-types'
import {DocumentRoute, hmId, hostnameStripProtocol, useUniversalAppContext} from '@shm/shared'
import {SEED_HOST_URL, VERSION} from '@shm/shared/constants'
import {getDocumentTitle} from '@shm/shared/content'
import {useResource} from '@shm/shared/models/entity'
import {Button, ButtonProps} from '@shm/ui/button'
import {copyTextToClipboard} from '@shm/ui/copy-to-clipboard'
import {FormInput} from '@shm/ui/form-input'
import {FormField} from '@shm/ui/forms'
import {IconComponent, PasteSetupUrl, SeedHost, SelfHost, UploadCloud} from '@shm/ui/icons'
import {Spinner} from '@shm/ui/spinner'
import {SizableText, Text, TextProps} from '@shm/ui/text'
import {toast} from '@shm/ui/toast'
import {Tooltip} from '@shm/ui/tooltip'
import {AlertCircle, ArrowRight, Check, Copy, ExternalLink, X} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {SubmitHandler, useForm} from 'react-hook-form'
import {z} from 'zod'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@shm/ui/components/alert-dialog'
import {DialogTitle} from '@shm/ui/components/dialog'
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@shm/ui/hover-card'
import {useAppDialog} from '@shm/ui/universal-dialog'
import {cn} from '@shm/ui/utils'
import {AlertTriangle, ArrowLeft, Plus} from 'lucide-react'
import {CelebrationDotsLeft, CelebrationDotsRight, CongratsGraphic, WebPublishedGraphic} from './publish-graphics'
const styles = stylex.create({
  s2b00eca2: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 4)',
  },
  sb87f7413: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'calc(0.25rem * 3)',
  },
  s65e234f5: {
    textAlign: 'center',
  },
  s44b652db: {
    position: 'absolute',
    top: 'calc(0.25rem * 4)',
    left: 'calc(0.25rem * 4)',
  },
  s3138839a: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s3fc16554: {
    marginTop: 'calc(0.25rem * 6)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  s78c56c2a: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    overflowY: 'auto',
    borderRadius: 'var(--radius)',
    backgroundColor: 'oklch(21% 0.034 264.665)',
    padding: 'calc(0.25rem * 4)',
  },
  s5f2b48b4: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  sdf8470a3: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    backgroundColor: 'oklch(21% 0.034 264.665)',
    padding: 'calc(0.25rem * 4)',
  },
  s5f2b48b5: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  s236e44da: {
    color: 'var(--muted-foreground)',
    textAlign: 'center',
  },
  sf0697c3f: {
    backgroundColor: 'var(--muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    padding: 'calc(0.25rem * 2)',
  },
  sf2718385: {
    color: 'var(--muted-foreground)',
  },
  s8a2570e2: {
    color: 'var(--destructive)',
  },
  sca449539: {
    textAlign: 'center',
    color: 'oklch(48.8% 0.243 264.376)',
  },
  s8b977d24: {
    color: 'oklch(48.8% 0.243 264.376)',
  },
  s822e7143: {
    marginTop: 'calc(0.25rem * 4)',
    display: 'flex',
    justifyContent: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s565c7661: {
    marginBottom: 'calc(0.25rem * 4)',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(48.8% 0.243 264.376)',
    padding: 'calc(0.25rem * 3)',
  },
  s7728bf1: {
    color: 'var(--muted-foreground)',
    textDecorationLine: 'underline',
  },
  sa02df2af: {
    display: 'flex',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 3)',
  },
  s558e1da5: {
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'transparent',
  },
  s9874c156: {
    marginInline: 'calc(0.25rem * 3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
  },
  s97a60bee: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(37.9% 0.146 265.522)',
  },
  s70b8d1e6: {
    color: 'var(--muted-foreground)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontStyle: 'italic',
  },
  sfeb2d98b: {
    color: 'var(--muted-foreground)',
    marginBottom: 'calc(0.25rem * 3)',
    textAlign: 'center',
  },
  s21fb93a9: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 1)',
  },
  s8b976e20: {
    color: 'oklch(80.9% 0.105 251.813)',
  },
  se658ac13: {
    display: 'flex',
    gap: 'calc(0.25rem * 1)',
  },
  sbf09ef67: {
    marginBottom: 'calc(0.25rem * 2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 1)',
  },
  se658ac15: {
    display: 'flex',
    gap: 'calc(0.25rem * 3)',
  },
  s4b5ce070: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    color: 'oklch(37.9% 0.146 265.522)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
  s312f36e1: {
    display: 'flex',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  se3416853: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 'calc(0.25rem * 3)',
  },
  sffd1579: {
    display: 'flex',
    flex: '1',
    flexShrink: '0',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(48.8% 0.243 264.376)',
  },
  s9a378369: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scd8213a7: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
    padding: 'calc(0.25rem * 8)',
  },
  s2f77d9f6: {
    alignSelf: 'center',
  },
  s5d936fd: {
    gap: 'calc(0.25rem * 4)',
  },
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)',
  },
  s86ff3e2: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 0)',
  },
  s21672183: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 2)',
    padding: 'calc(0.25rem * 2)',
  },
  s21fb93ac: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'calc(0.25rem * 4)',
  },
  s934164b1: {
    borderColor: 'var(--destructive)',
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 3)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: 'calc(0.25rem * 3)',
  },
  s51ab7e68: {
    color: 'var(--destructive)',
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
  },
  sfbc6e28f: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 3)',
  },
  sed2bbf1d: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(42.4% 0.199 265.638)',
  },
  sb162303e: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },
  sd66824d1: {
    marginInline: 'calc(0.25rem * 3)',
    color: 'oklch(80.9% 0.105 251.813)',
  },
  sbf5c63e8: {
    borderTopLeftRadius: '0',
    borderBottomLeftRadius: '0',
  },
  s2ffff9: {
    display: 'flex',
  },
  s187ea8ee: {
    marginBlock: 'calc(0.25rem * 6)',
    display: 'flex',
    justifyContent: 'center',
  },
  sf02fbf5: {
    color: 'var(--muted-foreground)',
    width: '100%',
    textAlign: 'center',
  },
  sfbb39f7: {
    cursor: 'pointer',
    color: 'oklch(42.4% 0.199 265.638)',
    textDecorationLine: 'underline',
  },
})
export function usePublishSite() {
  return useAppDialog(PublishSiteDialog, {
    className: 'h-[90vh] max-h-[900px] min-h-[500px] w-[90vw] max-w-[900px]',
    contentClassName: 'p-0 overflow-hidden',
  })
}
export function useRemoveSiteDialog() {
  return useAppDialog(RemoveSiteDialog, {
    isAlert: true,
  })
}
function RemoveSiteDialog({onClose, input}: {onClose: () => void; input: UnpackedHypermediaId}) {
  const removeSite = useRemoveSite(input)
  return (
    <div className={stylex.props(styles.s2b00eca2).className || ''}>
      <AlertDialogTitle>Remove Site</AlertDialogTitle>
      <AlertDialogDescription>
        Remove this site URL from the entity? Your site will still exist until you delete the server.
      </AlertDialogDescription>

      <div className={stylex.props(styles.sb87f7413).className || ''}>
        <AlertDialogCancel asChild>
          <Button
            variant="ghost"
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={() => {
            removeSite.mutate()
            onClose()
          }}
        >
          Remove Site
        </AlertDialogAction>
      </div>
    </div>
  )
}
const publishSiteSchema = z.object({
  url: z.string(),
})
type PublishSiteFields = z.infer<typeof publishSiteSchema>
function PublishDialogContainer({
  children,
  heading,
  backButton,
}: React.PropsWithChildren<{
  heading?: string
  backButton?: React.ReactNode
}>) {
  return (
    <div className="m-auto flex max-w-xl flex-col gap-6">
      {heading ? (
        <SizableText size="3xl" weight="bold" className={stylex.props(styles.s65e234f5).className || ''}>
          {heading}
        </SizableText>
      ) : null}
      {backButton ? <div className={stylex.props(styles.s44b652db).className || ''}>{backButton}</div> : null}
      <div className={stylex.props(styles.s3138839a).className || ''}>{children}</div>
    </div>
  )
}
function SeedHostHeader() {
  return (
    <div className={stylex.props(styles.s3fc16554).className || ''}>
      <SeedHost color="#ffffff" size={32} />
      <Text weight="bold" size="lg" className="text-white/90">
        Hosting by Seed Hypermedia
      </Text>
    </div>
  )
}
function SeedHostContainer({
  children,
  heading,
  backButton,
  footer,
}: React.PropsWithChildren<{
  heading?: string
  backButton?: React.ReactNode
  footer?: React.ReactNode
}>) {
  return (
    <div className={stylex.props(styles.s78c56c2a).className || ''}>
      <SeedHostHeader />
      {backButton ? <div className={stylex.props(styles.s44b652db).className || ''}>{backButton}</div> : null}
      <div className={stylex.props(styles.s5f2b48b4).className || ''}>
        {heading ? (
          <Text weight="bold" size="lg" className="text-center text-white/90">
            {heading}
          </Text>
        ) : null}
        {children}
      </div>
      {footer ? footer : null}
    </div>
  )
}
function SeedHostCongratsContainer({
  children,
  heading,
  graphic,
  footer,
}: React.PropsWithChildren<{
  heading?: string
  graphic?: React.ReactNode
  footer?: React.ReactNode
}>) {
  return (
    <div className={stylex.props(styles.sdf8470a3).className || ''}>
      <div className="absolute top-20 bottom-0 left-0 [transform-origin:center] scale-125 animate-[superSlow] [animation-delay:0ms] [animation-duration:3000ms] [animation-fill-mode:both] [animation-name:celebration-dots-left] [animation-timing-function:ease-in-out]">
        <CelebrationDotsLeft />
      </div>
      <div className="absolute top-20 right-0 bottom-0 [transform-origin:center] scale-125 animate-[superSlow] [animation-delay:0ms] [animation-duration:3000ms] [animation-fill-mode:both] [animation-name:celebration-dots-right] [animation-timing-function:ease-in-out]">
        <CelebrationDotsRight />
      </div>
      <SeedHostHeader />
      <div className={stylex.props(styles.s5f2b48b5).className || ''}>
        {graphic ? (
          <div className="scale-100 [transform:translateY(0px)] animate-[bounce] opacity-100 [animation-delay:0ms] [animation-duration:1000ms] [animation-fill-mode:both]">
            {graphic}
          </div>
        ) : null}
        {heading ? (
          <Text weight="bold" size="lg" className="mb-4 text-center text-white/90">
            {heading}
          </Text>
        ) : null}
        {children}
      </div>
      {footer ? footer : null}
    </div>
  )
}
function PublishSiteDialog({
  input,
  onClose,
}: {
  input: {
    id: UnpackedHypermediaId
    step?: 'seed-host-custom-domain' | undefined
  }
  onClose: () => void
}) {
  const {id, step: initialStep} = input
  const [mode, setMode] = useState<'input-url' | 'self-host' | 'seed-host' | 'seed-host-custom-domain' | null>(
    initialStep || null,
  )
  if (mode === 'input-url') {
    return <PublishWithUrl id={id} onComplete={onClose} onBack={() => setMode(null)} />
  }
  if (mode === 'self-host') {
    return <SelfHostContent onSetupUrl={() => setMode('input-url')} onBack={() => setMode(null)} />
  }
  if (mode === 'seed-host') {
    return <SeedHostContent onClose={onClose} onBack={() => setMode(null)} id={id} />
  }
  if (mode === 'seed-host-custom-domain') {
    return <SeedHostRegisterCustomDomain id={id} onClose={onClose} />
  }
  return (
    <PublishDialogContainer heading="Set Up Web Domain">
      <DialogInner>
        <DialogTitle className={stylex.props(styles.s236e44da).className || ''}>
          How would you like to publish to the web?
        </DialogTitle>
        <div className={stylex.props(styles.sf0697c3f).className || ''}>
          <PublishOptionButton
            icon={SeedHost}
            onClick={() => setMode('seed-host')}
            label="Free Hosting by Seed Hypermedia"
            height={60}
          />
          <PublishOptionButton
            icon={SelfHost}
            onClick={() => setMode('self-host')}
            label="Self Host on Your Own Server"
          />
          <PublishOptionButton
            icon={PasteSetupUrl}
            onClick={() => setMode('input-url')}
            label="Paste a Hosting Setup URL"
          />
        </div>
      </DialogInner>
    </PublishDialogContainer>
  )
}
function DialogInner(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn(props.className, 'flex max-w-md flex-col gap-2')} />
}
function BlueButton(props: ButtonProps) {
  return <Button {...props} variant="blue" />
}
function GreenButton(props: ButtonProps) {
  return <Button {...props} variant="green" />
}
function PublishOptionButton({
  icon: Icon,
  onClick,
  label,
  color,
  height,
}: {
  icon: IconComponent
  onClick: () => void
  label: string
  color?: string
  height?: number
}) {
  return (
    <Button
      onClick={onClick}
      style={{
        height,
      }}
    >
      <Icon color={color} size={32} />
      <SizableText
        className={stylex.props(styles.sf2718385).className || ''}
        style={{
          color,
        }}
      >
        {label}
      </SizableText>
    </Button>
  )
}
function BackButton({onPress}: {onPress: () => void}) {
  return (
    <Button size="icon" onClick={onPress} variant="ghost">
      <ArrowLeft className="size-4 text-gray-500 dark:text-gray-400" />
    </Button>
  )
}
function SeedHostInfo({info, onSubmit}: {info: HostInfoResponse; onSubmit: () => void}) {
  if (!info.pricing?.free || !info.pricing?.premium) {
    return (
      <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
        Error: Service unavailable or incompatible with this version of Seed.
      </SizableText>
    )
  }
  return (
    <div className="flex max-w-[600px] flex-col items-center justify-center gap-3">
      <SizableText className={stylex.props(styles.s236e44da).className || ''}>
        Seed offers free server hosting with a generous storage and bandwidth limit, perfect for getting started. If
        your needs grow beyond the free tier, you can easily purchase additional capacity to scale seamlessly.
      </SizableText>
      <SizableText className={stylex.props(styles.sca449539).className || ''}>
        By using Seed, you're supporting{' '}
        <SizableText weight="bold" className={stylex.props(styles.s8b977d24).className || ''}>
          Open Source Software
        </SizableText>
        , helping to build a more open and collaborative digital future.
      </SizableText>
      <div className={stylex.props(styles.s822e7143).className || ''}>
        <PlanContainer>
          <PlanHeading>
            <PlanTitle>Free</PlanTitle>
            <PlanPrice value={0} />
          </PlanHeading>
          <PlanFeatures>
            <PlanFeature label={`${info.pricing.free.gbStorage} GB Storage`} />
            <PlanFeature label={`${info.pricing.free.gbBandwidth} GB Bandwidth`} />
            <PlanFeature label={siteCountLabel(info.pricing.free.siteCount)} />
          </PlanFeatures>
          <OverageWarning />
          <SelectPlanButton active onClick={onSubmit} />
        </PlanContainer>
        <PlanContainer>
          <PlanHeading>
            <PlanTitle>Premium</PlanTitle>
            <PlanPrice value={info.pricing.premium.monthlyPriceUSDCents} label="starting at" />
          </PlanHeading>
          <PlanFeatures>
            <PlanFeature
              label={`${info.pricing.premium.gbStorage} GB Storage`}
              plus={`${formatPriceUSDCents(info.pricing.premium.gbStorageOverageUSDCents)}/GB/mo extra`}
            />
            <PlanFeature
              label={`${info.pricing.premium.gbBandwidth} GB Bandwidth`}
              plus={`${formatPriceUSDCents(info.pricing.premium.gbBandwidthOverageUSDCents)}/GB extra`}
            />
            <PlanFeature
              label={siteCountLabel(info.pricing.premium.siteCount)}
              plus={`${formatPriceUSDCents(info.pricing.premium.siteCountOverageUSDCents)}/mo extra site`}
            />
          </PlanFeatures>
          <SelectPlanButton comingSoon />
        </PlanContainer>
      </div>
      <div className={stylex.props(styles.s565c7661).className || ''}>
        <SizableText className={stylex.props(styles.sf2718385).className || ''}>
          For large organizations,{' '}
          <SizableText asChild className={stylex.props(styles.s7728bf1).className || ''}>
            <a href="mailto:sales@seedhypermedia.com">contact us</a>
          </SizableText>{' '}
          for a customized plan.
        </SizableText>
      </div>
    </div>
  )
}
function SelectPlanButton({
  active,
  comingSoon,
  onClick,
}: {
  active?: boolean
  comingSoon?: boolean
  onClick?: () => void
}) {
  const label = active ? 'Get Started' : comingSoon ? 'Coming Soon' : 'Select'
  const disabled = !active || comingSoon
  return (
    <div className={stylex.props(styles.sa02df2af).className || ''}>
      <Button
        variant="blue"
        onClick={onClick}
        className={cn(
          stylex.props(styles.s558e1da5).className || '',
          active && 'border-link-hover bg-link',
          disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
        )}
        disabled={disabled}
      >
        {label}
      </Button>
    </div>
  )
}
function OverageWarning() {
  return (
    <div className={stylex.props(styles.s9874c156).className || ''}>
      <FeatureSpacer>
        <AlertTriangle className={stylex.props(styles.s97a60bee).className || ''} />
      </FeatureSpacer>
      <SizableText className={stylex.props(styles.s70b8d1e6).className || ''}>
        Service may be interrupted if resources are exceeded.
      </SizableText>
    </div>
  )
}
function siteCountLabel(count: number) {
  if (count === 1) {
    return '1 Site'
  }
  return `${count} Sites`
}
const PlanHeading = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex min-h-[100px] flex-col items-center border-b border-blue-700 p-3', className)}
      {...props}
    />
  )
}
const PlanTitle = ({className, ...props}: TextProps) => {
  return (
    <Text
      weight="bold"
      size="lg"
      className={cn(stylex.props(styles.sfeb2d98b).className || '', className)}
      {...props}
    />
  )
}
function formatPriceUSDCents(cents: number) {
  if (cents % 100 === 0) {
    return `$${cents / 100}`
  }
  return `$${(cents / 100).toFixed(2)}`
}
function PlanPrice({value, label}: {value: number; label?: string}) {
  return (
    <div className={stylex.props(styles.s21fb93a9).className || ''}>
      <SizableText className={stylex.props(styles.s8b976e20).className || ''}>
        {label?.toUpperCase() || ' '}
      </SizableText>
      <div className={stylex.props(styles.se658ac13).className || ''}>
        <Text weight="bold" size="lg" className={stylex.props(styles.sf2718385).className || ''}>
          {formatPriceUSDCents(value)}
        </Text>
        <Text size="lg" className={stylex.props(styles.sf2718385).className || ''}>
          /mo
        </Text>
      </div>
    </div>
  )
}
function PlanFeature({label, plus}: {label: string; plus?: string}) {
  return (
    <div className={stylex.props(styles.sbf09ef67).className || ''}>
      <div className={stylex.props(styles.se658ac15).className || ''}>
        <FeatureSpacer>
          <Check className={stylex.props(styles.s4b5ce070).className || ''} />
        </FeatureSpacer>
        <FeatureText>{label}</FeatureText>
      </div>
      {plus ? (
        <PlusLabel>
          <Plus className={stylex.props(styles.sca3de968).className || ''} />
          <FeatureText className="text-black/80">{plus}</FeatureText>
        </PlusLabel>
      ) : null}
    </div>
  )
}
const FeatureSpacer = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(stylex.props(styles.s312f36e1).className || '', className)} {...props} />
}
const PlanFeatures = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(stylex.props(styles.se3416853).className || '', className)} {...props} />
}
const PlusLabel = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('ml-[38px] flex gap-2 rounded-sm bg-blue-50 p-1 px-2', className)} {...props} />
}
const PlanContainer = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(stylex.props(styles.sffd1579).className || '', className)} {...props} />
}
const FeatureText = ({className, ...props}: TextProps) => {
  return (
    <Text
      weight="bold"
      size="lg"
      className={cn(stylex.props(styles.sf2718385).className || '', className)}
      {...props}
    />
  )
}
function versionToInt(version: string): number | null {
  const parts = version.split('.')
  if (parts.length !== 3) return null
  return (
    // @ts-ignore
    parseInt(parts[0]) * 10_000 + parseInt(parts[1]) * 1000 + parseInt(parts[2])
  )
}
function isAppVersionEqualOrAbove(version: string) {
  if (VERSION === '0.0.0') return true // for local dev
  if (VERSION === '0.0.0.local-dev') return true // for local dev
  if (VERSION.match('0.0.0.local')) return true // for local builds
  const expectedVersionInt = versionToInt(version)
  const currentVersionInt = versionToInt(VERSION)
  if (expectedVersionInt === null || currentVersionInt === null) return false
  return currentVersionInt >= expectedVersionInt
}
function SeedHostIntro({
  onSubmit,
  onBack,
  info,
  infoError,
  infoIsLoading,
}: {
  onSubmit: () => void
  onBack: () => void
  info?: HostInfoResponse
  infoError?: unknown
  infoIsLoading: boolean
}) {
  let content = infoIsLoading ? (
    <div className={stylex.props(styles.s9a378369).className || ''}>
      <Spinner />
    </div>
  ) : null
  const isInvalidVersion = info?.minimumAppVersion && !isAppVersionEqualOrAbove(info.minimumAppVersion)
  if (info && !info.serviceErrorMessage && !isInvalidVersion) {
    content = <SeedHostInfo info={info} onSubmit={onSubmit} />
  } else if (infoError || info?.serviceErrorMessage || isInvalidVersion) {
    const invalidVersionMessage = isInvalidVersion
      ? 'The service has been updated. You must update to the latest version of the app.'
      : null
    content = (
      <SizableText className={stylex.props(styles.s8a2570e2).className || ''}>
        {(infoError instanceof Error ? infoError.message : String(infoError)) ||
          info?.serviceErrorMessage ||
          invalidVersionMessage}
      </SizableText>
    )
  } else {
    content = (
      <div className={stylex.props(styles.scd8213a7).className || ''}>
        <SizableText className={stylex.props(styles.s236e44da).className || ''}>
          Unable to load hosting service information.
        </SizableText>
        <SizableText className={stylex.props(styles.s236e44da).className || ''}>
          Please check your internet connection and try again.
        </SizableText>
        <Button variant="inverse" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }
  return <SeedHostContainer backButton={<BackButton onPress={onBack} />}>{content}</SeedHostContainer>
}
const LoginSchema = z.object({
  email: z.string(),
})
type LoginFields = z.infer<typeof LoginSchema>
function SeedHostLogin({onAuthenticated, onBack}: {onAuthenticated: () => void; onBack: () => void}) {
  const {login, absorbedSession, email, isSendingEmail, isPendingEmailValidation, error, reset} = useHostSession({
    onAuthenticated,
  })
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<LoginFields>({
    resolver: zodResolver(LoginSchema),
  })
  const onSubmit: SubmitHandler<LoginFields> = (data) => {
    login(data.email)
  }
  if (isPendingEmailValidation && email) {
    // @ts-expect-error
    const errorMessage = error?.message || absorbedSession.error?.message
    return (
      <SeedHostContainer
        heading="Waiting for Email Validation"
        backButton={<BackButton onPress={onBack} />}
        footer={
          <Button onClick={reset} size="sm" className={stylex.props(styles.s2f77d9f6).className || ''}>
            <X className="size-3 text-white/60" />
            <span className="text-white/60">Cancel Login</span>
          </Button>
        }
      >
        <DialogInner className={stylex.props(styles.s5d936fd).className || ''}>
          {errorMessage ? (
            <>
              <ErrorBox error={errorMessage} />
              <Button onClick={reset}>Try Again</Button>
            </>
          ) : (
            <>
              <SizableText className="text-center text-white/80">
                We sent a verification link to {email}. Click on it, and you will be logged in here.
              </SizableText>
              <div className={stylex.props(styles.s9a378369).className || ''}>
                <Spinner />
              </div>
            </>
          )}
        </DialogInner>
      </SeedHostContainer>
    )
  }
  return (
    <SeedHostContainer heading="Login to Seed Hypermedia Hosting" backButton={<BackButton onPress={onBack} />}>
      <form onSubmit={handleSubmit(onSubmit)} className={stylex.props(styles.sfbc6e290).className || ''}>
        <FormField name="email" label="Email Address" errors={errors} width={400}>
          <FormInput disabled={isSendingEmail} control={control} name="email" placeholder="me@email.com" />
        </FormField>

        <BlueButton disabled={isSendingEmail} type="submit">
          {isSendingEmail ? 'Sending Email…' : 'Authenticate with Email'}
        </BlueButton>

        <AnimatedSpinner isVisible={isSendingEmail} />
      </form>
    </SeedHostContainer>
  )
}
const RegisterSubdomainSchema = z.object({
  subdomain: z
    .string()
    .min(4, 'Subdomain must be at least 4 characters long')
    .refine((val) => !val.endsWith('-'), 'Subdomain cannot end with a dash'),
})
type RegisterSubdomainFields = z.infer<typeof RegisterSubdomainSchema>
function SeedHostRegisterSubdomain({
  onBack,
  onLogout,
  info,
  onPublished,
  id,
}: {
  onBack: () => void
  onLogout: () => void
  onPublished: (host: string) => void
  id: UnpackedHypermediaId
  info?: HostInfoResponse
}) {
  const {loggedIn, email, createSite, logout} = useHostSession({})
  const register = useSiteRegistration(id.uid)
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<RegisterSubdomainFields>({
    resolver: zodResolver(RegisterSubdomainSchema),
    defaultValues: {
      subdomain: '',
    },
  })
  useEffect(() => {
    setFocus('subdomain')
  }, [setFocus])
  if (!loggedIn) return null
  function onSubmit({subdomain}: RegisterSubdomainFields) {
    createSite
      .mutateAsync({
        subdomain,
      })
      .then(async ({subdomain, registrationSecret, setupUrl, host}) => {
        const siteRegistration = await register.mutateAsync({
          url: setupUrl,
        })
        return {
          host,
        }
      })
      .then(({host}) => {
        onPublished(host)
      })
  }
  const isSubmitting = register.isLoading || createSite.isLoading

  // @ts-expect-error
  const errorText = register.error?.message || createSite.error?.message
  return (
    <SeedHostContainer
      heading="Register Hyper.Media Subdomain"
      backButton={<BackButton onPress={onBack} />}
      footer={
        <div className={stylex.props(styles.s86ff3e2).className || ''}>
          <SizableText size="sm" className="text-white/80">
            Logged in as{' '}
          </SizableText>

          <HoverCard>
            <HoverCardTrigger>
              <Button
                variant="link"
                size="xs"
                className="text-blue-300 underline-offset-4 hover:text-blue-400 hover:underline"
                onClick={() => {
                  onLogout()
                  logout()
                }}
              >
                {email}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="dark w-full max-w-3xl rounded-lg bg-black p-2">
              <div className={stylex.props(styles.s21672183).className || ''}>
                <SizableText size="sm" className="text-white/80">
                  Logged into{' '}
                  <Text weight="bold" className="text-white/90">
                    {hostnameStripProtocol(SEED_HOST_URL)}
                  </Text>{' '}
                  as{' '}
                  <Text weight="bold" className="text-white/90">
                    {email}
                  </Text>
                </SizableText>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => {
                    onLogout()
                    logout()
                  }}
                >
                  Logout
                </Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className={stylex.props(styles.s21fb93ac).className || ''}>
        <FormField
          name="subdomain"
          label={`Select your unique sub-domain name on ${info?.hostDomain}`}
          errors={errors}
          width="70%"
        >
          <FormInput
            control={control}
            name="subdomain"
            placeholder="my-site-name"
            transformInput={(text) =>
              text
                .replace(/[ _]/g, '-')
                .replace(/[^a-zA-Z0-9-]/g, '')
                .toLowerCase()
            }
          />
        </FormField>
        <ErrorBox error={errorText} />

        <BlueButton type="submit">
          <UploadCloud className={stylex.props(styles.sca3de968).className || ''} />
          Publish Site
        </BlueButton>

        <AnimatedSpinner isVisible={isSubmitting} />
      </form>
    </SeedHostContainer>
  )
}
function AnimatedSpinner({isVisible}: {isVisible: boolean}) {
  return <Spinner className={isVisible ? 'opacity-100' : 'opacity-0'} />
}
function ErrorBox({error}: {error: string | null}) {
  if (!error) return null
  return (
    <div className={stylex.props(styles.s934164b1).className || ''}>
      <AlertCircle className={stylex.props(styles.s51ab7e68).className || ''} />
      <p className={stylex.props(styles.s8a2570e2).className || ''}>{error}</p>
    </div>
  )
}
function SeedHostSubdomainPublished({
  onClose,
  host,
  id,
  onCustomDomain,
}: {
  onClose: () => void
  host: string
  id: UnpackedHypermediaId
  onCustomDomain: () => void
}) {
  return (
    <SeedHostCongratsContainer
      heading="You Have Published to the Web!"
      graphic={<WebPublishedGraphic />}
      footer={
        <div className={stylex.props(styles.sfbc6e28f).className || ''}>
          <SizableText className="text-white/80">Now you can publish the site to your own domain.</SizableText>

          <div className={stylex.props(styles.se658ac15).className || ''}>
            <Button onClick={onClose}>
              <Check className="size-4 text-white/60" />
              <span className="text-white/60">Close</span>
            </Button>
            <BlueButton onClick={onCustomDomain}>
              <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
              Publish Custom Domain
            </BlueButton>
          </div>
        </div>
      }
    >
      <SizableText className="text-white/80">Here is the link to your new site.</SizableText>
      <PublishedUrl url={host} />
    </SeedHostCongratsContainer>
  )
}
function PublishedUrl({url}: {url: string}) {
  const {openUrl} = useUniversalAppContext()
  const textRef = useRef<any>(null)
  return (
    <div className={stylex.props(styles.sed2bbf1d).className || ''}>
      <div
        onClick={(e) => {
          e.preventDefault()
          if (textRef.current) {
            const range = document.createRange()
            range.selectNode(textRef.current)
            window.getSelection()?.removeAllRanges()
            window.getSelection()?.addRange(range)
          }
        }}
      >
        <div className={stylex.props(styles.sb162303e).className || ''}>
          <Text size="md" className={stylex.props(styles.sd66824d1).className || ''} ref={textRef}>
            {url}
          </Text>
          <Tooltip content="Copy URL">
            <Button
              variant="ghost"
              size="icon"
              className="m-2 h-auto self-stretch text-white/60 hover:text-white"
              onClick={() => {
                copyTextToClipboard(url)
                toast(`Copied ${url} URL`)
              }}
            >
              <Copy className={stylex.props(styles.sca3de968).className || ''} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <BlueButton className={stylex.props(styles.sbf5c63e8).className || ''} onClick={() => openUrl(url)}>
        Open
        <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
      </BlueButton>
    </div>
  )
}
const activelyWatchedDomainIds = new Set<string>()
export function useSeedHostDialog() {
  const {open, content} = useAppDialog(SeedHostDomainPublishedDialog, {
    className: 'h-[90vh] max-h-[900px] min-h-[500px] w-[90vw] max-w-[900px]',
    contentClassName: 'p-0',
  })
  const {pendingDomains} = useHostSession()
  const watchingDomainsInProgress = useRef<
    {
      domainId: string
      siteUid: string
      hostname: string
    }[]
  >([])
  useEffect(() => {
    if (!pendingDomains) return
    pendingDomains?.forEach((p) => {
      if (!watchingDomainsInProgress.current.find((d) => d.domainId === p.id)) {
        watchingDomainsInProgress.current.push({
          domainId: p.id,
          siteUid: p.siteUid,
          hostname: p.hostname,
        })
      }
    })
    watchingDomainsInProgress.current.forEach((watchingDomain) => {
      if (!pendingDomains.find((p) => p.id === watchingDomain.domainId)) {
        watchingDomainsInProgress.current = watchingDomainsInProgress.current.filter(
          (pendingDomain) => pendingDomain.domainId !== watchingDomain.domainId,
        )
        if (activelyWatchedDomainIds.has(watchingDomain.domainId)) {
          return
        }
        fetchResource(hmId(watchingDomain.siteUid))
          .then((entity: Awaited<ReturnType<typeof fetchResource>>) => {
            const siteDocument = entity?.type === 'document' ? entity.document : undefined
            const siteUrl = siteDocument?.metadata?.siteUrl
            if (siteUrl && siteUrl === `https://${watchingDomain.hostname}`) {
              open({
                id: hmId(watchingDomain.siteUid),
                host: watchingDomain.hostname,
              })
            }
          })
          .catch((e) => {
            console.error('Pending Domain released, failed to load entity', e)
          })
      }
    })
  }, [pendingDomains, open])
  return {
    content,
    open,
  }
}
function SeedHostDomainPublishedDialog({
  input,
  onClose,
}: {
  input: {
    id: UnpackedHypermediaId
    host: string
  }
  onClose: () => void
}) {
  return <SeedHostDomainPublished onClose={onClose} host={input.host} id={input.id} />
}
function SeedHostDomainPublished({onClose, host, id}: {onClose: () => void; host: string; id: UnpackedHypermediaId}) {
  return (
    <SeedHostCongratsContainer heading={`Now Published to ${host}!`} graphic={<CongratsGraphic />}>
      <SizableText className="text-white/80">Here is the link for your site.</SizableText>
      <PublishedUrl url={`https://${host}`} />
      <div className={stylex.props(styles.s2ffff9).className || ''}>
        <BlueButton onClick={onClose}>
          <Check className={stylex.props(styles.sca3de968).className || ''} />
          Done
        </BlueButton>
      </div>
    </SeedHostCongratsContainer>
  )
}
const RegisterCustomDomainSchema = z.object({
  domain: z
    .string()
    .min(3, 'Domain is required')
    .regex(/^(?!.*\.\.)(?!.*\.$)(?!^\.)[a-z0-9.-]+$/, 'Invalid domain format'),
})
type RegisterCustomDomainFields = z.infer<typeof RegisterCustomDomainSchema>
function SeedHostRegisterCustomDomain({
  onBack,
  id,
  onClose,
}: {
  onBack?: () => void
  id: UnpackedHypermediaId
  onClose: () => void
}) {
  const {createDomain} = useHostSession()
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<RegisterCustomDomainFields>({
    resolver: zodResolver(RegisterCustomDomainSchema),
  })
  const entity = useResource({
    ...id,
    version: null,
    latest: true,
  })
  const [localPendingDomain, setPendingDomain] = useState<{
    hostname: string
    domainId: string
  } | null>(null)
  const document = entity.data?.type === 'document' ? entity.data.document : undefined
  const siteUrl = document?.metadata?.siteUrl
  function onSubmit({domain}: RegisterCustomDomainFields) {
    if (!siteUrl) throw new Error('Site URL not found')
    createDomain
      .mutateAsync({
        hostname: domain,
        currentSiteUrl: siteUrl,
        id,
      })
      .then((d) => {
        setPendingDomain(d)
      })
  }
  const pendingDomain = useHostSession().pendingDomains?.find((pending) => pending.siteUid === id.uid)
  const pendingDomainId = localPendingDomain?.domainId
  // @ts-ignore
  useEffect(() => {
    if (pendingDomainId) {
      activelyWatchedDomainIds.add(pendingDomainId)
      return () => {
        activelyWatchedDomainIds.delete(pendingDomainId)
      }
    }
  }, [pendingDomainId])
  useEffect(() => {
    if (!pendingDomain && !localPendingDomain && siteUrl) {
      setFocus('domain')
    }
  }, [pendingDomain, localPendingDomain, siteUrl])
  if (pendingDomain) {
    let pendingStatus = null
    if (pendingDomain?.status === 'error') {
      pendingStatus = <ErrorBox error="Something went wrong. Please try domain setup again." />
    } else if (pendingDomain?.status === 'waiting-dns' && siteUrl) {
      pendingStatus = (
        <DialogInner>
          <DNSInstructions hostname={pendingDomain.hostname} siteUrl={siteUrl} />
        </DialogInner>
      )
    } else if (pendingDomain?.status === 'initializing') {
      pendingStatus = <SizableText className="text-white/80">Initializing your domain…</SizableText>
    }
    return (
      <SeedHostContainer
        heading="Set Up Custom Domain"
        footer={
          <div className={stylex.props(styles.sfbc6e28f).className || ''}>
            <SizableText className="text-white/80">You can close this dialog and keep using the app.</SizableText>
            <BlueButton onClick={onClose}>Close</BlueButton>
          </div>
        }
      >
        {pendingStatus}
        <div className={stylex.props(styles.s9a378369).className || ''}>
          <Spinner />
        </div>
      </SeedHostContainer>
    )
  }
  if (localPendingDomain && siteUrl === `https://${localPendingDomain.hostname}`) {
    return <SeedHostDomainPublished host={localPendingDomain.hostname} onClose={onClose} id={id} />
  }
  return (
    <SeedHostContainer
      heading={localPendingDomain ? `Setting up ${localPendingDomain.hostname}` : 'Set Up Custom Domain'}
      backButton={onBack ? <BackButton onPress={onBack} /> : null}
    >
      {siteUrl ? (
        <>
          <DialogInner>
            <SizableText className="text-white/80">You can now publish to a domain that you own.</SizableText>
            <SizableText className="text-white/80">
              On the next step you will be asked to update your DNS settings to point to the Seed Host service.
            </SizableText>
            <form onSubmit={handleSubmit(onSubmit)} className={stylex.props(styles.sfbc6e290).className || ''}>
              <FormField name="domain" label="What is your Domain Name?" errors={errors}>
                <FormInput
                  control={control}
                  name="domain"
                  placeholder="mydomain.com"
                  transformInput={(text) => {
                    if (text.match(/https?:\/\//)) {
                      text = text.replace(/https?:\/\//, '')
                    }
                    return text
                      .replace(/[ _]/g, '-')
                      .replace(/[^a-zA-Z0-9-\.]/g, '')
                      .toLowerCase()
                  }}
                />
              </FormField>
              {createDomain.error ? (
                // @ts-expect-error
                <ErrorBox error={createDomain.error.message} />
              ) : null}

              <BlueButton type="submit">
                Publish to Domain
                <UploadCloud className={stylex.props(styles.sca3de968).className || ''} />
              </BlueButton>

              <AnimatedSpinner isVisible={createDomain.isLoading} />
            </form>
          </DialogInner>
        </>
      ) : (
        <SizableText className="text-white/80">You need to publish your site first.</SizableText>
      )}
    </SeedHostContainer>
  )
}
export function DNSInstructions({hostname, siteUrl}: {hostname: string; siteUrl: string}) {
  const isSubd = isSubdomain(hostname)
  return (
    <div className={stylex.props(styles.sfbc6e28f).className || ''}>
      <SizableText className="text-white/80">Now is your time to change the DNS record for your domain.</SizableText>
      <SizableText className="text-white/80">
        Set the{' '}
        <Text weight="bold" className="text-white/90">
          {hostname}
        </Text>{' '}
        {isSubd ? 'CNAME' : 'ALIAS'} record to{' '}
        <Text weight="bold" className="text-white/90">
          {hostnameStripProtocol(siteUrl)}.
        </Text>
      </SizableText>
      <SizableText className="text-white/80">
        Once you update the DNS, it usually takes 10 minutes to propagate. Keep the app open until then.
      </SizableText>
    </div>
  )
}
function isSubdomain(hostname: string) {
  return hostname.split('.').length > 2
}
function SeedHostContent({onBack, onClose, id}: {onBack: () => void; onClose: () => void; id: UnpackedHypermediaId}) {
  const {loggedIn, hostInfo} = useHostSession({})
  const [host, setHost] = useState<string | null>(null)
  const [mode, setMode] = useState<
    'intro' | 'login' | 'register-subdomain' | 'subdomain-published' | 'register-custom-domain'
  >('intro')
  if (mode === 'intro') {
    return (
      <SeedHostIntro
        onSubmit={() => setMode(loggedIn ? 'register-subdomain' : 'login')}
        onBack={onBack}
        // @ts-expect-error
        info={hostInfo.data}
        infoError={hostInfo.error}
        infoIsLoading={hostInfo.isLoading}
      />
    )
  }
  if (mode === 'login') {
    return (
      <SeedHostLogin
        onAuthenticated={() => setMode('register-subdomain')}
        onBack={() => {
          setMode('intro')
        }}
      />
    )
  }
  if (mode === 'register-subdomain' && loggedIn) {
    return (
      <SeedHostRegisterSubdomain
        id={id}
        // @ts-expect-error
        info={hostInfo.data}
        onLogout={() => {
          setMode('login')
        }}
        onPublished={(host) => {
          setMode('subdomain-published')
          setHost(host)
        }}
        onBack={onBack}
      />
    )
  }
  if (mode === 'subdomain-published' && host && loggedIn) {
    return (
      <SeedHostSubdomainPublished
        onCustomDomain={() => setMode('register-custom-domain')}
        host={host}
        onClose={onClose}
        id={id}
      />
    )
  }
  if (mode === 'register-custom-domain' && loggedIn) {
    return (
      <SeedHostRegisterCustomDomain
        id={id}
        onBack={() => {
          if (host) setMode('subdomain-published')
          else onClose()
        }}
        onClose={onClose}
      />
    )
  }
  return null
}
function SelfHostContent({onSetupUrl, onBack}: {onSetupUrl: () => void; onBack: () => void}) {
  const spawn = useNavigate('spawn')
  return (
    <PublishDialogContainer heading="Host on Your Own Server" backButton={<BackButton onPress={onBack} />}>
      <DialogInner>
        <SizableText className={stylex.props(styles.s236e44da).className || ''}>
          You will need your own server and domain. Follow this guide to get started, and return when the setup script
          has printed the setup URL.
        </SizableText>
        <div className={stylex.props(styles.s187ea8ee).className || ''}>
          <Button
            onClick={() => {
              spawn(setupGuideRoute)
            }}
          >
            <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
            Open Setup Guide
          </Button>
        </div>
        <GreenButton onClick={onSetupUrl}>
          <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
          My Setup URL is Ready
        </GreenButton>
      </DialogInner>
    </PublishDialogContainer>
  )
}
function PublishWithUrl({
  id,
  onComplete,
  onBack,
}: {
  id: UnpackedHypermediaId
  onComplete: () => void
  onBack?: () => void
}) {
  const entity = useResource(id)
  const document = entity.data?.type === 'document' ? entity.data.document : undefined
  const replace = useNavigate('replace')
  const register = useSiteRegistration(id.uid)
  const onSubmit: SubmitHandler<PublishSiteFields> = (data) => {
    register
      .mutateAsync({
        url: data.url,
      })
      .then((publishedUrl) => {
        onComplete()
        toast.success(`Site published to ${publishedUrl}`)
        // make sure the user is seeing the latest version of the site that now includes the url
        replace({
          key: 'document',
          id: {
            ...id,
            version: null,
            latest: true,
          },
        })
      })
  }
  const {
    control,
    handleSubmit,
    setFocus,
    formState: {errors},
  } = useForm<PublishSiteFields>({
    resolver: zodResolver(publishSiteSchema),
    defaultValues: {
      url: '',
    },
  })
  useEffect(() => {
    const timer = setTimeout(() => {
      setFocus('url')
    }, 300)
    return () => clearTimeout(timer)
  }, [setFocus])
  const spawn = useNavigate('spawn')
  return (
    <PublishDialogContainer
      heading={`Publish "${getDocumentTitle(document)}" with a Hosting Setup URL`}
      backButton={onBack ? <BackButton onPress={onBack} /> : null}
    >
      {/* <DialogDescription>description</DialogDescription> */}
      <SizableText className={stylex.props(styles.sf02fbf5).className || ''}>
        The{' '}
        <span
          className={stylex.props(styles.sfbb39f7).className || ''}
          onClick={() => {
            spawn(setupGuideRoute)
          }}
        >
          Server Setup
        </span>{' '}
        will output a setup URL for you to paste here.
      </SizableText>
      <form onSubmit={handleSubmit(onSubmit)} className={stylex.props(styles.s21fb93ac).className || ''}>
        <FormField name="url" label="Site Setup URL" errors={errors}>
          <FormInput control={control} name="url" placeholder="https://mysite.com/hm/register?..." width={500} />
        </FormField>
        {/* @ts-expect-error */}
        {register.error ? <ErrorBox error={register.error.message} /> : null}

        <GreenButton type="submit">
          <UploadCloud className={stylex.props(styles.sca3de968).className || ''} />
          Publish Site
        </GreenButton>

        {register.isLoading ? (
          <div className={stylex.props(styles.s9a378369).className || ''}>
            <Spinner />
          </div>
        ) : null}
      </form>
    </PublishDialogContainer>
  )
}
const setupGuideId = hmId('z6Mko5npVz4Bx9Rf4vkRUf2swvb568SDbhLwStaha3HzgrLS', {
  path: ['resources', 'self-host-seed'],
})
const setupGuideRoute: DocumentRoute = {
  key: 'document',
  id: setupGuideId,
}
