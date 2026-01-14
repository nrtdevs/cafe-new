import ApiEndpoints from "@src/utility/http/ApiEndpoints"
import http from "@src/utility/http/useHttp"

interface dataTypes {
  async?: boolean
  jsonData?: any

  id?: string | number | null
  page?: string | number
  perPage?: string | number
  dispatch?: (e: any) => void
  success?: (e: any) => void
  loading?: (e: boolean) => void
}

export const PurchaseSample = async ({
  async = false,
  jsonData,
  loading,
  page,
  perPage,
  dispatch = () => {},
  success = () => {}
}: dataTypes) => {
  return http.request({
    async,
    method: 'post',
    path: ApiEndpoints.purchase_export,
    jsonData,
    loading,
    params: { page, per_page_record: perPage },
    success: (e: any) => {
      success(e)
    },
    error: () => {
      /** ErrorToast("data-fetch-failed") **/
    }
  })
}


export const employeeHandoverExport = async ({
  async = false,
  jsonData,
  loading,
  page,
  perPage,
  dispatch = () => {},
  success = () => {}
}: dataTypes) => {
  return http.request({
    async,
    method: 'post',
    path: ApiEndpoints.employeeHandoverExport,
    jsonData,
    loading,
    params: { page, per_page_record: perPage },
    success: (e: any) => {
      success(e)
    },
    error: () => {
      /** ErrorToast("data-fetch-failed") **/
    }
  })
}