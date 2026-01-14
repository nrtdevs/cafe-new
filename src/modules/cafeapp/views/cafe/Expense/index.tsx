import { yupResolver } from '@hookform/resolvers/yup'
import {
  useCreateOrUpdateExpenseMutation,
  useDeleteExpenseByIdMutation,
  useLoadExpensesMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/ExpenseRTK'
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
import { stateReducer } from '@src/utility/stateReducer'
import { ActionItem } from '@src/utility/types/typeMeeting'
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
import { expenseResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import ExpenseFilter from './ExpenseFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
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
  selectedUser?: expenseResponseTypes
  enableEdit?: boolean
  editData?: any
  selectedItem?: ActionItem
}

const defaultValues: expenseResponseTypes = {
  item: '',
  expense_date: '',
  description: '',
  total_expense: ''
}
const Expense = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add expense
  const canAddUser = Can(Permissions.expenseCreate)
  // can edit expense
  const canEditUser = Can(Permissions.expenseEdit)
  // can delete expense
  const canDeleteUser = Can(Permissions.employeeDelete)
  //can view expense
  const canViewUser = Can(Permissions.expenseRead)
  // form hook
  const form = useForm<expenseResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  const [createExpense, createExpenseResponse] = useCreateOrUpdateExpenseMutation()
  // load users

  const [loadExpense, loadRestExpense] = useLoadExpensesMutation()

  const [expenseDelete, ExpenseRestDelete] = useDeleteExpenseByIdMutation()

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

  // handle save expense
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      createExpense({
        jsonData: {
          ...state?.editData,
          ...userData
        }
      })
    } else {
      createExpense({
        jsonData: {
          ...userData
        }
      })
    }
  }

  // load expense list
  const loadUserList = () => {
    loadExpense({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle expense create response
  useEffect(() => {
    if (!createExpenseResponse.isUninitialized) {
      if (createExpenseResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id ? 'Updated Expense Successfully' : 'Created Expense Successfully'
        )
      } else if (createExpenseResponse.isError) {
        // handle error
        const errors: any = createExpenseResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createExpenseResponse])

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

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Expense'>
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
      expenseDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (ExpenseRestDelete?.isLoading === false) {
      if (ExpenseRestDelete?.isSuccess) {
        emitAlertStatus('success', null, ExpenseRestDelete?.originalArgs?.eventId)
      } else if (ExpenseRestDelete?.error) {
        emitAlertStatus('failed', null, ExpenseRestDelete?.originalArgs?.eventId)
      }
    }
  }, [ExpenseRestDelete])

  //open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<expenseResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  //update Expense

  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<expenseResponseTypes>(
        {
          id: state?.editData?.id,
          item: state?.editData?.item,
          total_expense: state?.editData?.total_expense,
          description: state?.editData?.description,
          expense_date: state?.editData?.expense_date
        },
        form.setValue
      )
    }
  }, [state.editData])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Expense' : 'Create Expense'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createExpenseResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  label='item'
                  name='item'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  label='total expense'
                  name='total_expense'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  label={'expense date'}
                  name='expense_date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label='description'
                  name='description'
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

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.item}
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
              <Label className='text-uppercase mb-25'>{'item'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'total expense'}</Label>
              <p className='text-capitalize'>(₹) {state.selectedUser?.total_expense ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'expense date'}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.expense_date) ?? 'N/A'}
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
          <div>
            <Label className='text-uppercase mb-25'>Description</Label>
            <p className='text-capitalize'>{state.selectedUser?.description ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<expenseResponseTypes>[] = [
    {
      name: 'item',
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
            {row?.item}
          </span>
        </Fragment>
      )
    },

    {
      name: 'total expense (₹)',
      sortable: false,
      center: true,
      minWidth: '200',
      cell: (row) => <Fragment>{row?.total_expense}</Fragment>
    },
    {
      name: 'expense date',
      sortable: false,
      minWidth: '200',
      cell: (row) => <Fragment>{row?.expense_date}</Fragment>
    },

    {
      name: 'Created Date',
      sortable: false,
      id: 'Created Date',
      minWidth: '200',
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
          {/* <DropDownMenu
                        options={[
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
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                onClick: () => {
                                    toggleModalAdd()
                                    setState({ editData: row, enableEdit: !state.enableEdit })
                                }
                            },
                            {
                                IF: canDeleteUser,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.id })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
                                    </ConfirmAlert>
                                )
                            }


                        ]}
                    /> */}
          <ButtonGroup role='group' className='my-2'>
            {canViewUser ? (
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
                  title={FM('delete-item', { name: row?.item })}
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
            loadRestExpense?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadRestExpense?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Expense List'>
        <ButtonGroup color='dark'>
          <ExpenseFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadRestExpense.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<expenseResponseTypes>
        initialPerPage={20}
        isLoading={loadRestExpense.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadRestExpense?.originalArgs?.jsonData?.sort}
        paginatedData={loadRestExpense?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Expense
