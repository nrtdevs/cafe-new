/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { Meeting } from '@src/utility/types/typeMeeting'
import { HttpListResponse, HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    jsonData?: any
}
interface ResponseType extends HttpResponse<Meeting> {
    someExtra: any
    payload?: any
}

interface ResponseListType extends HttpListResponse<Meeting> {
    someExtra: any
    payload?: any
}

interface RequestTypeAction {
    eventId: string
    ids: number[]
    action: string
}
export const CafeChildlogin = createApi({
    reducerPath: 'CafeChildlogin',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        cafeChLogin: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.CafeChildLogin
            })
        }),
        SubCafeChLogin: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.sub_cafe_child
            })
        }),
         EmployeeChLogin: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.employeeChildLogin
            })
        })
    }),


})




export const { useCafeChLoginMutation, useSubCafeChLoginMutation,useEmployeeChLoginMutation } = CafeChildlogin
