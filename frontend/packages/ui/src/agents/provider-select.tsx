import * as stylex from '@stylexjs/stylex'
import type {ModelProviderInfo, ModelProviderType} from './client'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shm/ui/select-dropdown'
import {ProviderIcon} from './provider-icons'
const styles = stylex.create({
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
  },
})
const ADD_PROVIDER_VALUE = '__add_provider__'

/**
 * Native select of configured model providers with a trailing "add provider"
 * option. Shared by the create-agent dialog and the agent settings page so both
 * can switch providers and add a new one in place.
 */
export function ProviderSelect({
  providers,
  value,
  onChange,
  onAddProvider,
  disabled,
}: {
  providers: ModelProviderInfo[] | undefined
  value: string
  onChange: (name: string) => void
  onAddProvider?: () => void
  disabled?: boolean
}) {
  const hasValueOption = !value || providers?.some((provider) => provider.name === value)
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next === ADD_PROVIDER_VALUE) onAddProvider?.()
        else onChange(next)
      }}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a provider" />
      </SelectTrigger>
      <SelectContent>
        {/* Keep a stranded value (e.g. a since-deleted provider) selectable rather than silently switching it. */}
        {hasValueOption ? null : <SelectItem value={value}>{value}</SelectItem>}
        {(providers || []).map((provider) => (
          <SelectItem key={provider.id} value={provider.name}>
            <span className={stylex.props(styles.s86ff3e4).className || ''}>
              <ProviderIcon
                type={provider.type as ModelProviderType}
                className={stylex.props(styles.sca3de968).className || ''}
              />
              {provider.name} ({provider.type})
            </span>
          </SelectItem>
        ))}
        {onAddProvider ? <SelectItem value={ADD_PROVIDER_VALUE}>+ Add provider…</SelectItem> : null}
      </SelectContent>
    </Select>
  )
}
