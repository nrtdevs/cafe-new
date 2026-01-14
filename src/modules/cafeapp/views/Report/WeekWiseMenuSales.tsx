import { CurrencyRupee } from '@mui/icons-material'
import { getUserData } from '@src/auth/utils'
import {
  CafeSaleSummary,
  orderResponseTypes
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useGetRecipeListMutation,
  useLoadOrdersLogMutation,
  useWeeklyMenuReportMutation,
  useWhatsAppLogMutation
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
import WeeklyMenusWiseFilter from './WeeklyMenusWiseFilter'
// import OrderFilter from '../Order/OrderFilter'
// import WhatsAppFilter from './WhatsAppFilter'
// import OrderHistoryFilter from './OrderHistoryFilter'

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: CafeSaleSummary
  enableEdit?: boolean
  comfirmedOrder?: boolean
  editData?: any
  cancelData?: any
  editConfirmedData?: any
}

const WeekWiseMenuSales = (props: any) => {
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

  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  //load order List mutation
  const [loadWhatsApp, loadResp] = useWeeklyMenuReportMutation()

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
  const loadWhatsAppList = () => {
    loadWhatsApp({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        // order_id: location?.state?.id,
        // name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
        // start_date: state.filterData
        //   ? formatDate(state.filterData?.start_date, 'YYYY-MM-DD')
        //   : formatDate(new Date(), 'YYYY-MM-DD'),
        // end_date: state.filterData
        //   ? formatDate(state.filterData?.end_date, 'YYYY-MM-DD')
        //   : formatDate(new Date(), 'YYYY-MM-DD')
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadWhatsAppList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e, page: e.page, per_page_record: e.per_page_record })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        week_start: e.week_start ? formatDateValue(e?.week_start, 'YYYY-MM-DD hh:mm:ss') : '',
        week_end: e?.week_end ? formatDateValue(e?.week_end, 'YYYY-MM-DD hh:mm:ss') : '',
        menu_id: e?.menu_id?.value ? e?.menu_id?.value : ''
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

  // view User modal
  //   const renderViewModal = () => {
  //     return (
  //       <CenteredModal
  //         open={modalView}
  //         title={`Invoice:${state.selectedUser?.order?.order_number}`}
  //         done='edit'
  //         hideClose
  //         disableFooter
  //         modalClass={'modal-lg'}
  //         hideSave={true}
  //         handleSave={() => {
  //           setState({
  //             enableEdit: true
  //           })
  //           closeViewModal(false)
  //         }}
  //         handleModal={() => closeViewModal(true)}
  //       >
  //         <div className=''></div>
  //         <div className='card'>
  //           <div className='card-body'>
  //             <div className='container'>
  //               {/* <div className='row d-flex align-items-baseline'>
  //                                 <div className='col-xl-9'>
  //                                     <p style={{ color: '#7e8d9f', fontSize: '20px' }}>
  //                                         Order No :<strong>{state.selectedUser?.id}</strong>
  //                                     </p>
  //                                 </div>

  //                                 <hr />
  //                             </div> */}

  //               <div className='container'>
  //                 <div className='row'>
  //                   <div className='col-xl-8'>
  //                     <ul className='list-unstyled'>
  //                       {state?.selectedUser?.customer_id ? (
  //                         <>
  //                           <li className='fw-bold'>
  //                             {FM('customer-name')}:{' '}
  //                             <span style={{ color: '#5d9fc5 ' }}>
  //                               {state?.selectedUser?.customer?.name}
  //                             </span>
  //                           </li>
  //                         </>
  //                       ) : (
  //                         ''
  //                       )}

  //                       {state?.selectedUser?.order?.payment_mode === 4 ||
  //                       state?.selectedUser?.order?.payment_mode === 3 ? (
  //                         <>
  //                           <li className='fw-bold'>
  //                             {FM('cash')} :{state?.selectedUser?.order?.cash_amount}
  //                             {
  //                               <CurrencyRupee
  //                                 sx={{
  //                                   maxHeight: '15px'
  //                                 }}
  //                               />
  //                             }
  //                           </li>
  //                           <li className='fw-bold'>
  //                             {FM('online')} :{state?.selectedUser?.order?.online_amount}
  //                             {
  //                               <CurrencyRupee
  //                                 sx={{
  //                                   maxHeight: '15px'
  //                                 }}
  //                               />
  //                             }
  //                           </li>
  //                         </>
  //                       ) : (
  //                         ''
  //                       )}

  //                       {state?.selectedUser?.order?.payment_mode === 1 ? (
  //                         <>
  //                           <li className='fw-bold'>
  //                             {FM('cash')} :{state?.selectedUser?.order?.cash_amount}
  //                             {
  //                               <CurrencyRupee
  //                                 sx={{
  //                                   maxHeight: '15px'
  //                                 }}
  //                               />
  //                             }
  //                           </li>
  //                         </>
  //                       ) : (
  //                         ''
  //                       )}

  //                       {state?.selectedUser?.order?.payment_mode === 2 ? (
  //                         <>
  //                           <li className='fw-bold'>
  //                             {FM('online')} :{state?.selectedUser?.order?.online_amount}
  //                             {
  //                               <CurrencyRupee
  //                                 sx={{
  //                                   maxHeight: '15px'
  //                                 }}
  //                               />
  //                             }
  //                           </li>
  //                         </>
  //                       ) : (
  //                         ''
  //                       )}
  //                       {state?.selectedUser?.order?.payment_mode === 3 ? (
  //                         <>
  //                           <li className='text-muted text-black'>
  //                             {FM('udhaar')} :{state?.selectedUser?.order?.udhaar_amount}
  //                             {
  //                               <CurrencyRupee
  //                                 sx={{
  //                                   maxHeight: '15px'
  //                                 }}
  //                               />
  //                             }
  //                           </li>
  //                         </>
  //                       ) : (
  //                         ''
  //                       )}
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('discount-amount')} (₹) : </span>
  //                         <span className=''>{totalDiscount}</span>
  //                       </li>
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('sender')} : </span>
  //                         <span className=''>{state?.selectedUser?.sender}</span>
  //                       </li>
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('receiver')} : </span>
  //                         <span className=''>{state?.selectedUser?.receiver}</span>
  //                       </li>
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('status')} : </span>
  //                         <span className=''>{state?.selectedUser?.status}</span>
  //                       </li>
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('wa_status')} : </span>
  //                         <span className=''>{state?.selectedUser?.wa_status}</span>
  //                       </li>
  //                       <li className=''>
  //                         <span className='fw-bold'>{FM('wa_id')} : </span>
  //                         <span className=''>{state?.selectedUser?.wa_id}</span>
  //                       </li>
  //                     </ul>
  //                   </div>
  //                   <div className='col-xl-4'>
  //                     <ul className='list-unstyled'>
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='fw-bold'>{FM('invoice')} :</span>
  //                         {state.selectedUser?.order?.order_number}
  //                       </li>
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='fw-bold'>Creation Date : </span>
  //                         {formatDate(state.selectedUser?.created_at, 'MM/DD/YYYY')}
  //                       </li>
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='me-1 fw-bold'>Status:</span>
  //                         <span className='badge bg-warning text-black fw-bold'>
  //                           {state.selectedUser?.order?.order_status === 1
  //                             ? 'Pending'
  //                             : state.selectedUser?.order?.order_status === 3
  //                             ? 'Completed'
  //                             : state.selectedUser?.order?.order_status === 2
  //                             ? 'Confirmed'
  //                             : ' Cancelled'}
  //                         </span>
  //                       </li>
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='me-1 fw-bold'>{FM('transaction')} :</span>
  //                         <span className='text-black fw-bold'>
  //                           {state.selectedUser?.order?.payment_mode === 1 ? (
  //                             <Badge color='light-warning'>{'Cash'}</Badge>
  //                           ) : state.selectedUser?.order?.payment_mode === 2 ? (
  //                             <Badge color='light-danger'>{FM('online')}</Badge>
  //                           ) : state.selectedUser?.order?.payment_mode === 4 ? (
  //                             <Badge color='light-secondary'>{'Split'}</Badge>
  //                           ) : state.selectedUser?.order?.payment_mode === 3 ? (
  //                             <Badge color='light-secondary'>{FM('udhaar')}</Badge>
  //                           ) : (
  //                             ''
  //                           )}
  //                         </span>
  //                       </li>
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='fw-bold'>{FM('order-duration')} : </span>
  //                         {state.selectedUser?.order_duration} Minute
  //                       </li>
  //                       {state?.selectedUser?.cancel_reason ? (
  //                         <li className=''>
  //                           <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                           <span className='fw-bold'>{FM('cancel-reason')} : </span>
  //                           <span className='text-danger'>{state.selectedUser?.cancel_reason}</span>
  //                         </li>
  //                       ) : (
  //                         ''
  //                       )}
  //                       {/* {state?.selectedUser?.customer_id ? (
  //                                                 <li className=''>
  //                                                     <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                                                     <span className='fw-bold'>Customer Name : </span>
  //                                                     <span className='text-danger'>{state.selectedUser?.customer?.name}</span>

  //                                                 </li>
  //                                             ) : (
  //                                                 ''
  //                                             )} */}
  //                       <li className=''>
  //                         <i className='fas fa-circle' style={{ color: '#84B0CA' }}></i>{' '}
  //                         <span className='fw-bold'>{FM('template')} : </span>
  //                         {state.selectedUser?.template}{' '}
  //                       </li>
  //                     </ul>
  //                   </div>
  //                 </div>

  //                 <div className='row my-2 mx-1 justify-content-center'>
  //                   <table className='table table-striped table-borderless'>
  //                     <thead style={{ backgroundColor: '#84B0CA' }} className='text-black'>
  //                       <tr>
  //                         <th scope='col'>#</th>
  //                         <th scope='col'>{FM('menu-name')}</th>
  //                         <th scope='col'>{FM('qty')}</th>
  //                         <th scope='col'>
  //                           {FM('price')}
  //                           {
  //                             <CurrencyRupee
  //                               sx={{
  //                                 maxHeight: '15px'
  //                               }}
  //                             />
  //                           }
  //                         </th>
  //                         <th scope='col'>
  //                           {FM('discount-price')}
  //                           {
  //                             <CurrencyRupee
  //                               sx={{
  //                                 maxHeight: '15px'
  //                               }}
  //                             />
  //                           }
  //                         </th>
  //                         <th scope='col'>{FM('instruction')}</th>
  //                         <th scope='col'>
  //                           {FM('total')}
  //                           {
  //                             <CurrencyRupee
  //                               sx={{
  //                                 maxHeight: '15px'
  //                               }}
  //                             />
  //                           }
  //                         </th>
  //                       </tr>
  //                     </thead>
  //                     <tbody>
  //                       {state?.selectedUser?.order_details?.map((item: any, index: any) => {
  //                         const menu = JsonParseValidate(item?.menu_detail)
  //                         return (
  //                           <>
  //                             <tr>
  //                               <th scope='row'>{index + 1}</th>
  //                               <td>{menu?.name}</td>
  //                               <td>{item?.quantity}</td>
  //                               <td>{item?.price}</td>
  //                               <td>{item?.discount_amount}</td>
  //                               <td>{item?.instructions}</td>
  //                               <td>{item?.total - item?.discount_amount}</td>
  //                             </tr>
  //                           </>
  //                         )
  //                       })}
  //                     </tbody>
  //                   </table>
  //                 </div>
  //                 <hr />
  //                 <div className='row'>
  //                   <div className='col-xl-6'></div>
  //                   <div className='col-xl-5'>
  //                     <ul className='list-unstyled'>
  //                       <li className='text-muted ms-3 d-flex justify-content-end'>
  //                         <span className='text-black me-1'>SubTotal(₹) :</span>
  //                         <span className='text-black'>
  //                           {state.selectedUser?.order?.total_amount}
  //                         </span>
  //                       </li>
  //                       <li className='text-muted ms-3 d-flex justify-content-end'>
  //                         <span className='text-black me-1'>{FM('tax')} (₹) : </span>
  //                         <span className='text-black'>
  //                           {Number(state.selectedUser?.order?.tax_amount)}
  //                         </span>
  //                       </li>

  //                       <hr />
  //                       <li className='text-muted ms-3 d-flex justify-content-end'>
  //                         <span className='text-black text-dark text-bolder'>
  //                           {FM('total-amount')}(₹) :{' '}
  //                         </span>
  //                         <span className='text-black text-bolder'>
  //                           {Number(state.selectedUser?.order?.payable_amount)}
  //                         </span>
  //                       </li>
  //                     </ul>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </CenteredModal>
  //     )
  //   }

  // table columns
  const columns: TableColumn<CafeSaleSummary>[] = [
    {
      name: 'menu',
      sortable: false,
      //   minWidth: '200px',
      //   center: true,
      cell: (row) => <Fragment>{row?.menu?.name}</Fragment>
    },
    {
      name: 'cafe',
      sortable: false,
      //   minWidth: '200px',
      //   center: true,
      cell: (row) => <Fragment>{row?.cafe?.name}</Fragment>
    },

    {
      name: 'total sale Quantity',
      sortable: false,
      //   minWidth: '200px',
      center: true,
      cell: (row) => <Fragment>{row?.total_sale_quantity}</Fragment>
    },

    {
      name: 'total sale(₹)',
      sortable: false,
      //   minWidth: '200px',
      cell: (row) => (
        <Fragment>
          {row?.total_sale_amount}
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
      name: 'week start',
      sortable: false,

      cell: (row) => <Fragment>{formatDate(row?.week_start)}</Fragment>
    },
    {
      name: 'week end',
      sortable: false,

      cell: (row) => <Fragment>{formatDate(row?.week_end)}</Fragment>
    }
  ]

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
      {/* {renderViewModal()} */}

      <Header route={props?.route} icon={<Menu size='25' />} title={FM('week-wise-menus-sales')}>
        <ButtonGroup color='dark'>
          <WeeklyMenusWiseFilter handleFilterData={handleFilterData} />
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

      <CustomDataTable<CafeSaleSummary>
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

export default WeekWiseMenuSales
