import {client} from '@/trpc'
import {
  defaultRoute,
  UniversalRoutingProvider,
  writeableStateStream,
} from '@shm/shared'
import {ReactNode, useEffect, useMemo} from 'react'
import {useIPC} from '../app-context'
import {
  NavAction,
  NavContextProvider,
  NavState,
  navStateReducer,
  setAppNavDispatch,
} from './navigation'
import {AppWindowEvent} from './window-events'

export function NavigationContainer({
  children,
  initialNav = {
    sidebarLocked: false,
    routes: [defaultRoute],
    routeIndex: 0,
    lastAction: 'replace',
  },
}: {
  children: ReactNode
  initialNav?: NavState
}) {
  const navigation = useMemo(() => {
    const [updateNavState, navState] = writeableStateStream(initialNav)
    return {
      dispatch(action: NavAction) {
        const prevState = navState.get()
        const newState = navStateReducer(prevState, action)
        if (prevState !== newState) {
          updateNavState(newState)
        } else if (action.type === 'closeBack') {
          client.closeAppWindow.mutate(window.windowId)
        }
      },
      state: navState,
    }
  }, [])
  const {send} = useIPC()

  useEffect(() => {
    return navigation.state.subscribe(() => {
      const state = navigation.state.get()
      console.log('LOLL', state)
      console.log('2LOLL', JSON.stringify(state))
      send('windowNavState', state)
    })
  }, [navigation, send])

  useEffect(() => {
    // @ts-expect-error
    return window.appWindowEvents?.subscribe((event: AppWindowEvent) => {
      if (event === 'back') {
        navigation.dispatch({type: 'pop'})
      }
      if (event === 'forward') {
        navigation.dispatch({type: 'forward'})
      }
    })
  }, [])

  useEffect(() => {
    setAppNavDispatch(navigation.dispatch)
    return () => {
      setAppNavDispatch(null)
    }
  }, [])

  return (
    <UniversalRoutingProvider
      value={{openRoute: (route) => navigation.dispatch({type: 'push', route})}}
    >
      <NavContextProvider value={navigation}>{children}</NavContextProvider>
    </UniversalRoutingProvider>
  )
}
