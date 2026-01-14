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
export const BrandManagement = createApi({
  reducerPath: 'Brand Management',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateBrand: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.createBrand + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewBrandById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewBrand + '/' + args
      })
    }),

    deleteBrandById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteBrand + id
      })
    }),
    loadBrands: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.listBrands
      })
    }),
   
  })
})
export const {
 useCreateOrUpdateBrandMutation,
 useDeleteBrandByIdMutation,
 useLoadBrandsMutation,
 useViewBrandByIdMutation
 
} = BrandManagement
