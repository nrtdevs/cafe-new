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
export const WarehouseManagement = createApi({
  reducerPath: 'Warehouse Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateWarehouse: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createWarehouse + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewWarehouseById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewWarehouse + '/' + args
      })
    }),

    deleteWarehouseById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteWarehouse + id
      })
    }),
    loadWarehouses: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listWarehouse
      })
    }),
   
  })
})
export const {
  useCreateOrUpdateWarehouseMutation,
 useViewWarehouseByIdMutation,
useDeleteWarehouseByIdMutation,
useLoadWarehousesMutation
 
} = WarehouseManagement
