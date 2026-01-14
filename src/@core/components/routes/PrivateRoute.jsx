// ** React Imports
import { Suspense, cloneElement, useContext } from 'react'
import { Navigate } from 'react-router-dom'

// ** Context Imports
import { AbilityContext } from '@src/utility/context/Can'

// ** Spinner Import
import httpConfig from '@src/utility/http/httpConfig'
import Spinner from '../spinner/Loading-spinner'

const PrivateRoute = ({ children, route }) => {
  // ** Hooks & Vars
  const ability = useContext(AbilityContext)
  const user = JSON?.parse(localStorage.getItem(httpConfig.storageUserData))

  if (route) {
    let action = null
    let resource = null
    let restrictedRoute = false

    if (route.meta) {
      action = route.meta.action
      resource = route.meta.resource
      restrictedRoute = route.meta.restricted
    }
    if (!user) {
      return <Navigate to='/login' />
    }
    if (user && restrictedRoute) {
      return <Navigate to='/dashboard' />
    }
    if (user && restrictedRoute && user.role === 'client') {
      return <Navigate to='/access-control' />
    }
    if (user && !ability.can(action || 'read', resource)) {
      return <Navigate to='/not-authorized' replace />
    }
  }

  return (
    <Suspense fallback={<Spinner className='content-loader' />}>
      {cloneElement(children, { route })}
    </Suspense>
  )
}

export default PrivateRoute
