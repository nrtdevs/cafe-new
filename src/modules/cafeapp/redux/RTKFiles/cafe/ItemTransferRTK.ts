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
export const ItemTransferRTKManagement = createApi({
  reducerPath: 'ItemTransfer Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateTransfer: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createItemTransfer + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewTransferById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewTransfer + '/' + args
      })
    }),

    deleteTransferId: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteTransfer + id
      })
    }),
    loadTransfer: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listItemTransfers
      })
    }),
    exportTransferItemReport: builder.mutation<any, any>({
          query: (jsonData) => ({
            jsonData,
            method: 'post',
            path: ApiEndpoints.exportTransfer
          })
        }),
    loadEmployeeHandover: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.employeeHandoverList
      })
    }),
      exportPurchaseReport: builder.mutation<any, any>({
          query: (jsonData) => ({
            jsonData,
            method: 'post',
            path: ApiEndpoints.exportPurchase
          })
        }),
     loadStockReceived: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.stockReceivingList
      })
    }),
     createOrUpdateStockReceiveConfirm: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.stockReceivingConfirm + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
  })
})
export const {
useCreateOrUpdateTransferMutation,
useDeleteTransferIdMutation,
useLoadTransferMutation,
useViewTransferByIdMutation,
useExportTransferItemReportMutation,
useLoadEmployeeHandoverMutation,
useExportPurchaseReportMutation,
useLoadStockReceivedMutation,
useCreateOrUpdateStockReceiveConfirmMutation
 
} = ItemTransferRTKManagement
