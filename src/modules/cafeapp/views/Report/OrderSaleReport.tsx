import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import CustomDataTable from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  emitAlertStatus,
  formatDate,
  isValidArray,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, Eye, List, PlusCircle, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import {
  useCreateOrUpdateCashHandoverMutation,
  useDeleteCashHandoverByIdMutation,
  useLoadHandoverMutation
} from '../../redux/RTKFiles/cafe/cashHandoverRTK'
import { useLoadDashboardtableMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import HandoverReportFilter from './HandoverReportFilter'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
// validation schema
const userFormSchema = {
  name: yup
    .string()
    .trim()
    .typeError('Please Name is Required')
    .required()
    .min(2, 'min length!')
    .max(50, 'max length!'),
  comment: yup
    .string()
    .typeError('Please comment is Required')
    .required()
    .min(2, 'min length!')
    .max(300, 'max length!'),
  handover_amount: yup.number().positive().typeError('Please Handover Amount is Required')
}
// validate
const schema = yup.object(userFormSchema).required()

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: any
  enableEdit?: boolean
  editData?: any
  editDataHandover?: any
}

const OrderSaleReport = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()

  // can add cashHandover
  const canAddUser = Can(Permissions.cashHandoverCreate)

  // can delete cashHandover
  const canDeleteUser = Can(Permissions.cashHandoverDelete)

  // form hook
  const form = useForm<any>({
    // resolver: yupResolver(schema),
    defaultValues: {}
  })

  // load dashboardTable
  const [dashboardtable, dashboardtablerestResponse] = useLoadDashboardtableMutation()

  //create handover
  const [createCashHandover, cashHandoverResponse] = useCreateOrUpdateCashHandoverMutation()

  // load users
  const [loadCustomer, loadCustomerResponse] = useLoadHandoverMutation()
  const [customerDelete, CustomerRestDelete] = useDeleteCashHandoverByIdMutation()
  //load Dashboard orderTime report

  const tdata = dashboardtablerestResponse?.data?.payload

  // delete mutation

  const navigate = useNavigate()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    editData: '',
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const currentDate = `${year}-${month}-${day}`

  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Cash Handover'>
            <NavLink className='' onClick={toggleModalAdd}>
              <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd, canAddUser])

  const loadList = () => {
    loadCustomer({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        ...state.filterData
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  //Total sum calculation
  //   const totalSaleAmount = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_amount, 0)
  //   const totalOrderConfirmed = tdata?.reduce(
  //     (acc: any, curr: any) => acc + +curr?.order_confirmed,
  //     0
  //   )
  //   const totalQuantity = tdata?.reduce(
  //     (acc: any, curr: any) => acc + +curr.total_sale_quantity,
  //     0,
  //     0
  //   )
  //   const totalSaleOffLine = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_offline, 0)
  //   const totalSaleOnline = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_online, 0)
  //   const totalSaleUdhari = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_udhari, 0)
  //   const totalOrderCompleted = tdata?.reduce(
  //     (acc: any, curr: any) => acc + +curr?.order_completed,
  //     0
  //   )
  //   const totalOrderPending = tdata?.reduce((acc: any, curr: any) => acc + +curr?.order_pending, 0)
  //   const totalOrderCanceled = tdata?.reduce((acc: any, curr: any) => acc + +curr?.order_canceled, 0)

  useEffect(() => {
    if (tdata && tdata.length > 0) {
      const saleData = tdata[0]
      if (!state?.editDataHandover?.id)
        setValues<any>(
          {
            id: saleData?.id,
            cash_amount: Number(saleData?.sale_offline),
            online_amount: Number(saleData?.sale_online),
            udhar_amount: Number(saleData?.sale_udhari),
            total_amount: Number(saleData?.sale_amount)
            // account_balance: state.editData?.account_balance
          },
          form.setValue
        )
    } else {
      //   console.log('No data available')
    }
  }, [tdata, state?.editDataHandover?.id])

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    loadList()
    form.reset()
    toggleModalAdd()
  }

  // load order list
  const loadUserList = () => {
    dashboardtable({
      jsonData: {
        // day: form.watch('request_for')?.value,
        start_date: currentDate,
        end_date: currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      customerDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (CustomerRestDelete?.isLoading === false) {
      if (CustomerRestDelete?.isSuccess) {
        emitAlertStatus('success', null, CustomerRestDelete?.originalArgs?.eventId)
      } else if (CustomerRestDelete?.error) {
        emitAlertStatus('failed', null, CustomerRestDelete?.originalArgs?.eventId)
      }
    }
  }, [CustomerRestDelete])
  // handle load list
  useEffect(() => {
    loadUserList()
  }, [])

  // reload page
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    }),
      loadList()
    form.reset()
  }

  // handle user create response
  useEffect(() => {
    if (!cashHandoverResponse.isUninitialized) {
      if (cashHandoverResponse.isSuccess) {
        closeAddModal()
        loadList()
        SuccessToast(state?.editData?.id ? 'Handover Successfully' : 'Handover Successfully')
      } else if (cashHandoverResponse.isError) {
        // handle error
        const errors: any = cashHandoverResponse.error
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [cashHandoverResponse])

  //handle filter
  const handleFilter = (data: any) => {
    dashboardtable({
      jsonData: {
        // day: data?.request_for?.value,
        start_date: form.watch('start_date')
          ? form.watch('start_date')
          : form.watch('request_for')?.value
          ? ''
          : currentDate,
        end_date: form.watch('end_date')
          ? form.watch('end_date')
          : form.watch('request_for')?.value
          ? ''
          : currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  //handle submit
  const handleSaveUser = (userData: any) => {
    if (state?.editDataHandover?.id) {
      createCashHandover({
        jsonData: {
          ...state?.editDataHandover,
          name: userData?.name,
          cash_amount: userData?.cash_amount,
          online_amount: userData?.online_amount,
          udhar_amount: userData?.udhar_amount,
          total_amount: userData?.total_amount,
          handover_amount: userData?.handover_amount,
          handover_date: formatDate(userData?.handover_date, 'YYYY-MM-DD'),
          comment: userData?.comment
        }
      })
    } else {
      createCashHandover({
        jsonData: {
          name: userData?.name,
          cash_amount: userData?.cash_amount,
          online_amount: userData?.online_amount,
          udhar_amount: userData?.udhar_amount,
          total_amount: userData?.total_amount,
          handover_amount: userData?.handover_amount,
          handover_date: formatDate(userData?.handover_date, 'YYYY-MM-DD'),
          comment: userData?.comment
        }
      })
    }
  }

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

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.name}
        done='edit'
        hideClose
        disableFooter
        hideSave
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          <Row>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            {/* <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('cafe')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.cafe?.name}</p>
            </Col> */}

            <Col md='6'>
              <Label className='mb-25'>{FM('handover-amount')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.handover_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>

            <Col md='6'>
              <Label className='mb-25'>{FM('cash-amount')}</Label>
              <p className=''>
                {state.selectedUser?.cash_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>
            <Col md='6'>
              <Label className='mb-25'>{FM('online-amount')}</Label>
              <p className=''>
                {state.selectedUser?.online_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>
            <Col md='6'>
              <Label className='mb-25'>{FM('udhaar-amount')}</Label>
              <p className=''>
                {state.selectedUser?.udhaar_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>
            <Col md='6'>
              <Label className='mb-25'>{FM('total-amount')}</Label>
              <p className=''>
                {state.selectedUser?.total_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>
            <Col md='6'>
              <Label className='mb-25'>{FM('remaining-amount')}</Label>
              <p className=''>
                {state.selectedUser?.remaining_amount ?? '0'}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '15px'
                    }}
                  />
                }
              </p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('handover_date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.handover_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('created_at')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('update-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
          <div>
            <Label className='text-uppercase mb-25'>{FM('comment')}</Label>
            <p className='text-capitalize'>{state.selectedUser?.comment ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  //update value in the form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<any>(
        {
          id: state?.editData?.id,
          cash_amount: Number(state.editData?.sale_offline),
          online_amount: Number(state.editData?.sale_online),
          udhar_amount: Number(state.editData?.sale_udhari),
          total_amount: Number(state.editData?.sale_amount)
          //   account_balance: state.editData?.account_balance
        },
        form.setValue
      )
    }
  }, [state.editData])

  //update data by edit

  useEffect(() => {
    if (state.editDataHandover && state.enableEdit) {
      setValues<any>(
        {
          id: state?.editDataHandover?.id,
          cash_amount: Number(state.editDataHandover?.cash_amount),
          online_amount: Number(state.editDataHandover?.online_amount),
          udhar_amount: Number(state.editDataHandover?.udhar_amount),
          total_amount: Number(state.editDataHandover?.total_amount),
          handover_amount: Number(state.editDataHandover?.handover_amount),
          comment: state?.editDataHandover?.comment,
          name: state?.editDataHandover?.name,
          handover_date: formatDate(state?.editDataHandover?.handover_date, 'YYYY-MM-DD')
          //   account_balance: state.editData?.account_balance
        },
        form.setValue
      )
    }
  }, [state.editDataHandover])

  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        from_date: e?.start_date ? formatDate(e?.start_date, 'YYYY-MM-DD') : undefined,
        end_date: e?.end_date ? formatDate(e?.end_date, 'YYYY-MM-DD') : undefined,
        cafe_id: e?.cafe_id?.value,
        sub_cafe_id: e?.sub_cafe_id?.value
      },
      page: 1,
      search: '',
      per_page_record: 20
    })
  }

  useEffect(() => {
    const value = Number(form.watch('handover_amount'))
    const stock = Number(form.watch('cash_amount'))
    // const cash = Number(state?.editDataHandover?.cash_amount)

    // If value is greater than stock, set an error
    if (value > stock) {
      form.setError('handover_amount', {
        type: 'manual',
        message: `Value cannot exceed available stock of ${stock}`
      })
    } else {
      // Clear the error if value is valid
      form.clearErrors('handover_amount')
    }

    // Always update the value in form state
    form.setValue('handover_amount', value)
  }, [form.watch('handover_amount')])

  // create handover  modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Edit Cash Handover' : 'Add Cash Handover'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={cashHandoverResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='3'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('cash-amount')}
                  name='cash_amount'
                  type='number'
                  className='mb-1 pointer-events-none'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='3'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('online-amount')}
                  name='online_amount'
                  type='number'
                  className='mb-1 pointer-events-none'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='3'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('udhar-amount')}
                  name='udhar_amount'
                  type='number'
                  className='mb-1 pointer-events-none'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='3'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('total-amount')}
                  name='total_amount'
                  type='number'
                  className='mb-1 pointer-events-none'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  name={'handover_date'}
                  type={'date'}
                  isClearable
                  label={FM('handover-date')}
                  dateFormat={'YYYY-MM-DD'}
                  datePickerOptions={{
                    maxDate: new Date()
                  }}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('handover-amount')}
                  name='handover_amount'
                  type='number'
                  className='mb-1'
                  //   onChangeValue={(e) => {
                  //     const value = Number(e.target.value)
                  //     const stock = Number(state?.editData?.sale_offline)
                  //     const cash = Number(state?.editDataHandover?.cash_amount)

                  //     // If value is greater than stock, set an error
                  //     if (value > stock) {
                  //       form.setError('handover_amount', {
                  //         type: 'manual',
                  //         message: `Value cannot exceed available stock of ${stock}`
                  //       })
                  //     } else if (value > cash) {
                  //       form.setError('handover_amount', {
                  //         type: 'manual',
                  //         message: `Value cannot exceed available stock of ${cash}`
                  //       })
                  //     } else {
                  //       // Clear the error if value is valid
                  //       form.clearErrors('handover_amount')
                  //     }

                  //     // Always update the value in form state
                  //     form.setValue('handover_amount', value)
                  //   }}
                  rules={{
                    required: true
                  }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('comment')}
                  name='comment'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<any>[] = [
    {
      name: FM('name'),
      sortable: false,

      id: 'name',
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
            {row?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'cash amount',
      sortable: false,

      cell: (row) => (
        <Fragment>
          <span className='text-black' id='viewData' style={{ fontWeight: 'bolder' }}>
            {row?.cash_amount ?? '0'}
            <CurrencyRupee
              sx={{
                maxHeight: '15px'
              }}
            />
          </span>
        </Fragment>
      )
    },

    {
      name: 'handover amount',
      sortable: false,

      cell: (row) => (
        <Fragment>
          <span className='text-black' id='viewData' style={{ fontWeight: 'bolder' }}>
            {row?.handover_amount ?? '0'}
            <CurrencyRupee
              sx={{
                maxHeight: '15px'
              }}
            />
          </span>
        </Fragment>
      )
    },
    {
      name: 'remaining amount',
      sortable: false,

      cell: (row) => (
        <Fragment>
          <span className='text-black' id='viewData' style={{ fontWeight: 'bolder' }}>
            {row?.remaining_amount ?? '0'}
            <CurrencyRupee
              sx={{
                maxHeight: '15px'
              }}
            />
          </span>
        </Fragment>
      )
    },
    {
      name: 'handover date',
      sortable: false,
      width: '200px',
      id: 'Created Date',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.handover_date)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            <UncontrolledTooltip placement='top' id='view' target='view'>
              {'view'}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-secondary btn-sm'
              id='view'
              color='secondary'
              onClick={() => {
                toggleModalView()
                setState({
                  selectedUser: row
                })
              }}
            >
              <Eye size={14} />
            </Button>
            {canAddUser ? (
              <>
                <UncontrolledTooltip placement='top' id='edit' target='edit'>
                  {'edit'}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-dark btn-sm'
                  id='edit'
                  color=''
                  onClick={() => {
                    toggleModalAdd()
                    setState({ editDataHandover: row, enableEdit: !state.enableEdit })
                  }}
                >
                  <Edit size={14} />
                </Button>
              </>
            ) : (
              ''
            )}
            {/* 
            {canDeleteUser ? (
              <>
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {'delete'}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-danger btn-sm'
                  eventId={`item-delete-${row?.id}`}
                  text={FM('are-you-sure')}
                  title={FM('delete-item', { name: row?.name })}
                  onClickYes={() => {
                    handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Trash2 size={14} id='delete' />
                </ConfirmAlert>
              </>
            ) : (
              ''
            )} */}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]

  const onSuccessEvent = () => {
    reloadData()
  }

  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}
      {/* <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('order-report')}</h3>
        </Col>

        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={dashboardtablerestResponse.isLoading}
            size='sm'
            color='info'
            className='mb-2'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </Col>
      </Row> */}
      <Card>
        {/* <div className='border-bottom p-1'>
          <Form onSubmit={form.handleSubmit(handleFilter)}>
            <Row className=''>
              <Show IF={user?.role_id === 1}>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label={'cafe'}
                    name='cafe_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.cafeList}
                    selectLabel={(e) => ` ${e.name} `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Show IF={user?.role_id === 1}>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_id')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_id')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>

              <>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    noLabel
                    name={'start_date'}
                    isDisabled={!!form.watch('request_for')}
                    type={'date'}
                    isClearable
                    label={FM('start-date')}
                    dateFormat={'YYYY-MM-DD'}
                    datePickerOptions={{
                      maxDate: form.watch('end_date')
                    }}
                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    noLabel
                    isClearable
                    isDisabled={!!form.watch('request_for')}
                    name={'end_date'}
                    type={'date'}
                    datePickerOptions={{
                      minDate: form.watch('start_date')
                    }}
                    label={FM('end-date')}
                    dateFormat={'YYYY-MM-DD'}
                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <div className=''>
                    <LoadingButton
                      loading={dashboardtablerestResponse?.isLoading}
                      className='btn-icon me-1'
                      tooltip={'Place Order'}
                      color='primary'
                      type='submit'
                    >
                      {FM('filter-Data')}
                    </LoadingButton>
                  </div>
                </Col>
              </>
            </Row>
          </Form>
        </div> */}
        {/* <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('date')}</th>
                <th>{FM('sale-quantity')}</th>
                <th>{FM('sale-amount')}</th>
                <th>{FM('sale-offline')}</th>
                <th>{FM('sale-online')}</th>
                <th>{FM('sale-udhari')}</th>
                <th>{FM('action')}</th>
         
              </tr>
            </thead>
            {dashboardtablerestResponse?.isLoading ? (
              <>
                <tbody>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {tdata &&
                  tdata?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody key={index}>
                          <tr>
                            <th scope='row'>{formatDate(item?.date, 'DD-MM-YYYY')}</th>
                            <td>{item?.total_sale_quantity}</td>
                            <td>{item?.sale_amount}</td>
                            <td>{item?.sale_offline}</td>
                            <td>{item?.sale_online}</td>
                            <td>{item?.sale_udhari}</td>
                            <td>
                              {canAddUser === true ? (
                                <>
                                  <UncontrolledTooltip placement='top' id='edit' target='edit'>
                                    {'Receiver User'}
                                  </UncontrolledTooltip>
                                  <Button
                                    className='d-flex waves-effect btn btn-primary btn-sm'
                                    id='edit'
                                    color=''
                                    onClick={() => {
                                      toggleModalAdd()
                                      setState({ editData: item, enableEdit: !state.enableEdit })
                                    }}
                                  >
                                    <Plus size={14} />
                                  </Button>
                                </>
                              ) : (
                                ''
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
              </>
            )}

            <thead
              style={{
                background: '#8d918e'
              }}
            >
              <tr>
                <th>{FM('total-sum')}</th>
                <th>{totalQuantity}</th>
                <th>{totalSaleAmount}</th>
                <th>{totalSaleOffLine}</th>
                <th>{totalSaleOnline}</th>
                <th>{totalSaleUdhari}</th>
                <th></th>
              </tr>
            </thead>
          </Table>
        </CardBody> */}
      </Card>

      <Header route={props?.route} icon={<List size='25' />} title=' Cash Handover List'>
        <ButtonGroup color='dark'>
          <HandoverReportFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadCustomerResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <Card>
        <CustomDataTable<any>
          initialPerPage={20}
          isLoading={loadCustomerResponse.isLoading}
          columns={columns}
          //   options={options}
          hideHeader
          // selectableRows={canEditUser || canDeleteUser}
          searchPlaceholder='search-user-name'
          //   onSort={handleSort}
          defaultSortField={loadCustomerResponse?.originalArgs?.jsonData?.sort}
          paginatedData={loadCustomerResponse?.data?.payload}
          //   handlePaginationAndSearch={handlePageChange}
        />
      </Card>
    </Fragment>
  )
}

export default OrderSaleReport
