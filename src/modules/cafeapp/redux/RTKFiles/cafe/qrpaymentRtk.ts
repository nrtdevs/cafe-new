/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HttpListResponse, HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'
import { QrResponseTypes } from '../ResponseTypes'

interface RequestType extends PagePerPageRequest {
  jsonData?: any
}
interface ResponseType extends HttpResponse<QrResponseTypes> {
  someExtra: any
  payload?: any
}

interface ResponseListType extends HttpListResponse<QrResponseTypes> {
  someExtra: any
  payload?: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
}
export const PaymentQrManagement = createApi({
  reducerPath: 'PaymentQrManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdatePaymentQr: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addQr + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewPaymentQrById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewQr + '/' + args
      })
    }),

    deletePaymentQrById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteQr + id
      })
    }),
    loadPaymentQrs: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.Paymentqrs
      })
    })
  })
})
export const {
  useCreateOrUpdatePaymentQrMutation,
  useLoadPaymentQrsMutation,
  useDeletePaymentQrByIdMutation,
  useViewPaymentQrByIdMutation
} = PaymentQrManagement
