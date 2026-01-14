/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { UserData } from '@src/utility/types/typeAuthApi'
import { ActionItem } from '@src/utility/types/typeMeeting'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: ActionItem & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
}

interface RequestTypeAction {
  eventId: string
  id: any
  ids: number[]
  action: string
  percent?: string | number
}
export const ActionManagement = createApi({
  reducerPath: 'ActionManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateAction: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addActionItems + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),

    deleteAction: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.actionItemViewUpdate + args?.id
      })
    }),
    viewAction: builder.mutation<ResponseType, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'get',
        path: ApiEndpoints.actionItemViewUpdate + args?.id
      })
    }),
    actionItemAction: builder.mutation<any, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'post',
        path: ApiEndpoints.actionItemAction
      })
    }),
    loadActions: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.actionItems
      })
    })
  })
})
export const {
  useLoadActionsMutation,
  useDeleteActionMutation,
  useViewActionMutation,
  useCreateOrUpdateActionMutation,
  useActionItemActionMutation
} = ActionManagement
