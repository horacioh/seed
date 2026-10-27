import {HMAccountsMetadata} from '@seed-hypermedia/client/hm-types'
import {useMemo} from 'react'
import {AccountAvatar} from './account-avatar'
import {Text} from './text'
import {cn} from './utils'

export function FacePile({accounts, accountsMetadata}: {accounts: string[]; accountsMetadata: HMAccountsMetadata}) {
  const maxVisible = 3
  const showAccountIds = useMemo(
    () => (accounts.length > maxVisible ? accounts.slice(0, maxVisible) : accounts),
    [accounts],
  )
  const remainingCount = accounts.length - showAccountIds.length

  const avatarClass =
    'dark:border-background dark:bg-background overflow-hidden rounded-full border-2 border-white bg-white'
  return (
    <div className="flex items-center gap-1 pl-2">
      {showAccountIds.map((author) => {
        const authorInfo = accountsMetadata[author]
        if (!authorInfo) return null
        return (
          <div key={author} className={avatarClass}>
            <AccountAvatar
              key={authorInfo.id.uid}
              id={authorInfo.id}
              name={authorInfo.metadata?.name}
              icon={authorInfo.metadata?.icon}
              size={24}
            />
          </div>
        )
      })}
      {remainingCount > 0 ? (
        <div className={cn('flex', avatarClass)}>
          <Text
            size="xs"
            className="text-muted-foreground size-6 text-center leading-5"
            style={{
              fontSize: '10px',
            }}
            weight="medium"
          >
            +{remainingCount}
          </Text>
        </div>
      ) : null}
    </div>
  )
}
