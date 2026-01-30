import { handleLogin } from '@src/redux/authentication'
import { SuccessToast, log } from '@src/utility/Utils'
import { LoginApiArgs } from '@src/utility/types/typeAuthApi'
import ApiEndpoints from '../ApiEndpoints'
import http from '../useHttp'

const extraPermissions = [
  //   {
  //     action: 'manage',
  //     subject: 'all'
  //   }
]
export const loginApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    authenticate: false,
    path: ApiEndpoints.login,
    showErrorToast: true
  })
}

export const login = ({
  formData,
  loading = (e: boolean) => { },
  success = (e: any) => { },
  // eslint-disable-next-line no-unused-vars
  errorMessage = 'login-failed',
  successMessage = 'login-successful',
  dispatch = (e: any) => { },
  ability,
  redirect = true,
  navigate = (e: any) => { },
  error = (e: any) => { }
}) => {
  console.log(formData, 'formData')
  http.request({
    jsonData: formData,
    method: 'post',
    path: ApiEndpoints.login,
    loading,
    authenticate: false,
    showErrorToast: true,
    error: (e: any) => {
      error(e)
      // console.log(e)
      // ErrorToast(errorMessage)
    },
    // success: (data: any) => {

    //   const p = data?.payload?.permissions?.map((a:any) => ({
    //       action: a.se_name,
    //       subject: a?.group_name
    //     })) ?? []

    //   log(p, 'permissions')

    //   const browsePermissions: any = Object.values(p).filter((perm: any) =>
    //     perm.action.includes('-browse')
    //   )
    //   log(browsePermissions, 'browsePermissions')
    //   let first_index = browsePermissions[0]
    //   log(browsePermissions, first_index)
    //   // Filter array p based on browse permissions
    //   const filteredP = p.filter((item) =>
    //     browsePermissions.some(
    //       (perm: any) => perm.action === item.action && perm.resource === item.subject
    //     )
    //   )
    //   log(filteredP, 'filterP')
    //   const m = {
    //     ...data?.payload,
    //     // role: data.payload.roles,
    //     ability: p?.concat(extraPermissions)
    //   }

    //   dispatch(handleLogin(m))
    //   SuccessToast(successMessage)
    //   // if (data?.data?.permissions) ability.update([
    //   //     {
    //   //         action: 'manage',
    //   //         subject: 'all'
    //   //     }
    //   // ])
    //   //   if (data?.payload?.permissions)
    //   ability.update(m?.ability)
    //   if (redirect) {
    //     if (data?.payload?.role_id === 1) {
    //       window.location.href = '/report'
    //     } else {
    //       if (first_index?.subject === 'dashboard') {
    //         window.location.href = '/dashboard'
    //       } else if (first_index.subject === 'unit') {
    //         window.location.href = '/unit'
    //       } else if (first_index?.subject === 'cafe') {
    //         window.location.href === '/cafe'
    //       } else if (first_index?.subject === 'order') {
    //         window.location.href === '/order'
    //       } else if (first_index?.subject === 'adminEmployee') {
    //         window.location.href === '/commons/employee'
    //       } else if (first_index?.subject === 'menu') {
    //         window.location.href === '/menus'
    //       } else if (first_index?.subject === 'category') {
    //         window.location.href === '/category'
    //       } else if (first_index?.subject === 'product') {
    //         window.location.href = '/product'
    //       } else if (first_index?.subject === 'employee') {
    //         window.location.href = '/commons/employee'
    //       } else if (filteredP[0]?.subject === 'salary') {
    //         window.location.href = '/commons/salary'
    //       } else if (first_index?.subject === 'customer') {
    //         window.location.href = '/customer'
    //       } else if (first_index?.subject === 'customerAccount') {
    //         window.location.href = '/account'
    //       } else if (first_index?.subject === 'expense') {
    //         window.location.href = '/expense'
    //       } else if (first_index?.subject === 'attendence') {
    //         window.location.href = '/attendance'
    //       } else if (first_index?.subject === 'OnlyForCafe') {
    //         window.location.href = '/sub-cafe'
    //       } else if (first_index?.subject === 'role') {
    //         window.location.href = '/role'
    //       } else if (first_index?.subject === 'cafe') {
    //         window.location.href = '/cafe'
    //       } else if (first_index?.subject === 'wastage') {
    //         window.location.href = '/manage-wastage'
    //       } else if (first_index?.subject === 'stock-history-browse') {
    //         window.location.href = '/stock-manage-log'
    //       } else if (first_index?.subject === 'stock-transfer') {
    //         window.location.href = '/stock-transfer'
    //       } else if (first_index?.subject === 'pull-data') {
    //         window.location.href = '/pull-data'
    //       } else if (first_index?.subject === 'opening-stock') {
    //         window.location.href = '/cafe-opening-stock'
    //       } else if(first_index?.subject === 'brand') {
    //           window.location.href = '/brand'
    //       }else if(first_index?.subject === 'catsubcat') {
    //           window.location.href = '/warehouse-category'
    //       }else if(first_index?.subject === 'item') {
    //           window.location.href = '/item'
    //       }else if(first_index?.subject === 'item-prchase') {
    //           window.location.href = '/purchase-item'
    //       } else if (first_index?.subject === 'stockManage') {
    //         window.location.href = '/stockmanage'
    //       }
    //     }
    //   }
    //   success(data)
    // }
    success: (data: any) => {
      // Map permissions
      const permissions = data?.payload?.permissions?.map((perm: any) => ({
        action: perm?.se_name,
        subject: perm?.group_name
      })) ?? []

      log(permissions, 'Mapped Permissions')

      // Extract browse permissions
      const browsePermissions = permissions.filter((perm: any) =>
        perm.action?.includes('-browse')
      )
      log(browsePermissions, 'Browse Permissions')

      const firstPermission = browsePermissions?.[0]
      if (!firstPermission) {
        console.warn('No browse permission found, cannot redirect.')
        return
      }

      // Optional: filtered permission list (can be used if needed)
      const filteredPermissions = permissions.filter((item: any) =>
        browsePermissions.some(
          (perm: any) => perm.action === item.action && perm.subject === item.subject
        )
      )
      log(filteredPermissions, 'Filtered Permissions')

      // Construct user object with abilities
      const userData = {
        ...data?.payload,
        ability: permissions.concat(extraPermissions)
      }

      // Dispatch login and show toast
      dispatch(handleLogin(userData))
      SuccessToast(successMessage)

      // Update ability
      ability.update(userData.ability)

      // Handle redirection
      if (redirect) {
        if (data?.payload?.role_id === 1) {
          window.location.href = '/report'
          return
        }

        // Subject to route mapping
        const redirectMap: Record<string, string> = {
          dashboard: '/dashboard',
          unit: '/unit',
          cafe: '/cafe',
          order: '/order',
          adminEmployee: '/commons/employee',
          menu: '/menus',
          category: '/category',
          product: '/product',
          employee: '/commons/employee',
          salary: '/commons/salary',
          customer: '/customer',
          customerAccount: '/account',
          expense: '/expense',
          attendence: '/attendance',
          OnlyForCafe: '/sub-cafe',
          role: '/role',
          wastage: '/manage-wastage',
          'stock-history-browse': '/stock-manage-log',
          'stock-transfer': '/stock-transfer',
          'pull-data': '/pull-data',
          'opening-stock': '/cafe-opening-stock',
          brand: '/brand',
          catsubcat: '/warehouse-category',
          item: '/item',
          'item-prchase': '/purchase-item',
          stockManage: '/stockmanage'
        }

        const redirectPath = redirectMap[firstPermission.subject]
        if (redirectPath) {
          window.location.href = redirectPath
        } else {
          console.warn('No redirect path matched for:', firstPermission.subject)
        }
      }

      // Optional: success callback
      success(data)
    }

  })
}

export const otpApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    path: ApiEndpoints.otp,
    showErrorToast: true,
    authenticate: false
  })
}

export const sendResetLinkApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    path: ApiEndpoints.login,
    showErrorToast: true
  })
}

export const resetPasswordApi = (args: LoginApiArgs) => {
  http.request({
    ...args,
    method: 'post',
    path: ApiEndpoints.login,
    showErrorToast: true
  })
}
