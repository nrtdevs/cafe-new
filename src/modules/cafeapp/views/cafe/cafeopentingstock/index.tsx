import { yupResolver } from '@hookform/resolvers/yup'
import {
  useCreateOrUpdateCafeOpeningMutation,
  useDeleteCafeOpeningIdMutation,
  useLoadCafeOpeningsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/CafeOpeningStock'
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
import { cafeOpeningResponseType } from '../../../redux/RTKFiles/ResponseTypes'

// validation schema
const userFormSchema = {
  unit_id: yup.object().required('unit must be required').typeError('unit must be required'),
  item_name: yup
    .string()
    .typeError('item name must be required')
    .min(2, 'min length!')
    .max(50, 'max length!'),
  shop_name: yup
    .string()
    .typeError('shop name must be required')
    .min(2, 'min length!')
    .max(50, 'max length!'),
  purchase_by: yup
    .string()
    .min(2, 'min length!')
    .max(50, 'max length!')
    .typeError('purchase by must be required'),
  recieved_by: yup
    .object()
    .typeError('received by must be required')
    .required('received by must be required'),
  quantity: yup
    .number()
    .typeError('quantity must be required')
    .required('quantity must be required'),
  date: yup.string().typeError('date must be required').required('date must be required'),
  price: yup.number().typeError('price must be required').required('price must be required'),
  bill_no: yup.string().typeError('bill no must be required').required('bill no must be required')
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
  selectedUser?: cafeOpeningResponseType
  enableEdit?: boolean
  editData?: any
}

const defaultValues: cafeOpeningResponseType = {
  item_name: '',
  unit_id: '',
  recieved_by: '',
  shop_name: '',
  date: '',
  address: '',
  purchase_by: ''
}
const CafeOpeningStock = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add openingStock
  const canAddUser = Can(Permissions.openingStockCreate)
  // can edit openingStock
  const canEditUser = Can(Permissions.openingStockEdit)
  // can delete openingStock
  const canDeleteUser = Can(Permissions.openingStockDelete)
  //can read openingStock
  const canReadOpeningStock = Can(Permissions.openingStockRead)

  // form hook
  const form = useForm<cafeOpeningResponseType>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation
  const [createCafeOpening, createCafeOpeningResponse] = useCreateOrUpdateCafeOpeningMutation()
  // load users
  const [loadCafeOpening, loadCafeOpeningResponse] = useLoadCafeOpeningsMutation()
  // delete mutation
  const [cafeOpeningDelete, cafeOpeningRestDelete] = useDeleteCafeOpeningIdMutation()

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
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createCafeOpening({
        jsonData: {
          ...userData,
          id: state?.editData?.id,
          unit_id: userData?.unit_id?.value,
          recieved_by: userData?.recieved_by?.value
        }
      })
    } else {
      createCafeOpening({
        jsonData: {
          ...userData,
          unit_id: userData?.unit_id?.value,
          recieved_by: userData?.recieved_by?.value
        }
      })
    }
  }

  // load cafe opening list
  const loadUserList = () => {
    loadCafeOpening({
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
    if (!createCafeOpeningResponse.isUninitialized) {
      if (createCafeOpeningResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id ? 'Updated Item Successfully' : 'Created  Item Successfully'
        )
      } else if (createCafeOpeningResponse.isError) {
        // handle error
        const errors: any = createCafeOpeningResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createCafeOpeningResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<cafeOpeningResponseType>(
        {
          id: state?.editData?.id,
          item_name: state?.editData?.item_name,
          quantity: state?.editData?.quantity,
          price: state?.editData?.price,
          shop_name: state?.editData?.shop_name,
          bill_no: state?.editData?.bill_no,
          address: state?.editData?.address,
          date: state?.editData?.date,
          purchase_by: state?.editData?.purchase_by,
          recieved_by: state.editData?.recieved_by
            ? {
                label: state.editData?.recieved_by?.name,
                value: state.editData?.recieved_by?.id
              }
            : undefined,

          unit_id: state.editData?.unit_id
            ? {
                label: state.editData?.unit?.name,
                value: state.editData?.unit_id
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
      filterData: { ...e, unit_id: e?.unit_id?.value },
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
          <BsTooltip title='Add Item'>
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
      cafeOpeningDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (cafeOpeningRestDelete?.isLoading === false) {
      if (cafeOpeningRestDelete?.isSuccess) {
        emitAlertStatus('success', null, cafeOpeningRestDelete?.originalArgs?.eventId)
      } else if (cafeOpeningRestDelete?.error) {
        emitAlertStatus('failed', null, cafeOpeningRestDelete?.originalArgs?.eventId)
      }
    }
  }, [cafeOpeningRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<cafeOpeningResponseType>(
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
        title={state.enableEdit ? 'Update Cafe Opening Stock' : 'Create Cafe Opening Stock'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createCafeOpeningResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='Item Name'
                  name='item_name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='quantity'
                  name='quantity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label='unit'
                  name='unit_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name} | ${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='buy price'
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='Shopping Date'
                  name='date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='bill no'
                  name='bill_no'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='purchase by'
                  name='purchase_by'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label={FM('received-by')}
                  name='recieved_by'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.employeList}
                  selectLabel={(e) => `${e.name} | ${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='shop name'
                  name='shop_name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label='address'
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
        title={state.selectedUser?.item_name}
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
              <p className='text-capitalize'>
                {state?.selectedUser?.item_name}
                {/* <span className='text-dark fw-bold text-capitalize small ms-50'>
                                    <span className={'text-danger'}>{state.selectedUser?.}</span>
                                </span> */}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>purchasing Date</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.date, 'DD/MM/YYYY') ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>quantity</Label>
              <p className='text-capitalize'>{state?.selectedUser?.quantity ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>Unit</Label>
              <p className='text-capitalize'>{state?.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>price</Label>
              <p className='text-capitalize'>{state?.selectedUser?.price ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Shop Name</Label>
              <p className='text-capitalize'>{state?.selectedUser?.shop_name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Bill No</Label>
              <p className='text-capitalize'>{state?.selectedUser?.bill_no ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>purchase by</Label>
              <p className='text-capitalize'>{state?.selectedUser?.purchase_by ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>received by</Label>
              <p className='text-capitalize'>{state?.selectedUser?.recieved_by?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Create Date</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
          <div>
            <Label className='text-uppercase mb-25'>Shopping Address</Label>
            <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<cafeOpeningResponseType>[] = [
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
            {row?.item_name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'quantity',
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity}</Fragment>
    },

    {
      name: 'unit',
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: 'quantity',
      sortable: false,
      cell: (row) => <Fragment>{row?.price}</Fragment>
    },
    {
      name: 'purchasing date',
      sortable: false,
      id: 'date',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.date)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            {canReadOpeningStock ? (
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
                  title={FM('delete-item', { name: row?.item_name })}
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
            loadCafeOpeningResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadCafeOpeningResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Cafe Opening Stock'>
        <ButtonGroup color='dark'>
          {/* <ProductFilter handleFilterData={handleFilterData} /> */}

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadCafeOpeningResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<cafeOpeningResponseType>
        initialPerPage={20}
        isLoading={loadCafeOpeningResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadCafeOpeningResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadCafeOpeningResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default CafeOpeningStock
