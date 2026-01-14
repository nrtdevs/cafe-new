import { lazy } from 'react'

const ApexCharts = lazy(() => import('@src/exampleViews/charts/apex'))
const ChartJS = lazy(() => import('@src/exampleViews/charts/chart-js'))
const Recharts = lazy(() => import('@src/exampleViews/charts/recharts'))

const ChartMapsRoutes = [
  {
    path: '/charts/apex',
    element: <ApexCharts />
  },
  {
    path: '/charts/chartjs',
    element: <ChartJS />
  },
  {
    path: '/charts/recharts',
    element: <Recharts />
  }
]

export default ChartMapsRoutes
