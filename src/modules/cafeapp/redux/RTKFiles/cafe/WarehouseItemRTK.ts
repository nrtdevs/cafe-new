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
export const WarehouseItemManagement = createApi({
  reducerPath: 'Warehouse Item Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateItem: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createWarehouseItem + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewItemById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewWarehouseItem + '/' + args
      })
    }),

    deleteItemById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteWarehouseItem + id
      })
    }),
    loadItems: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listWarehouseItem
      })
    }),
      loadWareHouseCafe: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.ListWarehouseCafes
      })
    })
      
  })
})
export const {
useCreateOrUpdateItemMutation,
useDeleteItemByIdMutation,
useLoadItemsMutation,
useViewItemByIdMutation,
useLoadWareHouseCafeMutation
 
} = WarehouseItemManagement
