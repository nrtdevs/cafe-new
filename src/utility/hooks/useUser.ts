import { useEffect, useState } from 'react'
import { useAppSelector } from '../../redux/store'
import { isValid } from '../Utils'
import { UserData } from '../types/typeAuthApi'

const useUser = () => {
  const user = useAppSelector((s) => s?.auth?.userData)
  const [t, setT] = useState<UserData | null>(null)

  useEffect(() => {
    if (isValid(user)) {
      setT(user)
    }
  }, [user])

  return t
}

export default useUser
