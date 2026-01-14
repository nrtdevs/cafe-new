// ** Redux Imports
import { createSlice } from '@reduxjs/toolkit'

// ** UseJWT import to get config
// import useJwt from '@src/auth/jwt/useJwt'
import httpConfig from '@src/utility/http/httpConfig'

// const config = useJwt.jwtConfig

const initialUser = () => {
    const item = window.localStorage.getItem(httpConfig.storageUserData)
    //** Parse stored json or if none return initialValue
    return item ? JSON.parse(item) : {}
}

export const authSlice = createSlice({
    name: 'authentication',
    initialState: {
        userData: initialUser()
    },
    reducers: {
        handleLogin: (state, action) => {
            state.userData = action.payload
            state[httpConfig.storageTokenKeyName] = action.payload[httpConfig.storageTokenKeyName]
            state[httpConfig.storageRefreshTokenKeyName] =
                action.payload[httpConfig.storageRefreshTokenKeyName]
            localStorage.setItem(httpConfig.storageUserData, JSON.stringify(action.payload))
            localStorage.setItem(
                httpConfig.storageTokenKeyName,
                JSON.stringify(action.payload.token)
            )
            localStorage.setItem(
                httpConfig.storageRefreshTokenKeyName,
                JSON.stringify(action.payload.token)
            )

            //write token and user data to local storage
            localStorage.setItem('userData', JSON.stringify(action.payload))
            localStorage.setItem('token', JSON.stringify(action.payload.token))
            localStorage.setItem('refreshToken', JSON.stringify(action.payload.token))
        },
        handleLogout: (state) => {
            state.userData = {}
            state[httpConfig.storageTokenKeyName] = null
            state[httpConfig.storageRefreshTokenKeyName] = null
            // ** Remove user, accessToken & refreshToken from localStorage
            localStorage.removeItem(httpConfig.storageUserData)
            localStorage.removeItem(httpConfig.storageTokenKeyName)
            localStorage.removeItem(httpConfig.storageRefreshTokenKeyName)
            localStorage.clear()

        }
    }
})

export const { handleLogin, handleLogout } = authSlice.actions

export default authSlice.reducer
