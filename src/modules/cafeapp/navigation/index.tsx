// ** Icons Import

import { getPath } from '@src/router/RouteHelper'
import { Permissions } from '@src/utility/Permissions'

import {
  AlignJustify,
  AlignLeft,
  Archive,
  ArrowDownLeft,
  BarChart2,
  Book,
  CheckSquare,
  Circle,
  Coffee,
  CreditCard,
  Database,
  DollarSign,
  Droplet,
  Filter,
  Gift,
  GitPullRequest,
  Grid,
  Home,
  Info,
  List,
  Lock,
  Menu,
  Move,
  ShoppingBag,
  ShoppingCart,
  User,
  UserMinus,
  Users
} from 'react-feather'

//employee-stock-wise-report menu-wise-report

export default [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <Grid size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('dashboard'),
    ...Permissions.productMenuBrowse
  },

  {
    id: 'order',
    title: 'Order',
    icon: <ShoppingBag size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('orders'),
    ...Permissions.orderBrowse
  },

  {
    id: 'ware-house',
    title: 'Warehouse',
    icon: <Home size={12} />,
    navLink: getPath('warehouses'),
    ...Permissions.warehouseBrowse
  },
  {
    id: 'employee-handover',
    title: 'Employee Handover',
    icon: <GitPullRequest size={12} />,
    navLink: getPath('employee-handover'),
    ...Permissions.employeeHanoverRead
  },
  {
    id: 'order-report',
    title: 'Cash Handover',
    icon: <List size={12} />,
    navLink: getPath('order-sale'),
    ...Permissions.cashHandoverRead
  },
  {
    id: 'menuReport',
    title: 'Reports',
    icon: <Book size={20} />,
    badge: 'light-success',
    children: [
      {
        id: 'report',
        title: 'Graph Report',
        icon: <Circle size={12} />,
        navLink: getPath('report'),
        ...Permissions.dashboardBrowse
      },

      {
        id: 'tableReport',
        title: 'Table Report',
        icon: <Circle size={12} />,
        navLink: getPath('tableReport'),
        ...Permissions.reportBrowse
      },
      {
        id: 'monitoring',
        title: 'Menu monitoring',
        icon: <Circle size={12} />,
        navLink: getPath('menu-wise-monitoring-report'),
        ...Permissions.reportBrowse
      },
      {
        id: 'menuReport-item',
        title: 'Menu Report',
        icon: <Circle size={12} />,
        navLink: getPath('menu-wise-report'),
        ...Permissions.reportBrowse
      },
      {
        id: 'menu-Report-weekly',
        title: 'Weekly Cafe sales',
        icon: <Circle size={12} />,
        navLink: getPath('cafe-wise-sale'),
        ...Permissions.reportBrowse
      },
      {
        id: 'menu-Report-weekly-menu',
        title: 'Weekly Menu sales',
        icon: <Circle size={12} />,
        navLink: getPath('menu-wise-sale'),
        ...Permissions.reportBrowse
      },
      {
        id: 'employeeReport',
        title: 'Stock Report',
        icon: <Circle size={12} />,
        navLink: getPath('employee-stock-wise-report'),
        ...Permissions.dashboardBrowse
      },
      {
        id: 'orderHistory',
        title: 'Order History',
        icon: <Circle size={12} />,
        navLink: getPath('order-history'),
        ...Permissions.reportBrowse
      },
      {
        id: 'WhatsAppHistory',
        title: 'WhatsApp History',
        icon: <Circle size={12} />,
        navLink: getPath('whats-app-history'),
        ...Permissions.orderBrowse
      }
    ]
  },
  {
    id: 'demand-products',
    title: 'Demand Product',
    icon: <Menu size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('demand-products'),
    ...Permissions.unitBrowse
  },


  {
    id: 'demand-product',
    title: 'Demand Product',
    icon: <Menu size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('demand-product'),
    ...Permissions.brandBrowse
  },



  //sub-cafe
  {
    id: 'unit',
    title: 'Unit',
    icon: <Droplet size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('unit'),
    ...Permissions.unitBrowse
  },
  {
    id: 'menu',
    title: 'menu',
    icon: <Menu size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('menus'),
    ...Permissions.productMenuBrowse
  },
  {
    id: 'role',
    title: 'Role',
    icon: <Lock size={12} />,
    navLink: getPath('role'),
    ...Permissions.roleBrowse
  },
  //   {
  //     header: 'Cafe Management',
  //     ...Permissions.cafeBrowse
  // tableReport
  //   },
  {
    id: 'cafe',
    title: 'Cafe Management',
    icon: <Coffee size={20} />,
    badge: 'light-success',

    // badgeText: '12',
    children: [
      {
        id: 'cafeList',
        title: 'Cafe List',
        icon: <Archive size={12} />,
        navLink: getPath('cafe'),
        ...Permissions.cafeBrowse
      },

      {
        id: 'cafeSubscription',
        title: 'Cafe Subscription',
        icon: <DollarSign size={12} />,
        navLink: getPath('Cafesub'),
        ...Permissions.cafeBrowse

        //warehouse-category
      },
      {
        id: 'sub-cafe',
        title: 'Sub Cafe',
        icon: <Archive size={12} />,
        navLink: getPath('sub-cafe'),
        ...Permissions.subCafeBrowse
      },

      {
        id: 'pull-data',
        title: 'Pull Data',
        icon: <GitPullRequest size={12} />,
        navLink: getPath('pull-data'),
        ...Permissions.pullDataBrowse
      },
      {
        id: 'category',
        title: 'Category',
        icon: <List size={20} />,
        badge: 'light-success',
        navLink: getPath('category'),
        ...Permissions.categoryBrowse
      },
      {
        id: 'product',
        title: 'Product',
        icon: <AlignJustify size={20} />,
        badge: 'light-success',
        navLink: getPath('product'),
        ...Permissions.productBrowse
      },
      {
        id: 'stockManage',
        title: 'Stock Manage',
        icon: <Database size={20} />,
        badge: 'light-success',
        navLink: getPath('stockmanage'),
        ...Permissions.stockTransferBrowse
      },
      {
        id: 'stockTransfer',
        title: 'Stock Transfer',
        icon: <Database size={20} />,
        badge: 'light-success',
        navLink: getPath('stock-transfer-data'),
        ...Permissions.stockTransferBrowse
      },
      {
        id: 'stocklog',
        title: 'Stock Manage Log',
        icon: <Database size={20} />,
        badge: 'light-success',
        navLink: getPath('stock-log'),
        ...Permissions.stockHistoryBrowse
      },
      {
        id: 'expense',
        title: 'Expense',
        icon: <BarChart2 size={20} />,
        badge: 'light-success',
        navLink: getPath('expense'),
        ...Permissions.expenseBrowse
      },
      {
        id: 'qycode',
        title: 'Payment QR',
        icon: <BarChart2 size={20} />,
        badge: 'light-success',
        // badgeText: '12',
        navLink: getPath('qrcode.payments'),
        ...Permissions.expenseBrowse
      },
      {
        id: 'stock',
        title: 'Cafe Opening Stock',
        icon: <AlignJustify size={20} />,
        badge: 'light-success',
        // badgeText: '12',
        navLink: getPath('openingstock'),
        ...Permissions.openingStockBrowse
      }
    ]
  },

  {
    id: 'brand1',
    title: 'Brand',
    icon: <Info size={12} />,
    navLink: getPath('brands'),
    ...Permissions.brandBrowse
  },
  {
    id: 'warehouses',
    title: 'Category',
    icon: <Filter size={20} />,
    badge: 'light-success',
    navLink: getPath('warehouse-category'),
    ...Permissions.catsubcatBrowse
  },

  {
    id: 'item1',
    title: 'Product',
    icon: <List size={12} />,
    navLink: getPath('items'),
    ...Permissions.itemBrowse
  },
  {
    id: 'purchaseItem',
    title: 'Purchase Stock',
    icon: <ShoppingCart size={12} />,
    navLink: getPath('purchase-items'),
    ...Permissions.purchaseItemBrowse
  },
  {
    id: 'itemTransfer',
    title: 'Transfer Stock',
    icon: <Move size={12} />,
    navLink: getPath('item-transfers'),
    ...Permissions.itemTransferRead
  },

  {
    id: 'inventory',
    title: 'Manage Wastage',
    icon: <Database size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('inventory'),
    ...Permissions.wastedBrowse
  },
  // employee
  {
    id: 'employee',
    title: 'Employees',
    icon: <Users size={20} />,
    badge: 'light-success',

    // badgeText: '12',
    children: [
      {
        id: 'employeeList-admin',
        title: 'Employee List',
        icon: <Users size={12} />,
        navLink: getPath('employee.list'),

        ...Permissions.adminEmployeeBrowse
      },
      {
        id: 'employeeList-user',
        title: 'Employee List',
        icon: <Users size={12} />,
        navLink: getPath('employees'),

        ...Permissions.employeeBrowse
      },
      {
        id: 'employeeSalary',
        title: 'Employee Salary',
        icon: <Gift size={12} />,
        navLink: getPath('salary'),

        ...Permissions.employeeSalaryBrowse
      },

      {
        id: 'employeeAttendance',
        title: 'Employee Attendance',
        icon: <CheckSquare size={12} />,
        navLink: getPath('employeeAttendance'),

        ...Permissions.attendanceBrowse
      },
      {
        id: 'employeeLeave',
        title: 'Employee Leave',
        icon: <UserMinus size={12} />,
        navLink: getPath('employeeLeave'),

        ...Permissions.attendanceBrowse
      }
    ]
  },

  /////cafe customer
  {
    id: 'customers',
    title: 'Customers',
    icon: <User size={20} />,
    badge: 'light-success',
    ...Permissions.customerBrowse,
    // badgeText: '12',
    children: [
      {
        id: 'customerList',
        title: 'Customer List',
        icon: <AlignLeft size={12} />,
        navLink: getPath('cafe.customers'),
        ...Permissions.customerBrowse
      },
      {
        id: 'customerAccount',
        title: 'Account',
        icon: <Book size={12} />,
        navLink: getPath('cafe.account'),
        ...Permissions.customerAccountBrowse
      }
    ]
  },
  {
    id: 'quantity-mismatch-list-1',
    title: 'Quantity Mismatch',
    icon: <ArrowDownLeft size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('quantity-mismatch-lists'),
    ...Permissions.unitBrowse
  },


  {
    id: 'quantity-mismatch-lists-2',
    title: 'Quantity Mismatch',
    icon: <ArrowDownLeft size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('quantity-mismatch-list'),
    ...Permissions.brandBrowse
  },
    {
    id: '',
    title: 'Waste Items',
    icon: <List size={20} />,
    badge: 'light-success',
    // badgeText: '12',
    navLink: getPath('waste-items'),
    ...Permissions.brandBrowse
  },
]
