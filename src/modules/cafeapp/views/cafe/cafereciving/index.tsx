import { yupResolver } from '@hookform/resolvers/yup'
import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import {
  ReceivedResponseTypes,
  customerAccountResponseTypes,
  salaryupdateResponseType
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateCafeSubRecievedMutation,
  useLoadCafeRecivedMutation,
  useViewCafeSubByIdMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe-admin/cafesub'
import { useDeleteSalaryByIdMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/SalaryMgmtRTK'
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
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Eye, List, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
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
import CafeRecieveFilter from './CafeRecieveFilter'
// import EmployeeSalaryFilter from './EmployeeSalaryFilter'

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
  selectedUser?: ReceivedResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: ReceivedResponseTypes = {
  cafe_id: '',
  subscription_id: '',
  amount_recieved: '',
  recieved_by: ''
}
const CafeSubcriptionRecieve = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add user
  const canAddUser = Can(Permissions?.dashboardBrowse)
  // can edit user
  const canEditUser = Can(Permissions.dashboardBrowse)
  // can delete user
  const canDeleteUser = Can(Permissions.dashboardBrowse)

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
  const [createSalary, createSalaryResponse] = useCreateOrUpdateCafeSubRecievedMutation()

  // load users

  const [loadCafeSub, loadCafeSubResponse] = useLoadCafeRecivedMutation()

  //view subscription
  const [viewSub, viewSubscriptionRes] = useViewCafeSubByIdMutation()

  // delete mutation
  const [empSalaryDelete, EmpSalaryRestDelete] = useDeleteSalaryByIdMutation()
  const viewSubRes: any = viewSubscriptionRes?.data?.payload

  const data = getUserData()

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
  const params = useParams()

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

  // view sub by id
  useEffect(() => {
    if (isValid(params.id)) {
      viewSub({
        id: params?.id
      })
    }
  }, [params])

  // handle save user
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createSalary({
        jsonData: {
          ...state?.editData,
          ...userData,
          cafe_id: userData?.cafe_id?.value
        }
      })
    } else {
      createSalary({
        jsonData: {
          ...userData,
          recieved_by: data?.cafe_id,
          cafe_id: viewSubRes?.cafe_id,
          subscription_id: viewSubRes?.id
          // ...getFIleBinaries(userData?.files)
        }
      })
    }
  }

  // load user list
  const loadUserList = () => {
    loadCafeSub({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        ...state.filterData,
        cafe_id: viewSubRes?.cafe_id,
        subscription_id: viewSubRes?.id
      }
    })
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

          paid_amount: state?.editData?.paid_amount
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
      filterData: { ...e },
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
          <BsTooltip title='Add Subscription Received'>
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
      empSalaryDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (EmpSalaryRestDelete?.isLoading === false) {
      if (EmpSalaryRestDelete?.isSuccess) {
        emitAlertStatus('success', null, EmpSalaryRestDelete?.originalArgs?.eventId)
      } else if (EmpSalaryRestDelete?.error) {
        emitAlertStatus('failed', null, EmpSalaryRestDelete?.originalArgs?.eventId)
      }
    }
  }, [EmpSalaryRestDelete])

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
        title={
          state.enableEdit
            ? 'Update Cafe Subscription Received'
            : 'Create Cafe Subscription Received'
        }
        scrollControl={false}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createSalaryResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Row>
            <Col md='6' className='d-flex justify-content-evenly'>
              <Label className='text-uppercase text-black mb-25'>{FM('cafe-name')} :</Label>
              <p className='text-dark fw-bold text-capitalize'>{viewSubRes?.cafe?.name}</p>
            </Col>
            <Col md='6' className='d-flex justify-content-evenly'>
              <Label className='text-uppercase text-black mb-25'>
                {FM('subscription-charge')} :
              </Label>
              <p className='text-dark fw-bold text-capitalize'>{viewSubRes?.subscription_charge}</p>
            </Col>
          </Row>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12'>
                <FormGroupCustom
                  noLabel
                  noGroup
                  control={form.control}
                  label='amount received'
                  name='amount_recieved'
                  type='number'
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
        title={'View Cafe Subscription Received'}
        done='edit'
        hideClose
        modalClass={'modal-lg'}
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
              <Label className='text-uppercase mb-25'>{FM('cafe-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.cafe?.name}</p>
            </Col>

            <Col md='6'>
              <Label className=''>{FM('email')}</Label>
              <p className=''>{state.selectedUser?.cafe?.email ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>mobile </Label>
              <p className='text-capitalize'>{state.selectedUser?.cafe?.mobile ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>address</Label>
              <p className='text-capitalize'>{state.selectedUser?.cafe?.address ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>subscription charge</Label>
              <p className='text-capitalize'>
                <span className='' style={{ fontWeight: 'bolder' }}>
                  {' '}
                  {state.selectedUser?.subscription?.subscription_charge ?? 'N/A'}
                  {
                    <CurrencyRupee
                      sx={{
                        maxHeight: '15px'
                      }}
                    />
                  }
                </span>
              </p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>amount receive</Label>
              <p className='text-capitalize'>
                <span className='' style={{ fontWeight: 'bolder' }}>
                  {' '}
                  {state.selectedUser?.amount_recieved ?? 'N/A'}
                  {
                    <CurrencyRupee
                      sx={{
                        maxHeight: '15px'
                      }}
                    />
                  }
                </span>
              </p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>subscription type</Label>
              <p className='text-capitalize'>
                <Fragment>
                  {state.selectedUser?.subscription?.subscription_type === 1 ? (
                    <Badge className='danger' color='danger'>
                      {'Monthly'}
                    </Badge>
                  ) : (
                    <Badge className='success' color='success'>
                      {'Yearly'}
                    </Badge>
                  )}
                </Fragment>
              </p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>received by</Label>
              <p className='text-capitalize'>{state.selectedUser?.recieved_by?.name ?? 'N/A'}</p>
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
  const columns: TableColumn<ReceivedResponseTypes>[] = [
    {
      name: FM('cafe-name'),
      sortable: false,
      id: 'cafe_id',
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
            {row?.cafe?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'amount received',
      sortable: false,
      cell: (row) => (
        <Fragment>
          <span className='' style={{ fontWeight: 'bolder' }}>
            {row?.amount_recieved}
            {
              <CurrencyRupee
                sx={{
                  maxHeight: '15px'
                }}
              />
            }
          </span>
        </Fragment>
      )
    },
    {
      name: 'subscription type',
      sortable: false,
      center: true,
      minWidth: '150',
      cell: (row) => (
        <Fragment>
          {row?.subscription?.subscription_type === 1 ? (
            <Badge className='danger' color='danger'>
              {'Monthly'}
            </Badge>
          ) : (
            <Badge className='success' color='success'>
              {'Yearly'}
            </Badge>
          )}
        </Fragment>
      )
    },

    {
      name: 'received by',
      sortable: false,
      center: true,
      minWidth: '150',
      cell: (row) => <Fragment>{row?.recieved_by?.name}</Fragment>
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
            {/* <UncontrolledTooltip placement='top' id='edit' target='edit'>
                            {("edit")}
                        </UncontrolledTooltip>
                        <Button className='d-flex waves-effect btn btn-dark btn-sm' id='edit' color=''
                            onClick={() => {
                                toggleModalAdd()
                                setState({ editData: row, enableEdit: !state.enableEdit })
                            }}
                        >
                            <Edit size={14}

                            />
                        </Button>

                        <UncontrolledTooltip placement='top' id={`grid-delete-${row?.id}`} target={`grid-delete-${row?.id}`}>
                            {("delete")}
                        </UncontrolledTooltip>
                        <ConfirmAlert
                            className='d-flex waves-effect btn btn-danger btn-sm'
                            eventId={`item-delete-${row?.id}`}
                            text={FM('are-you-sure')}
                            title={FM('delete-item', { name: row?.cafe_id })}

                            onClickYes={() => {
                                handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                            }}
                            onSuccessEvent={onSuccessEvent}
                            id={`grid-delete-${row?.id}`}
                        >
                            <Trash2 size={14} id="delete" />
                        </ConfirmAlert> */}
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
            loadCafeSubResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadCafeSubResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Cafe Subscription Recieved'>
        <ButtonGroup color='dark'>
          <CafeRecieveFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadCafeSubResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<ReceivedResponseTypes>
        initialPerPage={20}
        isLoading={loadCafeSubResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadCafeSubResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadCafeSubResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default CafeSubcriptionRecieve
