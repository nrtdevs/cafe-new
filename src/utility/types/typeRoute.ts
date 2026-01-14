// types for route meta
export interface MetaProps {
  title?: string
  layout?: string
  publicRoute?: boolean
  restricted?: boolean
  action?: string
  resource?: string
  appLayout?: boolean
  className?: string
}

// route props
export interface RouteProps {
  path: string
  element: JSX.Element
  name: string
  meta?: MetaProps
  children?: RouteProps[]
}
