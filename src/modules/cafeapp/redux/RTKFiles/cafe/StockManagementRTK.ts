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
export const StockManagement = createApi({
  reducerPath: 'StockManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdatestock: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addStockManage + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewStockManageById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewStockManage + '/' + args
      })
    }),
    actionMeeting: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'post',
        path: ApiEndpoints.meeting_action
      })
    }),
    fetchMeeting: builder.mutation<any, any>({
      query: (args) => ({
        jsonData: args,
        showErrorToast: false,
        showSuccessToast: false,
        method: 'get',
        path: ApiEndpoints.fetchMeeting
      })
    }),
    deleteStockManageById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteStockManage + id
      })
    }),
    loadStockManages: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.stockmanages
      })
    }),
    loadStockManageLog: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.stockManageLog
      })
    })
  })
})
export const {
  useCreateOrUpdatestockMutation,
  useLoadStockManagesMutation,
  useDeleteStockManageByIdMutation,
  useViewStockManageByIdMutation,
  useLoadStockManageLogMutation
} = StockManagement
