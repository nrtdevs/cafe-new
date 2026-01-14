/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HttpListResponse, HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: any
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
  payload?: any
}

interface ResponseListType extends HttpListResponse<any> {
  someExtra: any
  payload?: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
}
export const CashHandoverManagement = createApi({
  reducerPath: 'CashHandoverManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateCashHandover: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addCashHandover + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
 
   
    deleteCashHandoverById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteCashHandover + id
      })
    }),
    loadHandover: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.cashHandover
      })
    })
  })
})
export const {
useCreateOrUpdateCashHandoverMutation,
useDeleteCashHandoverByIdMutation,
useLoadHandoverMutation

} = CashHandoverManagement
