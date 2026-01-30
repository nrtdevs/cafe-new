import { yupResolver } from '@hookform/resolvers/yup'
import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import {
  cancelOrderResponseTypes,
  orderResponseTypes,
  orderStatusUpdateResponseTypes
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateOrdersMutation,
  useDeleteOrdersMutation,
  useGetRecipeListMutation,
  useLoadOrdersLogMutation,
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
import { useModal } from '@src/modules/common/components/modal/HandleModal'

import { exportData } from '@src/utility/Const'

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
import { Eye, Menu, RefreshCcw } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
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
const OrderLog = (props: any) => {
  const componentRef = useRef<HTMLElement | any>(null)
  const [printData, setPrintData] = useState<any>(null)
  const location = useLocation()

  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const currentDate = `${year}-${month}-${day}`
  const [kichenprintData, setKichenPrintData] = useState<any>(null)
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)

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
  const [loadOrders, loadResp] = useLoadOrdersLogMutation()
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

  const renderExportModal = () => {
    return (
      <CenteredModal
        open={modalExportAdd}
        title={'Export Order'}
        done={state.enableEdit ? 'Export' : 'Export'}
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
        hideSave={true}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className=''></div>
        <div className='card'>
          <div className='card-body'>
            <div className='container'>
              {/* <div className='row d-flex align-items-baseline'>
                                <div className='col-xl-9'>
                                    <p style={{ color: '#7e8d9f', fontSize: '20px' }}>
                                        Order No :<strong>{state.selectedUser?.id}</strong>
                                    </p>
                                </div>

                                <hr />
                            </div> */}

              <div className='container'>
                <div className='row'>
                  <div className='col-xl-8'>
                    <ul className='list-unstyled'>
                      {state?.selectedUser?.customer_id ? (
                        <>
                          <li className='text-muted'>
                            {FM('customer-name')}:{' '}
                            <span style={{ color: '#5d9fc5 ' }}>
                              {state?.selectedUser?.customer?.name}
                            </span>
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 4 ||
                        state?.selectedUser?.payment_mode === 3 ? (
                        <>
                          <li className='text-muted'>
                            {FM('cash')} :{state?.selectedUser?.cash_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                          <li className='text-muted'>
                            {FM('online')} :{state?.selectedUser?.online_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 1 ? (
                        <>
                          <li className='text-muted'>
                            {FM('cash')} :{state?.selectedUser?.cash_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 2 ? (
                        <>
                          <li className='text-muted'>
                            {FM('online')} :{state?.selectedUser?.online_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}
                      {state?.selectedUser?.payment_mode === 3 ? (
                        <>
                          <li className='text-muted text-black'>
                            {FM('udhaar')} :{state?.selectedUser?.udhaar_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}
                      <li className='text-muted'>
                        <span className=''>{FM('discount-amount')} (₹) : </span>
                        <span className=''>{totalDiscount}</span>
                      </li>
                    </ul>
                  </div>
                  <div className='col-xl-4'>
                    <ul className='list-unstyled'>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('invoice')} :</span>
                        {state.selectedUser?.order_number}
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>Creation Date : </span>
                        {formatDate(state.selectedUser?.created_at, 'MM/DD/YYYY')}
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='me-1 fw-bold'>Status:</span>
                        <span className='badge bg-warning text-black fw-bold'>
                          {state.selectedUser?.order_status === 1
                            ? 'Pending'
                            : state.selectedUser?.order_status === 3
                              ? 'Completed'
                              : state.selectedUser?.order_status === 2
                                ? 'Confirmed'
                                : ' Cancelled'}
                        </span>
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='me-1 fw-bold'>{FM('transaction')} :</span>
                        <span className='text-black fw-bold'>
                          {state.selectedUser?.payment_mode === 1 ? (
                            <Badge color='light-warning'>{'Cash'}</Badge>
                          ) : state.selectedUser?.payment_mode === 2 ? (
                            <Badge color='light-danger'>{FM('online')}</Badge>
                          ) : state.selectedUser?.payment_mode === 4 ? (
                            <Badge color='light-secondary'>{'Split'}</Badge>
                          ) : state.selectedUser?.payment_mode === 3 ? (
                            <Badge color='light-secondary'>{FM('udhaar')}</Badge>
                          ) : (
                            ''
                          )}
                        </span>
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('order-duration')} : </span>
                        {state.selectedUser?.order_duration} Minute
                      </li>
                      {state?.selectedUser?.cancel_reason ? (
                        <li className=''>
                          <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                          <span className='fw-bold'>{FM('cancel-reason')} : </span>
                          <span className='text-danger'>{state.selectedUser?.cancel_reason}</span>
                        </li>
                      ) : (
                        ''
                      )}
                      {/* {state?.selectedUser?.customer_id ? (
                                                <li className=''>
                                                    <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                                                    <span className='fw-bold'>Customer Name : </span>
                                                    <span className='text-danger'>{state.selectedUser?.customer?.name}</span>

                                                </li>
                                            ) : (
                                                ''
                                            )} */}
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('discount')} : </span>
                        {state.selectedUser?.discount} %
                      </li>
                    </ul>
                  </div>
                </div>

                <div className='row my-2 mx-1 justify-content-center'>
                  <table className='table table-striped table-borderless'>
                    <thead style={{ backgroundColor: '#84B0CA' }} className='text-black'>
                      <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>{FM('menu-name')}</th>
                        <th scope='col'>{FM('qty')}</th>
                        <th scope='col'>
                          {FM('price')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                        <th scope='col'>
                          {FM('discount-price')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                        <th scope='col'>{FM('instruction')}</th>
                        <th scope='col'>
                          {FM('total')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state?.selectedUser?.order_details?.map((item: any, index: any) => {
                        const menu = JsonParseValidate(item?.menu_detail)
                        return (
                          <>
                            <tr>
                              <th scope='row'>{index + 1}</th>
                              <td>{menu?.name}</td>
                              <td>{item?.quantity}</td>
                              <td>{item?.price}</td>
                              <td>{item?.discount_amount}</td>
                              <td>{item?.instructions}</td>
                              <td>{item?.total - item?.discount_amount}</td>
                            </tr>
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <hr />
                <div className='row'>
                  <div className='col-xl-6'></div>
                  <div className='col-xl-5'>
                    <ul className='list-unstyled'>
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black me-1'>SubTotal(₹) :</span>
                        <span className='text-black'>{state.selectedUser?.total_amount}</span>
                      </li>
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black me-1'>{FM('tax')} (₹) : </span>
                        <span className='text-black'>{Number(state.selectedUser?.tax_amount)}</span>
                      </li>

                      <hr />
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black text-dark text-bolder'>
                          {FM('total-amount')}(₹) :{' '}
                        </span>
                        <span className='text-black text-bolder'>
                          {Number(state.selectedUser?.payable_amount)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
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
      name: 'table no.',
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
      {renderViewModal()}

      <Header route={props?.route} icon={<Menu size='25' />} title={FM('order-history')}>
        <ButtonGroup color='dark'>
          {/* <OrderFilter handleFilterData={handleFilterData} /> */}
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

export default OrderLog
