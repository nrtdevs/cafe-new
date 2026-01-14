/* eslint-disable no-undef */
export const WebAppVersion = Object.freeze({
  current: '0.0.1'
})

export const entryPoint = `web-${WebAppVersion.current}`

export const Events = Object.freeze({
  Unauthenticated: 'Unauthenticated',
  reactSelect: 'reactSelect',
  RedirectMessage: 'goToMessage',
  RedirectNotification: 'goToNotification',
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  approved: 'approved',
  assigned: 'assigned',
  stampIn: 'stampIn',
  stampOut: 'stampOut',
  leaveRequest: 'leaveRequest',
  leaveApproved: 'leaveApproved',
  bankIdVerification: 'bankIdVerification',
  emergency: 'emergency',
  completed: 'completed',
  request: 'request',
  confirmAlert: 'confirmAlert'
})

export const IconSizes = Object.freeze({
  InputAddon: 16,
  HelpIcon: 12,
  MenuVertical: 22,
  CardListIcon: 15
})

export const OrderStatus = Object.freeze({
  Completed: 3,
  Pending: 1,
  Confirmed: 2,
  Cancelled: 4
})
export const DatedayweakStatus = Object.freeze({
  Today: 1,
  Week: 7,
  month: 30
})

export const PaymentMode = Object.freeze({
  Cash: 1,
  UPI: 2,
  SPLIT: 4
})
export const PaymentModeWithUdhaar = Object.freeze({
  Cash: 1,
  UPI: 2,
  Udhaar: 3,
  SPLIT: 4
  //   SPLITWithUdhaar: 5
})

export const PaymentModeWarehouse = Object.freeze({
  Cash: 'cash',
  UPI: 'upi',
  Udhaar: 'udhaar',
 
  //   SPLITWithUdhaar: 5
})
export const Patterns = Object.freeze({
  AlphaOnly: /^[a-zA-Z ]*$/,
  AlphaOnlyNoSpace: /^[a-zA-Z]*$/,
  AlphaNumericOnlyNoSpace: /^[a-zA-Z0-9]*$/,
  AlphaNumericOnly: /^[a-zA-Z0-9 ]*$/,
  NumberOnly: /^\d+(\.\d{1,2})?$/,
  NumberOnlyNoDot: /^[0-9]*$/,
  EmailOnly: /^\w+([!#$%&'*+-/=?^_`{|]?\w+)*@\w+([.-]?\w+)*(\.\w{2,5})+$/,
  Password: /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{6,16}$/
})

export type ActionTypes = {
  action: 'delete' | 'active' | 'inactive'
  ids: Array<number>
}

export enum CMD {
  Register = 'store-register',
  Disconnect = 'disconnect',
  GetAllSessions = 'getallsessions',
  GetCustomerSession = 'getcustomersession',
  RemoveCustomerSession = 'removecustomersession',
  AddCartItem = 'addtocart',
  UpdateCartItem = 'updatecart',
  RemoveCartItem = 'removecartitem',
  ProductInfo = 'productinfo'
}

export const mapApiKey = ''

export const RepeatType = Object.freeze({
  'every-day': 'every_day',
  'every-week': 'every_week',
  'every-month': 'every_month'
})

export const priorityType = Object.freeze({
  low: 'low',
  high: 'high',
  medium: 'medium'
})

export const ActionStratus = Object.freeze({
  'not-started': 'pending',
  'in-progress': 'in_progress',
  'on-hold': 'on_hold',
  completed: 'completed',
  cancelled: 'cancelled'
})

export const ActionStatusText = Object.freeze({
  'not-started': 'pending',
  'in-progress': 'in_progress',
  'on-hold': 'on_hold',
  completed: 'completed',
  cancelled: 'cancelled'
})

export const stock_operation = Object.freeze({
  In: 'In',
  Out: 'Out'
})
export const screens = Object.freeze({
  Seller: 'Seller',
  Kitchen: 'Kitchen',
  Warehouse: 'Warehouse',
  Waste: 'Waste'
  //   Transfer: 'Transfer'
})

export const Resource = Object.freeze({
  Transfer: 'Transfer'
})

export const gender = Object.freeze({
  Male: '1',
  Female: '2'
})
export const Modeoftransation = Object.freeze({
  cash: 1,
  online: 2
  //   recurring: 3
})
export const exportData = Object.freeze({
  Order: 1,
  OrderDetails: 2
  //   recurring: 3
})
export const documentType = Object.freeze({
  Aadhaar_Card: 'Aadhaar Card',
  Pan_Card: 'Pan Card',
  Voter_Id: 'Voter Id'
})
export const attanacetype = Object.freeze({
  absent: 1,
  present: 2,
  halfDay: 3
})
export const sub_status = Object.freeze({
  active: '1',
  inactive: '2'
})
export const sub_type = Object.freeze({
  monthly: '1',
  yearly: '2'
})
export const cafe_status = Object.freeze({
  active: '1',
  inactive: '2'
})

export const pullDataType = Object.freeze({
  category: 'category',
  product: 'product',
  menu: 'menu'
})
