import { RequestType } from '../http/Http'
import { HttpResponse } from './typeResponse'

// Login Api Types
export interface LoginApiArgs extends RequestType {
  success?: (e?: LoginApiResponse) => void
}

export type LoginApiResponse = HttpResponse<UserData>

// User data
export interface UserData {
  id?: number
  name?: string
  email?: string
  parent_key?: any
  parentLogin?: boolean
  childLogin?: boolean
  auth_id?: any
  is_parent?: any
  email_verified_at?: string
  role_id?: any
  mobile_number?: string
  address?: string
  designation?: string
  role?: any
  status?: number | string
  created_at?: string
  updated_at?: string
  deleted_at?: string
  access_token?: string
  roles?: any
  role_name?: string
  permissions?: PermissionsEntity[] | string[]
}

///Projects List
export interface ProjectsParam {
  id?: number
  project_code?: string
  status_code?: string
  project_name?: string
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}
///Pred List
export interface predListParam {
  created_at?: string
  deleted_at?: string
  id?: number
  lag_hr_cnt?: any
  pred_proj_id?: any
  pred_task_id?: any
  pred_type?: string
  predtask_projwbs_wbs_full_name?: string
  predtask_rsrc_id?: string
  predtask_status_code?: string
  predtask_task_name?: string
  proj_id?: string
  task_id?: string
  task_projwbs_wbs_full_name?: string
  task_rsrc_id?: string
  task_status_code?: string
  task_task_name?: string
  updated_at?: string
}
///RSc List

export interface rscListParams {
  created_at?: string
  deleted_at?: string
  id?: number
  rsrc_name?: string
  rsrc_short_name?: string
  rsrc_title_name?: string
  updated_at?: string
}

///Task RSRC List
export interface TaskRSRCList {
  acct_id?: string
  created_at?: string
  deleted_at?: string
  end_date?: string
  id?: number
  role_id?: string
  rsrc_id?: string
  rsrc_type?: string
  start_date?: string
  task_id?: string
  task_status_code?: string
  updated_at?: string
}
// Task List

export interface TaskListParams {
  id?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string
  end_date?: string
  resource_list?: any
  start_date?: string
  status_code?: string
  task_code?: string
  task_name?: string
  wbs_id?: string
}
export interface PermissionsEntity {
  id?: number
  action?: string
  subject?: string
  se_name?: string
  data?: any
  pivot?: Pivot
}

export interface Password {
  old_password?: string
  password?: string
}

export interface Role {
  id?: number
  name?: string
  group_name?: string
  se_name?: string
  is_default?: number
  created_at?: string
  updated_at?: string
  permissions?: Permission[] | null
}

export interface Permission {
  id?: number
  name?: string
  guard_name?: string
  created_at?: string
  updated_at?: string
  se_name?: string
  group_name: string
  data?: any
  description?: any
  belongs_to?: number
  pivot?: Pivot
}

export interface Pivot {
  role_id?: number
  permission_id?: number
}
