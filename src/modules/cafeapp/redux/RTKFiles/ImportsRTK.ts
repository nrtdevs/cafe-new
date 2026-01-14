/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: any & { sort?: any }
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
export const ImportManagement = createApi({
  reducerPath: 'ImportsManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    importFile: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        formData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.importReport
      })
    }),

    taskList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.taskList
      })
    }),
    rsrcList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.rdrcList
      })
    }),
    TaskRsrcList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.taskRSRCList
      })
    }),
    taskPredList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.taskPredList
      })
    }),
    projCostList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.projectCost
      })
    }),
    projectList: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.projectsList
      })
    }),
    taskRsrcView: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.taskRsrcView
      })
    }),
    taskView: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.taskView
      })
    }),
    taskPredView: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.taskPredView
      })
    }),
    projectCostView: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.projectCostView
      })
    }),
    activityGraph: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: 'post',
        path: ApiEndpoints.activityGraph
      })
    })
  })
})
export const {
  useImportFileMutation,
  useActivityGraphMutation,
  useTaskListMutation,
  useTaskViewMutation,
  useProjCostListMutation,
  useTaskPredListMutation,
  useProjectListMutation,
  useRsrcListMutation,
  useTaskRsrcListMutation
} = ImportManagement
