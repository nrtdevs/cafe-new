import { lazy } from 'react'

const Tour = lazy(() => import('@src/exampleViews/extensions/tour'))
const Swiper = lazy(() => import('@src/exampleViews/extensions/swiper'))
const Ratings = lazy(() => import('@src/exampleViews/extensions/ratings'))
const Sliders = lazy(() => import('@src/exampleViews/extensions/sliders'))
const I18nComponent = lazy(() => import('@src/exampleViews/extensions/i18n'))
const Pagination = lazy(() => import('@src/exampleViews/extensions/pagination'))
const SweetAlert = lazy(() => import('@src/exampleViews/extensions/sweet-alert'))
const DragAndDrop = lazy(() => import('@src/exampleViews/extensions/drag-and-drop'))
const AccessControl = lazy(() => import('@src/exampleViews/extensions/access-control'))
const ReactHotToast = lazy(() => import('@src/exampleViews/extensions/react-hot-toasts'))
const CopyToClipboard = lazy(() => import('@src/exampleViews/extensions/copy-to-clipboard'))
const ImportComponent = lazy(() => import('@src/exampleViews/extensions/import-export/Import'))
const ExportComponent = lazy(() => import('@src/exampleViews/extensions/import-export/Export'))
const ExportSelected = lazy(() =>
  import('@src/exampleViews/extensions/import-export/ExportSelected')
)

const ExtensionsRoutes = [
  {
    element: <SweetAlert />,
    path: '/extensions/sweet-alert'
  },
  {
    element: <ReactHotToast />,
    path: '/extensions/react-hot-toasts'
  },
  {
    element: <Sliders />,
    path: '/extensions/slider'
  },
  {
    element: <DragAndDrop />,
    path: '/extensions/drag-and-drop'
  },
  {
    element: <Tour />,
    path: '/extensions/tour'
  },
  {
    element: <CopyToClipboard />,
    path: '/extensions/clipboard'
  },
  {
    element: <Swiper />,
    path: '/extensions/swiper'
  },
  {
    path: '/access-control',
    element: <AccessControl />,
    meta: {
      action: 'read',
      resource: 'ACL'
    }
  },
  {
    element: <Ratings />,
    path: '/extensions/ratings'
  },
  {
    element: <Pagination />,
    path: '/extensions/pagination'
  },
  {
    element: <ImportComponent />,
    path: '/extensions/import'
  },
  {
    element: <ExportComponent />,
    path: '/extensions/export'
  },
  {
    element: <ExportSelected />,
    path: '/extensions/export-selected'
  },
  {
    element: <I18nComponent />,
    path: '/extensions/i18n'
  }
]

export default ExtensionsRoutes
