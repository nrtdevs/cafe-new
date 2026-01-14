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
import { unitResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'

import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import {
  useCreateOrUpdateunitMutation,
  useDeleteUnitByIdMutation,
  useLoadUnitsMutation
} from '../../../redux/RTKFiles/common-cafe/UnitsRTK'

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
  selectedUser?: unitResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: unitResponseTypes = {
  name: '',
  abbreiation: '',
  minvalue: ''
}
const Unit = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)

  // can add user
  const canAddUser = Can(Permissions.unitCreate)
  // can edit user
  const canEditUser = Can(Permissions.unitEdit)
  // can delete user
  const canDeleteUser = Can(Permissions.unitDelete)

  //can read unit
  const canReadUser = Can(Permissions.unitRead)

  // form hook
  const form = useForm<unitResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  const [crateUnit, createUnitResponse] = useCreateOrUpdateunitMutation()
  // load users
  const [loadUnit, loadUnitResponse] = useLoadUnitsMutation()

  // delete mutation
  const [unitDelete, unitRestDelete] = useDeleteUnitByIdMutation()

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

  // handle save unit
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      crateUnit({
        jsonData: {
          ...userData,
          is_parent: userData?.is_parent?.value,
          parent_unit_value: userData?.is_parent
            ? parseInt(userData?.minvalue) / parseInt(userData?.parent_unit_value)
            : null
        }
      })
    } else {
      crateUnit({
        jsonData: {
          ...userData,
          is_parent: userData?.is_parent?.value,
          parent_unit_value: userData?.is_parent
            ? parseInt(userData?.minvalue) / parseInt(userData?.parent_unit_value)
            : null
        }
      })
    }
  }

  // load unit list
  const loadUnitList = () => {
    loadUnit({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle unit create response
  useEffect(() => {
    if (!createUnitResponse.isUninitialized) {
      if (createUnitResponse.isSuccess) {
        closeAddModal()
        loadUnitList()
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-unit-successfully')}</>
          ) : (
            <>{FM('created-unit-successfully')}</>
          )
        )
      } else if (createUnitResponse.isError) {
        // handle error
        const errors: any = createUnitResponse.error
        log(errors)
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [createUnitResponse])

  // handle pagination and load list
  useEffect(() => {
    loadUnitList()
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
          <BsTooltip title='Add Unit'>
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
      unitDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (unitRestDelete?.isLoading === false) {
      if (unitRestDelete?.isSuccess) {
        emitAlertStatus('success', null, unitRestDelete?.originalArgs?.eventId)
      } else if (unitRestDelete?.error) {
        emitAlertStatus('failed', null, unitRestDelete?.originalArgs?.eventId)
      }
    }
  }, [unitRestDelete])

  ////////update Form

  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<unitResponseTypes>(
        {
          id: state?.editData?.id,
          name: state.editData?.name,
          abbreiation: state?.editData?.abbreiation,
          minvalue: state?.editData?.minvalue,
          parent_unit_value: state.editData?.parent?.minvalue,
          is_parent: state?.editData?.is_parent
            ? {
                label: state.editData?.parent?.name,
                value: state.editData?.parent?.id,
                minvalue: state.editData?.parent?.minvalue
              }
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  useEffect(() => {
    if (state?.editData) {
    } else {
      form.setValue('parent_unit_value', form.watch('is_parent')?.extra?.minvalue)
    }
  }, [form.watch('is_parent')])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<unitResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create unit modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Unit' : 'Create Unit'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createUnitResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label={FM('parent')}
                  name='is_parent'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              {/* <Hide IF={true}> */}
              <Col md='6'>
                <FormGroupCustom
                  isDisabled
                  control={form.control}
                  label='parent unit value'
                  name='parent_unit_value'
                  type='number'
                  className='mb-1'
                  rules={{ required: false, min: 0 }}
                />
              </Col>
              {/* </Hide> */}
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label='name'
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='abbreviation'
                  name='abbreiation'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='minvalue'
                  name='minvalue'
                  type='number'
                  className='mb-1'
                  rules={{ required: true, min: 0 }}
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
          {/* <Row className='align-items-center mb-1'>
            <Col md='1'>
              <User size={35} />
            </Col>
            <Col md='8'>
              <p className='text-dark mb-0'>{FM('personal-details')}</p>
              <p className='text-muted small mb-0'>{FM('edit-description')}</p>
            </Col>
          </Row> */}
          <Row>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>abbreviation</Label>
              <p className='text-capitalize'>{state.selectedUser?.abbreiation ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>parent</Label>
              <p className='text-capitalize'>{state.selectedUser?.parent?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>parent unit value</Label>
              <p className='text-capitalize'>{state.selectedUser?.parent_unit_value ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>minvalue</Label>
              <p className='text-capitalize'>{state.selectedUser?.minvalue ?? 'N/A'}</p>
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
  const columns: TableColumn<unitResponseTypes>[] = [
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
      name: 'abbreviation',
      sortable: false,

      cell: (row) => <Fragment>{row?.abbreiation}</Fragment>
    },
    {
      name: 'min value',
      sortable: false,

      cell: (row) => <Fragment>{row?.minvalue}</Fragment>
    },
    {
      name: 'parent',
      sortable: false,

      cell: (row) => <Fragment>{row?.parent?.name}</Fragment>
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
            loadUnitResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadUnitResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Unit List'>
        <ButtonGroup color='dark'>
          {/* <UserFilter handleFilterData={handleFilterData} /> */}

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadUnitResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<unitResponseTypes>
        initialPerPage={20}
        isLoading={loadUnitResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadUnitResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadUnitResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Unit
