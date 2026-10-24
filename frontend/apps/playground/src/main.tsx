import {CommentsProvider, QueryClientProvider, ReadOnlyViewerProvider, UniversalAppProvider} from '@shm/shared'
import {registerQueryClient} from '@shm/shared/models/query-client'
import {NavContextProvider, type NavigationContext, type NavState} from '@shm/shared/utils/navigation'
import {writeableStateStream} from '@shm/shared/utils/stream'
import {ReadOnlyViewer} from '@shm/editor/readonly-viewer'
import {TooltipProvider} from '@shm/ui/tooltip'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import './index.css'
import {queryClient} from './queryClient'
import {playgroundUniversalClient} from './universal-client'

registerQueryClient(queryClient)

const [, navigationState] = writeableStateStream<NavState>({
  routes: [],
  routeIndex: 0,
  lastAction: 'replace',
})
const playgroundNavigation: NavigationContext = {state: navigationState, dispatch: () => {}}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <NavContextProvider value={playgroundNavigation}>
            <UniversalAppProvider
              universalClient={playgroundUniversalClient}
              openUrl={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
              openRoute={null}
            >
              <ReadOnlyViewerProvider value={ReadOnlyViewer}>
                <CommentsProvider onReplyClick={() => {}} onReplyCountClick={() => {}}>
                  <App />
                </CommentsProvider>
              </ReadOnlyViewerProvider>
            </UniversalAppProvider>
          </NavContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
