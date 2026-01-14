import { AbilityContext } from '@src/utility/context/Can'
import { FC, ReactElement, useContext, useEffect, useState } from 'react'
import { PermissionType } from './Permissions'

interface PropsType {
    IF: boolean | PermissionType
    children?: ReactElement | ReactElement[]
}

// const Hide: FC<PropsType> = ({ IF, children }) => {
//   return <>{IF ? null : children}</>
// }

// export default Hide


const Hide: FC<PropsType> = ({ IF = false, children = null }: { IF?: any; children?: any }) => {
    const [per, setPer] = useState(null)
    const [g, setG] = useState(null)
    const ability = useContext(AbilityContext)
    const [type, setType] = useState('boolean')

    //   useEffect(() => {
    //     setPer(permission)
    //     setG(group)
    //   }, [permission, group])
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
            return null
        } else {
            return <>{children}</>
        }
    } else {
        if (IF) {
            return null
        } else {
            return <>{children}</>
        }
    }
}

export default Hide
