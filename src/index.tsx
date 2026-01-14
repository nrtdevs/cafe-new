// ** React Imports
import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// ** Redux Imports
import { store } from './redux/store'
import { Provider } from 'react-redux'

// ** Intl, CASL & ThemeColors Context
import ability from './configs/acl/ability'
import { AbilityContext } from '@src/utility/context/Can'
import { ThemeContext } from '@src/utility/context/ThemeColors'

// ** ThemeConfig
import themeConfig from './configs/themeConfig'

// ** Toast
import { Toaster, ToastPosition } from 'react-hot-toast'

// ** i18n
import './configs/i18n'

// ** Spinner (Splash Screen)
import Spinner from './@core/components/spinner/Fallback-spinner'

// ** Ripple Button
import './@core/components/ripple-button'

// ** Fake Database
// import './@fake-db'

// ** PrismJS
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx.min'

// ** React Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** React Hot Toast Styles
import '@styles/react/libs/react-hot-toasts/react-hot-toasts.scss'

// ** Core styles
import './@core/assets/fonts/feather/iconfont.css'
import './@core/scss/core.scss'
import './assets/scss/style.scss'

// ** Service Worker
import * as serviceWorker from './serviceWorker'
import { RenderHeaderMenuProvider } from '@src/utility/context/RenderHeader'

// ** Lazy load app
const LazyApp = lazy(() => import('./App'))

const container: any = document.getElementById('root')
const root = createRoot(container)

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Suspense fallback={<Spinner />}>
        <RenderHeaderMenuProvider>
          <AbilityContext.Provider value={ability}>
            <ThemeContext>
              <LazyApp />
              <Toaster
                position={themeConfig.layout.toastPosition as ToastPosition}
                toastOptions={{ className: 'react-hot-toast' }}
              />
            </ThemeContext>
          </AbilityContext.Provider>
        </RenderHeaderMenuProvider>
      </Suspense>
    </Provider>
  </BrowserRouter>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
