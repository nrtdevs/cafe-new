export interface DropdownProps {
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
