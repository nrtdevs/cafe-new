import { yupResolver } from '@hookform/resolvers/yup'
import { CurrencyRupee } from '@mui/icons-material'
import {
  useCreateOrUpdateCustomerMutation,
  useDeleteCustomerByIdMutation,
  useLoadCustomersMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/CustomersRTK'
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
import { gender } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  emailValidation,
  emitAlertStatus,
  formatDate,
  isValid,
  isValidArray,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, Eye, List, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  InputGroup,
  InputGroupText,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import { customerResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import CustomerFilter from './CustomerFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()

  name: yup
    .string()
    .typeError('Please Name is Required')
    .required()
    .min(2, 'min length!')
    .max(50, 'max length!'),
  mobile: yup
    .number()
    .required()
    .test(
      'len',
      'Please Enter Valid Mobile Number',
      (val: any) => val && val.toString().length === 10
    )
    .typeError('Please Enter  Mobile'),
  gender: yup.object().typeError('Please Select Gender').required(),
  email: yup.string().optional().notRequired().max(50, 'max length!')
  // address: yup.string().required()
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
  selectedUser?: customerResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: customerResponseTypes = {
  name: '',
  address: '',
  gender: '',
  mobile: '',
  account_balance: '',
  email: ''
}
const Customer = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add customer
  const canAddUser = Can(Permissions.customerCreate)
  // can edit customer
  const canEditUser = Can(Permissions.customerEdit)
  // can delete customer
  const canDeleteUser = Can(Permissions.customerDelete)
  //can read customer
  const canReadUser = Can(Permissions.customerRead)

  // form hook
  const form = useForm<customerResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // create or update user mutation
  const [createCustomer, createCustomerResponse] = useCreateOrUpdateCustomerMutation()

  // load users
  const [loadCustomer, loadCustomerResponse] = useLoadCustomersMutation()

  // delete mutation
  const [userAction, userActionResult] = useActionUserMutation()

  const [customerDelete, CustomerRestDelete] = useDeleteCustomerByIdMutation()

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

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    form.reset()
    toggleModalAdd()
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
      createCustomer({
        jsonData: {
          ...state?.editData,
          ...userData,
          gender: userData?.gender?.value
        }
      })
    } else {
      createCustomer({
        jsonData: {
          ...userData,
          gender: userData?.gender?.value
        }
      })
    }
  }

  // load user list
  const loadUserList = () => {
    loadCustomer({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle user create response
  useEffect(() => {
    if (!createCustomerResponse.isUninitialized) {
      if (createCustomerResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id ? 'Updated Customer Successfully' : 'Created Customer Successfully'
        )
      } else if (createCustomerResponse.isError) {
        // handle error
        const errors: any = createCustomerResponse.error
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createCustomerResponse])

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
      filterData: { ...e, role_id: e?.role_id?.value },
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

  //update customer
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<customerResponseTypes>(
        {
          id: state?.editData?.id,
          name: state.editData?.name,
          email: state.editData?.email,
          mobile: state.editData?.mobile,
          address: state.editData?.address,
          account_balance: state.editData?.account_balance,
          gender: state.editData?.gender
            ? {
                label:
                  state.editData?.gender === 1
                    ? 'male'
                    : state.editData?.gender === 2
                    ? 'female'
                    : '',
                value: state.editData?.gender
              }
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Customer'>
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

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<customerResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Customer' : 'Create Customer'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createCustomerResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('email')}
                  name='email'
                  type='email'
                  className='mb-1'
                  rules={{ required: false, pattern: emailValidation }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('mobile')}
                  name='mobile'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('account-balance')}
                  name='account_balance'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('select-gender')}
                  name='gender'
                  type='select'
                  selectOptions={createConstSelectOptions(gender, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('address')}
                  name='address'
                  type='textarea'
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
        title={state.selectedUser?.name}
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
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('email')}</Label>
              <p className=''>
                {state.selectedUser?.email === 'emptyEmail@cafe.in'
                  ? 'N/A'
                  : state.selectedUser?.email}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('gender')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.gender === 1 ? 'male' : 'female'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('mobile')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.mobile ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('current-balance')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.account_balance ?? '0'}
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
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
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
            <Label className='text-uppercase mb-25'>{FM('address')}</Label>
            <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<customerResponseTypes>[] = [
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
      name: 'email',
      sortable: false,

      cell: (row) => <Fragment>{row?.email === 'emptyEmail@cafe.in' ? '' : row?.email}</Fragment>
    },

    {
      name: 'mobile',
      sortable: false,

      cell: (row) => <Fragment>{row?.mobile}</Fragment>
    },
    {
      name: 'gender',
      sortable: false,

      cell: (row) => (
        <Fragment>
          {row?.gender === 1 ? <Fragment>{'male'}</Fragment> : <Fragment>{'female'}</Fragment>}
        </Fragment>
      )
    },
    {
      name: 'Current Balance',
      sortable: false,

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
          <span className='text-black' id='viewData' style={{ fontWeight: 'bolder' }}>
            {row?.account_balance ?? '0'}
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
      name: 'Created Date',
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
            loadCustomerResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadCustomerResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Customer List'>
        <ButtonGroup color='dark'>
          <CustomerFilter handleFilterData={handleFilterData} />

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

      <CustomDataTable<customerResponseTypes>
        initialPerPage={20}
        isLoading={loadCustomerResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadCustomerResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadCustomerResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Customer
