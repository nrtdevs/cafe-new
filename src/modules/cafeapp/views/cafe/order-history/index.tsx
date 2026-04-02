import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import { orderResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useGetRecipeListMutation,
  useLoadOrdersLogMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/OrderRTK'
import { useLoadExportOrderDataMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/DashboardRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import {
  FM,
  JsonParseValidate,
  formatDate,
  formatDateValue,
  isValid,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Eye, Menu, RefreshCcw } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { Badge, Button, ButtonGroup, UncontrolledTooltip } from 'reactstrap'
import OrderFilter from '../Order/OrderFilter'
import OrderHistoryFilter from './OrderHistoryFilter'

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: orderResponseTypes
  enableEdit?: boolean
  comfirmedOrder?: boolean
  editData?: any
  cancelData?: any
  editConfirmedData?: any
}

const OrderHistory = (props: any) => {
  const componentRef = useRef<HTMLElement | any>(null)
  const [printData, setPrintData] = useState<any>(null)
  const location = useLocation()

  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const currentDate = `${year}-${month}-${day}`
  const [kichenprintData, setKichenPrintData] = useState<any>(null)
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,

    onAfterPrint: () => {
      setKichenPrintData(null)
      setPrintData(null)
    }
  })

  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  //get REcepie List
  const [loadRecepieList, recipeResp] = useGetRecipeListMutation()
  //load Dashboard orderTime report
  const [orderTable, orderTableRestResponse] = useLoadExportOrderDataMutation()

  //load order List mutation
  const [loadOrders, loadResp] = useLoadOrdersLogMutation()

  const user1 = getUserData()

  const navigate = useNavigate()
  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    comfirmedOrder: false,
    editData: '',
    editConfirmedData: '',
    lastRefresh: new Date().getTime()
  }
  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  const urlDemo = orderTableRestResponse?.data?.payload?.[0]?.file_name

  useEffect(() => {
    if (urlDemo) {
      window.open(urlDemo, '_blank')
    } else {
      console.error('File URL is not available.')
    }
  }, [urlDemo])

  //load rec. list on cancel order
  useEffect(() => {
    if (state?.cancelData?.id) {
      loadRecepieList({
        id: state.cancelData?.id
      })
    }
  }, [state.cancelData])

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
    }
    toggleModalView()
  }

  // load order list
  const loadUserList = () => {
    loadOrders({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        // order_id: location?.state?.id,
        // name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        start_date: state.filterData
          ? formatDateValue(state.filterData?.start_date, 'YYYY-MM-DD HH:mm:ss')
          : formatDate(new Date(), 'YYYY-MM-DD'),
        end_date: state.filterData
          ? formatDateValue(state.filterData?.end_date, 'YYYY-MM-DD HH:mm:ss')
          : ''
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadUserList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e, page: e.page, per_page_record: e.per_page_record })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        ...e,
        order_status: e?.order_status?.value,
        payment_mode: e?.payment_mode?.value,
        sub_cafe_id: e?.sub_cafe_id?.value,
        cafe_id: e?.cafe_id?.value,
        start_date: e.start_date
          ? formatDateValue(e?.start_date, 'YYYY-MM-DD HH:mm:ss')
          : formatDate(new Date(), 'YYYY-MM-DD'),
        end_date: e?.end_date ? formatDateValue(e?.end_date, 'YYYY-MM-DD HH:mm:ss') : ''
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

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<orderResponseTypes>({
        id: state.selectedUser?.id
      })
      toggleModalView()
    }
  }, [state.selectedUser])

  // close export modal

  let number = state.selectedUser?.total_amount - state.selectedUser?.payable_amount
  let formattedNumber = number.toFixed(2)
  const totalDiscount = state.selectedUser?.order_details
    .reduce((acc, d) => acc + (parseFloat(d.discount_amount) || 0), 0)
    .toFixed(2)

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={`Table No:${state.selectedUser?.table_number}`}
        done='edit'
        hideClose
        disableFooter
        modalClass={'modal-lg'}
        hideSave={true}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='px-2 py-2'>
          <div className='row mb-2 pb-1 mx-0 border-bottom'>
            <div className='col-xl-8'>
              <ul className='list-unstyled mb-0'>
                {state?.selectedUser?.customer_id ? (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                      {FM('customer-name')}:
                    </span>
                    <span className='text-primary fw-bold'>
                      {state?.selectedUser?.customer?.name}
                    </span>
                  </li>
                ) : (
                  <li className='mb-75 text-muted small italic'>Walk-in Customer</li>
                )}

                {(state?.selectedUser?.payment_mode === 4 ||
                  state?.selectedUser?.payment_mode === 3) && (
                    <>
                      <li className='mb-75 d-flex align-items-center'>
                        <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                          {FM('cash')}:
                        </span>
                        <span>
                          <CurrencyRupee sx={{ maxHeight: '14px' }} />
                          {state?.selectedUser?.cash_amount}
                        </span>
                      </li>
                      <li className='mb-75 d-flex align-items-center'>
                        <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                          {FM('online')}:
                        </span>
                        <span>
                          <CurrencyRupee sx={{ maxHeight: '14px' }} />
                          {state?.selectedUser?.online_amount}
                        </span>
                      </li>
                    </>
                  )}

                {state?.selectedUser?.payment_mode === 1 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                      {FM('cash')}:
                    </span>
                    <span>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.cash_amount}
                    </span>
                  </li>
                )}

                {state?.selectedUser?.payment_mode === 2 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                      {FM('online')}:
                    </span>
                    <span>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.online_amount}
                    </span>
                  </li>
                )}

                {state?.selectedUser?.payment_mode === 3 && (
                  <li className='mb-75 d-flex align-items-center'>
                    <span className='fw-bold text-danger me-50' style={{ minWidth: '130px' }}>
                      {FM('udhaar')}:
                    </span>
                    <span className='text-danger fw-bold'>
                      <CurrencyRupee sx={{ maxHeight: '14px' }} />
                      {state?.selectedUser?.udhaar_amount}
                    </span>
                  </li>
                )}

                <li className='mb-0 d-flex align-items-center'>
                  <span className='fw-bold text-dark me-50' style={{ minWidth: '130px' }}>
                    {FM('discount-amount')}:
                  </span>
                  <span className='text-success fw-bold'>
                    <CurrencyRupee sx={{ maxHeight: '14px' }} />
                    {totalDiscount}
                  </span>
                </li>
              </ul>
            </div>
            <div className='col-xl-4 border-start-md ps-md-2 mt-2 mt-md-0'>
              <ul className='list-unstyled mb-0'>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('invoice')}:</span>
                  <span className='text-secondary'>#{state.selectedUser?.order_number}</span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>Created:</span>
                  <span className='text-secondary'>
                    {formatDate(state.selectedUser?.created_at, 'MMM DD, YYYY')}
                  </span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>Status:</span>
                  <Badge
                    pill
                    color={
                      state.selectedUser?.order_status === 1
                        ? 'light-warning'
                        : state.selectedUser?.order_status === 3
                          ? 'light-success'
                          : state.selectedUser?.order_status === 2
                            ? 'light-primary'
                            : 'light-danger'
                    }
                    className='text-capitalize'
                  >
                    {state.selectedUser?.order_status === 1
                      ? 'Pending'
                      : state.selectedUser?.order_status === 3
                        ? 'Completed'
                        : state.selectedUser?.order_status === 2
                          ? 'Confirmed'
                          : 'Cancelled'}
                  </Badge>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('transaction')}:</span>
                  <span>
                    {state.selectedUser?.payment_mode === 1 ? (
                      <Badge color='light-warning'>Cash</Badge>
                    ) : state.selectedUser?.payment_mode === 2 ? (
                      <Badge color='light-danger'>{FM('online')}</Badge>
                    ) : state.selectedUser?.payment_mode === 4 ? (
                      <Badge color='light-secondary'>Split</Badge>
                    ) : state.selectedUser?.payment_mode === 3 ? (
                      <Badge color='light-secondary'>{FM('udhaar')}</Badge>
                    ) : (
                      ''
                    )}
                  </span>
                </li>
                <li className='mb-75 d-flex align-items-center'>
                  <i
                    className='fas fa-circle font-small-3 me-50'
                    style={{ color: '#84B0CA', fontSize: '10px' }}
                  ></i>
                  <span className='fw-bold text-dark me-50'>{FM('order-duration')}:</span>
                  <span className='text-secondary'>{state.selectedUser?.order_duration} mins</span>
                </li>
                {state?.selectedUser?.cancel_reason && (
                  <li className='mb-0 d-flex align-items-top'>
                    <i
                      className='fas fa-circle font-small-3 me-50 text-danger mt-25'
                      style={{ fontSize: '10px' }}
                    ></i>
                    <div>
                      <span className='fw-bold text-danger me-50'>{FM('cancel-reason')}:</span>
                      <span className='text-danger small'>{state.selectedUser?.cancel_reason}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className='table-responsive border rounded-3 my-2'>
            <table className='table table-hover table-striped mb-0'>
              <thead className='table-light text-dark fw-bold'>
                <tr>
                  <th className='py-1 ps-2'>#</th>
                  <th className='py-1'>{FM('menu-name')}</th>
                  <th className='py-1 text-center'>{FM('qty')}</th>
                  <th className='py-1 text-end'>{FM('price')} (₹)</th>
                  <th className='py-1 text-center'>{FM('discount')} %</th>
                  <th className='py-1 text-end'>{FM('discount-price')} (₹)</th>
                  <th className='py-1'>{FM('instruction')}</th>
                  <th className='py-1 text-end pe-2'>{FM('total')} (₹)</th>
                </tr>
              </thead>
              <tbody>
                {state?.selectedUser?.order_details?.map((item: any, index: any) => {
                  const menu = JsonParseValidate(item?.menu_detail)
                  return (
                    <tr key={index}>
                      <td className='ps-2 align-middle'>{index + 1}</td>
                      <td className='align-middle fw-bold text-dark'>{menu?.name}</td>
                      <td className='text-center align-middle'>{item?.quantity}</td>
                      <td className='text-end align-middle'>{item?.price}</td>
                      <td className='text-center align-middle'>
                        {item?.discount_per > 0 ? (
                          <span className='text-success'>{item?.discount_per}%</span>
                        ) : (
                          <span className='text-muted'>-</span>
                        )}
                      </td>
                      <td className='text-end align-middle'>
                        {item?.discount_amount > 0 ? (
                          <span className='text-success'>{item?.discount_amount}</span>
                        ) : (
                          <span className='text-muted'>-</span>
                        )}
                      </td>
                      <td className='align-middle text-muted small'>{item?.instructions || '-'}</td>
                      <td className='text-end align-middle fw-bolder text-dark pe-2'>
                        {(item?.total - item?.discount_amount).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className='row justify-content-end pr-1 mx-0'>
            <div className='col-md-5 bg-light p-1 rounded-3'>
              <div className='d-flex justify-content-between mb-50'>
                <span className='text-muted fw-bold'>SubTotal(₹) :</span>
                <span className='fw-bold text-dark'>{state.selectedUser?.total_amount}</span>
              </div>
              <div className='d-flex justify-content-between mb-50'>
                <span className='text-muted fw-bold'>{FM('tax')} (₹) : </span>
                <span className='fw-bold text-dark'>
                  {Number(state.selectedUser?.tax_amount).toFixed(2)}
                </span>
              </div>
              <div className='d-flex justify-content-between border-top mt-1 pt-1'>
                <h5 className='fw-bolder text-primary mb-0 uppercase'>{FM('total-amount')}(₹) : </h5>
                <h5 className='fw-bolder text-primary mb-0'>
                  {Number(state.selectedUser?.payable_amount).toFixed(2)}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </CenteredModal>
    )
  }

  const statusObj1 = {
    cash: 'light-primary',
    online: 'light-success',
    recurring: 'light-dark',
    split: 'light-secondary'
  }

  // table columns
  const columns: TableColumn<orderResponseTypes>[] = [
    {
      name: 'table no.',
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
            {row?.table_number}
          </span>
        </Fragment>
      )
    },
    {
      name: 'Invoice No.',
      sortable: false,

      cell: (row) => <Fragment>{row?.order_number}</Fragment>
    },

    {
      name: 'Payable Amount(₹)',
      sortable: false,
      minWidth: '200px',
      cell: (row) => (
        <Fragment>
          {Number(row?.payable_amount)}
          {
            <CurrencyRupee
              sx={{
                maxHeight: '15px'
              }}
            />
          }
        </Fragment>
      )
    },
    {
      name: 'transaction',
      sortable: false,
      minWidth: '160px',
      cell: (row) => (
        <Fragment>
          {
            <Badge
              pill
              className='text-capitalize'
              color={
                statusObj1[
                row?.payment_mode === 1
                  ? 'cash'
                  : row?.payment_mode === 2
                    ? 'online'
                    : row?.payment_mode === 4
                      ? 'split'
                      : row?.payment_mode === 3
                        ? 'udhar'
                        : ''
                ]
              }
            >
              {row?.payment_mode === 1
                ? 'cash'
                : row?.payment_mode === 2
                  ? 'upi'
                  : row?.payment_mode === 4
                    ? 'split'
                    : row?.payment_mode === 3
                      ? 'udhar'
                      : ''}
            </Badge>
          }
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
          ) : row?.order_status === 3 ? (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-success'>
                {'Completed'}
              </Badge>
            </Fragment>
          ) : row?.order_status === 2 ? (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-primary'>
                {'Confirmed'}
              </Badge>
            </Fragment>
          ) : (
            <Fragment>
              <Badge pill className='text-capitalize' color='light-danger'>
                {' Cancelled'}
              </Badge>
            </Fragment>
          )}
        </Fragment>
      )
    },
    {
      name: 'Created Date',
      sortable: false,
      id: 'Created Date',
      minWidth: '160px',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.created_at, 'MM/DD/YYYY hh:mm:ss')}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      minWidth: '325px',
      center: true,
      cell: (row) => (
        <Fragment>
          {/* <DropDownMenu
                        options={[
                            {
                                IF: row?.order_status === 1,
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                to: getPath('update.order', { id: row?.id })
                                // onClick: () => {
                                //   toggleModalAdd()
                                //   setState({ editData: row })
                                // }
                            },
                            {
                                icon: <Printer size={'14'} />,
                                name: 'Print',
                                onClick: () => {
                                    setPrintData(row)
                                }
                            },
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
                                IF: row?.order_status === 1 || row?.order_status === 2,
                                icon: <XCircle size={'14'} />,
                                name: 'Cancel Order',
                                onClick: () => {
                                    toggleModalAdd()

                                    setState({ editData: row })
                                }
                            },
                            {
                                IF: row?.order_status === 1,
                                icon: <CheckCircle size={'14'} />,
                                name: 'Confirmed Order',
                                onClick: () => {
                                    handleSaveConfirmedUser(row)

                                    //   setState({ editData: row })
                                }
                            },
                            {
                                IF: row?.order_status === 2 || row?.order_status === 1,
                                icon: <CheckCircle size={'14'} />,
                                name: 'Completed Order',
                                onClick: () => {
                                    handleSaveCompletedUser(row)

                                    //   setState({ editData: row })
                                }
                            }
                          

                        ]}
                    /> */}
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
    // {
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadResp?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadResp?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<Menu size='25' />} title={FM('order-history')}>
        <ButtonGroup color='dark'>
          <OrderHistoryFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadResp.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<orderResponseTypes>
        initialPerPage={state.per_page_record}
        isLoading={loadResp.isLoading}
        columns={columns}
        options={options}
        hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default OrderHistory
