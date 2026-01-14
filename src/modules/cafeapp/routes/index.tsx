import { Permissions } from '@src/utility/Permissions'
import { lazy } from 'react'
// import ItemTransfer from '../views/cafe/warehouse/itemtransfer'

const RscList = lazy(() => import('@src/modules/cafeapp/views/users/RSCLIst'))
const TaskRSCRList = lazy(() => import('@src/modules/cafeapp/views/users/TaskRsrcList'))
const TaskList = lazy(() => import('@src/modules/cafeapp/views/users/TaskList'))
const TaskPredList = lazy(() => import('@src/modules/cafeapp/views/users/TaskPredList'))
const ProjectCost = lazy(() => import('@src/modules/cafeapp/views/users/ProjectCost'))
const Dashboard = lazy(() => import('@modules/cafeapp/views/Dashboard'))
const Cafe = lazy(() => import('@src/modules/cafeapp/views/cafe'))
const Warehouse = lazy(() => import('@src/modules/cafeapp/views/cafe/warehouse'))
const WarehouseCategory = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/warehouse-category')
)
const Brand = lazy(() => import('@src/modules/cafeapp/views/cafe/warehouse/brands'))
const Item = lazy(() => import('@src/modules/cafeapp/views/cafe/warehouse/items'))
const PurchaseItem = lazy(() => import('@src/modules/cafeapp/views/cafe/warehouse/purchase-item'))
const CreatePurchase = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/purchase-item/CreatePurchase')
)

const CreateEmployeeHandover = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/employee-handover/CreateEmployeeHandover')
)
const ReceivingEmployeeHandover = lazy(
  () =>
    import('@src/modules/cafeapp/views/cafe/warehouse/employee-handover/EmployeeHandoverReceiving')
)
const EmployeeHandoverReceiving = lazy(
  () =>
    import('@src/modules/cafeapp/views/cafe/warehouse/employee-handover/EmployeeReceivingHandover')
)
const EmployeeHandover = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/employee-handover')
)
const WarehouseSubCategory = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/warehouse-category/WarehouseSubCategory')
)
const ItemTransfer = lazy(() => import('@src/modules/cafeapp/views/cafe/warehouse/itemtransfer'))
const CreateItemTransfer = lazy(
  () => import('@src/modules/cafeapp/views/cafe/warehouse/itemtransfer/CreateTransferItem')
)

const Employee = lazy(() => import('@src/modules/cafeapp/views/commons/Employee'))
const Salary = lazy(() => import('@src/modules/cafeapp/views/commons/SalaryManagement'))
const EmpAttendance = lazy(
  () => import('@src/modules/cafeapp/views/commons/Employee/EmpAttendance')
)
//Customer
const Customer = lazy(() => import('@src/modules/cafeapp/views/cafe/Customer'))
const CustomerAccount = lazy(
  () => import('@src/modules/cafeapp/views/cafe/Customer/CustomerAccount')
)
const Expense = lazy(() => import('@src/modules/cafeapp/views/cafe/Expense'))
const Menus = lazy(() => import('@src/modules/cafeapp/views/cafe/Menus'))
const DemandProduct=lazy(()=>import('@src/modules/cafeapp/views/cafe/demand-product'))
const Orders = lazy(() => import('@src/modules/cafeapp/views/cafe/Order'))
const EmployeeLeave = lazy(() => import('@src/modules/cafeapp/views/commons/Employee/EmpLeave'))
const Category = lazy(() => import('@src/modules/cafeapp/views/cafe/categories'))
const Product = lazy(() => import('@src/modules/cafeapp/views/cafe/products'))
const Unit = lazy(() => import('@src/modules/cafeapp/views/commons/units'))
const StockManage = lazy(() => import('@src/modules/cafeapp/views/stockmanage'))
const StockReceiving = lazy(() => import('@src/modules/cafeapp/views/stockmanage/StockReceiving'))
const Report = lazy(() => import('@src/modules/cafeapp/views/Report'))
const WarehouseReport = lazy(() => import('@src/modules/cafeapp/views/Report/WareHouseStockReport'))
const QrCodePayment = lazy(() => import('@src/modules/cafeapp/views/cafe/qrcodepayment'))
const CafeSubcription = lazy(() => import('@src/modules/cafeapp/views/cafe/CafeSubcription'))
const Projects = lazy(() => import('@src/modules/cafeapp/views/Projects'))
const CafeSubcriptionRecieve = lazy(() => import('@src/modules/cafeapp/views/cafe/cafereciving'))
const InventoryStock = lazy(() => import('@src/modules/cafeapp/views/cafe/inventory'))
const CafeOpeningStock = lazy(() => import('@src/modules/cafeapp/views/cafe/cafeopentingstock'))
const StockManageLog = lazy(() => import('@src/modules/cafeapp/views/cafe/stockmangelog'))
const OrderTableReport = lazy(() => import('@src/modules/cafeapp/views/Report/TableListReport'))
const SubCafe = lazy(() => import('@src/modules/cafeapp/views/cafe/subcafe'))
const PullData = lazy(() => import('@src/modules/cafeapp/views/cafe/pulldata'))
const StockTransfer = lazy(() => import('@src/modules/cafeapp/views/cafe/stock-transfer'))
const Role = lazy(() => import('@src/modules/cafeapp/views/cafe/caferole'))
const EmployeeStockReport = lazy(
  () => import('@src/modules/cafeapp/views/Report/EmployeeStockReport')
)
const MenuWiseReport = lazy(() => import('@src/modules/cafeapp/views/Report/MenuWiseReport'))
const OrderLog = lazy(() => import('@src/modules/cafeapp/views/cafe/order-log'))
const OrderHistory = lazy(() => import('@src/modules/cafeapp/views/cafe/order-history'))
const WhatsAppHistory = lazy(() => import('@src/modules/cafeapp/views/cafe/whats-app-history'))
const MenuWiseSaleReport = lazy(() => import('@src/modules/cafeapp/views/Report/WeekWiseMenuSales'))
const CafeWiseSaleReport = lazy(() => import('@src/modules/cafeapp/views/Report/WeekWiseCafeSales'))
const CafeSetting = lazy(() => import('@src/modules/cafeapp/views/cafe/CafeSetting'))
const OrderSaleReport = lazy(() => import('@src/modules/cafeapp/views/Report/OrderSaleReport'))
const MenuLiveReport = lazy(() => import('@src/modules/cafeapp/views/Report/MenuLiveReport'))
const QuantityMismatch=lazy(()=>import('@src/modules/cafeapp/views/cafe/qunatity-mismatch-list'))

const DprRoutes = [
  {
    element: <InventoryStock />,
    path: '/manage-wastage',
    name: 'inventory',
    meta: {
      ...Permissions.wastedBrowse
    }
  },
  {
    element: <SubCafe />,
    path: '/sub-cafe',
    name: 'sub-cafe',
    meta: {
      ...Permissions.subCafeBrowse
    }
  },
  {
    element: <Warehouse />,
    path: '/warehouse',
    name: 'warehouses',
    meta: {
      ...Permissions.warehouseBrowse
    }
  },

  {
    element: <WarehouseCategory />,
    path: '/warehouse-category',
    name: 'warehouse-category',
    meta: {
      ...Permissions.catsubcatBrowse
    }
  },
  {
    element: <ItemTransfer />,
    path: '/item-transfer',
    name: 'item-transfers',
    meta: {
      ...Permissions.itemTransferRead
    }
  },
  {
    element: <CreateItemTransfer />,
    path: '/item-create/:id',
    name: 'item-transfer-create',
    meta: {
      ...Permissions.itemTransferCreate
    }
  },
  
    {
    element: <CreateItemTransfer />,
    path: '/item-transfer-create',
    name: 'item-transfers-create',
    meta: {
      ...Permissions.itemTransferCreate
    }
  },
  {
    element: <WarehouseSubCategory />,
    path: '/warehouse-subcategory/:id',
    name: 'warehouse-subcategory',
    meta: {
      ...Permissions.catsubcatBrowse
    }
  },
  {
    element: <Brand />,
    path: '/brand',
    name: 'brands',
    meta: {
      ...Permissions.brandBrowse
    }
  },
  {
    element: <Item />,
    path: '/item',
    name: 'items',
    meta: {
      ...Permissions.itemBrowse
    }
  },
  {
    element: <PurchaseItem />,
    path: '/purchase-item',
    name: 'purchase-items',
    meta: {
      ...Permissions.purchaseItemBrowse
    }
  },

  {
    element: <CreatePurchase />,
    path: '/purchase-item-create',
    name: 'purchase-items-create',
    meta: {
      ...Permissions.purchaseItemCreate
    }
  },
  {
    element: <EmployeeHandover />,
    path: '/employee-handover',
    name: 'employee-handover',
    meta: {
      ...Permissions.employeeHanoverRead
    }
  },
  {
    element: <CreateEmployeeHandover />,
    path: '/employee-handover-create',
    name: 'employee-handover-create',
    meta: {
      ...Permissions.employeeHandoverCreate
    }
  },
  {
    element: <ReceivingEmployeeHandover />,
    path: '/employee-handover-receiving',
    name: 'employee-handover-receiving',
    meta: {
      ...Permissions.employeeHandoverCreate
    }
  },
  //   {
  //     element: <EmployeeHandoverReceiving />,
  //     path: '/employee-handover-receiving-list',
  //     name: 'employee-handover-receiving-list',
  //     meta: {
  //       ...Permissions.employeeHanoverRead
  //     }
  //   },
  {
    element: <PullData />,
    path: '/pull-data',
    name: 'pull-data',
    meta: {
      ...Permissions.pullDataBrowse
    }
  },

  {
    element: <CafeOpeningStock />,
    path: '/cafe-opening-stock',
    name: 'openingstock',
    meta: {
      ...Permissions.openingStockBrowse
    }
  },
  {
    element: <StockManageLog />,
    path: '/stock-manage-log',
    name: 'stock-log',
    meta: {
      ...Permissions.stockHistoryBrowse
    }
  },
  {
    element: <Dashboard />,
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      ...Permissions.productMenuBrowse
    }
  },

  {
    element: <Dashboard />,
    path: '/update/order/:id',
    name: 'update.order',
    meta: {
      ...Permissions.productMenuBrowse
    }
  },
  //Write Header
  {
    element: <Report />,
    path: '/report',
    name: 'report',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <MenuLiveReport />,
    path: '/menu-wise-monitoring-report',
    name: 'menu-wise-monitoring-report',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <MenuWiseSaleReport />,
    path: '/menu-wise-sales',
    name: 'menu-wise-sale',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <OrderSaleReport />,
    path: '/cash-handover',
    name: 'order-sale',
    meta: {
      ...Permissions.cashHandoverRead
    }
  },
  {
    element: <CafeWiseSaleReport />,
    path: '/cafe-wise-sales',
    name: 'cafe-wise-sale',
    meta: {
      ...Permissions.reportBrowse
    }
  },

  {
    element: <OrderHistory />,
    path: '/oder-history',
    name: 'order-history',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <WhatsAppHistory />,
    path: '/whats-app-history',
    name: 'whats-app-history',
    meta: {
      ...Permissions.orderBrowse
    }
  },
  {
    element: <MenuWiseReport />,
    path: '/menu-wise-report',
    name: 'menu-wise-report',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <WarehouseReport />,
    path: '/warehouse-report',
    name: 'ware-house-report',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <EmployeeStockReport />,
    path: '/employee-stock-wise-report',
    name: 'employee-stock-wise-report',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <OrderTableReport />,
    path: '/order-report',
    name: 'tableReport',
    meta: {
      ...Permissions.reportBrowse
    }
  },
  {
    element: <StockManage />,
    path: '/stockmanage',
    name: 'stockmanage',
    meta: {
      ...Permissions.stockBrowse
    }
  },
  {
    element: <StockReceiving />,
    path: '/stock-receiving',
    name: 'stock-receive',
    meta: {
      ...Permissions.stockBrowse
    }
  },
  {
    element: <StockTransfer />,
    path: '/stock-transfer',
    name: 'stock-transfer-data',
    meta: {
      ...Permissions.stockTransferBrowse
    }
  },
  {
    element: <Employee />,
    path: '/commons/employee',
    name: 'employee.list',
    meta: {
      ...Permissions.adminEmployeeBrowse
    }
  },
  {
    element: <Employee />,
    path: '/employees',
    name: 'employees',
    meta: {
      ...Permissions.employeeBrowse
    }
  },
  {
    element: <Salary />,
    path: '/commons/salary',
    name: 'salary',
    meta: {
      ...Permissions.employeeSalaryBrowse
    }
  },
  {
    element: <EmpAttendance />,
    path: '/attendance',
    name: 'employeeAttendance',
    meta: {
      ...Permissions.attendanceBrowse
    }
  },
  {
    element: <EmployeeLeave />,
    path: '/leave',
    name: 'employeeLeave',
    meta: {
      ...Permissions.attendanceBrowse
    }
  },

  {
    element: <Customer />,
    path: '/customer',
    name: 'cafe.customers',
    meta: {
      ...Permissions.customerBrowse
    }
  },
  {
    element: <QrCodePayment />,
    path: '/qrcodepayment',
    name: 'qrcode.payments',
    meta: {
      ...Permissions.expenseBrowse
    }
  },
  {
    element: <CustomerAccount />,
    path: '/account',
    name: 'cafe.account',
    meta: {
      ...Permissions.customerAccountBrowse
    }
  },

  {
    element: <Expense />,
    path: '/expense',
    name: 'expense',
    meta: {
      ...Permissions.expenseBrowse
    }
  },
  {
    element: <Menus />,
    path: '/menus',
    name: 'menus',
    meta: {
      ...Permissions.productMenuBrowse
    }
  },
    {
    element: <DemandProduct/>,
    path: '/demand-product',
    name: 'demand-product',
    meta: {
      ...Permissions.brandBrowse
    }
  },
   {
    element: <DemandProduct/>,
    path: '/demand-products',
    name: 'demand-products',
    meta: {
      ...Permissions.unitBrowse
    }
  },
     {
    element: <QuantityMismatch/>,
    path: '/quantity-mismatch-list',
    name: 'quantity-mismatch-list',
    meta: {
      ...Permissions.brandBrowse
    }
  },
   {
    element: <QuantityMismatch/>,
    path: '/quantity-mismatch-list',
    name: 'quantity-mismatch-lists',
    meta: {
      ...Permissions.unitBrowse
    }
  },
  {
    element: <Orders />,
    path: '/Orders',
    name: 'orders',
    meta: {
      ...Permissions.orderBrowse
    }
  },
  {
    element: <OrderLog />,
    path: '/orders-log',
    name: 'orders-log',
    meta: {
      ...Permissions.orderBrowse
    }
  },

  {
    element: <Unit />,
    path: '/unit',
    name: 'unit',
    meta: {
      ...Permissions.unitBrowse
    }
  },
  {
    element: <Cafe />,
    path: '/cafe',
    name: 'cafe',
    meta: {
      ...Permissions.cafeBrowse
    }
  },
  {
    element: <CafeSetting />,
    path: '/cafe-setting',
    name: 'cafe-setting',
    meta: {
      ...Permissions.cafeSettings
    }
  },
  {
    element: <Role />,
    path: '/role',
    name: 'role',
    meta: {
      ...Permissions.roleBrowse
    }
  },
  {
    element: <CafeSubcription />,
    path: '/cafesub',
    name: 'Cafesub',
    meta: {
      ...Permissions.cafeBrowse
    }
  },
  {
    element: <CafeSubcriptionRecieve />,
    path: '/cafesubrecieve/:id',
    name: 'CafeSubcriptionRecieve',
    meta: {
      ...Permissions.cafeBrowse
    }
  },
  {
    element: <Category />,
    path: '/category',
    name: 'category',
    meta: {
      ...Permissions.categoryBrowse
    }
  },
  {
    element: <Product />,
    path: '/product',
    name: 'product',
    meta: {
      ...Permissions.productBrowse
    }
  },

  {
    element: <RscList />,
    path: '/rsc-list',
    name: 'rsclist'
  },

  {
    element: <Projects />,
    path: '/projects',
    name: 'projects'
  },
  {
    element: <TaskRSCRList />,
    path: '/task/rsc-list',
    name: 'task.rsclist'
  },
  {
    element: <TaskList />,
    path: '/task-list',
    name: 'taskList'
  },
  {
    element: <TaskPredList />,
    path: '/pred-list',
    name: 'predList'
  },
  {
    element: <ProjectCost />,
    path: '/project-cost',
    name: 'projectCost'
  }
] as const

export type DprRouteName = (typeof DprRoutes)[number]['name']
export default DprRoutes
