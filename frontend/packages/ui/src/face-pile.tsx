import * as stylex from '@stylexjs/stylex'
import {HMAccountsMetadata} from '@seed-hypermedia/client/hm-types'
import {useMemo} from 'react'
import {HMIcon} from './hm-icon'
import {Text} from './text'
const styles = stylex.create({
  s10ce0698: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 'calc(0.25rem * 2)',
  },
  s2ad4931: {
    marginLeft: 'calc(0.25rem * -2)',
  },
  s2ffff9: {
    display: 'flex',
  },
  sdf7f3c17: {
    width: 'calc(0.25rem * 6)',
    height: 'calc(0.25rem * 6)',
    textAlign: 'center',
    lineHeight: 'calc(0.25rem * 5)',
    color: 'oklch(70.7% 0.022 261.325)',
  },
  face: {
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderRadius: 'calc(infinity * 1px)',
    overflow: 'hidden',
    ':is(.dark *)': {
      borderColor: 'var(--background)',
      backgroundColor: 'var(--background)',
    },
  },
})
export function FacePile({accounts, accountsMetadata}: {accounts: string[]; accountsMetadata: HMAccountsMetadata}) {
  const maxVisible = 3
  const showAccountIds = useMemo(
    () => (accounts.length > maxVisible ? accounts.slice(0, maxVisible) : accounts),
    [accounts],
  )
  const remainingCount = accounts.length - showAccountIds.length
  return (
    <div className={stylex.props(styles.s10ce0698).className || ''}>
      {showAccountIds.map((author, idx) => {
        const authorInfo = accountsMetadata[author]
        if (!authorInfo) return null
        return (
          <div
            key={showAccountIds[idx]}
            className={stylex.props(styles.face, styles.s2ad4931).className || ''}
            style={{
              zIndex: idx + 1,
            }}
          >
            <HMIcon
              key={authorInfo.id.uid}
              id={authorInfo.id}
              name={authorInfo.metadata?.name}
              icon={authorInfo.metadata?.icon}
              size={20}
            />
          </div>
        )
      })}
      {remainingCount > 0 ? (
        <div className={stylex.props(styles.s2ffff9, styles.face, styles.s2ad4931).className || ''}>
          <Text
            size="xs"
            className={stylex.props(styles.sdf7f3c17).className || ''}
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
