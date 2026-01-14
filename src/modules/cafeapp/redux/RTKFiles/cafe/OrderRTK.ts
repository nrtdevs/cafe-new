/* eslint-disable no-confusing-arrow */
// ** Redux Imports
import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'
import { orderResponseTypes, orderStatusUpdateResponseTypes } from '../ResponseTypes'

interface RequestType extends PagePerPageRequest {
    jsonData?: orderResponseTypes & { sort?: any }
}

interface StatusUpdate {
    jsonData?: orderStatusUpdateResponseTypes & { sort?: any }
}
interface ResponseType extends HttpResponse<any> {
    someExtra: any
    payload?: any
}

interface RequestTypeAction {
    eventId: string
    id: any
    ids: number[]
    action: string
    percent?: string | number
}
export const OrderManagement = createApi({
    reducerPath: 'OrderManagement',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createOrUpdateOrders: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: args?.jsonData?.id ? 'put' : 'post',
                path: ApiEndpoints.addOrder + (args?.jsonData?.id ? '/' + args?.jsonData?.id : '')
            })
        }),
        orderStatusUpdate: builder.mutation<ResponseType, StatusUpdate>({
            query: (args) => ({
                jsonData: args?.jsonData,
                method: 'post',
                path: ApiEndpoints.orderStatusUpdate + args?.jsonData?.order_id
            })
        }),

        deleteOrders: builder.mutation<ResponseType, RequestTypeAction>({
            query: (args) => ({
                jsonData: args,
                method: 'delete',
                path: ApiEndpoints.updatOrder + args?.id
            })
        }),
        viewOrders: builder.mutation<ResponseType, any>({
            query: (args) => ({
                jsonData: args,
                method: 'get',
                path: ApiEndpoints.viewOrder + args?.id
            })
        }),
        getRecipeList: builder.mutation<ResponseType, any>({
            query: (args) => ({
                jsonData: args,
                method: 'get',
                path: ApiEndpoints.getOrderRecipe + args?.id
            })
        }),

        loadOrders: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.orders
            })
        }),
        loadOrdersLog: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.order_edit_logs
            })
        }),
        whatsAppLog: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.whatsappHistory
            })
        }),
       WeeklyMenuReport: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.weeklyMenuReport
            })
        }),
            WeeklyCafeReport: builder.mutation<ResponseType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.weeklyCafeSaleReport
            })
        }),
    })
})
export const {
    useCreateOrUpdateOrdersMutation,
    useDeleteOrdersMutation,
    useOrderStatusUpdateMutation,
    useGetRecipeListMutation,
    useViewOrdersMutation,
    useLoadOrdersMutation,
    useLoadOrdersLogMutation,
    useWhatsAppLogMutation,
    useWeeklyMenuReportMutation,
    useWeeklyCafeReportMutation
} = OrderManagement
