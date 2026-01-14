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
export const PullDataManagement = createApi({
  reducerPath: 'PullDataManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdatePullData: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.pullData + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),

    viewPullDataById: builder.mutation<ResponseType, any>({
      query: (args) => ({
        jsonData: args,
        method: 'get',
        path: ApiEndpoints.viewSubCafe + args?.id
      })
    }),

    deletePullDataById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteSubCafe + id
      })
    }),
    loadPullData: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.cafeSubList
      })
    }),
    loadCategoryPullData: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.pullCategory
      })
    }),
    loadProductPullData: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.pullProduct
      })
    }),
    loadMenuPullData: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.pullMenu
      })
    })
  })
})
export const {
  useCreateOrUpdatePullDataMutation,
  useViewPullDataByIdMutation,
  useDeletePullDataByIdMutation,
  useLoadPullDataMutation,
  useLoadCategoryPullDataMutation,
  useLoadProductPullDataMutation,
  useLoadMenuPullDataMutation
} = PullDataManagement
