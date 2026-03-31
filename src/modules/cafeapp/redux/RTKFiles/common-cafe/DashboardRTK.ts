import { createApi } from '@reduxjs/toolkit/query/react'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { axiosBaseQuery } from '@src/utility/http/Http'
import { Meeting } from '@src/utility/types/typeMeeting'
import { HttpListResponse, HttpResponse, PagePerPageRequest } from '@src/utility/types/typeResponse'

interface RequestType extends PagePerPageRequest {
    jsonData?: any
}
interface ResponseType extends HttpResponse<Meeting> {
    someExtra: any
    payload?: any
}

interface ResponseListType extends HttpListResponse<Meeting> {
    someExtra: any
    payload?: any
}

interface RequestTypeAction {
    eventId: string
    ids: number[]
    action: string
}
export const DasboardManagement = createApi({
    reducerPath: 'DasboardManagement',
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        loadDashboardgraph: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboardGraph
            })
        }),
        loadDashboardToday: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboard
            })
        }),
        loadDashboardtable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboard_table
            })
        }),
        loadDashboardWastedTable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboard_table_list
            })
        }),
        loadDashboardOrderTimeTable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.dashboard_table
            })
        }),
        loadDashboardTimeTable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.orderTimeReport
            })
        }),
        loadEmployeeStockTable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.employeeStockReport
            })
        }),
        loadExportOrderData: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.exportOrder
            })
        }),
        loadMenuReportTable: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.menuWiseReport
            })
        }),
        loadExportMenuOrderData: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.export_menuwise_report
            })
        }),
        loadEmployeeRecoveryData: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,
                params: { page: args?.page, per_page_record: args.per_page_record },
                method: 'post',
                path: ApiEndpoints.employeeRecovery
            })
        }),
        loadMenuWiseLiveReport: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,

                method: 'post',
                path: ApiEndpoints.menuWiseMonitoringReport
            })
        }),
        loadExportMenuWiseLiveReport: builder.mutation<ResponseListType, RequestType>({
            query: (args) => ({
                jsonData: args?.jsonData,

                method: 'post',
                path: ApiEndpoints.export_menuWise_Report
            })
        }),
    })
})
export const {
    useLoadDashboardgraphMutation,
    useLoadDashboardTodayMutation,
    useLoadDashboardtableMutation,
    useLoadDashboardWastedTableMutation,
    useLoadExportOrderDataMutation,
    useLoadDashboardOrderTimeTableMutation,
    useLoadDashboardTimeTableMutation,
    useLoadEmployeeStockTableMutation,
    useLoadMenuReportTableMutation,
    useLoadExportMenuOrderDataMutation,
    useLoadEmployeeRecoveryDataMutation,
    useLoadMenuWiseLiveReportMutation,
    useLoadExportMenuWiseLiveReportMutation
} = DasboardManagement
