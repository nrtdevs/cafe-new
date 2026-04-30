// do not remove
export type PermissionType = {
  action: string
  resource: string
  belongs_to?: any
}
export const Permissions = Object.freeze({
  // Dashboard
  dashboardBrowse: {
    action: 'dashboard-browse',
    resource: 'dashboard',
    belongs_to: 5
  },
  //cafe
  cafeCreate: {
    action: 'cafe-create',
    resource: 'cafe',
    belongs_to: 1
  },

  cafeEdit: {
    action: 'cafe-edit',
    resource: 'cafe',
    belongs_to: 1
  },
  cafeRead: {
    action: 'cafe-read',
    resource: 'cafe',
    belongs_to: 1
  },
  cafeDelete: {
    action: 'cafe-delete',
    resource: 'cafe',
    belongs_to: 1
  },
  cafeBrowse: {
    action: 'cafe-browse',
    resource: 'cafe',
    belongs_to: 1
  },

  //employee
  employeeRead: {
    action: 'employee-read',
    resource: 'employee',
    belongs_to: 2
  },
  employeeCreate: {
    action: 'employee-create',
    resource: 'employee',
    belongs_to: 2
  },
  employeeEdit: {
    action: 'employee-edit',
    resource: 'employee',
    belongs_to: 2
  },
  employeeDelete: {
    action: 'employee-delete',
    resource: 'employee',
    belongs_to: 2
  },
  employeeBrowse: {
    action: 'employee-browse',
    resource: 'employee',
    belongs_to: 2
  },

  //employee salary
  employeeSalaryBrowse: {
    action: 'employeeSalary-browse',
    resource: 'salary',
    belongs_to: 2
  },
  employeeSalaryRead: {
    action: 'employeeSalary-read',
    resource: 'salary',
    belongs_to: 2
  },
  employeeSalaryCreate: {
    action: 'employeeSalary-create',
    resource: 'salary',
    belongs_to: 2
  },
  employeeSalaryEdit: {
    action: 'employeeSalary-edit',
    resource: 'salary',
    belongs_to: 2
  },
  employeeSalaryDelete: {
    action: 'employeeSalary-delete',
    resource: 'salary',
    belongs_to: 2
  },

  //customer
  customerBrowse: {
    action: 'customer-browse',
    resource: 'customer',
    belongs_to: 10
  },
  customerRead: {
    action: 'customer-read',
    resource: 'customer',
    belongs_to: 10
  },
  customerCreate: {
    action: 'customer-create',
    resource: 'customer',
    belongs_to: 10
  },
  customerEdit: {
    action: 'customer-edit',
    resource: 'customer',
    belongs_to: 10
  },
  customerDelete: {
    action: 'customer-delete',
    resource: 'customer',
    belongs_to: 10
  },

  //customer account
  customerAccountBrowse: {
    action: 'customerAccount-browse',
    resource: 'customerAccount',
    belongs_to: 2
  },
  customerAccountRead: {
    action: 'customerAccount-read',
    resource: 'customerAccount',
    belongs_to: 2
  },
  customerAccountCreate: {
    action: 'customerAccount-create',
    resource: 'customerAccount',
    belongs_to: 2
  },
  customerAccountEdit: {
    action: 'customerAccount-edit',
    resource: 'customerAccount',
    belongs_to: 2
  },
  customerAccountDelete: {
    action: 'customerAccount-delete',
    resource: 'customerAccount',
    belongs_to: 2
  },

  //product
  productBrowse: {
    action: 'product-browse',
    resource: 'product',
    belongs_to: 2
  },
  productRead: {
    action: 'product-read',
    resource: 'product',
    belongs_to: 2
  },
  productCreate: {
    action: 'product-create',
    resource: 'product',
    belongs_to: 2
  },
  productEdit: {
    action: 'product-edit',
    resource: 'product',
    belongs_to: 2
  },
  productDelete: {
    action: 'product-delete',
    resource: 'product',
    belongs_to: 2
  },
  //stock manage
  stockBrowse: {
    action: 'stockManage-browse',
    resource: 'stockManage',
    belongs_to: 2
  },
  stockRead: {
    action: 'stockManage-read',
    resource: 'stockManage',
    belongs_to: 2
  },
  stockCreate: {
    action: 'stockManage-create',
    resource: 'stockManage',
    belongs_to: 2
  },
  stockEdit: {
    action: 'stockManage-edit',
    resource: 'stockManage',
    belongs_to: 2
  },
  stockDelete: {
    action: 'stockManage-delete',
    resource: 'stockManage',
    belongs_to: 2
  },
  //unit browse
  unitBrowse: {
    action: 'unit-browse',
    resource: 'unit',
    belongs_to: 5
  },
  unitRead: {
    action: 'unit-read',
    resource: 'unit',
    belongs_to: 5
  },
  unitCreate: {
    action: 'unit-create',
    resource: 'unit',
    belongs_to: 5
  },
  unitEdit: {
    action: 'unit-edit',
    resource: 'unit',
    belongs_to: 5
  },
  unitDelete: {
    action: 'unit-delete',
    resource: 'unit',
    belongs_to: 5
  },

  //recipe
  recipeBrowse: {
    action: 'recipe-browse',
    resource: 'recipe',
    belongs_to: 2
  },
  recipeRead: {
    action: 'recipe-read',
    resource: 'recipe',
    belongs_to: 2
  },
  recipeCreate: {
    action: 'recipe-create',
    resource: 'recipe',
    belongs_to: 2
  },
  recipeEdit: {
    action: 'recipe-edit',
    resource: 'recipe',
    belongs_to: 2
  },
  recipeDelete: {
    action: 'recipe-delete',
    resource: 'recipe',
    belongs_to: 2
  },
  //expense
  expenseBrowse: {
    action: 'expense-browse',
    resource: 'expense',
    belongs_to: 2
  },
  expenseRead: {
    action: 'expense-read',
    resource: 'expense',
    belongs_to: 2
  },
  expenseCreate: {
    action: 'expense-create',
    resource: 'expense',
    belongs_to: 2
  },
  expenseEdit: {
    action: 'expense-edit',
    resource: 'expense',
    belongs_to: 2
  },
  expenseDelete: {
    action: 'expense-delete',
    resource: 'expense',
    belongs_to: 2
  },
  //category
  categoryBrowse: {
    action: 'category-browse',
    resource: 'category',
    belongs_to: 2
  },
  categoryRead: {
    action: 'category-read',
    resource: 'category',
    belongs_to: 2
  },
  categoryCreate: {
    action: 'category-create',
    resource: 'category',
    belongs_to: 2
  },
  categoryEdit: {
    action: 'category-edit',
    resource: 'category',
    belongs_to: 2
  },
  categoryDelete: {
    action: 'category-delete',
    resource: 'category',
    belongs_to: 2
  },
  //menu
  productMenuBrowse: {
    action: 'menu-browse',
    resource: 'menu',
    belongs_to: 2
  },
  productMenuRead: {
    action: 'menu-read',
    resource: 'menu',
    belongs_to: 2
  },
  productMenuCreate: {
    action: 'menu-create',
    resource: 'menu',
    belongs_to: 2
  },
  productMenuEdit: {
    action: 'menu-edit',
    resource: 'menu',
    belongs_to: 2
  },
  productMenuDelete: {
    action: 'menu-delete',
    resource: 'menu',
    belongs_to: 2
  },

  //order
  orderBrowse: {
    action: 'order-browse',
    resource: 'order',
    belongs_to: 5
  },
  orderRead: {
    action: 'order-read',
    resource: 'order',
    belongs_to: 5
  },
  orderCreate: {
    action: 'order-create',
    resource: 'order',
    belongs_to: 5
  },
  orderEdit: {
    action: 'order-edit',
    resource: 'order',
    belongs_to: 5
  },
  orderDelete: {
    action: 'order-delete',
    resource: 'order',
    belongs_to: 5
  },
  //admin employee
  adminEmployeeBrowse: {
    action: 'adminEmployee-browse',
    resource: 'adminEmployee',
    belongs_to: 1
  },
  adminEmployeeRead: {
    action: 'adminEmployee-read',
    resource: 'adminEmployee',
    belongs_to: 1
  },
  adminEmployeeCreate: {
    action: 'adminEmployee-create',
    resource: 'adminEmployee',
    belongs_to: 1
  },
  adminEmployeeEdit: {
    action: 'adminEmployee-edit',
    resource: 'adminEmployee',
    belongs_to: 1
  },
  adminEmployeeDelete: {
    action: 'adminEmployee-delete',
    resource: 'adminEmployee',
    belongs_to: 1
  },
  //attendance
  attendanceBrowse: {
    action: 'attendence-browse',
    resource: 'attendence',
    belongs_to: 2
  },
  attendanceRead: {
    action: 'attendence-read',
    resource: 'attendence',
    belongs_to: 2
  },
  attendanceCreate: {
    action: 'attendence-create',
    resource: 'attendence',
    belongs_to: 2
  },
  attendanceEdit: {
    action: 'attendence-edit',
    resource: 'attendence',
    belongs_to: 2
  },
  attendanceDelete: {
    action: 'attendence-delete',
    resource: 'attendence',
    belongs_to: 2
  },
  //subCafe
  subCafeBrowse: {
    action: 'subcafe-browse',
    resource: 'OnlyForCafe',
    belongs_to: 6
  },
  subCafeRead: {
    action: 'subcafe-read',
    resource: 'OnlyForCafe',
    belongs_to: 6
  },
  subCafeCreate: {
    action: 'subcafe-create',
    resource: 'OnlyForCafe',
    belongs_to: 6
  },
  subCafeEdit: {
    action: 'subcafe-edit',
    resource: 'OnlyForCafe',
    belongs_to: 6
  },
  subCafeDelete: {
    action: 'subcafe-delete',
    resource: 'OnlyForCafe',
    belongs_to: 6
  },

  //role
  roleBrowse: {
    action: 'role-browse',
    resource: 'role',
    belongs_to: 3
  },
  roleRead: {
    action: 'role-read',
    resource: 'role',
    belongs_to: 3
  },
  roleCreate: {
    action: 'role-add',
    resource: 'role',
    belongs_to: 3
  },
  roleEdit: {
    action: 'role-edit',
    resource: 'role',
    belongs_to: 3
  },
  roleDelete: {
    action: 'role-delete',
    resource: 'role',
    belongs_to: 3
  },

  //wasted
  wastedBrowse: {
    action: 'wastage-browse',
    resource: 'wastage',
    belongs_to: 2
  },
  wastedRead: {
    action: 'wastage-read',
    resource: 'wastage',
    belongs_to: 2
  },
  wastedCreate: {
    action: 'wastage-create',
    resource: 'wastage',
    belongs_to: 2
  },
  wastedEdit: {
    action: 'wastage-edit',
    resource: 'wastage',
    belongs_to: 2
  },
  wastedDelete: {
    action: 'wastage-delete',
    resource: 'wastage',
    belongs_to: 2
  },

  //stock history
  stockHistoryBrowse: {
    action: 'stock-history-browse',
    resource: 'stock-history-browse',
    belongs_to: 2
  },

  //report browse
  reportBrowse: {
    action: 'report-browse',
    resource: 'report-browse',
    belongs_to: 3
  },

  //stock transfer
  stockTransferBrowse: {
    action: 'stock-transfer-browse',
    resource: 'stock-transfer',
    belongs_to: 2
  },
  stockTransferRead: {
    action: 'stock-transfer-read',
    resource: 'stock-transfer',
    belongs_to: 2
  },
  stockTransferCreate: {
    action: 'stock-transfer-create',
    resource: 'stock-transfer',
    belongs_to: 2
  },
  stockTransferEdit: {
    action: 'stock-transfer-edit',
    resource: 'stock-transfer',
    belongs_to: 2
  },
  stockTransferDelete: {
    action: 'stock-transfer-delete',
    resource: 'stock-transfer',
    belongs_to: 2
  },

  //pullData
  pullDataBrowse: {
    action: 'pull-data-browse',
    resource: 'pull-data',
    belongs_to: 2
  },
  pullDataRead: {
    action: 'pull-data-read',
    resource: 'pull-data',
    belongs_to: 2
  },
  pullDataCreate: {
    action: 'pull-data-create',
    resource: 'pull-data',
    belongs_to: 2
  },
  pullDataEdit: {
    action: 'pull-data-edit',
    resource: 'pull-data',
    belongs_to: 2
  },
  pullDataDelete: {
    action: 'pull-data-delete',
    resource: 'pull-data',
    belongs_to: 2
  },
  //opening stock
  openingStockBrowse: {
    action: 'opening-stock-browse',
    resource: 'opening-stock',
    belongs_to: 2
  },
  openingStockRead: {
    action: 'opening-stock-read',
    resource: 'opening-stock',
    belongs_to: 2
  },
  openingStockCreate: {
    action: 'opening-stock-create',
    resource: 'opening-stock',
    belongs_to: 2
  },
  openingStockEdit: {
    action: 'opening-stock-edit',
    resource: 'opening-stock',
    belongs_to: 2
  },
  openingStockDelete: {
    action: 'opening-stock-delete',
    resource: 'opening-stock',
    belongs_to: 2
  },
  //brand
  brandBrowse: {
    action: 'brand-browse',
    resource: 'brand',
    belongs_to: 7
  },
  brandRead: {
    action: 'brand-read',
    resource: 'brand',
    belongs_to: 7
  },
  brandCreate: {
    action: 'brand-create',
    resource: 'brand',
    belongs_to: 7
  },
  brandEdit: {
    action: 'brand-edit',
    resource: 'brand',
    belongs_to: 7
  },
  brandDelete: {
    action: 'brand-delete',
    resource: 'brand',
    belongs_to: 7
  },
  //item
  itemBrowse: {
    action: 'item-browse',
    resource: 'item',
    belongs_to: 7
  },
  itemRead: {
    action: 'item-read',
    resource: 'item',
    belongs_to: 7
  },
  itemCreate: {
    action: 'item-create',
    resource: 'item',
    belongs_to: 7
  },
  itemEdit: {
    action: 'item-edit',
    resource: 'item',
    belongs_to: 7
  },
  itemDelete: {
    action: 'item-delete',
    resource: 'item',
    belongs_to: 7
  },
  //purchase item
  purchaseItemBrowse: {
    action: 'item-prchase-browse',
    resource: 'item-prchase',
    belongs_to: 7
  },
  purchaseItemRead: {
    action: 'item-prchase-read',
    resource: 'item-prchase',
    belongs_to: 7
  },
  purchaseItemCreate: {
    action: 'item-prchase-create',
    resource: 'item-prchase',
    belongs_to: 7
  },
  purchaseItemEdit: {
    action: 'item-prchase-edit',
    resource: 'item-prchase',
    belongs_to: 7
  },
  purchaseItemDelete: {
    action: 'item-prchase-delete',
    resource: 'item-prchase',
    belongs_to: 7
  },
  purchaseItemImport: {
    action: 'item-prchase-import',
    resource: 'item-prchase',
    belongs_to: 7
  },


  //catsubcat
  catsubcatBrowse: {
    action: 'catsubcat-browse',
    resource: 'catsubcat',
    belongs_to: 7
  },
  catsubcatRead: {
    action: 'catsubcat-read',
    resource: 'catsubcat',
    belongs_to: 7
  },
  catsubcatCreate: {
    action: 'catsubcat-create',
    resource: 'catsubcat',
    belongs_to: 7
  },
  catsubcatEdit: {
    action: 'catsubcat-edit',
    resource: 'catsubcat',
    belongs_to: 7
  },
  catsubcatDelete: {
    action: 'catsubcat-delete',
    resource: 'catsubcat',
    belongs_to: 7
  },

  //warehouse
  warehouseBrowse: {
    action: 'warehouse-browse',
    resource: 'warehouse',
    belongs_to: 2
  },
  warehouseRead: {
    action: 'warehouse-read',
    resource: 'warehouse',
    belongs_to: 2
  },
  warehouseCreate: {
    action: 'warehouse-create',
    resource: 'warehouse',
    belongs_to: 2
  },
  warehouseEdit: {
    action: 'warehouse-edit',
    resource: 'warehouse',
    belongs_to: 2
  },
  warehouseDelete: {
    action: 'warehouse-delete',
    resource: 'warehouse',
    belongs_to: 2
  },

  //item transfer
  itemTransferRead: {
    action: 'item-transfer-read',
    resource: 'item-transfer',
    belongs_to: 7
  },
  itemTransferCreate: {
    action: 'item-transfer-add',
    resource: 'item-transfer',
    belongs_to: 7
  },

  itemTransferDelete: {
    action: 'item-transfer-delete',
    resource: 'item-transfer',
    belongs_to: 7
  },

  //employee handover

  employeeHanoverRead: {
    action: 'employee-handover-read',
    resource: 'employee-handover',
    belongs_to: 4
  },

  employeeHandoverCreate: {
    action: 'employee-handover-add',
    resource: 'employee-handover',
    belongs_to: 4
  },

  //cash handover list
  cashHandoverRead: {
    action: 'cash-handover-read',
    resource: 'cash-handover',
    belongs_to: 2
  },

  cashHandoverCreate: {
    action: 'cash-handover-add',
    resource: 'cash-handover',
    belongs_to: 2
  },

  cashHandoverDelete: {
    action: 'cash-handover-delete',
    resource: 'cash-handover',
    belongs_to: 2
  },

  //cafe setting
  cafeSettings: {
    action: 'cafe_setting',
    resource: 'cafe_setting',
    belongs_to: 2
  },

  //demand products
  demandProductsBrowse: {
    action: 'item-demand-browse',
    resource: 'item-demand',
    belongs_to: 7
  },
  demandProductsRead: {
    action: 'item-demand-read',
    resource: 'item-demand',
    belongs_to: 7
  },
  demandProductsCreate: {
    action: 'item-demand-create',
    resource: 'item-demand',
    belongs_to: 7
  },
  demandProductsEdit: {
    action: 'item-demand-edit',
    resource: 'item-demand',
    belongs_to: 7
  },
  demandProductsDelete: {
    action: 'item-demand-delete',
    resource: 'item-demand',
    belongs_to: 7
  },
  demandProductsImport: {
    action: 'item-demand-import',
    resource: 'item-demand',
    belongs_to: 7
  }


})
