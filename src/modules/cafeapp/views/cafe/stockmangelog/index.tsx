import { stockManagementResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import { useLoadStockManageLogMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/StockManagementRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import { FM, formatDate, isValid, isValidArray, setValues } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Eye, List, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { Button, ButtonGroup, Col, Label, Row, UncontrolledTooltip } from 'reactstrap'
import StockLogFilter from './StockLogFilter'

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: stockManagementResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: stockManagementResponseTypes = {
  product_id: '',
  unit_id: '',
  quantity: '',
  stock_operation: '',
  resource: '',
  unit: '',
  price: ''
}
const StockManageLog = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)

  // can edit stock
  const canEditUser = Can(Permissions.stockEdit)
  // can delete stock
  const canDeleteUser = Can(Permissions.stockDelete)

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // load stock
  const [loadStockManage, loadStockManageResponse] = useLoadStockManageLogMutation()

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
        selectedUser: undefined
      })
    }
    toggleModalView()
  }

  // load Stock list
  const loadStockList = () => {
    loadStockManage({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        product: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadStockList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, product_id: e?.product_id?.value },
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

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
    }
  }

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<stockManagementResponseTypes>({
        id: state.selectedUser?.id
      })
      toggleModalView()
    }
  }, [state.selectedUser])

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.product?.name}
        done='edit'
        modalClass={'modal-lg'}
        hideClose
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalView()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          <Row>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('product')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.product?.name}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('current-quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.current_quanitity ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.quantity ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('unit-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('price')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.price ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('resource')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.resource ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('stock-operation')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.stock_operation ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('old-price')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.old_price ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('old-quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.old_quantity ?? 'N/A'}</p>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase fw-bold  mb-25'>{FM('shopping-detail')}</Label>
              <hr />
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('shop-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.shop_name ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('shopping-date')}</Label>
              <p className='text-capitalize'>{formatDate(state.selectedUser?.date) ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('bill-no')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.bill_no ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('purchase-by')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.purchase_by ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('received-by')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.recieved_by?.name ?? 'N/A'}</p>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('address')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className=' text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('update-date')}</Label>
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
  const columns: TableColumn<stockManagementResponseTypes>[] = [
    {
      name: FM('product'),
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
            className='text-primary text-capitalize'
          >
            {row?.product?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('quantity'),
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity}</Fragment>
    },

    {
      name: FM('unit'),
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: FM('price'),
      sortable: false,
      cell: (row) => <Fragment>{row?.price}</Fragment>
    },
    {
      name: FM('operation'),
      sortable: false,
      cell: (row) => <Fragment>{row?.stock_operation}</Fragment>
    },
    {
      name: FM('current-quantity1'),
      sortable: false,
      cell: (row) => <Fragment>{row?.current_quanitity}</Fragment>
    },
    {
      name: FM('old-quantity1'),
      sortable: false,
      cell: (row) => <Fragment>{row?.old_quantity}</Fragment>
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
            loadStockManageResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadStockManageResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title={FM('stock-manage-log')}>
        <ButtonGroup color='dark'>
          <StockLogFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadStockManageResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<stockManagementResponseTypes>
        initialPerPage={20}
        isLoading={loadStockManageResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}

        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadStockManageResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadStockManageResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default StockManageLog
