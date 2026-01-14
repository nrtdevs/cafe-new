import { lazy } from 'react'

const DashboardAnalytics = lazy(() => import('@src/exampleViews/dashboard/analytics'))
const DashboardEcommerce = lazy(() => import('@src/exampleViews/dashboard/ecommerce'))

const DashboardRoutes = [
  {
    path: '/dashboard/analytics',
    element: <DashboardAnalytics />
  },
  {
    path: '/dashboard/ecommerce',
    element: <DashboardEcommerce />
  }
]

export default DashboardRoutes
