export interface DataWithPagination<T> {
  current_page: string
  last_page: number
  per_page: string
  total: number
  promotions?: any
  data?: Array<T>
}

export interface HttpListResponse<T> {
  code: number
  message: any
  data: DataWithPagination<T>
  total: any
  per_page: any
  payload?: any
  success: boolean
  current_page: number
  last_page: number
}

export interface HttpResponse<T> {
  code: number
  message: any
  data: T
  success: boolean
}

export interface PagePerPageRequest {
  page?: number | string
  per_page_record?: number
}
