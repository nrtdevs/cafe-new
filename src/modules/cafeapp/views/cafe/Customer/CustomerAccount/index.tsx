import { yupResolver } from '@hookform/resolvers/yup'
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
import BsTooltip from '@src/modules/common/components/tooltip'
import { useActionUserMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  emitAlertStatus,
  formatDate,
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
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, Eye, List, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'

import { CurrencyRupee } from '@mui/icons-material'
import { customerAccountResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateCust_accountMutation,
  useDeleteCust_AccountByIdMutation,
  useLoadCust_AccountsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/CustomerAccountRTK'
import { Modeoftransation } from '@src/utility/Const'
import CustAccountFilter from './CustAccountFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
  customer_id: yup.object().typeError('please select customer').required()
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
  customerAc?: any
  lastRefresh?: any
  selectedUser?: customerAccountResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: customerAccountResponseTypes = {
  customer: '',
  customer_id: '',
  payment_received: '',
  previous_balance: '',
  sale: '',
  mode_of_transaction: '',
  new_balance: ''
}
const CustomerAccount = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add customer account
  const canAddUser = Can(Permissions?.customerAccountCreate)
  // can edit customer account
  const canEditUser = Can(Permissions.customerAccountEdit)
  // can delete customer account
  const canDeleteUser = Can(Permissions.customerAccountDelete)
  //can read customer account
  const canReadUser = Can(Permissions.customerAccountRead)

  // form hook
  const form = useForm<customerAccountResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  const [createCustAcc, createCust_AccResponse] = useCreateOrUpdateCust_accountMutation()
  // load users

  const [loadCustomerAccount, loadCustomerAccountResponse] = useLoadCust_AccountsMutation()

  // delete mutation
  const [userAction, userActionResult] = useActionUserMutation()
  const [customeraccDelete, CustomerAccrestDelete] = useDeleteCust_AccountByIdMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    editData: '',
    customerAc: undefined,
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
      enableEdit: false,
      customerAc: undefined,
      editData: null
    })
    form.reset()
    toggleModalAdd()
  }

  //color mode of transation
  const statusObj = {
    cash: 'light-warning',
    online: 'light-danger',
    recurring: 'light-primary'
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

  // handle save user
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      createCustAcc({
        jsonData: {
          ...state?.editData,
          ...userData,
          customer_id: userData?.customer_id?.value,
          mode_of_transaction: userData?.mode_of_transaction?.value
        }
      })
    } else {
      createCustAcc({
        jsonData: {
          ...userData,
          customer_id: userData?.customer_id?.value,
          mode_of_transaction: userData?.mode_of_transaction?.value
        }
      })
    }
  }

  // load user list
  const loadUserList = () => {
    loadCustomerAccount({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        // name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // set value updated time
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<customerAccountResponseTypes>(
        {
          id: state?.editData?.id,
          customer_id: state.editData?.customer_id
            ? {
                label: state.editData?.customer?.name,
                value: state.editData?.customer_id
              }
            : undefined,
          mode_of_transaction: state?.editData?.mode_of_transaction
            ? {
                label:
                  state.editData?.mode_of_transaction === 1
                    ? 'cash'
                    : state.editData?.mode_of_transaction === 2
                    ? 'online'
                    : 'recuiring',
                value: state.editData?.mode_of_transaction
              }
            : undefined,
          sale: state.editData?.sale,
          payment_received: state?.editData?.payment_received
        },
        form.setValue
      )
    }
  }, [state.editData])
  // handle user create response
  useEffect(() => {
    if (!createCust_AccResponse.isUninitialized) {
      if (createCust_AccResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Customer Account Successfully'
            : 'Created Customer Account Successfully'
        )
      } else if (createCust_AccResponse.isError) {
        // handle error
        const errors: any = createCust_AccResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createCust_AccResponse])

  // handle pagination and load list
  useEffect(() => {
    loadUserList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, customer_id: e?.customer_id?.value },
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

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Customer Account'>
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

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      customeraccDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (CustomerAccrestDelete?.isLoading === false) {
      if (CustomerAccrestDelete?.isSuccess) {
        emitAlertStatus('success', null, CustomerAccrestDelete?.originalArgs?.eventId)
      } else if (CustomerAccrestDelete?.error) {
        emitAlertStatus('failed', null, CustomerAccrestDelete?.originalArgs?.eventId)
      }
    }
  }, [CustomerAccrestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<customerAccountResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // show customer balance
  useEffect(() => {
    if (isValid(form.watch('customer_id')?.extra)) {
      setState({ customerAc: form.watch('customer_id')?.extra })
    }
  }, [form.watch('customer_id')])

  // log("hgfh", form.watch('customer_id'))
  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Customer Account' : 'Create Customer Account'}
        handleModal={closeAddModal}
        scrollControl={false}
        modalClass={'modal-lg'}
        loading={createCust_AccResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          {state.enableEdit ? (
            ''
          ) : (
            <div>
              <Row>
                <Col md='6' className='d-flex justify-content-evenly'>
                  <Label className='text-uppercase mb-25'>Current Balance</Label>
                  <p className='text-dark fw-bold text-capitalize'>
                    {state.customerAc?.account_balance}
                    {
                      <CurrencyRupee
                        sx={{
                          maxHeight: '15px'
                        }}
                      />
                    }
                  </p>
                </Col>
              </Row>
            </div>
          )}

          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label='customer name'
                  name='customer_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.customers}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              {/* <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    label='sale'
                                    name='sale'
                                    type='number'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col> */}

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={'mode of transaction'}
                  name='mode_of_transaction'
                  type='select'
                  selectOptions={createConstSelectOptions(Modeoftransation, FM)}
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label='payment received'
                  name='payment_received'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
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
        title={state.selectedUser?.customer?.name}
        done='edit'
        hideClose
        disableFooter
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
        <div className='p-2'>
          <Row>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.customer?.name}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>sale</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.sale ?? 'N/A'}
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
              <Label className='text-uppercase mb-25'>payment received</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.payment_received ?? 'N/A'}
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
              <Label className='text-uppercase mb-25'>new balance</Label>
              <p className='text-capitalize'>{state.selectedUser?.new_balance ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>previous balance</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.previous_balance ?? 'N/A'}
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
              <Label className='text-uppercase mb-25'>mode of transaction</Label>
              <p className='text-capitalize'>
                {
                  <Fragment>
                    {' '}
                    <Badge
                      className='text-capitalize'
                      color={
                        statusObj[
                          state.selectedUser?.mode_of_transaction === 1
                            ? 'cash'
                            : state.selectedUser?.mode_of_transaction === 2
                            ? 'online'
                            : 'udhar'
                        ]
                      }
                      pill
                    >
                      {state.selectedUser?.mode_of_transaction === 1
                        ? 'cash'
                        : state.selectedUser?.mode_of_transaction === 2
                        ? 'online'
                        : 'udhar'}
                    </Badge>
                  </Fragment>
                }
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Create Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<customerAccountResponseTypes>[] = [
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
            {row?.customer?.name}
          </span>
        </Fragment>
      )
    },
    {
      name: 'sale (₹)',
      sortable: false,

      cell: (row) => (
        <Fragment>
          {row?.sale}
          <CurrencyRupee
            sx={{
              maxHeight: '15px'
            }}
          />
        </Fragment>
      )
    },
    {
      name: 'previous balance (₹)',
      sortable: false,

      minWidth: '150',
      cell: (row) => (
        <Fragment>
          {row?.previous_balance}
          <CurrencyRupee
            sx={{
              maxHeight: '15px'
            }}
          />
        </Fragment>
      )
    },
    {
      name: 'payment receive (₹)',
      sortable: false,
      minWidth: '150',
      cell: (row) => (
        <Fragment>
          {row?.payment_received}{' '}
          <CurrencyRupee
            sx={{
              maxHeight: '15px'
            }}
          />
        </Fragment>
      )
    },

    {
      name: 'current balance (₹)',
      sortable: false,
      center: true,
      minWidth: '150',
      cell: (row) => (
        <Fragment>
          <UncontrolledTooltip
            placement='top'
            id='viewData'
            target='viewData'
            className='text-capitalize'
          >
            {
              'negative balance means customer has to pay you  and positive balance means customer has a credit balance'
            }
          </UncontrolledTooltip>
          <span id='viewData' className='text-black' style={{ fontWeight: 'bolder' }}>
            {' '}
            {row?.new_balance}
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
      name: 'transaction',
      sortable: false,
      center: true,
      minWidth: '150',
      cell: (row) => (
        <Fragment>
          {' '}
          <Badge
            className='text-capitalize'
            color={
              statusObj[
                row.mode_of_transaction === 1
                  ? 'cash'
                  : row.mode_of_transaction === 2
                  ? 'online'
                  : 'recurring'
              ]
            }
            pill
          >
            {row.mode_of_transaction === 1
              ? 'cash'
              : row.mode_of_transaction === 2
              ? 'online'
              : 'udhar'}
          </Badge>
        </Fragment>
      )
    },

    {
      name: 'Date',
      sortable: false,
      id: 'Created Date',

      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.created_at)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
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

            {canEditUser ? (
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
                    setState({ editData: row, enableEdit: !state.enableEdit })
                  }}
                >
                  <Edit size={14} />
                </Button>
              </>
            ) : (
              ''
            )}

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
                  title={FM('delete-item', { name: row?.customer?.name })}
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
            )}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]
  const onSuccessEvent = () => {
    reloadData()
  }
  const options: TableDropDownOptions = (selectedRows) => [
    {
      IF: canDeleteUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<Trash2 size={14} />}
          onDropdown
          eventId={`item-delete`}
          text={FM('are-you-sure')}
          title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'delete', 'item-delete')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('delete')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserCheck size={14} />}
          onDropdown
          eventId={`item-active`}
          text={FM('are-you-sure')}
          title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'active', 'item-active')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('activate')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserX size={14} />}
          onDropdown
          eventId={`item-inactive`}
          text={FM('are-you-sure')}
          title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('inactivate')}
        </ConfirmAlert>
      )
    }
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadCustomerAccountResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadCustomerAccountResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}

      <Header route={props?.route} icon={<List size='25' />} title='Customer Account List'>
        <ButtonGroup color='dark'>
          <CustAccountFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadCustomerAccountResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<customerAccountResponseTypes>
        initialPerPage={20}
        isLoading={loadCustomerAccountResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadCustomerAccountResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadCustomerAccountResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default CustomerAccount
