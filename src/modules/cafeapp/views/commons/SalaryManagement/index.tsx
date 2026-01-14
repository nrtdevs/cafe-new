import { yupResolver } from '@hookform/resolvers/yup'
import { getUserData } from '@src/auth/utils'
import {
  customerAccountResponseTypes,
  salaryResponseTypes,
  salaryupdateResponseType
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateSalaryMutation,
  useDeleteSalaryByIdMutation,
  useLoadSalarysMutation
} from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/SalaryMgmtRTK'
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
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
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
import EmployeeSalaryFilter from './EmployeeSalaryFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
  employee_id: yup
    .object()
    .required('employee must be required')
    .typeError('employee must be required'),
  paid_amount: yup
    .number()
    .min(1, 'min length 1!')
    .max(9999999999, 'max length 10!')
    .typeError('Please provide paid amount ')
    .required('Please provide paid amount.')
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
  selectedUser?: salaryResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: salaryResponseTypes = {
  employee_id: '',
  previous_balance: '',
  date: '',
  new_balance: '',
  paid_amount: '',
  remarks: ''
}
const SalaryManagement = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add salary
  const canAddUser = Can(Permissions?.employeeSalaryCreate)
  // can edit salary
  const canEditUser = Can(Permissions.employeeSalaryEdit)
  // can delete salary
  const canDeleteUser = Can(Permissions.employeeSalaryDelete)
  //can read salary
  const canReadSalary = Can(Permissions.employeeSalaryRead)

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
  const [createSalary, createSalaryResponse] = useCreateOrUpdateSalaryMutation()

  // load users
  const [loadSalary, loadSalaryResponse] = useLoadSalarysMutation()

  // delete mutation
  const [empSalaryDelete, EmpSalaryrestDelete] = useDeleteSalaryByIdMutation()
  const user1 = getUserData()

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

  // load user list
  const loadUserList = () => {
    loadSalary({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        cafe_id: user1?.cafe_id,
        // name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

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
      filterData: { ...e, employee_id: e?.employee_id?.value },
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
          <BsTooltip title='Add Salary Adavance'>
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

  // handle save user
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createSalary({
        jsonData: {
          ...state?.editData,
          ...userData,
          employee_id: userData?.employee_id?.value
        }
      })
    } else {
      createSalary({
        jsonData: {
          ...userData,
          employee_id: userData?.employee_id?.value
          // ...getFIleBinaries(userData?.files)
        }
      })
    }
  }

  //set the updated value
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<salaryupdateResponseType>(
        {
          id: state?.editData?.id,
          date: state?.editData?.date,
          employee_id: state.editData?.employee_id
            ? {
                label: state.editData?.employee?.name,
                value: state.editData?.employee_id
              }
            : undefined,

          paid_amount: state?.editData?.paid_amount,
          remarks: state?.editData?.remarks
        },
        form.setValue
      )
    }
  }, [state.editData])

  // handle user create response
  useEffect(() => {
    if (!createSalaryResponse.isUninitialized) {
      if (createSalaryResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Advance Salary Successfully'
            : 'Created Advance Salary Successfully'
        )
      } else if (createSalaryResponse.isError) {
        // handle error
        const errors: any = createSalaryResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createSalaryResponse])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      empSalaryDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (EmpSalaryrestDelete?.isLoading === false) {
      if (EmpSalaryrestDelete?.isSuccess) {
        emitAlertStatus('success', null, EmpSalaryrestDelete?.originalArgs?.eventId)
      } else if (EmpSalaryrestDelete?.error) {
        emitAlertStatus('failed', null, EmpSalaryrestDelete?.originalArgs?.eventId)
      }
    }
  }, [EmpSalaryrestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<salaryupdateResponseType>(
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
        title={state.enableEdit ? 'Update  Employee Salary' : 'Create Employee Salary'}
        scrollControl={false}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createSalaryResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${user1?.cafe_id}`}
                  control={form.control}
                  async
                  isClearable
                  label={FM('select-employee-name')}
                  name='employee_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.employeList}
                  selectLabel={(e) => `${e.name} `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    cafe_id: user1?.cafe_id
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='paid amount'
                  name='paid_amount'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'date'}
                  // datePickerOptions={(
                  //     {
                  //         minDate: new Date(),
                  //         maxDate: new Date(new Date().getFullYear() + 10, 12, 31),

                  //     }
                  // )}
                  name='date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('remarks')}
                  name='remarks'
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
        title={state.selectedUser?.employee?.name}
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
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.employee?.name}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase  mb-25'>Paid Amount</Label>
              <p className=' text-capitalize'>{state.selectedUser?.paid_amount ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>previous balance </Label>
              <p className='text-capitalize'>{state.selectedUser?.previous_balance ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>new balance</Label>
              <p className='text-capitalize'>{state.selectedUser?.new_balance ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Salary</Label>
              <p className='text-capitalize'>{state.selectedUser?.employee?.salary ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Advance salary Date</Label>
              <p className='text-capitalize'>{formatDate(state.selectedUser?.date) ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Create Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>

            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Remarks</Label>
              <p className='text-capitalize'>{state.selectedUser?.remarks ?? 'N/A'}</p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<salaryResponseTypes>[] = [
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
            {row?.employee?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'paid amount',
      sortable: false,

      cell: (row) => <Fragment>{row?.paid_amount}</Fragment>
    },
    {
      name: 'previous balance',
      sortable: false,

      minWidth: '150',
      cell: (row) => <Fragment>{row?.previous_balance}</Fragment>
    },

    {
      name: 'new balance',
      sortable: false,
      center: true,
      minWidth: '150',
      cell: (row) => <Fragment>{row?.new_balance}</Fragment>
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
            {canReadSalary ? (
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
                  title={FM('delete-item', { name: row?.employee?.name })}
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
            loadSalaryResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadSalaryResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Advance Employee Salary  List'>
        <ButtonGroup color='dark'>
          <EmployeeSalaryFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadSalaryResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<salaryResponseTypes>
        initialPerPage={20}
        isLoading={loadSalaryResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadSalaryResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadSalaryResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default SalaryManagement
