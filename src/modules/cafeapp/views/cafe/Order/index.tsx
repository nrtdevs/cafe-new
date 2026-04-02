import { yupResolver } from '@hookform/resolvers/yup'
import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import {
  cancelOrderResponseTypes,
  orderResponseTypes,
  orderStatusUpdateResponseTypes
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {

  useDeleteOrdersMutation,
  useGetRecipeListMutation,
  useLoadOrdersMutation,
  useOrderStatusUpdateMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/OrderRTK'
import { useLoadExportOrderDataMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/DashboardRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { getPath } from '@src/router/RouteHelper'
import { exportData } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
  FM,
  JsonParseValidate,
  SuccessToast,
  createConstSelectOptions,
  emitAlertStatus,
  formatDate,
  formatDateValue,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  Check,
  CheckCircle,
  Cpu,
  Download,
  Edit,
  Eye,
  Key,
  Menu,
  Printer,
  RefreshCcw,
  XCircle
} from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Form,
  InputGroupText,
  NavItem,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import KichenPrints from './KichenPrints'
import OrderFilter from './OrderFilter'
import OrderPrints from './OrderPrints'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
  cash_amount: yup.number().optional().min(0).typeError('Cash amount should be a number'),
  online_amount: yup.number().optional().min(0).typeError('Online amount should be a number'),
  udhaar_amount: yup.number().optional().min(0).typeError('Udhaar amount should be a number')
}

// validate
const schema = yup.object(userFormSchema)

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: orderResponseTypes
  enableEdit?: boolean
  comfirmedOrder?: boolean
  editData?: any
  cancelData?: any
  editConfirmedData?: any
}

const defaultValues: any = {
  order_id: '',
  cancel_reason: '',
  order: '',
  recipes: [{ is_reusable: '', menu_id: '', product_id: '', quantity: '', unit_id: '' }]
}
const Orders = (props: any) => {
  const componentRef = useRef<HTMLElement | any>(null)
  const [printData, setPrintData] = useState<any>(null)
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const currentDate = `${year}-${month}-${day}`
  const [kichenprintData, setKichenPrintData] = useState<any>(null)
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add order
  const canAddUser = Can(Permissions.orderCreate)
  // can edit order
  const canEditUser = Can(Permissions.orderEdit)
  // can delete order
  const canDeleteUser = Can(Permissions.orderDelete)
  //can read order
  const canReadUser = Can(Permissions.orderRead)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,

    onAfterPrint: () => {
      setKichenPrintData(null)
      setPrintData(null)
    }
  })
  // form hook
  const form = useForm<cancelOrderResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'recipes'
  })

  useEffect(() => {
    if (isValid(printData)) {
      handlePrint()
      // const dateTimeStr = '05-07-2024 14:30';
      // log(formatDateTime(dateTimeStr))
    }
  }, [printData])

  useEffect(() => {
    if (isValid(kichenprintData)) {
      handlePrint()
    }
  }, [kichenprintData])

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle export modal
  const [modalExportAdd, toggleExportModalAdd] = useModal()
  // toggle add modal
  const [modalComplete, toggleComplete] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  // const [_, createResp] = useCreateOrUpdateOrdersMutation()

  //get REcepie List
  const [loadRecepieList, recipeResp] = useGetRecipeListMutation()
  //load Dashboard orderTime report
  const [orderTable, orderTableRestResponse] = useLoadExportOrderDataMutation()
  const recepriesArray = recipeResp?.data?.payload?.recipes
  //load order List mutation
  const [loadOrders, loadResp] = useLoadOrdersMutation()
  const [statusUpdate, statusUpdateResp] = useOrderStatusUpdateMutation()
  const user1 = getUserData()
  // delete mutation
  const [orderDelete, deleteResp] = useDeleteOrdersMutation()

  const navigate = useNavigate()
  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    comfirmedOrder: false,
    editData: '',
    editConfirmedData: '',
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false
    })
    setState({ cancelData: undefined })
    form.reset()
    toggleModalAdd()
  }

  //close complete
  const closeConfirmOrder = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editConfirmedData: undefined,
      comfirmedOrder: false,
      editData: undefined
    })
    form.reset()
    toggleComplete()
  }

  //append the field value
  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  const urlDemo = orderTableRestResponse?.data?.payload?.[0]?.file_name

  useEffect(() => {
    if (urlDemo) {
      window.open(urlDemo, '_blank')
    } else {
      console.error('File URL is not available.')
    }
  }, [urlDemo])

  //load rec. list on cancel order
  useEffect(() => {
    if (state?.cancelData?.id) {
      loadRecepieList({
        id: state.cancelData?.id
      })
    }
  }, [state.cancelData])

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          {/* <BsTooltip title='Add Product'>
                        <NavLink className='' onClick={toggleModalAdd}>
                            <PlusCircle className={'ficon' + (modalAdd ? 'text-primary' : '')} />
                        </NavLink>
                    </BsTooltip> */}
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [canAddUser])

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
      form.reset()
    }
    toggleModalView()
  }

  // handle cancel data
  const handleSaveUser = (d: any) => {
    const data: any = {
      ...d,
      order_status: 4,
      order_id: state.cancelData?.id
    }

    statusUpdate({
      jsonData: data
    })
    closeAddModal()
  }

  // handle save order with ConfirmedUser
  const handleSaveConfirmedUser = (userData: any) => {
    const data: orderStatusUpdateResponseTypes = {
      ...userData,
      order_status: 2,
      order_id: userData?.id
    }

    statusUpdate({
      jsonData: data
    })
  }

  // handle save order with CompletedUser
  const handleSaveCompletedUser = (userData: any) => {
    toggleComplete()
  }

  const handleSaveCancel = (userData: any) => {
    toggleModalAdd()
  }

  // handle save complete order
  const handleSaveCompletedOrder = (userData: any) => {
    const data: orderStatusUpdateResponseTypes = {
      ...userData,
      payable_amount: userData?.payable_amount + userData?.tax_amount,
      order_status: 3,
      order_id: userData?.id
    }

    statusUpdate({
      jsonData: data
    })
  }
  // set recipes
  useEffect(() => {
    if (isValidArray(recepriesArray)) {
      const recipes = recepriesArray?.map((item: any) => {
        return {
          ...item,
          is_reusable: '1'
        }
      })
      setValues<cancelOrderResponseTypes>(
        {
          recipes: recipes
        },
        form.setValue
      )
    }
  }, [recipeResp, recepriesArray])

  const today = new Date()
  today.setDate(today.getDate() - 1)

  const previousDate = today.toISOString().split('T')[0]
  //   console.log(previousDate)

  // load order list
  const loadUserList = () => {
    loadOrders({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        // name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        start_date: state.filterData
          ? formatDateValue(state.filterData?.start_date, 'YYYY-MM-DD HH:mm:ss')
          : formatDate(new Date(), 'YYYY-MM-DD'),
        end_date: state.filterData
          ? formatDateValue(state.filterData?.end_date, 'YYYY-MM-DD HH:mm:ss')
          : ''
      }
    })
  }

  // handle user create response
  // useEffect(() => {
  //   if (!createResp.isUninitialized) {
  //     if (createResp.isSuccess) {
  //       closeAddModal()
  //       loadUserList()
  //       SuccessToast(FM('user-created-successfully'))
  //     } else if (createResp.isError) {
  //       // handle error
  //       const errors: any = createResp.error
  //       log(errors)
  //       setInputErrors(errors?.data?.payload, form.setError)
  //     }
  //   }
  // }, [createResp])

  useEffect(() => {
    if (statusUpdateResp?.isSuccess) {
      //   closeAddModal()
      loadUserList()
      SuccessToast('Order Status updated Successfully')
    }
  }, [statusUpdateResp])

  // handle pagination and load list
  useEffect(() => {
    loadUserList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e, page: e.page, per_page_record: e.per_page_record })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        ...e,
        order_status: e?.order_status?.value,
        payment_mode: e?.payment_mode?.value,
        cafe_id: e?.cafe_id?.value
      },
      page: 1,
      search: '',
      per_page_record: 20
    })
  }

  // reload Data
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValid(ids)) {
      // orderDelete({
      //     id: ids,
      //     eventId: eventId,
      //     action,
      //     ids: []
      // })
    }
  }

  // handle action result
  useEffect(() => {
    if (deleteResp?.isLoading === false) {
      if (deleteResp?.isSuccess) {
        emitAlertStatus('success', null, deleteResp?.originalArgs?.eventId)
      } else if (deleteResp?.error) {
        emitAlertStatus('failed', null, deleteResp?.originalArgs?.eventId)
      }
    }
  }, [deleteResp])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<orderResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // close export modal
  const closeExportModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
      form.reset()
    }
    toggleExportModalAdd()
  }

  const handleExport = (userData: any) => {
    orderTable({
      jsonData: {
        user_id:
          user1?.role_id === 2 || user1?.role_id === 6 ? userData?.user_id?.value : user1?.id,
        from_date: formatDate(userData?.from_date, 'YYYY-MM-DD'),
        to_date: formatDate(userData?.to_date, 'YYYY-MM-DD'),
        export: userData?.export?.value,
        cafe_id: user1?.cafe_id
      }
    })

    closeExportModal()
  }

  //export order  modal
  const renderExportModal = () => {
    return (
      <CenteredModal
        open={modalExportAdd}
        title={'Export Order'}
        done={state.enableEdit ? '' : ''}
        buttonTitle={FM('export')}
        handleSave={form.handleSubmit(handleExport)}
        // handleSave={() => {
        //     setState({
        //         enableEdit: true
        //     })
        //     closeViewModal(false)
        //     // toggleModalAdd()
        // }}
        handleModal={() => closeExportModal(true)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleExport)}>
            <Show IF={user1?.role_id === 2 || user1?.role_id === 6}>
              <Col md='12' lg='12' xl='12' sm='12'>
                <Show IF={user1?.role_id === 2 || user1?.role_id === 6}>
                  <FormGroupCustom
                    control={form.control}
                    async
                    isClearable
                    label={'employee'}
                    name='user_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.employeList}
                    selectLabel={(e) => ` ${e.name} `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Show>
              </Col>
            </Show>
            <Col md='12' lg='12' sm='12' xs='12'>
              <FormGroupCustom
                control={form.control}
                label={'select export data'}
                name='export'
                type='select'
                selectOptions={createConstSelectOptions(exportData, FM)}
                className='mb-1'
                rules={{ required: true }}
              />
            </Col>

            <Col md='12' lg='12' sm='12' xs='12'>
              <FormGroupCustom
                control={form.control}
                label={'from date'}
                name='from_date'
                type='date'
                className='mb-1'
                datePickerOptions={{
                  maxDate: new Date()
                }}
                // dateFormat='YYYY-MM-DD'
                rules={{ required: true }}
              />
            </Col>

            {form.watch('from_date') ? (
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'to date'}
                  name='to_date'
                  type='date'
                  // dateFormat='YYYY-MM-DD'
                  className='mb-1'
                  datePickerOptions={{
                    minDate: form.watch('from_date')
                  }}
                  rules={{ required: true }}
                />
              </Col>
            ) : (
              ''
            )}
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // create cancel modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.cancelData ? 'Update' : 'Save'}
        title={state.cancelData ? 'Cancel Order' : 'Create Order'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={statusUpdateResp.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12' sm='12' xs='12' lg='12'>
                <FormGroupCustom
                  noLabel
                  control={form.control}
                  label={FM('cancel-reason')}
                  name='cancel_reason'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              {/* <Col md='12' sm='12' xs='12' lg='12'>
                                <Row className='bg-primary p-1'>
                                    <Col>
                                        <h4 className='text-white'>{FM('name')}</h4>
                                    </Col>
                                    <Col>
                                        <h4 className='text-white'>{FM('quantity')}</h4>
                                    </Col>
                                    <Col>
                                        <h4 className='text-white'>{FM('reusable')}</h4>
                                    </Col>
                                    <Col>
                                        <h4 className='text-white'>{FM('waste')}</h4>
                                    </Col>
                                </Row>
                                <div style={{ height: '50vh', overflow: 'scroll' }}>
                                    {isValidArray(recepriesArray) ? (
                                        recepriesArray?.map((item: any, index: any) => {
                                            return (
                                                <Row className='p-1'>
                                                    <Col>{item?.product?.name}</Col>
                                                    <Col>
                                                        {item?.quantity}
                                                        {item?.unit?.name}
                                                    </Col>
                                                    <Col>
                                                        <FormGroupCustom
                                                            key={index}
                                                            defaultValue={`1`}
                                                            control={form.control}
                                                            label={FM('reusable')}
                                                            name={`recipes.${index}.is_reusable`}
                                                            type='radio'
                                                            className=''
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                    <Col>
                                                        <FormGroupCustom
                                                            key={index}
                                                            defaultValue={`2`}
                                                            control={form.control}
                                                            label={FM('waste')}
                                                            name={`recipes.${index}.is_reusable`}
                                                            type='radio'
                                                            className=''
                                                            rules={{ required: false }}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        })
                                    ) : (
                                        <span className='text-danger'>No Recipies</span>
                                    )}
                                </div>
                            </Col> */}
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  let number = state.selectedUser?.total_amount - state.selectedUser?.payable_amount
  let formattedNumber = number.toFixed(2)
  const totalDiscount = state.selectedUser?.order_details
    .reduce((acc, d) => acc + (parseFloat(d.discount_amount) || 0), 0)
    .toFixed(2)

  const handleconfirm = (data: any) => {
    const data1: orderStatusUpdateResponseTypes = {
      ...data,
      payment_received: data?.payment_received ? data?.payment_received : 0,
      payable_amount: state?.editData?.payable_amount + state?.editData?.tax_amount,
      cash_amount: data?.cash_amount ? parseFloat(data?.cash_amount) : 0,
      online_amount: data?.online_amount ? parseFloat(data?.online_amount) : 0,
      udhaar_amount: data?.udhaar_amount ? parseFloat(data?.udhaar_amount) : 0,
      order_status: 3,
      customer_id: state?.editData?.customer_id,
      order_id: state?.editData?.id
    }

    statusUpdate({
      jsonData: data1
    })
    closeConfirmOrder()
  }

  useEffect(() => {
    if (state.editData) {
      let data = parseFloat(form.watch('cash_amount')) ? parseFloat(form.watch('cash_amount')) : 0
      let data1 = parseFloat(form.watch('online_amount'))
        ? parseFloat(form.watch('online_amount'))
        : 0
      form.setValue('payment_received', data + data1)
      let data2 = parseFloat(state.editData?.payable_amount)
      let data3 = 0
      let data4 = data2 + data3
      let data5 = data4 - data - data1
      let data6 = Number(data5).toFixed(2)
      form.setValue('udhaar_amount', data6)
    }
  }, [state.editData, form.watch('cash_amount'), form.watch('online_amount')])
  // user complete modal
  const renderConfirmedModal = () => {
    return (
      <CenteredModal
        open={modalComplete}
        done={state.comfirmedOrder ? 'Update' : 'Save'}
        title={'Complete Order'}
        handleModal={closeConfirmOrder}
        modalClass={'modal-lg'}
        loading={statusUpdateResp.isLoading}
        handleSave={form.handleSubmit(handleconfirm)}
      >
        <div className='p-2'>
          <div className='container'>
            <Row>
              <Col md='6'>
                <h4 className='text-black'>Customer Name : {state?.editData?.customer?.name}</h4>
              </Col>
              <Col md='6'>
                <h4 className='text-black'>
                  {'Account Balance'} : {state?.editData?.customer?.account_balance}
                </h4>
              </Col>
              <Col md='12'>
                <h4 className='text-black'>
                  {'Payable Amount(₹)'} : {Number(state?.editData?.payable_amount)}
                </h4>
              </Col>
            </Row>
          </div>
          <Form onSubmit={form.handleSubmit(handleconfirm)}>
            <Row className='mt-2'>
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
                  control={form.control}
                  defaultValue={0}
                  label='cash Amount'
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
                  defaultValue={0}
                  label='Online Amount'
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
                  control={form.control}
                  isDisabled={true}
                  label={FM('udhaar-amount')}
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
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={`Table No:${state.selectedUser?.table_number}`}
        done='edit'
        hideClose
        disableFooter
        modalClass={'modal-lg'}
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='px-2 py-2'>
          <div className='row mb-2 pb-1 mx-0 border-bottom'>
            <div className='col-xl-8'>
              <ul className='list-unstyled mb-0'>
                {state?.selectedUser?.customer_id ? (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                      {FM('customer-name')}:
                    </span>
                    <span className='text-primary fw-bold'>
                      {state?.selectedUser?.customer?.name}
                    </span>
                  </li>
                ) : (
                  <li className='mb-75 text-muted small italic'>Walk-in Customer</li>
                )}

                <li className='mb-75 d-flex align-items-center'>
                  <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                    {FM('customer-contact')}:
                  </span>
                  <span className='text-secondary'>{state?.selectedUser?.contact_number || '-'}</span>
                </li>

                {(state?.selectedUser?.payment_mode === 4 ||
                  state?.selectedUser?.payment_mode === 3) && (
                    <>
                      <li className='mb-75 d-flex align-items-center'>
                        <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                          {FM('cash')}:
                        </span>
                        <span>
                          <CurrencyRupee sx={{ maxHeight: '14px' }} />
                          {state?.selectedUser?.cash_amount}
                        </span>
                      </li>
                      <li className='mb-75 d-flex align-items-center'>
                        <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                          {FM('online')}:
                        </span>
                        <span>
                          <CurrencyRupee sx={{ maxHeight: '14px' }} />
                          {state?.selectedUser?.online_amount}
                        </span>
                      </li>
                    </>
                  )}

                {state?.selectedUser?.payment_mode === 1 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                      {FM('cash')}:
                    </span>
                    <span>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.cash_amount}
                    </span>
                  </li>
                )}

                {state?.selectedUser?.payment_mode === 2 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                      {FM('online')}:
                    </span>
                    <span>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.online_amount}
                    </span>
                  </li>
                )}

                {state?.selectedUser?.payment_mode === 3 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-danger me-50' style={{ minWidth: '140px' }}>
                      {FM('udhaar')}:
                    </span>
                    <span className='text-danger fw-bold'>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.udhaar_amount}
                    </span>
                  </li>
                )}

                <li className='mb-0 d-flex align-items-center'>
                  <span className='fw-bold text-dark me-50' style={{ minWidth: '140px' }}>
                    {FM('discount-amount')}:
                  </span>
                  <span className='text-success fw-bold'>
                    <CurrencyRupee sx={{ maxHeight: '14px' }} />
                    {totalDiscount}
                  </span>
                </li>
              </ul>
            </div>
            <div className='col-xl-4 border-start-md ps-md-2 mt-2 mt-md-0'>
              <ul className='list-unstyled mb-0'>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('invoice')}:</span>
                  <span className='text-secondary'>#{state.selectedUser?.order_number}</span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>Created:</span>
                  <span className='text-secondary'>
                    {formatDate(state.selectedUser?.created_at, 'MMM DD, YYYY')}
                  </span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>Status:</span>
                  <Badge
                    pill
                    color={
                      state.selectedUser?.order_status === 1
                        ? 'light-warning'
                        : state.selectedUser?.order_status === 3
                          ? 'light-success'
                          : state.selectedUser?.order_status === 2
                            ? 'light-primary'
                            : 'light-danger'
                    }
                    className='text-capitalize'
                  >
                    {state.selectedUser?.order_status === 1
                      ? 'Pending'
                      : state.selectedUser?.order_status === 3
                        ? 'Completed'
                        : state.selectedUser?.order_status === 2
                          ? 'Confirmed'
                          : 'Cancelled'}
                  </Badge>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('transaction')}:</span>
                  <span>
                    {state.selectedUser?.payment_mode === 1 ? (
                      <Badge color='light-warning'>Cash</Badge>
                    ) : state.selectedUser?.payment_mode === 2 ? (
                      <Badge color='light-danger'>{FM('online')}</Badge>
                    ) : state.selectedUser?.payment_mode === 4 ? (
                      <Badge color='light-secondary'>Split</Badge>
                    ) : state.selectedUser?.payment_mode === 3 ? (
                      <Badge color='light-secondary'>{FM('udhaar')}</Badge>
                    ) : (
                      ''
                    )}
                  </span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('order-duration')}:</span>
                  <span className='text-secondary'>{state.selectedUser?.order_duration} mins</span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('employee')}:</span>
                  <span className='text-secondary'>{state.selectedUser?.employee?.name || '-'}</span>
                </li>
                {state?.selectedUser?.cancel_reason && (
                  <li className='mb-0 d-flex align-items-top'>
                    <i
                      className='fas fa-circle font-small-3 me-50 text-danger mt-25'
                      style={{ fontSize: '10px' }}
                    ></i>
                    <div>
                      <span className='fw-bold text-danger me-50'>{FM('cancel-reason')}:</span>
                      <span className='text-danger small'>{state.selectedUser?.cancel_reason}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className='table-responsive border rounded-3 my-2'>
            <table className='table table-hover table-striped mb-0'>
              <thead className='table-light text-dark fw-bold'>
                <tr>
                  <th className='py-1 ps-2'>#</th>
                  <th className='py-1'>{FM('menu-name')}</th>
                  <th className='py-1 text-center'>{FM('qty')}</th>
                  <th className='py-1 text-end'>{FM('price')} (₹)</th>
                  <th className='py-1 text-center'>{FM('discount')} %</th>
                  <th className='py-1 text-end'>{FM('discount-price')} (₹)</th>
                  <th className='py-1'>{FM('instruction')}</th>
                  <th className='py-1 text-end pe-2'>{FM('total')} (₹)</th>
                </tr>
              </thead>
              <tbody>
                {state?.selectedUser?.order_details?.map((item: any, index: any) => {
                  const menu = JsonParseValidate(item?.menu_detail)
                  return (
                    <tr key={index}>
                      <td className='ps-2 align-middle'>{index + 1}</td>
                      <td className='align-middle fw-bold text-dark'>{menu?.name}</td>
                      <td className='text-center align-middle'>{item?.quantity}</td>
                      <td className='text-end align-middle'>{item?.price}</td>
                      <td className='text-center align-middle'>
                        {item?.discount_per > 0 ? (
                          <span className='text-success'>{item?.discount_per}%</span>
                        ) : (
                          <span className='text-muted'>-</span>
                        )}
                      </td>
                      <td className='text-end align-middle'>
                        {item?.discount_amount > 0 ? (
                          <span className='text-success'>{item?.discount_amount}</span>
                        ) : (
                          <span className='text-muted'>-</span>
                        )}
                      </td>
                      <td className='align-middle text-muted small'>{item?.instructions || '-'}</td>
                      <td className='text-end align-middle fw-bolder text-dark pe-2'>
                        {(item?.total - item?.discount_amount).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className='row justify-content-end pr-1 mx-0'>
            <div className='col-md-5 bg-light p-1 rounded-3'>
              <div className='d-flex justify-content-between mb-50'>
                <span className='text-muted fw-bold'>SubTotal(₹) :</span>
                <span className='fw-bold text-dark'>{state.selectedUser?.total_amount}</span>
              </div>
              <div className='d-flex justify-content-between mb-50'>
                <span className='text-muted fw-bold'>{FM('tax')} (₹) : </span>
                <span className='fw-bold text-dark'>
                  {Number(state.selectedUser?.tax_amount).toFixed(2)}
                </span>
              </div>
              <div className='d-flex justify-content-between border-top mt-1 pt-1'>
                <h5 className='fw-bolder text-primary mb-0 uppercase'>{FM('total-amount')}(₹) : </h5>
                <h5 className='fw-bolder text-primary mb-0'>
                  {Number(state.selectedUser?.payable_amount).toFixed(2)}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </CenteredModal>
    )
  }

  const statusObj1 = {
    cash: 'light-primary',
    online: 'light-success',
    recurring: 'light-dark',
    split: 'light-secondary'
  }

  // table columns
  const columns: TableColumn<orderResponseTypes>[] = [
    {
      name: 'table no. ',
      sortable: false,

      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              setState({
                selectedUser: row
              })
            }}
            className='text-primary'
          >
            {row?.table_number}
          </span>
        </Fragment>
      )
    },
    {
      name: 'Invoice No.',
      sortable: false,

      cell: (row) => <Fragment>{row?.order_number}</Fragment>
    },

    {
      name: 'Payable Amount(₹)',
      sortable: false,
      minWidth: '200px',
      cell: (row) => (
        <Fragment>
          {Number(row?.payable_amount)}
          {
            <CurrencyRupee
              sx={{
                maxHeight: '15px'
              }}
            />
          }
        </Fragment>
      )
    },

    {
      name: 'transaction',
      sortable: false,
      minWidth: '160px',
      cell: (row) => (
        <Fragment>
          {
            <Badge
              pill
              className='text-capitalize'
              color={
                statusObj1[
                row?.payment_mode === 1
                  ? 'cash'
                  : row?.payment_mode === 2
                    ? 'online'
                    : row?.payment_mode === 4
                      ? 'split'
                      : row?.payment_mode === 3
                        ? 'udhar'
                        : ''
                ]
              }
            >
              {row?.payment_mode === 1
                ? 'cash'
                : row?.payment_mode === 2
                  ? 'upi'
                  : row?.payment_mode === 4
                    ? 'split'
                    : row?.payment_mode === 3
                      ? 'udhar'
                      : ''}
            </Badge>
          }
        </Fragment>
      )
    },
    {
      name: 'status',
      sortable: false,

      cell: (row) => (
        <Fragment>
          {row?.order_status === 1 ? (
            <Fragment>
              <Badge pill color='light-warning'>
                {'pending'}
              </Badge>
            </Fragment>
          ) : row?.order_status === 3 ? (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-success'>
                {'Completed'}
              </Badge>
            </Fragment>
          ) : row?.order_status === 2 ? (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-primary'>
                {'Confirmed'}
              </Badge>
            </Fragment>
          ) : (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-danger'>
                {' Cancelled'}
              </Badge>
            </Fragment>
          )}
        </Fragment>
      )
    },
    {
      name: 'Created Date',
      sortable: false,
      id: 'Created Date',
      minWidth: '160px',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.created_at, 'MM/DD/YYYY hh:mm:ss')}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      minWidth: '325px',
      center: true,
      cell: (row) => (
        <Fragment>
          {/* <DropDownMenu
                        options={[
                            {
                                IF: row?.order_status === 1,
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                to: getPath('update.order', { id: row?.id })
                                // onClick: () => {
                                //   toggleModalAdd()
                                //   setState({ editData: row })
                                // }
                            },
                            {
                                icon: <Printer size={'14'} />,
                                name: 'Print',
                                onClick: () => {
                                    setPrintData(row)
                                }
                            },
                            {
                                icon: <Eye size={'14'} />,
                                name: 'View',
                                onClick: () => {
                                    setState({
                                        selectedUser: row
                                    })
                                }
                            },
                            {
                                IF: row?.order_status === 1 || row?.order_status === 2,
                                icon: <XCircle size={'14'} />,
                                name: 'Cancel Order',
                                onClick: () => {
                                    toggleModalAdd()

                                    setState({ editData: row })
                                }
                            },
                            {
                                IF: row?.order_status === 1,
                                icon: <CheckCircle size={'14'} />,
                                name: 'Confirmed Order',
                                onClick: () => {
                                    handleSaveConfirmedUser(row)

                                    //   setState({ editData: row })
                                }
                            },
                            {
                                IF: row?.order_status === 2 || row?.order_status === 1,
                                icon: <CheckCircle size={'14'} />,
                                name: 'Completed Order',
                                onClick: () => {
                                    handleSaveCompletedUser(row)

                                    //   setState({ editData: row })
                                }
                            }
                          

                        ]}
                    /> */}
          <ButtonGroup role='group' className='my-2'>
            <UncontrolledTooltip placement='top' id='print' target='print'>
              {'print without kitchen'}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-primary btn-sm'
              id='print'
              color='primary'
              onClick={() => {
                setPrintData(row)
              }}
            >
              <Printer size={14} />
            </Button>
            <UncontrolledTooltip placement='top' id='print1' target='print1'>
              {'print kitchen'}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-info btn-sm'
              id='print1'
              color='primary'
              onClick={() => {
                setKichenPrintData(row)
              }}
            >
              <Printer size={14} />
            </Button>
            {canReadUser ? (
              <>
                <UncontrolledTooltip placement='top' id='view' target='view'>
                  {'view'}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-secondary btn-sm'
                  id='view'
                  color='secondary'
                  onClick={() => {
                    setState({
                      selectedUser: row
                    })
                  }}
                >
                  <Eye size={14} />
                </Button>
              </>
            ) : (
              ''
            )}

            <Show IF={row?.order_status === 1}>
              <UncontrolledTooltip placement='top' id='edit' target='edit'>
                {'edit'}
              </UncontrolledTooltip>
              <Button
                className='d-flex waves-effect btn btn-dark btn-sm'
                id='edit'
                color=''
                onClick={() => {
                  navigate(getPath('update.order', { id: row?.id }))

                  //orders-log
                }}
              >
                <Edit size={14} />
              </Button>
            </Show>
            <Show IF={row?.order_status === 1 || row?.order_status === 2}>
              <UncontrolledTooltip placement='top' id='Cancel' target='Cancel'>
                {FM('cancel-order')}
              </UncontrolledTooltip>
              <Button
                className='d-flex waves-effect btn btn-danger btn-sm'
                id='Cancel'
                color=''
                onClick={() => {
                  handleSaveCancel(row)
                  setState({ cancelData: row })
                }}
              >
                <XCircle size={14} />
              </Button>
              {/* <UncontrolledTooltip placement='top' id={`grid-delete-${row?.id}`} target={`grid-delete-${row?.id}`}>
                                {FM('cancle-order')}
                            </UncontrolledTooltip>
                            <ConfirmAlert
                                className='d-flex waves-effect btn btn-danger btn-sm'
                                eventId={`item-delete-${row?.id}`}
                                text={FM('are-you-sure')}
                                title={FM('cancle-order', { name: row?.order_number })}

                                onClickYes={() => {
                                    toggleModalAdd()

                                    setState({ editData: row })
                                }}
                                onSuccessEvent={onSuccessEvent}
                                id={`grid-delete-${row?.id}`}
                            >
                                <XCircle size={14} />
                           
                            </ConfirmAlert> */}
            </Show>
            <Show IF={row?.order_status === 1}>
              <UncontrolledTooltip placement='top' id='Confirmed' target='Confirmed'>
                {'Confirmed Order'}
              </UncontrolledTooltip>
              <Button
                className='d-flex waves-effect btn btn-warning btn-sm'
                id='Confirmed'
                color=''
                onClick={() => {
                  handleSaveConfirmedUser(row)
                }}
              >
                <CheckCircle size={14} />
              </Button>
            </Show>
            <Show IF={row?.order_status === 1 || row?.order_status === 2}>
              {/* <UncontrolledTooltip placement='top' id='Completed' target='Completed'>
                                {("Completed order")}
                            </UncontrolledTooltip>
                            <Button className='d-flex waves-effect btn btn-success btn-sm' id='Completed' color=''
                                onClick={() => {
                                    handleSaveCompletedUser(row)
                                }}
                            >
                                <Check size={14} />
                            </Button> */}
              <Show
                IF={row?.payment_mode === 1 || row?.payment_mode == 2 || row?.payment_mode == 4}
              >
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {'Completed order'}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-success btn-sm'
                  eventId={`item-delete-${row?.order_number}`}
                  text={FM('are-you-sure')}
                  title={FM('completed-order', { order_number: row?.order_number })}
                  loader={false}
                  onClickYes={() => {
                    // toggleModalAdd()
                    handleSaveCompletedOrder(row)
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Check size={14} id='delete' />
                </ConfirmAlert>
              </Show>
              <Show IF={row?.customer_id && row?.payment_mode === 3}>
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {'Completed order'}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-success btn-sm'
                  eventId={`item-delete-${row?.order_number}`}
                  text={FM('are-you-sure')}
                  title={FM('completed-order', { order_number: row?.order_number })}
                  loader={false}
                  onClickYes={() => {
                    // toggleModalAdd()
                    handleSaveCompletedUser(row)
                    setState({
                      editData: row
                    })
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Check size={14} id='delete' />
                </ConfirmAlert>
              </Show>
            </Show>
            {/* <UncontrolledTooltip placement='top' id='Confirmed' target='Confirmed'>
                            {FM("order-history")}
                        </UncontrolledTooltip>
                        <Button className='d-flex waves-effect btn btn-warning btn-sm' id='Confirmed' color=''
                            onClick={() => {
                                navigate(getPath('orders-log'), {
                                    state: {
                                        id: row?.id,

                                    }
                                })

                                //orders-log
                            }}
                        >
                            <Cpu size={14} />
                        </Button> */}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]
  const onSuccessEvent = () => {
    reloadData()
  }

  const options: TableDropDownOptions = (selectedRows) => [
    // {
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadResp?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadResp?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }

  return (
    <Fragment>
      <span style={{ display: 'none' }}>
        <OrderPrints key={printData?.id} props={printData} ref={componentRef} />
      </span>
      <span style={{ display: 'none' }}>
        <KichenPrints key={kichenprintData?.id} props={kichenprintData} ref={componentRef} />
      </span>
      {renderExportModal()}
      {renderCreateModal()}
      {renderViewModal()}
      {renderConfirmedModal()}
      <Header route={props?.route} icon={<Menu size='25' />} title='Orders'>
        <Button
          size='sm'
          onClick={() => {
            toggleExportModalAdd()
          }}
          className='me-2'
        >
          <Download size='14' className='me-75' />
          <span className='align-middle'>{FM('export-order')}</span>
        </Button>
        <ButtonGroup color='dark'>
          <OrderFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadResp.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<orderResponseTypes>
        initialPerPage={state.per_page_record}
        isLoading={loadResp.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Orders
