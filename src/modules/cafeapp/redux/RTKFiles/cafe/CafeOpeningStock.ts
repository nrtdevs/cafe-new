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
export const CafeOpeningManagement = createApi({
  reducerPath: 'CafeOpeningManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateCafeOpening: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path:
          ApiEndpoints.addCafeOpeningStock + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewCafeOpeningById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewCafeOpeningStock + '/' + args
      })
    }),

    deleteCafeOpeningId: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteCafeOpeningStock + id
      })
    }),
    loadCafeOpenings: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.cafeOpeningStockLists
      })
    })
  })
})
export const {
  useCreateOrUpdateCafeOpeningMutation,
  useLoadCafeOpeningsMutation,
  useDeleteCafeOpeningIdMutation,
  useViewCafeOpeningByIdMutation
} = CafeOpeningManagement
