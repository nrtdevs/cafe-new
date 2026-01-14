import { useCallback, useContext } from 'react'
import { useAppSelector } from '../../redux/store'
import { Socket } from '../context/Socket'
import { JsonParseValidate } from '../Utils'
import useUser from './useUser'

const useWebSockets = () => {
  const user = useUser()
  const token = useAppSelector((s) => s.auth?.userData?.access_token)
  const { sendJsonMessage, sendMessage, lastMessage, readyState } = useContext(Socket)

  const send = useCallback(
    (params: any) =>
      sendJsonMessage({
        ...params,
        token
      }),
    [user]
  )

  return {
    readyState,
    lastMessage: JsonParseValidate(lastMessage?.data),
    lastMessageOriginal: lastMessage,
    send,
    sendMessage
  }
}

export default useWebSockets
