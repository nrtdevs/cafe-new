import { employeeHandoverExport } from '@src/modules/cafeapp/api/Exportapi'
import { itemTransferType } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateTransferMutation,
  useDeleteTransferIdMutation,
  useLoadEmployeeHandoverMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'

import CustomDataTable, {
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { getPath } from '@src/router/RouteHelper'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { FM, emitAlertStatus, formatDate, isValid, isValidUrl, setValues } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Download, Eye, Menu, Plus, RefreshCcw, Trash2 } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, ButtonGroup, Col, Label, Row, UncontrolledTooltip } from 'reactstrap'
import EmployeeHandoverFilter from './EmployeeHandoverFilter'
import { useLoadEmployeeRecoveryDataMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/DashboardRTK'

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: any
  enableEdit?: boolean
  editData?: any
}

const EmployeeReceivingHandover = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const navigate = useNavigate()

  // can delete menu
  const canCreateHandover = Can(Permissions.employeeHandoverCreate)
  //can read menu
  const canReadUser = Can(Permissions.productBrowse)

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // load menus
  const [loadMenu, loadMenuResp] = useLoadEmployeeRecoveryDataMutation()

  // delete mutation
  const [menuDelete, deleteResp] = useDeleteTransferIdMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 1000,
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
    }
    toggleModalView()
  }

  //load menu list
  const loadUserList = () => {
    loadMenu({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
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

  //handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValid(ids)) {
      menuDelete({
        id: ids,
        eventId: eventId,
        action,
        ids: []
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (deleteResp?.isLoading === false) {
      if (deleteResp?.isSuccess) {
        emitAlertStatus('success', null, deleteResp?.originalArgs?.eventId)
      } else if (deleteResp?.error) {
        emitAlertStatus('failed', null, deleteResp?.originalArgs?.eventId)
      }
    }
  }, [deleteResp])

  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<any>({
        id: state.selectedUser?.id
      })
      toggleModalView()
    }
  }, [state.selectedUser])

  // view handover Receiving modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.product?.name}
        done='edit'
        hideClose
        disableFooter
        hideSave={!canReadUser}
        modalClass={'modal-lg'}
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
              <Label className='text-uppercase mb-25'>{FM('item')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.product?.name}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.subcategory?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('current_stock')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.current_stock ?? 'N/A'} {state?.selectedUser?.unit?.name}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('remaining_stock')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.remaining_stock ?? 'N/A'}
                {state?.selectedUser?.unit?.name}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('in-stock')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.in_stock ?? 'N/A'} {state?.selectedUser?.unit?.name}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('out-stock')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.out_stock ?? 'N/A'} {state?.selectedUser?.unit?.name}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('handoverto')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.handoverto?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('handoverby')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.handoverby?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('handover_date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.handover_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('created-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<any>[] = [
    {
      name: 'Item',
      id: 'product',
      sortable: false,
      width: '180px', // 👈 set column width here
      cell: (row) => <Fragment>{row?.product?.name}</Fragment>
    },
    {
      name: 'Current Stock',
      id: 'current_stock',
      sortable: false,
      width: '180px',
      cell: (row) => <Fragment>{row?.current_stock}</Fragment>
    },
    {
      name: 'Remaining Stock',
      id: 'remaining_stock',
      sortable: false,
      width: '180px',
      cell: (row) => <Fragment>{row?.remaining_stock}</Fragment>
    },
    {
      name: 'in stock',
      id: 'in_stock',
      sortable: false,
      width: '180px',
      cell: (row) => <Fragment>{row?.in_stock}</Fragment>
    },
    {
      name: 'out stock',
      id: 'out_stock',
      sortable: false,
      width: '180px',
      cell: (row) => <Fragment>{row?.out_stock}</Fragment>
    },
    {
      name: 'Unit',
      id: 'unit',
      sortable: false,
      width: '100px',
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: 'Handover By',
      id: 'handoverby',
      sortable: false,
      width: '140px',
      cell: (row) => <Fragment>{row?.handoverby?.name}</Fragment>
    },
    {
      name: 'Handover To',
      id: 'handoverto',
      sortable: false,
      width: '140px',
      cell: (row) => <Fragment>{row?.handoverto?.name}</Fragment>
    },
    {
      name: FM('handover-date'),
      id: 'handover_date',
      sortable: false,
      width: '180px',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              setState({ selectedUser: row })
            }}
            className='text-primary'
          >
            {formatDate(row?.handover_date)}
          </span>
        </Fragment>
      )
    },
    {
      name: 'status',
      sortable: false,

      cell: (row) => (
        <Fragment>
          {row?.order_status === 1 ? (
            <Fragment>
              <Badge pill color='light-warning'>
                {'pending'}
              </Badge>
            </Fragment>
          ) : (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-success'>
                {'Confirmed'}
              </Badge>
            </Fragment>
          )}
        </Fragment>
      )
    },
    {
      name: FM('action'),
      id: 'action',
      sortable: false,

      width: '110px',

      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            {canReadUser ? (
              <>
                <UncontrolledTooltip
                  placement='top'
                  id={`view-${row.id}`}
                  target={`view-${row.id}`}
                >
                  {'View'}
                </UncontrolledTooltip>
                <Button
                  id={`view-${row.id}`}
                  className='d-flex waves-effect btn btn-secondary btn-sm'
                  onClick={() => {
                    setState({ selectedUser: row })
                  }}
                >
                  <Eye size={14} />
                </Button>
              </>
            ) : null}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]

  const onSuccessEvent = () => {
    reloadData()
  }

  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadMenuResp?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadMenuResp?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }

  return (
    <Fragment>
      {renderViewModal()}

      <Header route={props?.route} icon={<Menu size='25' />} title='Handover List'>
        <ButtonGroup color='dark'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadMenuResp.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<any>
        initialPerPage={20}
        isLoading={loadMenuResp.isLoading}
        columns={columns}
        // options={options}
        hideSearch
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadMenuResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadMenuResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default EmployeeReceivingHandover
