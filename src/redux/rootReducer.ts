// ** Reducers Imports
import { CafeReducers, cafeMiddleware } from '@src/modules/cafeapp/redux'
import auth from './authentication'
import layout from './layout'
import navbar from './navbar'

const rootReducer = {
  // theme reducers,
  navbar,
  layout,
  // auth reducers
  auth,
  // Meeting Reducers integration
  // Dpr Reducer integration
  ...CafeReducers
}
export const middleware = [
  // Meeting Middleware integration
  // Dpr Middleware integration
  ...cafeMiddleware
]
export default rootReducer
