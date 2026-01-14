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
export const CategoryManagement = createApi({
  reducerPath: 'CategoryManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdatecategory: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addCategory + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewCategoryById: builder.mutation<ResponseType, Number>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.viewCategory + '/' + args
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
    deleteCategoryById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteCategory + id
      })
    }),
    loadCategories: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.categories
      })
    })
  })
})
export const {
  useCreateOrUpdatecategoryMutation,
  useLoadCategoriesMutation,
  useDeleteCategoryByIdMutation,
  useViewCategoryByIdMutation,
  useActionMeetingMutation
} = CategoryManagement
