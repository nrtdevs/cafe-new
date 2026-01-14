import { lazy } from 'react'

const Typography = lazy(() => import('@src/exampleViews/ui-elements/typography'))
const Icons = lazy(() => import('@src/exampleViews/ui-elements/icons'))
const CardsBasic = lazy(() => import('@src/exampleViews/ui-elements/cards/basic'))
const CardsAdvance = lazy(() => import('@src/exampleViews/ui-elements/cards/advance'))
const CardsStatistics = lazy(() => import('@src/exampleViews/ui-elements/cards/statistics'))
const CardsAnalytics = lazy(() => import('@src/exampleViews/ui-elements/cards/analytics'))
const CardsActions = lazy(() => import('@src/exampleViews/ui-elements/cards/actions'))
const Accordion = lazy(() => import('@src/exampleViews/components/accordion'))
const Alerts = lazy(() => import('@src/exampleViews/components/alerts'))
const Autocomplete = lazy(() => import('@src/exampleViews/components/autocomplete'))
const Avatar = lazy(() => import('@src/exampleViews/components/avatar'))
const Badge = lazy(() => import('@src/exampleViews/components/badge'))
const BlockUI = lazy(() => import('@src/exampleViews/components/block-ui'))
const Breadcrumbs = lazy(() => import('@src/exampleViews/components/breadcrumbs'))
const Buttons = lazy(() => import('@src/exampleViews/components/buttons'))
const Carousel = lazy(() => import('@src/exampleViews/components/carousel'))
const Collapse = lazy(() => import('@src/exampleViews/components/collapse'))
const Divider = lazy(() => import('@src/exampleViews/components/divider'))
const Dropdown = lazy(() => import('@src/exampleViews/components/dropdowns'))
const ListGroup = lazy(() => import('@src/exampleViews/components/listGroup'))
const Modal = lazy(() => import('@src/exampleViews/components/modal'))
const NavComponent = lazy(() => import('@src/exampleViews/components/navComponent'))
const Offcanvas = lazy(() => import('@src/exampleViews/components/offcanvas'))
const Pagination = lazy(() => import('@src/exampleViews/components/pagination'))
const BadgePills = lazy(() => import('@src/exampleViews/components/badgePills'))
const TabPills = lazy(() => import('@src/exampleViews/components/tabPills'))
const Popovers = lazy(() => import('@src/exampleViews/components/popovers'))
const Progress = lazy(() => import('@src/exampleViews/components/progress'))
const Spinners = lazy(() => import('@src/exampleViews/components/spinners'))
const Tabs = lazy(() => import('@src/exampleViews/components/tabs'))
const Timeline = lazy(() => import('@src/exampleViews/components/timeline'))
const Toasts = lazy(() => import('@src/exampleViews/components/toasts'))
const Tooltips = lazy(() => import('@src/exampleViews/components/tooltips'))

const UiElementRoutes = [
  {
    element: <Typography />,
    path: '/ui-element/typography'
  },
  {
    element: <Icons />,
    path: '/icons/reactfeather'
  },
  {
    path: '/cards/basic',
    element: <CardsBasic />
  },
  {
    path: '/cards/advance',
    element: <CardsAdvance />
  },
  {
    path: '/cards/statistics',
    element: <CardsStatistics />
  },
  {
    path: '/cards/analytics',
    element: <CardsAnalytics />
  },
  {
    path: '/cards/action',
    element: <CardsActions />
  },
  {
    element: <Accordion />,
    path: '/components/accordion'
  },
  {
    element: <Alerts />,
    path: '/components/alerts'
  },
  {
    element: <Autocomplete />,
    path: '/components/auto-complete'
  },
  {
    element: <Avatar />,
    path: '/components/avatar'
  },
  {
    element: <Badge />,
    path: '/components/badges'
  },
  {
    element: <BlockUI />,
    path: '/components/blockui'
  },
  {
    element: <Breadcrumbs />,
    path: '/components/breadcrumbs'
  },
  {
    element: <Buttons />,
    path: '/components/buttons'
  },
  {
    element: <Carousel />,
    path: '/components/carousel'
  },
  {
    element: <Collapse />,
    path: '/components/collapse'
  },
  {
    element: <Divider />,
    path: '/components/divider'
  },
  {
    element: <Dropdown />,
    path: '/components/dropdowns'
  },
  {
    element: <ListGroup />,
    path: '/components/list-group'
  },
  {
    element: <Modal />,
    path: '/components/modals'
  },
  {
    element: <NavComponent />,
    path: '/components/nav-component'
  },
  {
    element: <Offcanvas />,
    path: '/components/offcanvas'
  },
  {
    element: <Pagination />,
    path: '/components/pagination'
  },
  {
    element: <BadgePills />,
    path: '/components/pill-badges'
  },
  {
    element: <TabPills />,
    path: '/components/pills-component'
  },
  {
    element: <Popovers />,
    path: '/components/popovers'
  },
  {
    element: <Progress />,
    path: '/components/progress'
  },
  {
    element: <Spinners />,
    path: '/components/spinners'
  },
  {
    element: <Tabs />,
    path: '/components/tabs-component'
  },
  {
    element: <Timeline />,
    path: '/components/timeline'
  },
  {
    element: <Toasts />,
    path: '/components/toasts'
  },
  {
    element: <Tooltips />,
    path: '/components/tooltips'
  }
]

export default UiElementRoutes
