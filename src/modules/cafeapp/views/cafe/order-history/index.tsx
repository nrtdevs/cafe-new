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
        <div className=''></div>
        <div className='card'>
          <div className='card-body'>
            <div className='container'>
              {/* <div className='row d-flex align-items-baseline'>
                                <div className='col-xl-9'>
                                    <p style={{ color: '#7e8d9f', fontSize: '20px' }}>
                                        Order No :<strong>{state.selectedUser?.id}</strong>
                                    </p>
                                </div>

                                <hr />
                            </div> */}

              <div className='container'>
                <div className='row'>
                  <div className='col-xl-8'>
                    <ul className='list-unstyled'>
                      {state?.selectedUser?.customer_id ? (
                        <>
                          <li className='text-muted'>
                            {FM('customer-name')}:{' '}
                            <span style={{ color: '#5d9fc5 ' }}>
                              {state?.selectedUser?.customer?.name}
                            </span>
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 4 ||
                      state?.selectedUser?.payment_mode === 3 ? (
                        <>
                          <li className='text-muted'>
                            {FM('cash')} :{state?.selectedUser?.cash_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                          <li className='text-muted'>
                            {FM('online')} :{state?.selectedUser?.online_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 1 ? (
                        <>
                          <li className='text-muted'>
                            {FM('cash')} :{state?.selectedUser?.cash_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}

                      {state?.selectedUser?.payment_mode === 2 ? (
                        <>
                          <li className='text-muted'>
                            {FM('online')} :{state?.selectedUser?.online_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}
                      {state?.selectedUser?.payment_mode === 3 ? (
                        <>
                          <li className='text-muted text-black'>
                            {FM('udhaar')} :{state?.selectedUser?.udhaar_amount}
                            {
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            }
                          </li>
                        </>
                      ) : (
                        ''
                      )}
                      <li className='text-muted'>
                        <span className=''>{FM('discount-amount')} (₹) : </span>
                        <span className=''>{totalDiscount}</span>
                      </li>
                    </ul>
                  </div>
                  <div className='col-xl-4'>
                    <ul className='list-unstyled'>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('invoice')} :</span>
                        {state.selectedUser?.order_number}
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>Creation Date : </span>
                        {formatDate(state.selectedUser?.created_at, 'MM/DD/YYYY')}
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='me-1 fw-bold'>Status:</span>
                        <span className='badge bg-warning text-black fw-bold'>
                          {state.selectedUser?.order_status === 1
                            ? 'Pending'
                            : state.selectedUser?.order_status === 3
                            ? 'Completed'
                            : state.selectedUser?.order_status === 2
                            ? 'Confirmed'
                            : ' Cancelled'}
                        </span>
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='me-1 fw-bold'>{FM('transaction')} :</span>
                        <span className='text-black fw-bold'>
                          {state.selectedUser?.payment_mode === 1 ? (
                            <Badge color='light-warning'>{'Cash'}</Badge>
                          ) : state.selectedUser?.payment_mode === 2 ? (
                            <Badge color='light-danger'>{FM('online')}</Badge>
                          ) : state.selectedUser?.payment_mode === 4 ? (
                            <Badge color='light-secondary'>{'Split'}</Badge>
                          ) : state.selectedUser?.payment_mode === 3 ? (
                            <Badge color='light-secondary'>{FM('udhaar')}</Badge>
                          ) : (
                            ''
                          )}
                        </span>
                      </li>
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('order-duration')} : </span>
                        {state.selectedUser?.order_duration} Minute
                      </li>
                      {state?.selectedUser?.cancel_reason ? (
                        <li className=''>
                          <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                          <span className='fw-bold'>{FM('cancel-reason')} : </span>
                          <span className='text-danger'>{state.selectedUser?.cancel_reason}</span>
                        </li>
                      ) : (
                        ''
                      )}
                      {/* {state?.selectedUser?.customer_id ? (
                                                <li className=''>
                                                    <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                                                    <span className='fw-bold'>Customer Name : </span>
                                                    <span className='text-danger'>{state.selectedUser?.customer?.name}</span>

                                                </li>
                                            ) : (
                                                ''
                                            )} */}
                      <li className=''>
                        <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
                        <span className='fw-bold'>{FM('discount')} : </span>
                        {state.selectedUser?.discount} %
                      </li>
                    </ul>
                  </div>
                </div>

                <div className='row my-2 mx-1 justify-content-center'>
                  <table className='table table-striped table-borderless'>
                    <thead style={{ backgroundColor: '#84B0CA' }} className='text-black'>
                      <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>{FM('menu-name')}</th>
                        <th scope='col'>{FM('qty')}</th>
                        <th scope='col'>
                          {FM('price')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                        <th scope='col'>
                          {FM('discount-price')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                        <th scope='col'>{FM('instruction')}</th>
                        <th scope='col'>
                          {FM('total')}
                          {
                            <CurrencyRupee
                              sx={{
                                maxHeight: '15px'
                              }}
                            />
                          }
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {state?.selectedUser?.order_details?.map((item: any, index: any) => {
                        const menu = JsonParseValidate(item?.menu_detail)
                        return (
                          <>
                            <tr>
                              <th scope='row'>{index + 1}</th>
                              <td>{menu?.name}</td>
                              <td>{item?.quantity}</td>
                              <td>{item?.price}</td>
                              <td>{item?.discount_amount}</td>
                              <td>{item?.instructions}</td>
                              <td>{item?.total - item?.discount_amount}</td>
                            </tr>
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <hr />
                <div className='row'>
                  <div className='col-xl-6'></div>
                  <div className='col-xl-5'>
                    <ul className='list-unstyled'>
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black me-1'>SubTotal(₹) :</span>
                        <span className='text-black'>{state.selectedUser?.total_amount}</span>
                      </li>
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black me-1'>{FM('tax')} (₹) : </span>
                        <span className='text-black'>{Number(state.selectedUser?.tax_amount)}</span>
                      </li>

                      <hr />
                      <li className='text-muted ms-3 d-flex justify-content-end'>
                        <span className='text-black text-dark text-bolder'>
                          {FM('total-amount')}(₹) :{' '}
                        </span>
                        <span className='text-black text-bolder'>
                          {Number(state.selectedUser?.payable_amount)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
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
