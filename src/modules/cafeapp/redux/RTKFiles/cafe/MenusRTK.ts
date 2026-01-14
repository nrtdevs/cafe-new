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
  action: string
  id: any
  ids: number[]

  percent?: string | number
}
export const MenuManagement = createApi({
  reducerPath: 'MenuManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateMenu: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addMenu + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewMenu: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'get',
        path: ApiEndpoints.viewMenu + args?.id
      })
    }),

    deleteMenuById: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        method: 'delete',
        path: ApiEndpoints.deleteMenu + args?.id
      })
    }),
    loadMenus: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.menus
      })
    }),
    loadCategorywiseMenu: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.CategoryWiseMenus
      })
    }),
     createOrUpdateDemand: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints. add_demand + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
      loadDemands: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.list_demand
      })
    }),
       deleteDemandById: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        method: 'delete',
        path: ApiEndpoints.add_demand + '/' + args?.id
      })
    }),
        viewDemands: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'get',
           path: ApiEndpoints.add_demand + '/' + args?.id
      })
    }),
     loadMismatchList: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.quantity_mismatch_list
      })
    }),
     actionMismatchQuantityId: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.Quantity_mismatch_action + '/' + args?.jsonData?.id
      })
    }),
  })
})
export const {
  useCreateOrUpdateMenuMutation,
  useLoadMenusMutation,
  useLoadCategorywiseMenuMutation,
  useDeleteMenuByIdMutation,
  useViewMenuMutation,
  useCreateOrUpdateDemandMutation,
  useLoadDemandsMutation,
  useDeleteDemandByIdMutation,
  useViewDemandsMutation,
  useLoadMismatchListMutation,
  useActionMismatchQuantityIdMutation
} = MenuManagement
