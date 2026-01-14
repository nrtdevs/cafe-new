import { yupResolver } from '@hookform/resolvers/yup'
import { cafeResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateSubCafeMutation,
  useDeleteSubCafeByIdMutation,
  useLoadSubCafesMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/SubCafe'
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
import { handleLogin } from '@src/redux/authentication'
import { sub_status } from '@src/utility/Const'
import Hide from '@src/utility/Hide'
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
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import base64 from 'base-64'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  Edit,
  Eye,
  Key,
  List,
  PlusCircle,
  RefreshCcw,
  Trash2,
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
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
// import SubCafeFilter from './SubCafeFilter'

import { useSubCafeChLoginMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/AuthRTK'
import WarehouseFilter from './WarehouseFilter'
import {
  useCreateOrUpdateWarehouseMutation,
  useDeleteWarehouseByIdMutation,
  useLoadWarehousesMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/WarehouseRTK'
import { getUserData } from '@src/auth/utils'

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,20}$/
// validation schema
const userFormSchema = {
  name: yup
    .string()
    .trim()
    .typeError('Please Name is required')
    .required()
    .min(2, 'min length!')
    .max(50, 'max length!'),
  address: yup
    .string()
    .trim()
    .typeError('Please  Address required')
    .required()
    .min(2, 'min length!')
    .max(200, 'max length!'),
  // website: yup.string().trim().required().min(2, 'min length!').max(50, 'max length!'),
  contact_person_name: yup
    .string()
    .typeError('please contact person name required')
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
    .typeError('Please Enter Valid Mobile Number'),
  email: yup.string().required().matches(emailValidation, 'Please Enter Valid Email'),
  contact_person_email: yup
    .string()
    .required()
    .matches(emailValidation, 'Please Enter Valid email'),
  contact_person_phone: yup
    .number()
    .required()
    .test(
      'len',
      'Please Enter Valid Phone Number',
      (val: any) => val && val.toString().length === 10
    )
    .typeError('Please Enter Valid Phone Number'),
  status: yup.object().typeError('Status Is Required').required()
  //   password: yup.string().optional().notRequired().matches(passwordRules, {
  //     message:
  //       'min 5 characters,max 20 characters 1 upper case letter, 1 lower case letter, 1 numeric digit'
  //   })
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
  selectedUser?: cafeResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: cafeResponseTypes = {
  name: '',
  email: '',
  password: '',
  mobile: '',
  address: '',
  website: '',
  profile_image_path: undefined,
  contact_person_name: '',
  contact_person_email: '',
  contact_person_phone: '',
  subscription_status: ''
}
const Warehouse = (props: any) => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add sub cafe
  const dispatch = useDispatch()

  const canAddUser = Can(Permissions.warehouseCreate)
  // can edit sub cafe
  const canEditUser = Can(Permissions.warehouseEdit)
  // can delete sub cafe
  const canDeleteUser = Can(Permissions.warehouseDelete)
  // can view sub cafe
  const canViewUser = Can(Permissions.warehouseRead)

  // form hook
  const form = useForm<cafeResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // create or update sub cafe mutation
  const [createWarehouse, createWarehouseResponse] = useCreateOrUpdateWarehouseMutation()

  // load  sub cafe
  const [loadWarehouse, loadWareResponse] = useLoadWarehousesMutation()

  //delete sub cafe
  const [subCafeDelete, subCafeRestDelete] = useDeleteWarehouseByIdMutation()

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

  // handle save warehouse Data
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createWarehouse({
        jsonData: {
          ...userData,
          status: userData?.status?.value,
          password: undefined,
          qr_codes: userData?.qr_codes?.map((data) => data?.file_name)
        }
      })
    } else {
      createWarehouse({
        jsonData: {
          ...userData,
          status: userData?.status?.value,
          qr_codes: userData?.qr_codes?.map((data) => data?.file_name)
        }
      })
    }
  }

  //load warehouse  list
  const loadWarehouseList = () => {
    loadWarehouse({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle sub cafe create response
  useEffect(() => {
    if (!createWarehouseResponse.isUninitialized) {
      if (createWarehouseResponse.isSuccess) {
        closeAddModal()
        loadWarehouseList()
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-warehouse-successfully')} </>
          ) : (
            <>{FM('created-warehouse-successfully')}</>
          )
        )
      } else if (createWarehouseResponse.isError) {
        // handle error
        const errors: any = createWarehouseResponse.error
        log(errors)
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [createWarehouseResponse])

  // handle pagination and load list
  useEffect(() => {
    loadWarehouseList()
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
          <BsTooltip title={FM('add-warehouse')}>
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
      subCafeDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (subCafeRestDelete?.isLoading === false) {
      if (subCafeRestDelete?.isSuccess) {
        emitAlertStatus('success', null, subCafeRestDelete?.originalArgs?.eventId)
      } else if (subCafeRestDelete?.error) {
        emitAlertStatus('failed', null, subCafeRestDelete?.originalArgs?.eventId)
      }
    }
  }, [subCafeRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<cafeResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  //setValueOnFOrm
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<cafeResponseTypes>(
        {
          id: state?.editData?.id,
          name: state?.editData?.name,
          email: state?.editData?.email,
          mobile: state?.editData?.mobile,
          address: state?.editData?.address,
          website: state?.editData?.website,
          contact_person_name: state?.editData?.contact_person_name,
          contact_person_email: state?.editData?.contact_person_email,
          contact_person_phone: state?.editData?.contact_person_phone,
          no_of_subcafe: state?.editData?.no_of_subcafe,
          status: state?.editData?.status
            ? {
                label:
                  state?.editData?.status === 1
                    ? 'Active'
                    : state?.editData?.status === 2
                    ? 'InActive'
                    : '',
                value: state?.editData?.status
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

  // create sub cafe modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'Update' : 'save'}
        title={state.enableEdit ? FM('update-warehouse') : FM('create-warehouse')}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createWarehouseResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6'>
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
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('mobile')}
                  name='mobile'
                  type='number'
                  className='mb-1'
                  rules={{ required: true, min: 0 }}
                />
              </Col>

              {/* <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('website')}
                                    name='website'
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: true, min: 0 }}
                                />
                            </Col> */}

              <Hide IF={state?.editData?.id}>
                <Col md='6'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('password')}
                    name='password'
                    type='password'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Hide>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('contact-person-name')}
                  name='contact_person_name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('contact-person-email')}
                  name='contact_person_email'
                  type='email'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('contact-person-phone')}
                  name='contact_person_phone'
                  type='number'
                  className='mb-1'
                  rules={{ required: true, min: 0 }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('status')}
                  name={`status`}
                  selectOptions={createConstSelectOptions(sub_status, FM)}
                  type='select'
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
                  rules={{ required: true }}
                />
              </Col>

              {/* <Col md='12' className=''>
                <FormGroupCustom
                  isMulti
                  control={form.control}
                  label={'Qr Code'}
                  name='qr_codes'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>
              {state?.editData?.qr_codes ? (
                <>
                  {state?.editData?.qr_codes?.map((item: any) => {
                    ;<Col md='12'>
                      <img src={item} width={'100'} height={'100'} />
                    </Col>
                  })}
                </>
              ) : (
                ''
              )} */}
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view sub cafe modal
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
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('email')}</Label>
              <p className=''>{state.selectedUser?.email ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('mobile')}</Label>
              <p className=''>{state.selectedUser?.mobile ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('status')}</Label>
              <p className=''>{state.selectedUser?.status === 1 ? 'Active' : 'InActive'}</p>
            </Col>

            {/* <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('website')}</Label>
              <p className=''>{state.selectedUser?.website ?? 'N/A'}</p>
            </Col> */}
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('contact-person-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.contact_person_name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('contact-person-email')}</Label>
              <p className=''>{state.selectedUser?.contact_person_email ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('contact-person-phone')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.contact_person_phone ?? 'N/A'}</p>
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
            {state?.selectedUser?.profile_image_path ? (
              <Col md='12'>
                <Label className='text-uppercase mb-25'>{FM('cafe-logo')}</Label>
                <p className='text-capitalize'>
                  <img src={state?.selectedUser?.profile_image_path} width={'100'} height={'100'} />
                </p>
              </Col>
            ) : (
              ''
            )}
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
  const columns: TableColumn<cafeResponseTypes>[] = [
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
      name: FM('email'),
      sortable: false,
      id: 'email',
      cell: (row) => <Fragment>{row?.email}</Fragment>
    },
    {
      name: FM('mobile'),
      sortable: false,
      id: 'mobile',
      cell: (row) => <Fragment>{row?.mobile}</Fragment>
    },
    {
      name: FM('status'),
      sortable: false,
      id: 'Status',
      cell: (row) => (
        <Fragment>
          {row?.status === 1 ? (
            <Badge pill className='' color='light-success'>
              {'Active'}
            </Badge>
          ) : (
            <Badge pill className='' color='light-danger'>
              {'InActive'}
            </Badge>
          )}
        </Fragment>
      )
    },

    {
      name: FM('created-date'),
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
            {canViewUser ? (
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

            {canEditUser ? (
              <>
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
                  {FM('delete')}
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
            loadWareResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadWareResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Warehouse List'>
        <ButtonGroup color='dark'>
          <WarehouseFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadWareResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>
      <CustomDataTable<cafeResponseTypes>
        initialPerPage={20}
        isLoading={loadWareResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadWareResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadWareResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Warehouse
