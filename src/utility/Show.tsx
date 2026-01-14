import { FC, useContext, useEffect, useState } from 'react'
import { AbilityContext } from '@src/utility/context/Can'
import { PermissionType } from './Permissions'

interface PropTypes {
  IF: boolean | PermissionType
  children: null | JSX.Element | JSX.Element[]
}

export const Can = (p: PermissionType | boolean): boolean => {
  const ability: any = useContext(AbilityContext)
  return typeof p === 'object' ? ability.can(p?.action, p?.resource) : !!p
}

const Show: FC<PropTypes> = ({ IF = false, children = null }: { IF: any; children: any }) => {
  const ability: any = useContext(AbilityContext)
  const [per, setPer] = useState(null)
  const [g, setG] = useState(null)
  const [type, setType] = useState('boolean')

  const setPermissions = (permissions: any) => {
    // log(permissions, 'le')
    if (permissions !== null) {
      if (typeof permissions === 'object') {
        setType('object')
        if (permissions?.hasOwnProperty('action') && permissions?.hasOwnProperty('resource')) {
          setPer(permissions?.action)
          setG(permissions?.resource)
        }
      }
    }
  }

  useEffect(() => {
    setPermissions(IF)
  }, [IF])

  if (type === 'object') {
    if (ability.can(per, g)) {
      return <>{children}</>
    } else {
      return null
    }
  } else {
    if (IF) {
      return <>{children}</>
    } else {
      return null
    }
  }
}

export default Show
