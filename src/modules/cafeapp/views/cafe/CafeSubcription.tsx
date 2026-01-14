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
import { getPath } from '@src/router/RouteHelper'
import { sub_status, sub_type } from '@src/utility/Const'
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
import { useNavigate } from 'react-router-dom'
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
import { cafeSubResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateCafeSubMutation,
  useDeleteCafeSubByIdMutation,
  useLoadCafeSubsMutation
} from '../../redux/RTKFiles/cafe-admin/cafesub'
import CafeSubFilter from './CafeSubFilter'

// validation schema
const userFormSchema = {
  name: yup.string().min(2, 'min length!').max(50, 'max length!'),
  current_quanitity: yup.number().min(0),
  price: yup.number().min(0),
  alert_quanitity: yup.number().min(0)
}

// validate
const schema = yup.object(userFormSchema).required()

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  reciiveData?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: cafeSubResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: cafeSubResponseTypes = {
  cafe_id: '',
  subscription_type: '',
  subscription_start_date: '',
  subscription_end_date: '',
  subscription_charge: '',
  subscription_status: {
    label: 'Active',
    value: 1
  }
}
const CafeSubcription = (props: any) => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add user
  const canAddUser = Can(Permissions.cafeBrowse)
  // can edit user
  const canEditUser = Can(Permissions.cafeBrowse)
  // can delete user
  const canDeleteUser = Can(Permissions.cafeBrowse)
  //can read cafe
  const canReadCafe = Can(Permissions.cafeRead)

  // form hook
  const form = useForm<cafeSubResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // create or update cafe subscription mutation
  const [createCafeSub, createCafeSubResponse] = useCreateOrUpdateCafeSubMutation()
  // load cafe subscription
  const [loadSubCafe, loadSubCafeResponse] = useLoadCafeSubsMutation()
  // delete mutation cafe subscription
  const [cafeSubDelete, cafeSubRestDelete] = useDeleteCafeSubByIdMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    editData: '',
    reciiveData: '',
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)
  const navigate = useNavigate()

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
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createCafeSub({
        jsonData: {
          ...state?.editData,
          ...userData,
          cafe_id: userData?.cafe_id?.value,
          subscription_status: userData?.subscription_status.value,
          subscription_type: userData?.subscription_type?.value
        }
      })
    } else {
      createCafeSub({
        jsonData: {
          ...userData,
          cafe_id: userData?.cafe_id?.value,
          subscription_status: userData?.subscription_status.value,
          subscription_type: userData?.subscription_type?.value
        }
      })
    }
  }

  // load cafeSubscription list
  const loadUserList = () => {
    loadSubCafe({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        ...state.filterData
      }
    })
  }

  // handle cafe subscription  create response
  useEffect(() => {
    if (!createCafeSubResponse.isUninitialized) {
      if (createCafeSubResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Cafe Subscription Successfully'
            : 'Created  Cafe Subscription Successfully'
        )
      } else if (createCafeSubResponse.isError) {
        // handle error
        const errors: any = createCafeSubResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createCafeSubResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<cafeSubResponseTypes>(
        {
          id: state?.editData?.id,
          subscription_charge: state?.editData?.subscription_charge,
          subscription_start_date: state?.editData?.subscription_start_date,
          subscription_end_date: state?.editData?.subscription_end_date,
          subscription_type: state.editData?.subscription_type
            ? {
                label: state.editData?.subscription_type === 1 ? 'Monthly' : 'yearly',
                value: state.editData?.subscription_type
              }
            : undefined,
          cafe_id: state.editData?.cafe_id
            ? {
                label: state.editData?.cafe?.name,
                value: state.editData?.cafe_id
              }
            : undefined,
          subscription_status: state.editData?.subscription_status
            ? {
                label:
                  state.editData?.subscription_status === 1
                    ? 'Active'
                    : state.editData?.subscription_status === 2
                    ? 'InActive'
                    : '',
                value: state.editData?.subscription_status
              }
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

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
      filterData: {
        ...e,
        cafe_id: e?.cafe_id?.value,
        subscription_type: e?.subscription_type?.value
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

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Cafe Subscription'>
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
      cafeSubDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (cafeSubRestDelete?.isLoading === false) {
      if (cafeSubRestDelete?.isSuccess) {
        emitAlertStatus('success', null, cafeSubRestDelete?.originalArgs?.eventId)
      } else if (cafeSubRestDelete?.error) {
        emitAlertStatus('failed', null, cafeSubRestDelete?.originalArgs?.eventId)
      }
    }
  }, [cafeSubRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<cafeSubResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create cafeSubscription modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Cafe Subscription' : 'Create Cafe Subscription'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createCafeSubResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label='Select Cafe'
                  name='cafe_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.cafeList}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={'Subscription Status'}
                  name={`subscription_status`}
                  selectOptions={createConstSelectOptions(sub_status, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={'subscription type'}
                  name={`subscription_type`}
                  selectOptions={createConstSelectOptions(sub_type, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='subscription charge'
                  name='subscription_charge'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='subscription startDate'
                  name='subscription_start_date'
                  type='date'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='subscription endDate'
                  name='subscription_end_date'
                  type='date'
                  className='mb-1'
                  datePickerOptions={{
                    minDate: form.watch('subscription_start_date')
                  }}
                  rules={{ required: false }}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view CafeSubscription modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={`${state.selectedUser?.cafe?.name} Subcription`}
        done='edit'
        hideClose
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: false
          })
          closeViewModal(true)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          <Row>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Cafe Name</Label>
              <p className='text-capitalize'>{state.selectedUser?.cafe?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>email</Label>
              <p className=''>{state.selectedUser?.cafe?.email ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>mobile</Label>
              <p className=''>{state.selectedUser?.cafe?.mobile ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Subscription type</Label>
              <p className=''>
                {state.selectedUser?.subscription_type === 1 ? 'Monthly' : 'Yearly'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>subscription charge</Label>
              <p className=''>(₹) {state.selectedUser?.subscription_charge}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>subscription start date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.subscription_start_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>subscription end date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.subscription_end_date) ?? 'N/A'}
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
  const columns: TableColumn<cafeSubResponseTypes>[] = [
    {
      name: FM('cafe-name'),
      sortable: true,
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
            {row?.cafe?.name}
          </span>
        </Fragment>
      )
    },
    {
      name: FM('subscription-id'),
      sortable: true,
      id: 'id',
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
            {row?.id}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('subscription-type'),
      sortable: true,

      cell: (row) => (
        <Fragment>
          {row?.subscription_type === 1 ? (
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
      name: 'sub charge (₹)',
      sortable: true,
      cell: (row) => <Fragment>{row?.subscription_charge}</Fragment>
    },
    {
      name: FM('created-date'),
      sortable: true,
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
            {canReadCafe ? (
              <>
                <UncontrolledTooltip placement='top' id='view' target='view'>
                  {FM('view')}
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
              {FM('edit')}
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
              {FM('delete')}
            </UncontrolledTooltip>
            <ConfirmAlert
              className='d-flex waves-effect btn btn-danger btn-sm'
              eventId={`item-delete-${row?.id}`}
              text={FM('are-you-sure')}
              title={FM('delete-item', { name: row?.cafe?.name })}
              onClickYes={() => {
                handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
              }}
              onSuccessEvent={onSuccessEvent}
              id={`grid-delete-${row?.id}`}
            >
              <Trash2 size={14} id='delete' />
            </ConfirmAlert>
            <UncontrolledTooltip placement='top' id='receive' target='receive'>
              {'list cafe receiving'}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-info btn-sm'
              id='receive'
              color=''
              onClick={() => {
                navigate(getPath('CafeSubcriptionRecieve', { id: row?.id }))
              }}
            >
              <List size={14} />
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
            loadSubCafeResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadSubCafeResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header
        route={props?.route}
        icon={<List size='25' />}
        goBack={true}
        title='Cafe Subscription'
      >
        <ButtonGroup color='dark'>
          <CafeSubFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadSubCafeResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<cafeSubResponseTypes>
        initialPerPage={20}
        isLoading={loadSubCafeResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadSubCafeResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadSubCafeResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default CafeSubcription
