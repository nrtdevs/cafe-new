import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

const Faq = lazy(() => import('@src/exampleViews/pages/faq'))
const ApiKey = lazy(() => import('@src/exampleViews/pages/api-key'))
const Profile = lazy(() => import('@src/exampleViews/pages/profile'))
const Pricing = lazy(() => import('@src/exampleViews/pages/pricing'))
const License = lazy(() => import('@src/exampleViews/pages/license'))
const Error = lazy(() => import('@src/exampleViews/pages/misc/Error'))
const BlogList = lazy(() => import('@src/exampleViews/pages/blog/list'))
const BlogEdit = lazy(() => import('@src/exampleViews/pages/blog/edit'))
const BlogDetails = lazy(() => import('@src/exampleViews/pages/blog/details'))
const ComingSoon = lazy(() => import('@src/exampleViews/pages/misc/ComingSoon'))
const ModalExamples = lazy(() => import('@src/exampleViews/pages/modal-examples'))
const Maintenance = lazy(() => import('@src/exampleViews/pages/misc/Maintenance'))
const AccountSettings = lazy(() => import('@src/exampleViews/pages/account-settings'))
const NotAuthorized = lazy(() => import('@src/exampleViews/pages/misc/NotAuthorized'))
const KnowledgeBase = lazy(() => import('@src/exampleViews/pages/knowledge-base/KnowledgeBase'))
const KnowledgeBaseCategory = lazy(() =>
  import('@src/exampleViews/pages/knowledge-base/KnowledgeBaseCategory')
)
const KBCategoryQuestion = lazy(() =>
  import('@src/exampleViews/pages/knowledge-base/KnowledgeBaseCategoryQuestion')
)

const PagesRoutes = [
  {
    path: '/pages/profile',
    element: <Profile />
  },
  {
    path: '/pages/faq',
    element: <Faq />
  },
  {
    path: '/pages/knowledge-base',
    element: <KnowledgeBase />
  },
  {
    path: '/pages/knowledge-base/:category',
    element: <KnowledgeBaseCategory />
  },
  {
    path: '/pages/knowledge-base/:category/:question',
    element: <KBCategoryQuestion />
  },
  {
    path: '/pages/account-settings',
    element: <AccountSettings />
  },
  {
    path: '/pages/license',
    element: <License />
  },
  {
    path: '/pages/api-key',
    element: <ApiKey />
  },
  {
    path: '/pages/modal-examples',
    element: <ModalExamples />
  },
  {
    path: '/pages/blog/list',
    element: <BlogList />
  },
  {
    path: '/pages/blog/detail/:id',
    element: <BlogDetails />
  },
  {
    path: '/pages/blog/detail',
    element: <Navigate to='/pages/blog/detail/1' />
  },
  {
    path: '/pages/blog/edit/:id',
    element: <BlogEdit />
  },
  {
    path: '/pages/blog/edit',
    element: <Navigate to='/pages/blog/edit/1' />
  },
  {
    path: '/pages/pricing',
    element: <Pricing />
  },
  {
    path: '/misc/coming-soon',
    element: <ComingSoon />,
    meta: {
      publicRoute: true,
      layout: 'blank'
    }
  },
  {
    path: '/misc/not-authorized',
    element: <NotAuthorized />,
    meta: {
      publicRoute: true,
      layout: 'blank'
    }
  },
  {
    path: '/misc/maintenance',
    element: <Maintenance />,
    meta: {
      publicRoute: true,
      layout: 'blank'
    }
  },
  {
    path: '/misc/error',
    element: <Error />,
    meta: {
      publicRoute: true,
      layout: 'blank'
    }
  }
]

export default PagesRoutes
