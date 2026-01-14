import { lazy } from 'react'

const Reactstrap = lazy(() => import('@src/exampleViews/tables/reactstrap'))
const DTBasic = lazy(() => import('@src/exampleViews/tables/data-tables/basic'))
const DTAdvance = lazy(() => import('@src/exampleViews/tables/data-tables/advance'))

const TablesRoutes = [
  {
    path: '/tables/reactstrap',
    element: <Reactstrap />
  },
  {
    path: '/datatables/basic',
    element: <DTBasic />
  },
  {
    path: '/datatables/advance',
    element: <DTAdvance />
  }
]

export default TablesRoutes
