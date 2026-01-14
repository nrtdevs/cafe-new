/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { UserData } from '@src/utility/types/typeAuthApi'
import { Meeting } from '@src/utility/types/typeMeeting'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: Meeting
}
interface ResponseType extends HttpResponse<any> {
  someExtra: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
}
export const AppSettings = createApi({
  reducerPath: 'AppSettings',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    loadAppSetting: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        // params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'get',
        path: ApiEndpoints.appSetting
      })
    }),
    updateAppSetting: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.updateSetting
      })
    }),
    loadNotifications: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.notifications
      })
    }),
    readAllNotifications: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.readAllNotifications
      })
    }),
    readNotifications: builder.mutation<ResponseType, RequestType>({
      query: (args) => ({
        method: 'get',
        path: ApiEndpoints.notification + '/' + args?.jsonData?.id + '/read'
      })
    })
  })
})
export const {
  useLoadAppSettingMutation,
  useUpdateAppSettingMutation,
  useLoadNotificationsMutation,
  useReadAllNotificationsMutation,
  useReadNotificationsMutation
} = AppSettings
