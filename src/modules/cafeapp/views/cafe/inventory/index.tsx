import { yupResolver } from '@hookform/resolvers/yup'
import {
  useCreateOrUpdateInventoryMutation,
  useDeleteInventoryByIdMutation,
  useLoadInventorsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/InventoryRTK'
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
import toast from 'react-hot-toast'
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
import { wastedResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'

// validation schema
const userFormSchema = {
  quantity: yup
    .number()
    .typeError('Current quantity must be a number')
    .required('Please provide plan cost.')
    .min(0),
  unit_id: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required()
    })
    .nullable()
    .required('required'),

  date: yup.string().required('Please select Date')
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
  selectedUser?: wastedResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: wastedResponseTypes = {
  product_id: null,
  unit_id: null,
  date: '',
  menu_id: null,
  reason: undefined
}

const InventoryStock = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add wasted
  const canAddUser = Can(Permissions.wastedCreate)
  // can edit wasted
  const canEditUser = Can(Permissions.wastedEdit)
  // can delete wasted
  const canDeleteUser = Can(Permissions.wastedDelete)
  //can read wasted
  const canReadWasted = Can(Permissions.wastedRead)

  // form hook
  const form = useForm<wastedResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation
  const [createManageWastage, createManageWastageResponse] = useCreateOrUpdateInventoryMutation()
  // load users
  const [loadManageWastage, loadManageWastageResponse] = useLoadInventorsMutation()
  // delete mutation
  const [productDelete, productRestDelete] = useDeleteInventoryByIdMutation()

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

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined,
        editData: null
      })
      form.setValue('reason', '')
      form.reset()
    }
    toggleModalView()
  }

  // load manage wasted list
  const loadUserList = () => {
    loadManageWastage({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle save stock wasted
  const handleSaveUser = (userData: any) => {
    if (isValid(state.editData)) {
      if (
        (userData?.create_menu === 1 && form.watch('menu_id') === null) ||
        (userData?.create_menu === 0 && form.watch('product_id') === null)
      ) {
        form.watch('create_menu') == 1
          ? toast.error('please select menu')
          : toast.error('please select product')
      } else {
        createManageWastage({
          jsonData: {
            id: state?.editData?.id,
            date: userData?.date ? userData?.date : '',
            reason: userData?.reason ? userData?.reason : '',
            quantity: userData?.quantity ? userData?.quantity : '',
            menu_id: userData?.menu_id?.value ? userData?.menu_id?.value : null,
            product_id: userData?.product_id?.value ? userData?.product_id?.value : null,
            unit_id: userData?.unit_id?.value ? userData?.unit_id?.value : null,
            image: userData?.image
              ? userData?.image[0]?.file_name
              : state?.editData?.image
              ? state?.editData?.image
              : ''
          }
        })
      }
    } else {
      if (
        (userData?.create_menu === 1 && form.watch('menu_id') === null) ||
        (userData?.create_menu === 0 && form.watch('product_id') === null)
      ) {
        form.watch('create_menu') == 1
          ? toast.error('please select menu')
          : toast.error('please select product')
      } else {
        createManageWastage({
          jsonData: {
            date: userData?.date ? userData?.date : '',
            quantity: userData?.quantity ? userData?.quantity : '',
            menu_id: userData?.menu_id?.value ? userData?.menu_id?.value : null,
            product_id: userData?.product_id?.value ? userData?.product_id?.value : null,
            unit_id: userData?.unit_id?.value ? userData?.unit_id?.value : null,
            image: userData?.image[0]?.file_name ? userData?.image[0]?.file_name : '',
            reason: userData?.reason ? userData?.reason : ''
          }
        })
      }
    }
  }

  // handle user create response
  useEffect(() => {
    if (!createManageWastageResponse.isUninitialized) {
      if (createManageWastageResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        form.setValue('reason', '')
        SuccessToast(
          state?.editData?.id
            ? 'Updated Wasted Items Successfully'
            : 'Created  Wasted Items Successfully'
        )
      } else if (createManageWastageResponse.isError) {
        // handle error
        const errors: any = createManageWastageResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createManageWastageResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<wastedResponseTypes>(
        {
          id: state?.editData?.id,
          date: state.editData?.date,
          quantity: state.editData?.quantity,
          menu_id: state.editData?.menu_id
            ? {
                label: state.editData?.menu?.name,
                value: state.editData?.menu_id
              }
            : undefined,
          product_id: state.editData?.product_id
            ? {
                label: state.editData?.product?.name,
                value: state.editData?.product_id
              }
            : undefined,
          reason: state.editData?.reason,
          create_menu: state?.editData?.menu_id ? 1 : 0,
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

  //setValue

  useEffect(() => {
    if (state.editData) {
      if (state?.editData?.product_id && form.watch('create_menu') === 1) {
        form.setValue('product_id', undefined)
        form.setValue('menu_id', {
          label: '',
          value: ''
        })
      } else if (state?.editData?.product_id && form.watch('create_menu') === 0) {
        form.setValue('product_id', {
          label: state.editData?.product?.name,
          value: state.editData?.product_id
        })
      } else if (state?.editData?.menu_id && form.watch('create_menu') === 0) {
        form.setValue('menu_id', undefined)
        form.setValue('product_id', {
          label: '',
          value: ''
        })
      } else {
        form.setValue('menu_id', {
          label: state.editData?.menu?.name ?? '',
          value: state.editData?.menu_id ?? ''
        })
      }
    }
  }, [state.editData, form.watch('create_menu')])

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

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    form.setValue('reason', '')
    form.reset()
    toggleModalAdd()
  }
  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Wasted Items'>
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
      productDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (productRestDelete?.isLoading === false) {
      if (productRestDelete?.isSuccess) {
        emitAlertStatus('success', null, productRestDelete?.originalArgs?.eventId)
      } else if (productRestDelete?.error) {
        emitAlertStatus('failed', null, productRestDelete?.originalArgs?.eventId)
      }
    }
  }, [productRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<wastedResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  useEffect(() => {
    if (state.editData) {
    } else {
      if (form.watch('product_id')) {
        form.setValue('unit_id', {
          label: form.watch(`product_id`)?.extra?.unit?.name ?? '',
          value: form.watch(`product_id`)?.extra?.unit_id
        })
      } else {
        form.setValue('unit_id', {
          label: '',
          value: ''
        })
      }
    }
  }, [form.watch('product_id')])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Wasted Item' : 'Create Wasted Item'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createManageWastageResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  defaultValue={0}
                  control={form.control}
                  label={FM('with-menu')}
                  name={`create_menu`}
                  type='checkbox'
                  className='mb-2'
                  inputClassName={''}
                  rules={{ required: false }}
                />
              </Col>

              {form.watch('create_menu') === 1 ? (
                <Col md='6'>
                  <FormGroupCustom
                    key={`${form.watch('create_menu') === 1}`}
                    control={form.control}
                    async
                    label={FM('menu-name')}
                    placeholder={FM('select-menu')}
                    name='menu_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.menus}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              ) : (
                <Col md='6'>
                  <FormGroupCustom
                    key={state?.editData?.id}
                    control={form.control}
                    async
                    isClearable
                    label={FM('product-name')}
                    placeholder={FM('select-product')}
                    name='product_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.products}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              )}

              <Col md='6'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label={FM('quantity')}
                  name='quantity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label={FM('unit')}
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
              <Col md='6'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label={FM('date')}
                  name='date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label={FM('reason')}
                  name='reason'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='12' className=''>
                <FormGroupCustom
                  key={state?.editData?.id}
                  control={form.control}
                  label={FM('upload-image')}
                  name='image'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>
              {state?.editData?.image ? (
                <Col md='12'>
                  <img src={state?.editData?.image} width={'100'} height={'100'} />
                </Col>
              ) : (
                ''
              )}
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
        title={
          state.selectedUser?.menu_id
            ? state?.selectedUser?.menu?.name
            : state?.selectedUser?.product?.name
        }
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
            {state?.selectedUser?.product_id ? (
              <Col md='6'>
                <Label className='text-uppercase mb-25'>{FM('product-name')}</Label>
                <p className='text-capitalize'>{state.selectedUser?.product?.name}</p>
              </Col>
            ) : (
              <Col md='6'>
                <Label className='text-uppercase mb-25'>{FM('menu-name')}</Label>
                <p className='text-capitalize'>{state.selectedUser?.menu?.name ?? 'N/A'}</p>
              </Col>
            )}

            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.date, 'DD/MM/YYYY') ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('unit')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.quantity ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('reason')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.reason ?? 'N/A'}</p>
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
            {state?.selectedUser?.image ? (
              <Col md='6'>
                <Label className='text-uppercase mb-25'>{FM('image')}</Label>
                <p className='text-capitalize'>
                  <img src={state?.selectedUser?.image} width={'100'} height={'100'} />
                </p>
              </Col>
            ) : (
              ''
            )}
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<wastedResponseTypes>[] = [
    {
      name: 'product',
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
            {row?.product?.name ?? 'N/A'}
          </span>
        </Fragment>
      )
    },

    {
      name: 'menu name',
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
            {row?.menu?.name ?? 'N/A'}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('date'),
      sortable: false,
      id: 'date',
      cell: (row) => <Fragment>{formatDate(row?.date, 'DD/MM/YYYY') ?? 'N/A'}</Fragment>
    },

    {
      name: 'quantity',
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity ?? 'N/A'}</Fragment>
    },

    {
      name: 'unit',
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name ?? 'N/A'}</Fragment>
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
                                        title={FM('delete-item', { name: row?.name })}
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
            {canReadWasted ? (
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
                  title={FM('delete-item', {
                    name: row?.menu_id ? row?.menu?.name : row?.product?.name
                  })}
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
            loadManageWastageResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadManageWastageResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Manage Wastage'>
        <ButtonGroup color='dark'>
          {/* <ProductFilter handleFilterData={handleFilterData} /> */}

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadManageWastageResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<wastedResponseTypes>
        initialPerPage={20}
        isLoading={loadManageWastageResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadManageWastageResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadManageWastageResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default InventoryStock
