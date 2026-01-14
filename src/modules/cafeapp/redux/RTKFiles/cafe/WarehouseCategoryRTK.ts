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
export const WarehouseCategoryManagement = createApi({
  reducerPath: 'Warehouse Category Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateWarehouseCategory: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createWarehouseCategory + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewWarehouseCategoryById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewWarehouseCategory + '/' + args
      })
    }),

    deleteWarehouseCategoryById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteWarehouseCategory + id
      })
    }),
    loadWarehouseCategories: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listWarehouseCategory
      })
    }),
   
  })
})
export const {
 useCreateOrUpdateWarehouseCategoryMutation,
useDeleteWarehouseCategoryByIdMutation,
useViewWarehouseCategoryByIdMutation,
useLoadWarehouseCategoriesMutation

 
} = WarehouseCategoryManagement
