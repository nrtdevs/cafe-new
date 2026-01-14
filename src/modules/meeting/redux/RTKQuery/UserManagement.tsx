/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { UserData } from '@src/utility/types/typeAuthApi'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    jsonData?: UserData & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
    someExtra: any
}

interface RequestTypeAction {
    eventId: string
    ids: number[]
    action: string
}
export const MeetingUserManagement = createApi({
    reducerPath: 'MeetingUserManagement',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createOrUpdateUser: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: args?.jsonData?.id ? 'put' : 'post',
                path: ApiEndpoints.user + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
            })
        }),
        actionUser: builder.mutation<ResponseType, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'post',
                path: ApiEndpoints.user_action
            })
        }),
        changePassword: builder.mutation<ResponseType, any>({
            query: (args) => ({
                jsonData: args,
                method: 'post',
                path: ApiEndpoints.changePassword
            })
        }),
        loadUsers: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.users
            })
        })
    })
})
export const {
    useCreateOrUpdateUserMutation,
    useLoadUsersMutation,
    useActionUserMutation,
    useChangePasswordMutation
} = MeetingUserManagement
