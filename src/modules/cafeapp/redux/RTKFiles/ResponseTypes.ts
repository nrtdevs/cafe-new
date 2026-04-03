export interface cafeResponseTypes {
  id?: number
  name?: string
  email?: string
  password?: string
  mobile?: string | any
  address?: string
  no_of_subcafe?: number

  gst_no?: any
  website?: string
  status?: string | any
  profile_image_path?: any
  contact_person_name?: string | any
  contact_person_email?: string
  contact_person_phone?: string | any
  subscription_status?: string | any
  created_at?: string
  updated_at?: string
  deleted_at?: string
  qr_codes?: any
}

export interface loginResponseTypes {
  id?: number
  email?: string
  password?: string
  entry_mode?: string
  created_at?: string
  updated_at?: string
}

export interface recipesResponseTypes {
  menu_id?: string | any
  product_id?: string | any
  is_reusable?: string | any
}
export interface orderStatusUpdateResponseTypes {
  id?: number
  order_id?: string | any
  order_status?: string
  recipes?: recipesResponseTypes[] | any
  online_amount?: number
  cash_amount?: number
  udhaar_amount?: number
  payment_received?: number
  payable_amount?: number
}

export interface changePasswordResponseTypes {
  id?: number
  old_password?: string
  password?: string
}

export interface employeeResponseTypes {
  id?: number
  uuid?: string
  cafe_id?: string
  parent_id?: string
  is_parent?: string
  name?: string
  email?: string
  password?: string
  role?: any
  subscription_status?: string
  profile_image_path?: any
  email_verified_at?: string
  role_id?: number | any
  mobile?: string
  designation?: string
  document_type?: string | any
  document_number?: string
  address?: string
  joining_date?: string | any
  birth_date?: string | any
  gender?: string | any
  salary?: string
  salary_balance?: string
  image?: string
  account_balance?: string
  created_at?: string
  updated_at?: string
  employee?: any
  year_month?: any
  attendence?: any
}

///unit response types
export interface unitResponseTypes {
  id?: number
  name?: string
  minvalue?: string
  abbreiation?: string
  is_parent?: any
  parent?: any
  parent_unit_value?: any
  created_at?: string
  updated_at?: string
}

//salary response types
export interface salaryResponseTypes {
  id?: number
  from_date?: string | any
  end_date?: string | any
  date?: string | any
  employee?: any
  employee_id?: string | any
  previous_balance: string | any
  new_balance?: string | any
  paid_amount?: number | any
  remarks?: string | any
  created_at?: string
  updated_at?: string
}
export interface salaryupdateResponseType {
  id?: number
  employee?: any
  paid_amount?: number | any
  employee_id?: string | any
  date?: string | any
  remarks?: string | any
}

//CafeAmountReceived response types

export interface ReceivedResponseTypes {
  id?: number
  cafe_id?: number | any
  cafe?: any
  subscription?: string | any
  subscription_id?: number | any
  amount_recieved?: number | any
  recieved_by?: string | any
  created_at?: string
  updated_at?: string
}

//employeeAttendance response types
export interface employeeAttendanceResponseTypes {
  id?: number | any
  date?: string | any
  from_date?: string | any
  end_date?: string | any
  employee?: any
  search?: string | any
  employee_attendence?: any
  employee_id?: string | any
  attendences?: any
  attendence?: string | any
  created_at?: string
  updated_at?: string
  name?: string
}

//employeeLeave response types
export interface employeeLeaveResponseTypes {
  id?: number
  cafe_id?: string
  employee_id?: string | any
  year_month?: string | any
  search?: string | any
  employee?: any
  name?: string | any
  month?: string | any
  year?: string | any
  no_of_leaves?: number | any
  date?: any
  leaves?: any
  created_at?: string
  updated_at?: string
}

//category response types
export interface categoryResponseTypes {
  id?: number
  cafe_id?: any
  name?: string
  image?: string
  created_at?: string
  updated_at?: string
  tax?: string
}

//products response types
export interface productsResponseTypes {
  id?: number
  cafe_id?: string
  unit_id?: any
  name?: string
  brand?: any
  packsize?: any
  description?: string
  menu_category_id?: any
  category?: any
  subcategory?: any
  image_path?: string | any
  current_quanitity?: number | any
  alert_quanitity?: number | any
  status?: string
  menu_price?: any
  create_menu?: boolean
  category_id?: any
  subcategory_id?: any
  quantity?: number
  price?: any
  priority_rank?: any
  order_duration?: any
  created_at?: string
  updated_at?: string
  deleted_at?: string
  unit_name?: string

  unit?: any
}

export interface RoleResponseTypes {
  id?: number
  name?: string
  group_name?: string
  se_name?: string
  is_default?: number
  created_at?: string
  updated_at?: string
  permissions?: any
}

//menus response types
export interface menusResponseTypes {
  id?: number | any
  map?: any
  discount?: number | any
  is_monitoring?: any
  payable_discount_amount?: any
  recipes_count?: number | any
  recipes_without_product?: any
  cafe_id?: string
  category_id?: number | any
  unit_id?: string | any
  name?: string
  description?: string
  create_menu?: any
  image_path?: string
  order_duration?: number | any
  priority_rank?: string | number
  quantity?: number | any
  price?: number | any
  created_at?: string
  updated_at?: string
  deleted_at?: string
  category?: any
  status?: any
  is_reusable?: string | any
  recipes?: any
  unit?: string | any
  items?: any
  requested_products?: any
  warehouse?: any
  demand_date?: any
  demand_by?: any
  cafe?: any
  warehouse_id?: any


}

export interface cancelOrderResponseTypes {
  id?: number | any
  order_id?: number | any
  order?: any

  cancel_reason?: string | any
  created_at?: string
  updated_at?: string
  recipes?: menusResponseTypes | any
  cash_amount?: number | any
  from_date?: any
  online_amount?: number | any
  udhaar_amount?: number | any
  payment_received?: number | any
}

//stockManagement response types
export interface stockManagementResponseTypes {
  id?: number
  product_id?: string | any
  unit_id?: any
  quantity?: number | any
  stock_operation?: any
  resource?: any
  unit?: any
  pack_size_id?: any
  shop_name?: string
  category?: any

  brand?: any
  brand_id?: any
  subcategory?: any
  packsize?: any
  bill_no?: any
  address?: string
  purchase_by?: string
  category_id?: any
  recieved_by?: any
  date?: any
  price?: any
  subcategory_id?: any
  product?: any
  old_price?: any
  comment?: any
  old_quantity?: any
  transfer_cafe_id?: any
  order_id?: any
  current_quanitity?: any
  created_at?: string
  updated_at?: string
  transfer_info?: any
}
export interface stockResponseTypes {
  id?: number
  product_id?: string | any
  unit_id?: string | any
  quantity?: number | any
  stock_operation?: string | any
  resource?: string | any
  unit?: any
  product?: any
}
//expense response types
export interface expenseResponseTypes {
  id?: number | any
  item?: string
  description?: string
  expense_date?: string | any
  total_expense?: number | any
  cafe_id?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

//orderContains response types
export interface orderContainsResponseTypes {
  id?: number | any
  menu_detail?: menusResponseTypes
  menu_id?: number | any
  buy_quantity?: number | any
  discount_amount?: number | any
  quantity?: number | any
  price?: number | any
  sub_total?: number | any
  instructions?: string | any
  order_duration?: number | any
  preparation_duration?: number | any
  category?: any
  discount?: number | any
  tax?: any
  menu?: any
  is_discount?: Boolean
  total?: number | any
  payable_amount?: any
}
export interface orderResponseTypes {
  id?: number | any
  search?: string | any
  customer?: any
  status?: any
  order?: any
  wa_status?: any
  message?: any
  contact_number?: any
  send_invoice_to_whats_app?: any
  employee?: any
  wa_id?: any
  template?: any
  sender?: any
  receiver?: any
  discount_amount?: number
  cash_amount?: number | any
  online_amount?: number | any
  sub_cafe_id?: number | any
  discount?: number
  customer_id?: number | any
  table_number?: number | any
  order_number?: any
  cafe_id?: any
  order_status?: number | any
  order_type?: number | any
  total_quantity?: number | any
  total_amount?: number | any
  tax_amount?: number | any
  cancel_reason?: string | any
  payable_amount?: number | any
  payment_mode?: number | any
  order_duration?: number | any
  created_at?: string
  start_date?: any
  updated_at?: string

  end_date?: any
  tax?: any
  order_details?: orderContainsResponseTypes[] | any
  udhaar_amount?: number | any
  payment_received?: number | any
}
//customer response types
export interface customerResponseTypes {
  id?: number | any
  name?: string
  address?: string
  gender?: string | any
  account_balance?: string
  email?: string
  mobile?: string
  created_at?: string
  updated_at?: string
}
//customerAccount response types
export interface customerAccountResponseTypes {
  id?: number
  cafe_id?: number | any
  customer_id?: number | any
  from_date?: any
  end_date?: any
  previous_balance?: number | any
  sale?: number | any
  payment_received?: number | any
  new_balance?: number | any
  mode_of_transaction?: string | any
  created_at?: string
  updated_at?: string
  customer?: any
}

export interface GraphReportListResponseTypes {
  id?: number
  request_for?: any
  end_date?: any
  start_date?: any
  menu_id?: number | any
  sale_amount?: any
  sale_online?: any
  sale_offline?: any
  order_completed?: any
  order_pending?: any
  order_confirmed?: any
  order_canceled?: any
  present_employees_count?: any
  half_day_employees_count?: any
  absent_employees_count?: any
  category_id?: any
  expense_amount?: any
  employee_id?: any
  cafe_id: number | any
  sub_cafe_id?: any
}
//qy payment type
export interface QrResponseTypes {
  id?: number
  qr_code_image_path?: any
  created_at?: string
  updated_at?: string
}
//Cafe subcription response types
export interface cafeSubResponseTypes {
  id?: number | any
  cafe_id?: any
  subscription_type?: any
  subscription_start_date?: any
  subscription_end_date?: string | any
  cafe?: any
  subscription_charge?: any
  subscription_status?: any
  created_at?: string
  updated_at?: string
}

// table list-report
export interface tableReportListResponseTypes {
  id?: number
  request_for?: any
  end_date?: any
  start_date?: any
  menu_id?: number | any
  is_overall_report?: any
  sale_amount?: any
  cafe_ids1?: any
  sale_online?: any
  sale_offline?: any
  cafe_id2?: any
  total_sale_quantity?: any
  order_completed?: any
  order_pending?: any
  order_confirmed?: any
  sub_cafe_ids1?: any
  sub_cafe_id?: any
  order_canceled?: any
  sub_cafe_ids?: any
  present_employees_count?: any
  half_day_employees_count?: any
  absent_employees_count?: any
  expense_amount?: any
  employee_id?: any
  cafe_id?: number | any
  date?: any
  sale_udhari?: any
  category_id?: any
  product_id?: any
  with_wasted?: any
  without_wasted?: any
  request_fors?: any
  end_dates?: any
  start_dates?: any
  menu_ids?: number | any
  category_ids?: any
  cafe_ids?: number | any
  request_forss?: any
  start_datetime?: any
  end_datetime?: any
  start_datess?: any
  end_datess?: any
  request_fors_ss?: any
  category_id_ss?: any
  menu_id_ss?: any
  sub_cafe_id2?: any
}

//menu wise sales report
interface SalesSummary {
  menu_id: number;
  menu_name: string;
  total_quantity_sold: number;
  total_sales_amount: number;
  total_tax: number;
  total_discount: number;
  completed_orders: number;
  sale_date: string;
}


//   today report-list
export interface todayReportListResponseTypes {
  id?: number
  todays_sale_amount?: number
  todays_sale_online?: number
  todays_sale_offline?: number
  todays_sale_udhari?: number
  todays_order_completed?: number
  todays_order_pending?: number
  todays_order_confirmed?: number
  todays_order_canceled?: number
  todays_present_employees_count?: number
  todays_half_day_employees_count?: number
  todays_absent_employees_count?: number
  totalEmployee?: number
  total_expense?: number
}

//manage wasted type
export interface wastedResponseTypes {
  cafe_id?: any
  id?: number
  menu_id?: any
  product_id?: any
  unit_id?: any
  create_menu?: any
  unit?: any
  quantity?: number
  date?: any
  image?: any
  product?: any
  menu?: any
  reason?: string
  created_at?: string
  updated_at?: string
}

//cafe opening stock
export interface cafeOpeningResponseType {
  cafe_id?: any
  cafe?: any
  id?: number
  item_name?: string
  quantity?: number
  price?: number
  shop_name?: string
  date?: string
  bill_no?: string
  unit_id?: any
  unit?: any
  address?: string
  purchase_by?: string
  recieved_by?: any
  created_at?: string
  updated_at?: string
}

export interface pullData {
  id?: number
  type?: any
  category_ids?: any
  menu_ids?: any
  product_ids?: any
}

export interface Purchase {
  id: number
  cafe_id: number
  product?: any
  auth_id: number
  date?: string
  documents?: any
  contact_number?: any
  shop_name?: string
  item_id: number
  brand_id: number
  category_id: number
  subcategory_id: number
  unit_id: number
  pack_size_id: number
  quantity: number | null
  price: string
  total_amount: number | null
  created_by: number | null
  purchase_date: string
  rate: number | null
  shop: string | null
  payment_mode: string | null
  person: string | null
  status: number
  created_at: string
  updated_at: string
  deleted_at: string | null

  item: Item
  unit: Unit | null
  brand: Brand
  category: Category
  subcategory: Subcategory
  packsize: PackSize
}

// Interface for individual item
export interface HandoverItem {
  product_id: any;
  category_id: any;
  subcategory_id: any;
  unit_id: any;
  in_stock: any;
  out_stock: any;
  remaining_stock: any;
  current_stock: any;
  comment: string;
}

// Interface for overall handover data
export interface HandoverData {
  handover_employee_id: any;
  handover_date: string;
  items: HandoverItem[];
}

export interface WarehouseItemType {
  id: number
  cafe_id: number | undefined | null
  name: string
  stock: any
  unit?: any
  unit_id?: any
  unit_name?: any
  last_average_price?: any
  brand?: any
  packsize?: any
  price?: number
  alert_quanitity?: number
  current_quanitity?: number



  category_id: number
  subcategory_id: number

  created_at: string
  updated_at: string
  deleted_at: string | null

  category: Category
  subcategory: Subcategory

}

export interface Item {
  id: number
  cafe_id: number
  auth_id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface Brand {
  id: number
  cafe_id: number
  auth_id: number
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  cafe_id: number
  auth_id: number
  is_parent: number | null
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: number
  cafe_id: number
  auth_id: number
  is_parent: number | null
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface PackSize {
  id: number
  cafe_id: number | null
  auth_id: number | null
  name: string
  status: number
  created_at: string
  updated_at: string
}

export interface Unit {
  id: number
  name: string
  // Add other fields if you have them for unit
}

//transfer item
export interface TransferItem {
  unit_id: string;
  item_id: string;
  quantity: number;
  rate: number;
}

export interface itemTransferType {
  id?: number | any
  transfer_to_cafe: any;
  item?: any
  product?: any
  unit?: any
  brand?: any
  packsize?: any
  category?: any
  transfer_info?: any
  delivery_person?: string
  date?: string
  price?: number
  final_average_price?: any
  rate?: any
  sub_category?: any
  quantity?: number
  subcategory?: any
  created_at?: string
  updated_at?: string
  deleted_at?: string
  transfer_date: string;
  items: TransferItem[];
}


export interface Cafe {
  id: number;
  cafe_id: number;
  email: string;
  name: string
  mobile: number;
  profile_image_path: string | null;
  contact_person_email: string;
  contact_person_name: string;
  contact_person_phone: string;
  address: string;
  payment_qr_codes: any[]; // replace `any` if you know the structure
}

export interface CafeSaleSummary {
  id: number;
  cafe_id: number;
  auth_id: number | null;
  total_sale_amount: string;
  total_sale_quantity: number;
  week_start: string; // ISO date string format
  week_end: string;
  created_at: string;
  updated_at: string;
  cafe: Cafe;
}

export interface Cafe {
  id: number;
  cafe_id: number;
  name: string;
  email: string;
  mobile: number;
  profile_image_path: string | null;
  contact_person_email: string;
  contact_person_name: string;
  contact_person_phone: string;
  address: string;
  payment_qr_codes: any[]; // can be replaced with a proper type if structure is known
}

export interface CafeSaleSummary {
  id: number;
  menu_id: number;
  cafe_id: number;
  auth_id: number | null;
  total_sale_amount: string;
  total_sale_quantity: number;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
  cafe: Cafe;
  menu: any | null; // replace `any` with proper Menu type if you know the structure
}



//mismatch type 
export interface StockItem {
  id: number;
  warehouse_id: number;
  cafe_id: number;
  auth_id: number;
  stock_recieved_id: number;
  sent_quantity: string;
  recieved_quantity: string;
  comment: string;
  delivery_person: string;
  warehouse_remarks: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  warehouse: Warehouse;
  cafe: Cafe;
  item?: any;

  quantity?: any;
  stock_received: StockReceived;
}

export interface Warehouse {
  id: number;
  name: string;
  email: string;
}

export interface Cafe {
  id: number;
  name: string;
  email: string;
}

export interface StockReceived {
  id: number;
  product_id: number;
  quantity: number;
  recieved_quantity: number;
  product: Product;
  date: string
  unit?: any
}

export interface Product {
  id: number;
  name: string;
}




