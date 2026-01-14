/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { Permission, Role } from '@src/utility/types/typeAuthApi'
import { HttpListResponse, HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
  jsonData?: any
}

interface RequestTypeAction {
  eventId: string
  ids: number[]
  action: string
}
export const RoleManagement = createApi({
  reducerPath: 'RoleManagement',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrUpdateRole: builder.mutation<HttpResponse<Role>, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        method: args?.jsonData?.id ? 'put' : 'post',
        path: ApiEndpoints.addRole + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
      })
    }),
    deleteRole: builder.mutation<HttpResponse<Role>, RequestTypeAction>({
      query: (args) => ({
        jsonData: args,
        method: 'delete',
        path: ApiEndpoints.actionRole
      })
    }),
    loadRoles: builder.mutation<HttpListResponse<any>, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.roles
      })
    }),
    loadPermissions: builder.mutation<HttpResponse<Permission[]>, RequestType>({
      query: (args) => ({
        jsonData: args?.jsonData,
        params: { page: args?.page, per_page_record: args.per_page_record },
        method: 'post',
        path: ApiEndpoints.permissions
      })
    })
  })
})
export const {
  useCreateOrUpdateRoleMutation,
  useLoadRolesMutation,
  useDeleteRoleMutation,
  useLoadPermissionsMutation
} = RoleManagement
