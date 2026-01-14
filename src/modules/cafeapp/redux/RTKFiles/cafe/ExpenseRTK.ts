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
export const ExpenseManagement = createApi({
  reducerPath: 'ExpenseManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateExpense: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addExpense + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    viewExpense: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'get',
        path: ApiEndpoints.viewExpense + args?.id
      })
    }),

    deleteExpenseById: builder.mutation<ResponseType, any>({
      query: ({ id }) => ({
        method: 'delete',
        path: ApiEndpoints.deleteExpense + id
      })
    }),
    loadExpenses: builder.mutation<ResponseListType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.expenses
      })
    })
  })
})
export const {
  useCreateOrUpdateExpenseMutation,
  useLoadExpensesMutation,
  useDeleteExpenseByIdMutation,
  useViewExpenseMutation
} = ExpenseManagement
