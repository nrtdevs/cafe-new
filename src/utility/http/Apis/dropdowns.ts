import { log } from '@src/utility/Utils'
import http from '../useHttp'

export interface dataTypes {
  async?: boolean
  jsonData?: any
  path?: any
  id?: string | number
  method?: string
  
  page?: string | number
  perPage?: string | number
  dispatch?: (e: any) => void
  success?: (e: any) => void
  loading?: (e: boolean) => void
}
export const loadDropdown = async ({
  async = false,
  jsonData,
  loading,
  page,
  perPage,
  path,
  method = 'post',
  success = () => {}
}: dataTypes) => {
  return http.request({
    async,
    method,
    path,
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
