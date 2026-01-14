// ** Navigation imports
import apps from './apps'
import pages from './pages'
import forms from './forms'
import tables from './tables'
import others from './others'
import charts from './charts'
import dashboards from './dashboards'
import uiElements from './ui-elements'
import { Info } from 'react-feather'

const exampleNav = []
// check env
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'

if (isDev) {
  exampleNav.push({
    id: 'examples',
    title: 'Examples',
    icon: <Info size={20} />,
    // badge: 'light-warning',
    // badgeText: '2',
    children: [
      {
        header: 'Dashboard'
      },
      ...dashboards,
      ...apps,
      ...pages,
      ...uiElements,
      ...forms,
      ...tables,
      ...charts,
      ...others
    ]
  })
}

export default exampleNav
