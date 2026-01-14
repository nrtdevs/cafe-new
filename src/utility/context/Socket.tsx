/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useCallback, useEffect, useReducer, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { SendJsonMessage } from 'react-use-websocket/dist/lib/types'
import { useAppDispatch, useAppSelector } from '../../redux/store'
import { CMD } from '../Const'
import { echoEvent } from '../hooks/useEcho'
import useUser from '../hooks/useUser'
import httpConfig from '../http/httpConfig'
import { stateReducer } from '../stateReducer'
import { isValid, JsonParseValidate, log } from '../Utils'

type SocketProps = {
  sendMessage: (e: any) => void
  sendJsonMessage: SendJsonMessage
  lastMessage: any
  readyState: ReadyState
  disconnect: () => void
}
interface States {
  url?: string | null
  registered?: boolean
  reconnectAttempts?: number
}
const context: SocketProps = {
  sendJsonMessage: () => {},
  sendMessage: () => {},
  lastMessage: null,
  readyState: ReadyState.UNINSTANTIATED,
  disconnect: () => {}
}
// ** Create Context
const Socket = createContext(context)
const SocketContext = ({ children }: { children: JSX.Element }) => {
  const user = useUser()
  const reconnect = useRef(false)
  const token = useAppSelector((s) => s.auth?.userData?.access_token)
  const dispatch = useAppDispatch()
  const initState: States = {
    url: null,
    registered: false,
    reconnectAttempts: 0
  }
  const reducers = stateReducer<States>
  const [state, setState] = useReducer(reducers, initState)

  // init websocket
  const { sendJsonMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    state?.url ?? null,
    {
      shouldReconnect: (closeEvent) => {
        return reconnect.current
      },
      reconnectAttempts: 5,
      reconnectInterval: 3000
    },
    httpConfig?.enableSocket
  )

  // connect user
  const register = useCallback(() => {
    sendJsonMessage({
      command: CMD.Register,
      userId: user?.id,
      token
    })
  }, [user, token])

  // disconnect user
  const disconnect = useCallback(() => {
    sendJsonMessage({
      command: CMD.Disconnect,
      userId: user?.id,
      token
    })
    setState({ registered: false })
    getWebSocket()?.close()
  }, [user, token])

  // send message
  const sendMessage = useCallback(
    (data: any) => {
      sendJsonMessage({
        ...data,
        userId: user?.id,
        entry_mode: 'web',
        token
      })
    },
    [user, token]
  )
  //   useEffect(() => {
  //     if (isValid(user)) {
  //       echoEvent(
  //         (e: {
  //           action?: string
  //           cart_id?: string
  //           customer_id?: string
  //           session_id?: string
  //           store_id?: string
  //           uniqueId?: string
  //           userId?: string
  //         }) => {
  //           log('echoEvent', e)
  //           if (e?.action === CMD.GetAllSessions) {
  //             // get all session
  //             requestAllSessions()
  //           } else if (e?.action === CMD.GetCustomerSession) {
  //             // update a session
  //             sendMessage({
  //               command: CMD.GetCustomerSession,
  //               customer_id: e?.customer_id,
  //               session_id: e?.session_id
  //             })
  //           }
  //         },
  //         user!
  //       )
  //     }
  //   }, [user])

  // register user when socket open
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      if (isValid(token)) {
        setState({ registered: true })
        register()
      }
    }
  }, [readyState, ReadyState, token])

  // reconnect or close
  useEffect(() => {
    if (isValid(token)) {
      setState({ url: httpConfig.socketChatUrl })
      if (
        readyState === ReadyState.CLOSED &&
        state?.reconnectAttempts &&
        state?.reconnectAttempts < 5
      ) {
        reconnect.current = true
        setState({ reconnectAttempts: state?.reconnectAttempts + 1 })
      } else {
        if (state?.reconnectAttempts && state?.reconnectAttempts === 5) {
          setState({ registered: false })
          getWebSocket()?.close()
        }
      }
    } else {
      setState({ url: null })
      reconnect.current = false
    }
  }, [token, readyState])

  //   // request all sessions
  //   useEffect(() => {
  //     if (readyState === ReadyState.OPEN) {
  //       if (isValid(token)) {
  //         // load sessions
  //         requestAllSessions()
  //       }
  //     }
  //   }, [readyState, ReadyState, token])

  //   // receive data
  //   useEffect(() => {
  //     if (readyState === ReadyState.OPEN) {
  //       const message = JsonParseValidate(lastMessage?.data)
  //       //   log('lastMessage', message)

  //       // get all sessions
  //       switch (message?.command) {
  //         case CMD.GetAllSessions:
  //           log('GetAllSessions', message)
  //           break
  //         default:
  //           break
  //       }
  //     }
  //   }, [lastMessage, readyState])

  return (
    <Socket.Provider value={{ lastMessage, sendMessage, sendJsonMessage, readyState, disconnect }}>
      {children}
    </Socket.Provider>
  )
}

export { Socket, SocketContext }
