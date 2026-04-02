import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import TooltipLink from '@src/modules/common/components/tooltip/TooltipLink'
import { handleLogin } from '@src/redux/authentication'
import { getPath } from '@src/router/RouteHelper'
import { OrderStatus, PaymentMode, PaymentModeWithUdhaar } from '@src/utility/Const'

import Show, { Can } from '@src/utility/Show'
import {
  FM,
  JsonParseValidate,
  SuccessToast,
  createConstSelectOptions,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { AbilityContext } from '@src/utility/context/Can'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import InputNumber from 'rc-input-number'
import { Fragment, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { Check, Key, List, Minus, Plus, Trash2 } from 'react-feather'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  CardBody,
  CardFooter,
  Col,
  Form,
  InputGroupText,
  Row
} from 'reactstrap'
import * as yup from 'yup'
import logo from '../../../../assets/images/logo/logo.png'
import {
  menusResponseTypes,
  orderContainsResponseTypes,
  orderResponseTypes
} from '../../redux/RTKFiles/ResponseTypes'
import { useLoadMenusMutation } from '../../redux/RTKFiles/cafe/MenusRTK'
import {
  useCreateOrUpdateOrdersMutation,
  useViewOrdersMutation
} from '../../redux/RTKFiles/cafe/OrderRTK'
import { useCafeChLoginMutation } from '../../redux/RTKFiles/common-cafe/AuthRTK'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

const userFormSchema = {
  // file: yup.string().required()
  //   discount: yup
  //     .number()
  //     .optional()
  //     .min(0)
  //     .max(100)
  //     .typeError('Discount should be a number between 0 and 100')
  //     .required(),
  cash_amount: yup.number().optional().min(0).typeError('Cash amount should be a number'),
  online_amount: yup.number().optional().min(0).typeError('Online amount should be a number'),
  udhaar_amount: yup.number().optional().min(0).typeError('Udhaar amount should be a number')
  //table_number: yup.number().optional().notRequired().min(0).typeError('Table number should be a number'),
}
const schema = yup.object(userFormSchema)

interface States {
  view?: string
  timer?: any
  scrollPos?: any
  sidebarHeight?: any
  menuArr?: any
}

function Dashboard(props: any) {
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const refEl = useRef<HTMLElement | any>(null)
  const refEl2 = useRef<HTMLElement | any>(null)
  const [modalAdd, toggleModalAdd] = useModal()
  const [udharData, setUdharData] = useState<any>(0)

  const defaultValues: orderResponseTypes = {
    customer_id: '',
    order_status: {
      label: 'Pending',
      value: 1
    },
    payment_received: 0,
    order_type: '',
    total_quantity: '',
    total_amount: '',
    cash_amount: 0,
    online_amount: 0,
    udhaar_amount: 0,
    discount: 0,
    tax_amount: '',
    payable_amount: '',
    send_invoice_to_whats_app: 1,
    payment_mode: {
      label: 'UPI',
      value: 2
    },
    order_duration: '',
    created_at: '',
    updated_at: '',
    order_details: []
  }
  const form = useForm<orderResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  const initState: States = {
    view: 'list',
    scrollPos: undefined,
    sidebarHeight: undefined,
    timer: new Date().toLocaleTimeString(),
    menuArr: []
  }
  const nav = useNavigate()
  const reducers = stateReducer<States>
  const [state, setState] = useReducer(reducers, initState)
  const params = useParams()
  const ability = useContext(AbilityContext)
  const [loading, setLoading] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<any>([])
  const [selectedIds, setSelectedIds] = useState<any>([])
  const [dataCheck, setDataCheck] = useState<boolean>(false)
  const [loadMenu, menuRes] = useLoadMenusMutation()
  const [createOrder, orderRes] = useCreateOrUpdateOrdersMutation()
  const [viewOrder, viewOrderRes] = useViewOrdersMutation()
  const menuData: menusResponseTypes = menuRes?.data?.payload
  const viewOrders: orderResponseTypes = viewOrderRes?.data?.payload
  const [ChildLogin, createChildLogin] = useCafeChLoginMutation()
  const users = useUser()

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const menuDataS = isValidArray(menuData) ? menuData : []

  useEffect(() => {
    if (orderRes?.isSuccess === false) {
      setLoading(false)
    }
  }, [orderRes])

  //cafe child login
  useEffect(() => {
    if (!createChildLogin.isUninitialized) {
      if (createChildLogin.isSuccess) {
        const data = createChildLogin.data
        const extraPermissions = [
          {
            action: 'manage',
            subject: 'all'
          }
        ]
        const p =
          data?.payload?.permissions?.map((a) => ({
            action: a.se_name,
            subject: a?.group_name
          })) ?? []

        const m = {
          ...data?.payload,
          ability: p
        }
        dispatch(handleLogin(m))
        SuccessToast('cafe child login')
        if (data?.payload?.permissions) {
          ability.update(m?.ability)
        }
        window.location.href = '/report'
      } else if (createChildLogin.isError) {
        // handle error
        const errors: any = createChildLogin.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createChildLogin])

  //child login button submission
  const childLoginButton = (e: any) => {
    //const encoded = base64.encode(row?.uuid)
    ChildLogin({
      jsonData: {
        // ...user,
        account_uuid: users?.parent_key,
        is_back_to_self_account: 1
      }
    })
  }

  //search filter
  useEffect(() => {
    //get time out for search
    const timer = setTimeout(() => {
      loadMenu({
        jsonData: {
          name: isValid(form.watch('search')) ? form.watch('search') : null
        }
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [form.watch('search')])

  //get view order details
  useEffect(() => {
    if (isValid(params.id)) {
      viewOrder({
        id: Number(params?.id)
      })
    }
  }, [params])

  //header button show in admin login directly in
  useEffect(() => {
    setHeaderMenu(
      <>
        <Show IF={users?.parentLogin === true || users?.parent_key !== null}>
          <BsTooltip<ButtonProps>
            className='btn btn-primary btn-sm'
            color='primary'
            size='sm'
            onClick={childLoginButton}
            title='Back To Admin'
            Tag={Button}
          >
            <>
              <Key className={'ficon ' + (modalAdd ? 'text-primary' : '')} size={'14'} />
              <span> Admin</span>
            </>
          </BsTooltip>
        </Show>
      </>
    )
  }, [users])

  //add order in menu click operation
  const handleMenuClick = (item: any) => {
    // update array if already exist
    const index = state.menuArr.findIndex((x: any) => x.id === item.id)
    // setSelectedIndex(i)
    //color change
    setSelectedIds((prevSelectedIds: any) => {
      if (prevSelectedIds.includes(item.id)) {
        // If the item is already selected, remove it from the selection
        return prevSelectedIds.filter((id: any) => id !== state.menuArr.findIndex((x: any) => x.id))
      } else {
        // If the item is not selected, add it to the selection
        return [...prevSelectedIds, item.id]
      }
    })

    if (index !== -1) {
      const newArr = [...state.menuArr]
      newArr[index] = { ...item, buy_quantity: newArr[index].buy_quantity + 1 }
      setState({ menuArr: newArr })
      return
    }
    setState({ menuArr: [...state.menuArr, { ...item, buy_quantity: 1 }] })
  }

  //update quantity
  const updateQuantity = (item: any, value: any) => {
    const index = state.menuArr.findIndex((x: any) => x.id === item.id)
    setSelectedIds((prevSelectedIds: any) => {
      if (prevSelectedIds.includes(item.id)) {
        // If the item is already selected, remove it from the selection
        return prevSelectedIds.filter((id: any) => id !== item.id)
      } else {
        // If the item is not selected, add it to the selection
        return [...prevSelectedIds, item.id]
      }
    })
    if (index !== -1) {
      const newArr = [...state.menuArr]
      newArr[index] = { ...item, buy_quantity: value, instruction: '' }
      setState({ menuArr: [...newArr] })
    }
  }

  //delete quantity
  const deleteItem = (item: any) => {
    const index = state.menuArr.findIndex((x: any) => x.id === item.id)
    setSelectedIds((prevSelectedIds: any) => {
      if (prevSelectedIds.includes(item.id)) {
        // If the item is already selected, remove it from the selection
        return prevSelectedIds.filter((id: any) => id !== item.id)
      } else {
        // If the item is not selected, add it to the selection
        return [...prevSelectedIds, item.id]
      }
    })
    if (index !== -1) {
      const newArr = [...state.menuArr]
      newArr.splice(index, 1)
      setState({ menuArr: [...newArr] })
    }
  }

  //handle submit
  const handlePlaceOrder = (userData: any) => {
    log('userData', userData)
    setLoading(true)
    if (!userData?.payment_mode) {
      toast.error('Please select payment mode')
      setLoading(false)
    } else {
      const data = {
        ...userData,
        order_status: userData?.order_status?.value,
        payment_mode: userData?.payment_mode?.value,
        customer_id: userData?.customer_id?.value,
        send_invoice_to_whats_app: userData?.send_invoice_to_whats_app === 1 ? true : false,
        table_number: userData?.table_number,
        contact_number: userData?.contact_number,
        cash_amount:
          form.watch('payment_mode')?.value === 1
            ? Number(userData?.payable_amount)
            : form.watch('payment_mode')?.value === 3
              ? Number(userData?.cash_amount)
              : form.watch('payment_mode')?.value === 3 && form.watch('order_status')?.value === 1
                ? Number(userData?.cash_amount)
                : form.watch('payment_mode')?.value === 4
                  ? Number(userData?.cash_amount)
                  : 0,
        online_amount:
          form.watch('payment_mode')?.value === 2
            ? Number(userData?.payable_amount)
            : form.watch('payment_mode')?.value === 3
              ? Number(userData?.online_amount)
              : form.watch('payment_mode')?.value === 3 && form.watch('order_status')?.value === 1
                ? Number(userData?.online_amount)
                : form.watch('payment_mode')?.value === 4
                  ? Number(userData?.online_amount)
                  : 0,
        udhaar_amount:
          (form.watch('customer_id') && form.watch('order_status'))?.value === 1
            ? userData?.udhaar_amount
            : form.watch('payment_mode')?.value === 3 && form.watch('order_status')?.value === 3
              ? Number(form.watch('udhaar_amount'))
              : form.watch('payment_mode')?.value === 3 && form.watch('order_status')?.value === 1
                ? Number(userData?.payable_amount)
                : 0,
        payment_received: userData?.payment_received ? Number(userData?.payment_received) : 0,
        discount: Number(userData?.discount) ?? 0,
        order_duration: Math.round(
          state.menuArr?.reduce((a: any, b: any) => a + b?.order_duration, 0) /
          state.menuArr?.length
        ),
        order_details: state.menuArr.map((d: any, i: any) => {
          let taxs = (d.price * d.buy_quantity * d?.category?.tax) / 100
          // const isChecked = selectedItems.includes(d.id);
          // let p: any = form.watch('discount') ? form.watch('discount') : 0
          // const discount = isChecked ? (p * d.price) / 100 : 0
          const isChecked = selectedItems.includes(d.id)
          let p: any = form.watch(`order_details.${i}.discount` as any)
            ? form.watch(`order_details.${i}.discount` as any)
            : 0
          const discount = form.watch(`order_details.${i}.discount` as any)
            ? (p * d.price * d?.buy_quantity) / 100
            : 0
          let t1 = d?.price * d?.buy_quantity
          const price1 = t1 - discount
          let t = (price1 * d?.category?.tax) / 100
          const price = d.price - discount
          const total = form.watch(`order_details.${i}.discount` as any)
            ? price * d?.buy_quantity
            : price * d?.buy_quantity

          return {
            menu_id: d.id,
            quantity: d.buy_quantity,
            price: d.price,
            tax: t,
            order_type: 2,
            discount: userData?.order_details[i]?.discount,
            is_discount: isChecked ? true : false,
            instructions: userData?.order_details[i]?.instructions ?? '',
            preparation_duration: d.order_duration,
            total: d.price * d.buy_quantity,
            sub_total: d.price * d.buy_quantity - discount
          }
        })
      }
      // log(Number(form.watch('payable_amount')), 'payable_amount')
      // log(Number(form.watch('cash_amount')), 'cash_amount')
      // log(Number(form.watch('online_amount')), 'online_amount')

      let cash = data?.cash_amount
      let online = data?.online_amount
      let udhar = Number(form.watch('udhaar_amount'))
      let pay = Number(form.watch('payable_amount'))
      let sum = cash + online + udhar === pay
      // log(cash, online, udhar, sum)
      if (data?.order_details?.length !== 0) {
        if (sum === true) {
          createOrder({ jsonData: data })
        } else {
          toast.error('Please Enter Cash Amount and Online Amount Equal to Payable Amount')
          setLoading(false)
        }
        // createOrder({ jsonData: data })
      } else {
        setLoading(false)
        toast.error('please select the items')
      }
    }
  }

  useEffect(() => {
    if (isValid(viewOrders)) {
      const data = {
        ...viewOrders,
        order_status: viewOrders?.order_status
          ? {
            label:
              viewOrders?.order_status === 1
                ? 'Pending'
                : viewOrders?.order_status === 2
                  ? 'Confirmed'
                  : viewOrders?.order_status === 3
                    ? 'Completed'
                    : viewOrders?.order_status === 4
                      ? 'Cancelled'
                      : '',
            value: viewOrders?.order_status
          }
          : undefined,
        table_number: viewOrders?.table_number,
        contact_number: viewOrders?.contact_number,
        send_invoice_to_whats_app: viewOrders?.send_invoice_to_whats_app === true ? 1 : 0,
        payment_mode: viewOrders?.payment_mode
          ? {
            label:
              viewOrders?.payment_mode === 1
                ? 'CASH'
                : viewOrders?.payment_mode === 2
                  ? 'ONLINE'
                  : viewOrders?.payment_mode === 3
                    ? 'UDHAR'
                    : viewOrders?.payment_mode === 4
                      ? 'SPLIT'
                      : '',
            value: viewOrders?.payment_mode
          }
          : undefined,
        customer_id: viewOrders?.customer_id
          ? {
            label: viewOrders?.customer?.name,
            value: viewOrders?.customer_id
          }
          : undefined,

        order_details: viewOrders?.order_details?.map((d: orderContainsResponseTypes, i: any) => {
          const menu: menusResponseTypes = JsonParseValidate(d?.menu_detail)

          let data = parseFloat(d?.discount_amount)

          const isChecked = data > 0

          if (isChecked) {
            // Add the menu id if it's not already selected
            setSelectedItems((prevSelectedItems) => {
              if (!prevSelectedItems.includes(menu?.id)) {
                return [...prevSelectedItems, menu?.id]
              }
              return prevSelectedItems
            })

            setSelectedIds((prevSelectedIds) => {
              if (!prevSelectedIds.includes(menu.id)) {
                return [...prevSelectedIds, menu.id]
              }
              return prevSelectedIds
            })
          } else {
            // Remove the menu id if it's selected
            setSelectedItems((prevSelectedItems) => {
              return prevSelectedItems.filter((id) => id !== menu?.id)
            })

            setSelectedIds((prevSelectedIds) => {
              return prevSelectedIds.filter((id) => id !== menu.id)
            })
          }

          return {
            id: menu?.id,
            buy_quantity: d.quantity,
            price: d.price,
            order_type: 2,
            discount: viewOrders?.order_details?.[i]?.discount_per,
            category: d?.menu?.category,
            preparation_duration: d.preparation_duration,
            order_duration: d.preparation_duration,
            instructions: viewOrders?.order_details?.[i]?.instructions,
            sub_total: d.price * d.quantity,
            name: menu?.name
          }
        })
      }

      setState({ menuArr: [...data?.order_details] })
      setValues<orderResponseTypes>(
        {
          ...data
        },
        form.setValue
      )
    }
  }, [viewOrders])

  // set payment mode null if no customer id
  useEffect(() => {
    if (!isValid(form.watch('customer_id'))) {
      if (form.watch('payment_mode')?.value === 3) {
        form.setValue('payment_mode', null)
      }
    }
  }, [form.watch('customer_id')])

  useEffect(() => {
    const total =
      state.menuArr
        ?.map((a: any, i: any) => {
          // log(`a`, a)
          let t = a?.price * a?.buy_quantity
          const isChecked = selectedItems.includes(a.id)
          let p: any = form.watch(`order_details.${i}.discount` as any)
            ? form.watch(`order_details.${i}.discount` as any)
            : 0
          const discount = form.watch(`order_details.${i}.discount` as any)
            ? (p * a.price * a?.buy_quantity) / 100
            : 0
          const price = t - discount
          // log(`price`, price)
          const total = isChecked ? price : price
          // log(`total`, total)
          return total
        })
        .reduce((a: any, b: any) => a + b, 0) ?? 0
    const totalTax =
      state.menuArr
        ?.map((a: any, i: any) => {
          const isChecked = selectedItems.includes(a.id)
          let p: any = form.watch(`order_details.${i}.discount` as any)
            ? form.watch(`order_details.${i}.discount` as any)
            : 0
          const discount = form.watch(`order_details.${i}.discount` as any)
            ? (p * a.price * a?.buy_quantity) / 100
            : 0
          let t1 = a?.price * a?.buy_quantity
          const price = t1 - discount
          let t = (price * a?.category?.tax) / 100

          return t
        })
        .reduce((a: any, b: any) => a + b, 0) ?? 0
    form.setValue('total_amount', total.toFixed(2))
    form.setValue('tax_amount', totalTax.toFixed(2))
    form.setValue('payable_amount', (total + Number(totalTax)).toFixed(2))
    let totalData: any = (total + Number(totalTax)).toFixed(2)

    if (form.watch('payment_mode')?.value === 3) {
      let cash = Number(form.watch('cash_amount'))
      let online = Number(form.watch('online_amount'))
      let sum = totalData - (cash + online)
      let totalUdhar = sum.toFixed(2)
      form.setValue('udhaar_amount', totalUdhar)
    }
  }, [
    state.menuArr,
    form.watch('tax_amount'),
    form.watch('udhaar_amount'),
    form.watch,
    selectedItems,
    state.menuArr
  ])

  const closeAddModal = (reset = true) => {
    if (reset) {
      setState({ menuArr: [] })
      setDataCheck(false)
      form.reset()
    }
  }

  // handle order create response
  useEffect(() => {
    if (!orderRes.isUninitialized) {
      if (orderRes.isSuccess) {
        closeAddModal()
        SuccessToast(params?.id ? 'Updated Order Successfully' : 'Created Order Successfully')
        //navigate to list
        nav(getPath('orders'))
      } else if (orderRes.isError) {
        // handle error
        const errors: any = orderRes.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [orderRes])

  //set online amount in payment mode split
  useEffect(() => {
    if (form.watch('payment_mode')?.value === 4) {
      let payable = form.watch('payable_amount')
      let totalOnline = (payable - form.watch('cash_amount')).toFixed(2)
      form.setValue('online_amount', totalOnline)
    }
  }, [form.watch('payment_mode'), form.watch('cash_amount')])

  //set cash amount in payment mode spilt
  useEffect(() => {
    if (form.watch('payment_mode')?.value === 4) {
      let payable = form.watch('payable_amount')
      let totalCash = payable - form.watch('online_amount')
      form.setValue('cash_amount', totalCash)
    }
  }, [form.watch('payment_mode'), form.watch('online_amount')])

  //set the value payment mode in udhar
  useEffect(() => {
    let data = Number(form.watch('cash_amount'))
    let data1 = Number(form.watch('online_amount'))
    form.setValue('payment_received', data + data1)
    let data2 = Number(form.watch('payable_amount'))

    let data4 = data + data1

    let data5 = (data2 - data4).toFixed(2)

    setUdharData(data5)
  }, [
    form.watch('cash_amount'),
    form.watch('online_amount'),
    form.watch('payment_mode')?.value === 3
  ])

  useEffect(() => {
    form.setValue('udhaar_amount', udharData)
  }, [udharData])

  //set the discount checkbox
  const handleCheckboxChange = (event, itemId) => {
    const isChecked = event.target.checked
    // log(`isChecked`, isChecked)

    if (isChecked) {
      setSelectedItems([...selectedItems, itemId?.id])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId?.id))
    }
  }

  //set the all checkbox discount
  const handleSelectAllCheckboxChange = (event) => {
    const isChecked = event.target.checked
    setSelectAll(isChecked)

    if (isChecked) {
      const allItemIds = state.menuArr?.map((item) => item.id)
      setSelectedItems(allItemIds)
    } else {
      setSelectedItems([])
    }
  }

  // Use useEffect to log selectedItems when it changes
  useEffect(() => {
    // log(selectedItems, 'checked');
    let data = state.menuArr.length === selectedItems.length
    let data1 = selectedItems.length

    if (data && data1 !== 0) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [selectedItems])



  const handleChange = (e: any, i) => {
    const total =
      state.menuArr
        ?.map((a: any, i: any) => {
          // log(`a`, a)
          let t = a?.price * a?.buy_quantity
          const isChecked = selectedItems.includes(a.id)
          let p: any = form.watch(`order_details.${i}.discount` as any)
            ? form.watch(`order_details.${i}.discount` as any)
            : 0
          const discount = form.watch(`order_details.${i}.discount` as any)
            ? (p * a.price * a?.buy_quantity) / 100
            : 0
          const price = t - discount
          // log(`price`, price)
          const total = isChecked ? price : price
          // log(`total`, total)
          return total
        })
        .reduce((a: any, b: any) => a + b, 0) ?? 0
    const totalTax =
      state.menuArr
        ?.map((a: any, i: any) => {
          const isChecked = selectedItems.includes(a.id)
          let p: any = form.watch(`order_details.${i}.discount` as any)
            ? form.watch(`order_details.${i}.discount` as any)
            : 0
          const discount = form.watch(`order_details.${i}.discount` as any)
            ? (p * a.price * a?.buy_quantity) / 100
            : 0
          let t1 = a?.price * a?.buy_quantity
          const price = t1 - discount
          let t = (price * a?.category?.tax) / 100

          return t
        })
        .reduce((a: any, b: any) => a + b, 0) ?? 0
    form.setValue('total_amount', total.toFixed(2))
    form.setValue('tax_amount', totalTax.toFixed(2))
    form.setValue('payable_amount', (total + Number(totalTax)).toFixed(2))
    let totalData: any = (total + Number(totalTax)).toFixed(2)

    if (form.watch('payment_mode')?.value === 3) {
      let cash = Number(form.watch('cash_amount'))
      let online = Number(form.watch('online_amount'))
      let sum = totalData - (cash + online)
      let totalUdhar = sum.toFixed(2)
      form.setValue('udhaar_amount', totalUdhar)
    }
  }

  //render card item
  const renderCartItems = (data?: orderResponseTypes, status?: any) => {
    return (
      <Fragment>
        <Card
          id='pos-sidebar'
          className={status}
          // style={{ height: 'calc(100vh - 119px)', background: '#f8f3ff' }}
          style={{ height: 'calc(95vh - 62px)', background: '#fff' }}
        >
          <div className='border  p-1'>
            <h3 className='border-bottom'>{FM('cart-items')}</h3>
            <Form onSubmit={form.handleSubmit(handlePlaceOrder)}>
              <div className='flex-1'>
                <Row className='g-0 flex-1 border-bottom'>
                  <Col md='3'>
                    <FormGroupCustom
                      control={form.control}
                      async
                      label={FM('customer')}
                      name='customer_id'
                      isClearable
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.customers}
                      selectLabel={(e) => `${e.name}  `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                    />
                  </Col>
                  <Col md='3'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('customer-contact')}
                      name='contact_number'
                      type='number'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                      onChangeValue={(e) => {
                        const value = e.target.value

                        // Check if value length is less than 10 or more than 12
                        if (value.length < 10 || value.length > 12) {
                          form.setError(`contact_number`, {
                            type: 'manual',
                            message: 'Contact number must be between 10 and 12 digits'
                          })
                        } else {
                          form.clearErrors(`contact_number`)
                        }
                      }}
                    />
                  </Col>
                  <Col md='2'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('table')}
                      name='table_number'
                      type='number'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                    />
                  </Col>

                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('order-status')}
                      name='order_status'
                      selectOptions={createConstSelectOptions(OrderStatus, FM)}
                      type='select'
                      className='mb-1 me-1'
                      rules={{ required: true }}
                    />
                  </Col>

                  <Col md='3'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('payment-mode')}
                      name='payment_mode'
                      selectOptions={createConstSelectOptions(
                        isValid(form.watch('customer_id')) ? PaymentModeWithUdhaar : PaymentMode,
                        FM
                      )}
                      type='select'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                    />
                  </Col>
                  {form.watch('order_status')?.value === 3 &&
                    form.watch('payment_mode')?.value === 3 ? (
                    <>
                      <Col md='3'>
                        <FormGroupCustom
                          noGroup
                          isDisabled={true}
                          control={form.control}
                          placeholder='payment received'
                          name='payment_received'
                          type='number'
                          className='mb-1'
                          rules={{ required: false }}
                        />
                      </Col>

                      <Col md='3'>
                        <FormGroupCustom
                          defaultValue={0}
                          control={form.control}
                          label={FM('cash-amount')}
                          name='cash_amount'
                          type='number'
                          className='mb-1 me-1'
                          rules={{ required: false }}
                          append={
                            <InputGroupText>
                              <span>INR</span>
                            </InputGroupText>
                          }
                        />
                      </Col>
                      <Col md='3'>
                        <FormGroupCustom
                          defaultValue={0}
                          control={form.control}
                          label={FM('online-amount')}
                          name='online_amount'
                          type='number'
                          className='mb-1 me-1'
                          rules={{ required: false }}
                          append={
                            <InputGroupText>
                              <span>INR</span>
                            </InputGroupText>
                          }
                        />
                      </Col>
                      <Col md='3'>
                        <FormGroupCustom
                          key={`${udharData}`}
                          isDisabled={true}
                          control={form.control}
                          label={FM('udhar-amount')}
                          name='udhaar_amount'
                          type='number'
                          className='mb-1 me-1'
                          rules={{ required: false }}
                          append={
                            <InputGroupText>
                              <span>INR</span>
                            </InputGroupText>
                          }
                        />
                      </Col>
                    </>
                  ) : (
                    ''
                  )}

                  {form.watch('payment_mode')?.value === 4 ? (
                    <>
                      <Col md='3'>
                        <FormGroupCustom
                          control={form.control}
                          label={FM('cash-amount')}
                          name='cash_amount'
                          type='number'
                          className='mb-1 me-1'
                          rules={{ required: false }}
                          append={
                            <InputGroupText>
                              <span>INR</span>
                            </InputGroupText>
                          }
                        />
                      </Col>
                      <Col md='3'>
                        <FormGroupCustom
                          control={form.control}
                          label={FM('online-amount')}
                          name='online_amount'
                          type='number'
                          className='mb-1 me-1'
                          rules={{ required: false }}
                          append={
                            <InputGroupText>
                              <span>INR</span>
                            </InputGroupText>
                          }
                        />
                      </Col>
                      <Col md='2'>
                        {Number(form.watch('discount')) > 0 ? (
                          <>
                            {Number(form.watch('discount_amount')) ==
                              Number(form.watch('cash_amount')) +
                              Number(form.watch('online_amount')) ? (
                              <></>
                            ) : (
                              <div className='text-danger'>
                                Total Amount should be equal to payable amount
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {Number(form.watch('payable_amount')) ==
                              Number(form.watch('cash_amount')) +
                              Number(form.watch('online_amount')) ? (
                              <></>
                            ) : (
                              <div className='text-danger'>
                                Total Amount should be equal to payable amount
                              </div>
                            )}
                          </>
                        )}
                      </Col>
                    </>
                  ) : (
                    ''
                  )}
                </Row>
                <Row className='g-0 flex-1 pt-1'>
                  <Col md='3'>
                    <FormGroupCustom
                      isDisabled
                      control={form.control}
                      label={FM('payable-amount')}
                      name='payable_amount'
                      type='text'
                      className='mb-1 me-1'
                      rules={{ required: true }}
                      append={
                        <InputGroupText>
                          <span>INR</span>
                        </InputGroupText>
                      }
                    />
                  </Col>

                  <Col md='3'>
                    <FormGroupCustom
                      isDisabled
                      control={form.control}
                      label={FM('total')}
                      name='total_amount'
                      type='number'
                      className='mb-1 me-1'
                      rules={{ required: true }}
                      append={
                        <InputGroupText>
                          <span>INR</span>
                        </InputGroupText>
                      }
                    />
                  </Col>

                  <Col md='2'>
                    <FormGroupCustom
                      defaultValue={0}
                      control={form.control}
                      label={FM('tax')}
                      name='tax_amount'
                      type='number'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                    //   append={
                    //     <InputGroupText>
                    //       <span>%</span>
                    //     </InputGroupText>
                    //   }
                    />
                  </Col>

                  {/* <Col md='2'>
                    <FormGroupCustom
                      defaultValue={0}
                      control={form.control}
                      label='Discount'
                      placeholder='Discount'
                      name='discount'
                      type='number'
                      className='mb-1 me-1'
                      rules={{ required: false }}
                      append={
                        <InputGroupText>
                          <span>%</span>
                        </InputGroupText>
                      }
                    />
                  </Col> */}
                  <Col xs='2' className='mt-2'>
                    <LoadingButton
                      disabled={loading || orderRes?.isLoading}
                      loading={loading || orderRes?.isLoading}
                      className='btn-icon me-1'
                      tooltip={'Place Order'}
                      color='primary'
                      // size='sm'
                      type='submit'
                    >
                      {/* <Send size={16} /> */}
                      {FM('place-order')}
                    </LoadingButton>
                  </Col>
                  <Col md='12'>
                    <div className='px-1'>
                      <FormGroupCustom
                        // defaultValue={}

                        name={`send_invoice_to_whats_app`}
                        type={'checkbox'}
                        label={'Send Invoice To WhatsApp'}
                        className='mb-0 w-10 fw-bold text-black'
                        control={form.control}
                        rules={{ required: false }}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
          <CardBody
            ref={refEl2}
            className='p-0 border-bottom'
            style={{ height: 'calc(100vh - 500px)' }}
            id={'side_bar_card'}
          >
            <PerfectScrollbar
              key={42}
              style={{ height: state?.sidebarHeight - 42 }}
              className=''
              options={{
                wheelPropagation: false
              }}
            >
              <>
                <Row
                  key={'drdefd'}
                  className={`session-cart m-0 p-1 g-0 ${'pb-0'
                    // isValid(item?.in_offer_cart) ? 'pb-0' : 'border-bottom'
                    } align-items-start `}
                >
                  <Col md='12' className=''>
                    <Row className='g-0 mb-50 pt-50'>
                      <Col md='12' className='text-white bg-primary p-25'>
                        <Row className='ms-2'>
                          <Col xs='2'>
                            {'Discount %'}
                            {/* {state?.menuArr.length > 0 ? (
                              <>
                                <BsTooltip title='Add All Menus Discount'>
                                  <input
                                    id='selectAll'
                                    type='checkbox'
                                    onChange={handleSelectAllCheckboxChange}
                                    checked={selectAll}
                                    className='form-check-input'
                                  />
                                </BsTooltip>
                              </>
                            ) : (
                              ''
                            )} */}
                          </Col>

                          <Col xs='2'>{'Menu'}</Col>
                          <Col xs='2'>{'Price'}</Col>
                          <Col xs='2'>{'Quantity'}</Col>
                          <Col xs='2'>{'Instruction'}</Col>
                          <Col xs='2'>{'Action'}</Col>
                          {/* <Col xs='1'></Col> */}
                        </Row>
                      </Col>
                      <Col md='12'>
                        <Card className={`mb-0 m-1`}>
                          {isValidArray(state.menuArr) ? (
                            state.menuArr.map((d: any, i: any) => {
                              const isChecked = selectedItems.includes(d.id)
                              let p: any = form.watch(`order_details.${i}.discount` as any)
                                ? form.watch(`order_details.${i}.discount` as any)
                                : 0
                              const discount = form.watch(`order_details.${i}.discount` as any)
                                ? (p * d.price) / 100
                                : 0
                              const price = d.price - discount
                              const total = form.watch(`order_details.${i}.discount` as any)
                                ? price * d?.buy_quantity
                                : price * d?.buy_quantity


                              return (
                                <>
                                  <Row className='mb-1 ms-1'>
                                    <Col sx='2'>
                                      <FormGroupCustom
                                        noGroup
                                        noLabel
                                        defaultValue={0}
                                        control={form.control}
                                        label='Discount'
                                        placeholder='Discount'
                                        onChangeValue={(e) => {
                                          handleChange(e?.target.value, i)
                                        }}
                                        name={`${`order_details.${i}`}.discount`}
                                        type='number'
                                        className='mb-1 me-1'
                                        rules={{ required: false, max: 99 }}
                                      />
                                      {/* <BsTooltip title='Add particular menu discount'>
                                        <input
                                          type='checkbox'
                                          onChange={(event) => handleCheckboxChange(event, d)}
                                          checked={isChecked}
                                          className='form-check-input'
                                        />
                                      </BsTooltip> */}
                                    </Col>
                                    <Col xs='2'>{d?.name}</Col>
                                    <Col xs='2' className=''>
                                      {total.toFixed(2)}
                                      <FormGroupCustom
                                        noLabel
                                        key={`${total}---tst`}
                                        control={form.control}
                                        noGroup
                                        name={`${`order_details.${i}`}.total`}
                                        type='hidden'
                                        className='mb-0 me-1'
                                        rules={{ required: true }}
                                      />
                                    </Col>
                                    <Col xs='2'>
                                      <InputNumber
                                        min={1}
                                        value={d?.buy_quantity}
                                        onChange={(e) => {
                                          updateQuantity(d, e)
                                        }}
                                        defaultValue={d?.buy_quantity}
                                        onStep={(e, { type }) => {
                                          updateQuantity(d, e)
                                        }}
                                        className='input-sm '
                                        upHandler={<Plus />}
                                        downHandler={<Minus />}
                                      />
                                    </Col>

                                    <Col xs='2'>
                                      <FormGroupCustom
                                        noLabel
                                        control={form.control}
                                        label='Instruction'
                                        name={`${`order_details.${i}`}.instructions`}
                                        type='text'
                                        className='mb-0 me-1'
                                        rules={{ required: true }}
                                      />
                                    </Col>
                                    <Col xs='2'>
                                      <LoadingButton
                                        loading={false}
                                        className='btn-icon'
                                        tooltip={'Delete Order'}
                                        color='danger'
                                        size='sm'
                                        onClick={() => {
                                          deleteItem(d)
                                        }}
                                      >
                                        <Trash2 size={16} />
                                      </LoadingButton>
                                    </Col>
                                  </Row>
                                </>
                              )
                            })
                          ) : (
                            <span>Please Select Menu First</span>
                          )}
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </>
            </PerfectScrollbar>
            {/* </Show> */}
          </CardBody>
          <CardFooter className='mb-0 p-1 '>
            <Row className='bg-primary text-white'>
              <Col xs='12' className='mb-1 pb-1 border-bottom'>
                <Row className='g-0'></Row>
                <Row className='g-0 mt-25'>
                  <Col>
                    <h3 className='mb-0 text-white fw-bolder'>{'Total'}</h3>
                  </Col>
                  <Col xs='4' className='d-flex justify-content-end'>
                    {/* <p className='mb-0 text-dark fw-bolder'>{total + (total * 18) / 100)}</p> */}
                    <h3 className='mb-0 text-white fw-bolder'>
                      INR {form.watch('payable_amount')}
                    </h3>
                  </Col>
                </Row>
              </Col>

              {form?.watch('customer_id') ? (
                <>
                  <div>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h4 className='text-white text-capitalize'>{FM('customer-balance')}</h4>
                      <h4 className='text-white text-capitalize mt-1'>
                        {form.watch('customer_id')?.extra?.account_balance}
                      </h4>
                    </div>
                  </div>
                </>
              ) : (
                ''
              )}
            </Row>
          </CardFooter>
        </Card>
      </Fragment>
    )
  }

  // Create TIme
  useEffect(() => {
    const interval = setInterval(() => {
      setState({
        timer: new Date().toLocaleTimeString()
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <Header route={props?.route} icon={<List size='25' />} title={`Dashboard | ${state?.timer}`}>
        <ButtonGroup color='dark'>
          <TooltipLink
            className='btn btn-primary btn-icon'
            Tag={Link}
            title={'Order List'}
            to={getPath('orders')}
            color='primary'
          >
            <List size='16' />
          </TooltipLink>
        </ButtonGroup>
      </Header>

      <Row>
        <Col md='4'>
          <Card>
            <div className='border-bottom m-0 bg-primary'>
              <Row className='m-1'>
                <Col md='4' className='mt-25'>
                  <h4 className='text-white'>Menu</h4>
                </Col>

                <Col md='8'>
                  <FormGroupCustom
                    noLabel
                    control={form.control}
                    label='Search'
                    name={`search`}
                    type='text'
                    className='mb-0'
                    rules={{ required: true }}
                  />
                </Col>
              </Row>
            </div>
            <div style={{ height: '80vh', overflow: 'scroll' }}>
              {menuRes?.isLoading ? (
                <>
                  <Row>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                    <Col md='12'>
                      <Shimmer className='bg-white' height={30}></Shimmer>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  {isValidArray(menuData)
                    ? menuData?.map((item: menusResponseTypes, index: any) => {
                      const itemIndex = state.menuArr.findIndex((x) => x.id === item.id)

                      return (
                        <>
                          <div
                            className='border-bottom cursor-pointer'
                            onClick={() => handleMenuClick(item)}
                            style={{
                              backgroundColor: itemIndex !== -1 ? '#f5f5f5' : '#fff'
                            }}
                          >
                            <Row>
                              <Col md='3'>
                                <img
                                  src={item?.image_path ?? logo}
                                  className='img-fluid m-1'
                                  alt='Menu image'
                                />
                              </Col>

                              <Col md='7'>
                                <h4 className='text-primary text-capitalize mt-1'>
                                  {item?.name}
                                </h4>

                                <p className='mb-0'>
                                  <span className='fw-bolder'>Price:</span> {item?.price}
                                </p>
                              </Col>

                              <Col md='2' className=''>
                                <div className='mt-1'>
                                  {itemIndex !== -1 ? (
                                    <p>{state.menuArr[itemIndex].buy_quantity}</p>
                                  ) : (
                                    ''
                                  )}
                                </div>
                                {itemIndex !== -1 ? <Check className='text-success' /> : ''}
                              </Col>
                            </Row>
                          </div>
                        </>
                      )
                    })
                    : null}
                </>
              )}
            </div>
          </Card>
        </Col>

        <Col md='8'>{renderCartItems()}</Col>
      </Row>
    </div>
  )
}

export default Dashboard
