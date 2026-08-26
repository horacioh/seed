import * as stylex from '@stylexjs/stylex'
import {Spinner} from '@shm/ui/spinner'
import {Text} from '@shm/ui/text'
const styles = stylex.create({
  s3fe03fd8: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  se295dce2: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'calc(0.25rem * 6)',
  },
})
export function NotFoundPage() {
  return (
    <div className={stylex.props(styles.s3fe03fd8).className || ''}>
      <Text size="lg">404</Text>
      <Text>Page not found</Text>
    </div>
  )
}
export function BaseLoading() {
  return (
    <div className={stylex.props(styles.se295dce2).className || ''}>
      <Spinner />
    </div>
  )
}
