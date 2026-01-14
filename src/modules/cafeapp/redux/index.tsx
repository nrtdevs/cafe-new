// ** Reducers Imports
import { CafeManagement } from './RTKFiles/cafe-admin/cafeadminRTK'
import { CafeSubcriptionManagement } from './RTKFiles/cafe-admin/cafesub'
import { PullDataManagement } from './RTKFiles/cafe-admin/pulldata'
import { CafeOpeningManagement } from './RTKFiles/cafe/CafeOpeningStock'
import { CustomerAccountManagement } from './RTKFiles/cafe/CustomerAccountRTK'
import { CustomerManagement } from './RTKFiles/cafe/CustomersRTK'
import { ExpenseManagement } from './RTKFiles/cafe/ExpenseRTK'
import { InventoryManagement } from './RTKFiles/cafe/InventoryRTK'
import { MenuManagement } from './RTKFiles/cafe/MenusRTK'
import { OrderManagement } from './RTKFiles/cafe/OrderRTK'
import { ProductManagement } from './RTKFiles/cafe/ProductsRTK'
import { RoleManagement } from './RTKFiles/cafe/RoleRTK'
import { StockManagement } from './RTKFiles/cafe/StockManagementRTK'
import { SubCafeManagement } from './RTKFiles/cafe/SubCafe'
import { CategoryManagement } from './RTKFiles/cafe/categoryRTK'
import { PaymentQrManagement } from './RTKFiles/cafe/qrpaymentRtk'
import { CafeChildlogin } from './RTKFiles/common-cafe/AuthRTK'
import { DasboardManagement } from './RTKFiles/common-cafe/DashboardRTK'
import { EmpAttanceManagement } from './RTKFiles/common-cafe/EmployeeAttendanceRTK'
import { EmpLeaveManagement } from './RTKFiles/common-cafe/EmployeeLeaveRTK'
import { EmployeeManagement } from './RTKFiles/common-cafe/EmployeeRTK'
import { SalaryManagement } from './RTKFiles/common-cafe/SalaryMgmtRTK'
import { UnitManagement } from './RTKFiles/common-cafe/UnitsRTK'
import { WarehouseManagement } from './RTKFiles/cafe/WarehouseRTK'
import { WarehouseCategoryManagement } from './RTKFiles/cafe/WarehouseCategoryRTK'
import { BrandManagement } from './RTKFiles/cafe/BrandRTK'
import { WarehouseItemManagement } from './RTKFiles/cafe/WarehouseItemRTK'
import { PurchaseItemManagement } from './RTKFiles/cafe/PurchaseItemRTK'
import { ItemTransferRTKManagement } from './RTKFiles/cafe/ItemTransferRTK'
import { CashHandoverManagement } from './RTKFiles/cafe/cashHandoverRTK'

const CafeReducers = {
  // RTK
  [CafeManagement.reducerPath]: CafeManagement.reducer,
  [CategoryManagement.reducerPath]: CategoryManagement.reducer,
  [ProductManagement.reducerPath]: ProductManagement.reducer,
  [UnitManagement.reducerPath]: UnitManagement.reducer,
  [StockManagement.reducerPath]: StockManagement.reducer,
  [SubCafeManagement.reducerPath]: SubCafeManagement.reducer,
  [RoleManagement.reducerPath]: RoleManagement.reducer,
  [WarehouseCategoryManagement.reducerPath]: WarehouseCategoryManagement.reducer,
  [MenuManagement.reducerPath]: MenuManagement.reducer,
  [CustomerManagement.reducerPath]: CustomerManagement.reducer,
  [CustomerAccountManagement.reducerPath]: CustomerAccountManagement.reducer,
  [ExpenseManagement.reducerPath]: ExpenseManagement.reducer,
  [OrderManagement.reducerPath]: OrderManagement.reducer,
  [EmployeeManagement.reducerPath]: EmployeeManagement.reducer,
  [EmpLeaveManagement.reducerPath]: EmpLeaveManagement.reducer,
  [EmpAttanceManagement.reducerPath]: EmpAttanceManagement.reducer,
  [SalaryManagement.reducerPath]: SalaryManagement.reducer,
  [CafeChildlogin.reducerPath]: CafeChildlogin.reducer,
  [DasboardManagement.reducerPath]: DasboardManagement.reducer,
  [PaymentQrManagement.reducerPath]: PaymentQrManagement.reducer,
  [CafeSubcriptionManagement.reducerPath]: CafeSubcriptionManagement.reducer,
  [InventoryManagement.reducerPath]: InventoryManagement.reducer,
  [CafeOpeningManagement.reducerPath]: CafeOpeningManagement.reducer,
  [PullDataManagement.reducerPath]: PullDataManagement.reducer,
  [WarehouseManagement.reducerPath]: WarehouseManagement.reducer,
  [BrandManagement.reducerPath]: BrandManagement.reducer,
  [WarehouseItemManagement.reducerPath]: WarehouseItemManagement.reducer,
  [PurchaseItemManagement.reducerPath]: PurchaseItemManagement.reducer,
  [ItemTransferRTKManagement.reducerPath]: ItemTransferRTKManagement.reducer,
  [CashHandoverManagement.reducerPath]: CashHandoverManagement.reducer
}
const cafeMiddleware = [
  CafeManagement.middleware,
  CategoryManagement.middleware,
  ProductManagement.middleware,
  WarehouseCategoryManagement.middleware,
  UnitManagement.middleware,
  StockManagement.middleware,
  MenuManagement.middleware,
  CustomerManagement.middleware,
  CustomerAccountManagement.middleware,
  RoleManagement.middleware,
  ExpenseManagement.middleware,
  OrderManagement.middleware,
  EmployeeManagement.middleware,
  EmpLeaveManagement.middleware,
  EmpAttanceManagement.middleware,
  SalaryManagement.middleware,
  CafeChildlogin.middleware,
  DasboardManagement.middleware,
  PaymentQrManagement.middleware,
  CafeSubcriptionManagement.middleware,
  InventoryManagement.middleware,
  CafeOpeningManagement.middleware,
  SubCafeManagement.middleware,
  PullDataManagement.middleware,
  WarehouseManagement.middleware,
  BrandManagement.middleware,
  WarehouseItemManagement.middleware,
  PurchaseItemManagement.middleware,
  ItemTransferRTKManagement.middleware,
  CashHandoverManagement.middleware
]

export { CafeReducers, cafeMiddleware }
