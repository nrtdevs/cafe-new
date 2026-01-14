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
export const PurchaseItemManagement = createApi({
  reducerPath: 'Purchase Item Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateListPurchaseItem: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createPurchaseItem + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
   
    viewPurchaseItemById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewPurchaseItem+ '/' + args
      })
    }),

    deletePurchaseItemById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deletePurchaseItem + id
      })
    }),
    loadPurchaseItem: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listPurchaseItem
      })
    }),
    importPurchaseItemReport: builder.mutation<any, any>({
      query: (jsonData) => ({
        jsonData,
        method: 'post',
        path: ApiEndpoints.purchase_import
      })
    }),
       createOrUpdateEmployeeHandover: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.employee_handover + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
      createEmployeeHandoverReceiving: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.employeeHandoverConfirm + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
      importItemReport: builder.mutation<any, any>({
      query: (jsonData) => ({
        jsonData,
        method: 'post',
        path: ApiEndpoints.importItem
      })
    }),
   
  })
})
export const {
useCreateOrUpdateListPurchaseItemMutation,
useDeletePurchaseItemByIdMutation,
useLoadPurchaseItemMutation,
useViewPurchaseItemByIdMutation,
useImportPurchaseItemReportMutation,
useCreateOrUpdateEmployeeHandoverMutation,
useCreateEmployeeHandoverReceivingMutation,
useImportItemReportMutation

 
} = PurchaseItemManagement
