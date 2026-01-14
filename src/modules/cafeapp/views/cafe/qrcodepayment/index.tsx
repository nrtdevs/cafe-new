import { yupResolver } from '@hookform/resolvers/yup'
import {
  useCreateOrUpdatePaymentQrMutation,
  useDeletePaymentQrByIdMutation,
  useLoadPaymentQrsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/qrpaymentRtk'
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
import { Edit, List, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
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
import { QrResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'

// validation schema
const userFormSchema = {
  //name: yup.string().min(2, 'min length!').max(50, 'max length!'),
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
  selectedUser?: QrResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: QrResponseTypes = {
  qr_code_image_path: ''
}

const QrCodePayment = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add user
  const canAddUser = Can(Permissions.productCreate)
  // can edit user
  const canEditUser = Can(Permissions.productEdit)
  // can delete user
  const canDeleteUser = Can(Permissions.productDelete)

  // form hook
  const form = useForm<QrResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update qr  mutation
  const [createQr, createQrResponse] = useCreateOrUpdatePaymentQrMutation()
  // load Qr
  const [loadQr, loadQrResponse] = useLoadPaymentQrsMutation()

  // delete mutation
  const [userAction, userActionResult] = useActionUserMutation()
  const [paymentQrDelete, PaymentQrRestDelete] = useDeletePaymentQrByIdMutation()

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
      createQr({
        jsonData: {
          ...state?.editData,
          ...userData,
          qr_code_image_path: userData?.qr_code_image_path
            ? userData?.qr_code_image_path[0]?.file_name
            : state?.editData?.qr_code_image_path
        }
      })
    } else {
      createQr({
        jsonData: {
          ...userData,
          qr_code_image_path: userData?.qr_code_image_path[0]?.file_name
        }
      })
    }
  }

  // load Qr list
  const loadQrList = () => {
    loadQr({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        //name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle user create response
  useEffect(() => {
    if (!createQrResponse.isUninitialized) {
      if (createQrResponse.isSuccess) {
        closeAddModal()
        loadQrList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Payment Qr Successfully'
            : 'Created  Payment Qr Successfully'
        )
      } else if (createQrResponse.isError) {
        // handle error
        const errors: any = createQrResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createQrResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<QrResponseTypes>(
        {
          id: state?.editData?.id

          // qr_code_image_path: state?.editData?.qr_code_image_path,
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
    loadQrList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
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
          <BsTooltip title={FM('add-payment-qr')}>
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
      paymentQrDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (PaymentQrRestDelete?.isLoading === false) {
      if (PaymentQrRestDelete?.isSuccess) {
        emitAlertStatus('success', null, PaymentQrRestDelete?.originalArgs?.eventId)
      } else if (PaymentQrRestDelete?.error) {
        emitAlertStatus('failed', null, PaymentQrRestDelete?.originalArgs?.eventId)
      }
    }
  }, [PaymentQrRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<QrResponseTypes>(
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
        title={state.enableEdit ? <>{FM('update-payment-qr')}</> : <>{FM('create-payment-qr')}</>}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createQrResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12' className=''>
                <FormGroupCustom
                  control={form.control}
                  label={'Upload image'}
                  name='qr_code_image_path'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>

              {state?.editData?.qr_code_image_path ? (
                <Col md='12'>
                  <img src={state?.editData?.qr_code_image_path} width={'100'} height={'100'} />
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
        title={state.selectedUser}
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
              <Label className='text-uppercase mb-25'>Create Date</Label>
              <p className='text-dark fw-bold text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className='text-dark fw-bold text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<QrResponseTypes>[] = [
    {
      name: 'Payment Qr',
      sortable: false,
      id: 'Payment',
      cell: (row) => (
        <Fragment>
          <Fragment>
            {' '}
            <img src={row.qr_code_image_path} width={'100'} height={'100'} />
          </Fragment>
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
      name: 'Updated Date',
      sortable: false,
      id: 'update Date',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.updated_at)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
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
              title={FM('delete-item', { name: row?.id })}
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
            loadQrResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadQrResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Payment Qr'>
        <ButtonGroup color='dark'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadQrResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<QrResponseTypes>
        initialPerPage={20}
        isLoading={loadQrResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        //selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadQrResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadQrResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default QrCodePayment
