import { CurrencyRupee, HMobiledata, LocalParking, Spellcheck } from '@mui/icons-material'
import StatsHorizontal from '@src/@core/components/widgets/stats/StatsHorizontal'
import { getUserData } from '@src/auth/utils'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useActionUserMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { DatedayweakStatus } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { FM, createConstSelectOptions, formatDate, formatDateValue, log } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import {
  AlignJustify,
  Check,
  CheckCircle,
  Clock,
  Menu,
  RefreshCcw,
  User,
  XCircle
} from 'react-feather'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, Col, Form, NavItem, Row, Table } from 'reactstrap'
import * as yup from 'yup'
import { tableReportListResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import {
  useLoadDashboardOrderTimeTableMutation,
  useLoadDashboardTimeTableMutation,
  useLoadDashboardTodayMutation,
  useLoadDashboardWastedTableMutation,
  useLoadDashboardtableMutation
} from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import Hide from '@src/utility/Hide'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
}
// validate
// const schema = yup.object(userFormSchema).required()

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: tableReportListResponseTypes
  enableEdit?: boolean
  editData?: any
}

const TableListReport = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()
  // can add user

  // form hook
  const form = useForm<tableReportListResponseTypes>({
    // resolver: yupResolver(schema),
    // defaultValues
  })

  // load dashboardTable
  const [dashboardtable, dashboardtablerestResponse] = useLoadDashboardtableMutation()
  //load Dashboard orderTime report
  const [dashboardsTable, dashboardOrderTableRestResponse] =
    useLoadDashboardOrderTimeTableMutation()
  // load wastage
  const [dashboardTable, dashboardTableRestResponse] = useLoadDashboardWastedTableMutation()
  // load DashboardToday
  const [loadDashboardToday, dashboardTodayRes] = useLoadDashboardTodayMutation()

  //load time order report
  const [loadDashboardTimeTable, dashboardTimeTableResponse] = useLoadDashboardTimeTableMutation()

  const tData = dashboardTableRestResponse?.data?.payload
  const tdata = dashboardtablerestResponse?.data?.payload
  const timeViseData = dashboardOrderTableRestResponse?.data?.payload
  const timeTableOrder = dashboardTimeTableResponse?.data?.payload
  //   log(timeTableOrder, 'timeTable')
  // can add order
  const canAddUser = Can(Permissions.orderCreate)
  // delete mutation
  const [userAction, userActionResult] = useActionUserMutation()
  const navigate = useNavigate()

  //get login user detail
  const user1 = getUserData()

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

  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const currentDate = `${year}-${month}-${day}`

  //Total sum calculation
  const totalSaleAmount = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_amount, 0)
  const totalOrderConfirmed = tdata?.reduce(
    (acc: any, curr: any) => acc + +curr?.order_confirmed,
    0
  )
  const totalQuantity = tdata?.reduce(
    (acc: any, curr: any) => acc + +curr.total_sale_quantity,
    0,
    0
  )
  const totalSaleOffLine = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_offline, 0)
  const totalSaleOnline = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_online, 0)
  const totalSaleUdhari = tdata?.reduce((acc: any, curr: any) => acc + +curr?.sale_udhari, 0)
  const totalOrderCompleted = tdata?.reduce(
    (acc: any, curr: any) => acc + +curr?.order_completed,
    0
  )
  const totalOrderPending = tdata?.reduce((acc: any, curr: any) => acc + +curr?.order_pending, 0)
  const totalOrderCanceled = tdata?.reduce((acc: any, curr: any) => acc + +curr?.order_canceled, 0)
  const TotalWastage = tData?.reduce((acc: any, curr: any) => acc + +curr?.total_wastage_menu, 0)
  const TotalWastageProduct = tData?.reduce(
    (acc: any, curr: any) => acc + +curr.total_wastage_product,
    0,
    0
  )
  const totalTimeSaleAmount = timeViseData?.reduce(
    (acc: any, curr: any) => acc + +curr?.sale_amount,
    0
  )
  const totalTimeQuantity = timeViseData?.reduce(
    (acc: any, curr: any) => acc + +curr.total_sale_quantity,
    0,
    0
  )

  //today list
  const loadTodayList = () => {
    loadDashboardToday({
      // page: state.page,
      // per_page_record: state.per_page_record
    })
  }

  useEffect(() => {
    loadTodayList()
  }, [])

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''></NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [canAddUser])

  // load order list
  const loadUserList = () => {
    dashboardtable({
      jsonData: {
        // day: form.watch('request_for')?.value,
        start_date: currentDate,
        end_date: currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  // load wasted list
  const loadWastedList = () => {
    dashboardTable({
      jsonData: {
        start_date: form.watch('start_datess')
          ? form.watch('start_datess')
          : form.watch('request_fors_ss')?.value
            ? ''
            : currentDate,
        end_date: form.watch('end_datess')
          ? form.watch('end_datess')
          : form.watch('request_fors_ss')?.value
            ? ''
            : currentDate
        // menu_id: form.watch('menu_id_ss')?.value,
        // cafe_id: form.watch('cafe_id')?.value,
        // product_id: form.watch('product_id')?.value,
        // category_id: form.watch('category_id_ss')?.value
      }
    })
  }

  // handle  load list
  useEffect(() => {
    loadWastedList()
  }, [
    // form.watch('menu_id_ss'),
    state.lastRefresh
    // form.watch('request_fors_ss'),
    // form.watch('start_datess'),
    // form.watch('end_datess'),
    // form.watch('cafe_id'),
    // form.watch('category_id_ss'),
    // form.watch('product_id')
  ])

  // handle load list
  useEffect(
    () => {
      loadUserList()
    },
    [
      // state.lastRefresh,
      // form.watch('request_for'),
      // form.watch('start_date'),
      // form.watch('end_date'),
      // form.watch('cafe_id'),
      // form.watch('sub_cafe_id')
    ]
  )

  //order time wise
  const loadList = () => {
    dashboardsTable({
      jsonData: {
        start_date: currentDate,
        end_date: currentDate
      }
    })
  }

  useEffect(
    () => {
      loadList()
    },
    [
      // form.watch('menu_ids'),
      // state.lastRefresh,
      // form.watch('request_fors'),
      // form.watch('start_dates'),
      // form.watch('end_dates'),
      // form.watch('cafe_ids'),
      // form.watch('category_ids'),
      // form.watch('sub_cafe_ids')
    ]
  )

  //order time wise
  const loadTimeTableOrder = () => {
    loadDashboardTimeTable({
      jsonData: {
        start_datetime: form.watch('start_datetime')
          ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        end_datetime:
          form.watch('start_datetime') < form.watch('end_datetime')
            ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
            : '',
        menu_id: form.watch('menu_id')?.value,
        cafe_id: form.watch('cafe_ids1')?.value,
        category_id: form.watch('category_ids')?.value,
        sub_cafe_id: form.watch('sub_cafe_ids1')?.value
      }
    })
  }

  // order time wise report
  useEffect(() => {
    loadTimeTableOrder()
  }, [])

  // reload page
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    }),
      form.reset()
  }

  const handleFilter = (data: any) => {
    dashboardtable({
      jsonData: {
        day: data?.request_for?.value,
        start_date: form.watch('start_date')
          ? form.watch('start_date')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        end_date: form.watch('end_date')
          ? form.watch('end_date')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  const handleOrderProductReport = (data: any) => {
    dashboardsTable({
      jsonData: {
        day: data?.request_for?.value,
        start_date: form.watch('start_dates')
          ? form.watch('start_dates')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        end_date: form.watch('end_dates')
          ? form.watch('end_dates')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        menu_id: form.watch('menu_ids')?.value,
        cafe_id: form.watch('cafe_ids')?.value,
        category_id: form.watch('category_ids')?.value,
        sub_cafe_id: form.watch('sub_cafe_ids')?.value
      }
    })
  }

  const handleOrderTimeWiseReport = (data: any) => {
    loadDashboardTimeTable({
      jsonData: {
        start_date: form.watch('start_datetime')
          ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        end_date: form.watch('end_datetime')
          ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        menu_id: form.watch('menu_id')?.value,
        cafe_id: form.watch('cafe_ids1')?.value,
        category_id: form.watch('category_ids')?.value,
        sub_cafe_id: form.watch('sub_cafe_ids1')?.value
      }
    })
  }

  const handleOrderWastageReport = (data: any) => {
    dashboardTable({
      jsonData: {
        start_date: form.watch('start_dates')
          ? form.watch('start_dates')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        end_date: form.watch('end_dates')
          ? form.watch('end_dates')
          : form.watch('request_for')?.value
            ? ''
            : currentDate,
        menu_id: form.watch('menu_ids')?.value,
        cafe_id: form.watch('cafe_ids')?.value,
        category_id: form.watch('category_ids')?.value,
        sub_cafe_id: form.watch('sub_cafe_ids')?.value
      }
    })
  }

  return (
    <Fragment>
      <Row>
        <div>
          <h3>{FM('today-order-report')}</h3>
        </div>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Order Completed'
            icon={<Check size={26} />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_order_completed}
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='secondary'
            statTitle='Order Pending'
            icon={<Clock size={26} />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_order_pending}
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='primary'
            statTitle='Order Confirmed'
            icon={<CheckCircle size={26} />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_order_confirmed}
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='danger'
            statTitle='Order Cancelled'
            icon={<XCircle size={26} />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_order_canceled}
              </h3>
            }
          />
        </Col>
      </Row>
      <Row>
        <div>
          <h3>{FM('today-sale-report')}</h3>
        </div>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Sale Amount'
            icon={<CurrencyRupee />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {Number(dashboardTodayRes?.data?.payload?.todays_sale_amount).toFixed(2)}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '18px'
                    }}
                  />
                }
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='primary'
            statTitle='Sale Online'
            icon={<CurrencyRupee />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {Number(dashboardTodayRes?.data?.payload?.todays_sale_online).toFixed(2)}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '18px'
                    }}
                  />
                }
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='secondary'
            statTitle='Sale Offline'
            icon={<CurrencyRupee />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {Number(dashboardTodayRes?.data?.payload?.todays_sale_offline).toFixed(2)}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '18px'
                    }}
                  />
                }
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Sale Udhari'
            icon={<CurrencyRupee />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_sale_udhari}
                {
                  <CurrencyRupee
                    sx={{
                      maxHeight: '18px'
                    }}
                  />
                }
              </h3>
            }
          />
        </Col>
      </Row>
      <Row>
        <div>
          <h3>{FM('today-attendance')}</h3>
        </div>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Present'
            icon={<LocalParking />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_present_employees_count}
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='primary'
            statTitle='Half Day'
            icon={<HMobiledata />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_half_day_employees_count}
              </h3>
            }
          />
        </Col>

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='danger'
            statTitle='Absent'
            icon={<Spellcheck />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.todays_absent_employees_count}
              </h3>
            }
          />
        </Col>

        {user1?.role_id === 1 ? (
          <Col md='3' xs='6'>
            <StatsHorizontal
              color='success'
              statTitle='Employee'
              icon={<User />}
              renderStats={
                <h3 className='fw-bolder mb-75'>
                  {dashboardTodayRes?.data?.payload?.todays_present_employees_count +
                    dashboardTodayRes?.data?.payload?.todays_half_day_employees_count +
                    dashboardTodayRes?.data?.payload?.todays_absent_employees_count}
                </h3>
              }
            />
          </Col>
        ) : (
          <Col md='3' xs='6'>
            <StatsHorizontal
              color='success'
              statTitle='Employee'
              icon={<User />}
              renderStats={
                <h3 className='fw-bolder mb-75'>
                  {dashboardTodayRes?.data?.payload?.totalEmployee}
                </h3>
              }
            />
          </Col>
        )}

        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle=' Expense'
            icon={<CurrencyRupee />}
            renderStats={
              <h3 className='fw-bolder mb-75'>{dashboardTodayRes?.data?.payload?.total_expense}</h3>
            }
          />
        </Col>
      </Row>
      <Row>
        <div>
          <h3>{FM('today-wastage')}</h3>
        </div>
        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Total Wastage Menu'
            icon={<Menu />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.total_wastage_menu}
              </h3>
            }
          />
        </Col>
        <Col md='3' xs='6'>
          <StatsHorizontal
            color='success'
            statTitle='Total Wastage Product'
            icon={<AlignJustify />}
            renderStats={
              <h3 className='fw-bolder mb-75'>
                {dashboardTodayRes?.data?.payload?.total_wastage_product}
              </h3>
            }
          />
        </Col>
      </Row>

      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('order-report')}</h3>
        </Col>

        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={dashboardTableRestResponse.isLoading}
            size='sm'
            color='info'
            className='mb-2'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </Col>
      </Row>
      <Card>
        <div className='border-bottom p-1'>
          <Form onSubmit={form.handleSubmit(handleFilter)}>
            <Row className=''>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <Show IF={user?.role_id === 1}>
                    <FormGroupCustom
                      control={form.control}
                      async
                      noGroup
                      noLabel
                      isClearable
                      label={'cafe'}
                      name='cafe_id'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.cafeList}
                      selectLabel={(e) => ` ${e.name} `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Show>
                </Col>
              </Show>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_id')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_id')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  noGroup
                  isClearable
                  noLabel
                  isDisabled={!!form.watch('start_date') || form.watch('end_date')}
                  placeholder='Today|Week|Month'
                  name='request_for'
                  selectOptions={createConstSelectOptions(DatedayweakStatus, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    noLabel
                    name={'start_date'}
                    isDisabled={!!form.watch('request_for')}
                    type={'date'}
                    isClearable
                    label={FM('start-date')}
                    dateFormat={'YYYY-MM-DD'}
                    datePickerOptions={{
                      maxDate: form.watch('end_date')
                    }}
                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    noLabel
                    isClearable
                    isDisabled={!!form.watch('request_for')}
                    name={'end_date'}
                    type={'date'}
                    datePickerOptions={{
                      minDate: form.watch('start_date')
                    }}
                    label={FM('end-date')}
                    dateFormat={'YYYY-MM-DD'}
                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <div className=''>
                    <Button
                      className='btn-icon me-1'
                      tooltip={'Place Order'}
                      color='primary'
                      type='submit'
                    >
                      {FM('filter-Data')}
                    </Button>
                  </div>
                </Col>
              </>
            </Row>
          </Form>
        </div>
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('date')}</th>
                <th>{FM('sale-quantity')}</th>
                <th>{FM('sale-amount')}</th>
                <th>{FM('sale-offline')}</th>
                <th>{FM('sale-online')}</th>
                <th>{FM('sale-udhari')}</th>
                <th>{FM('order-completed')}</th>
                <th>{FM('order-confirmed')}</th>
                <th>{FM('order-pending')}</th>
                <th>{FM('order-cancelled')}</th>
              </tr>
            </thead>
            {dashboardtablerestResponse?.isLoading ? (
              <>
                <tbody>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {tdata &&
                  tdata?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody key={index}>
                          <tr>
                            <th scope='row' className='w-50'>
                              {formatDate(item?.date, 'DD-MM-YYYY')}
                            </th>
                            <td>{item?.total_sale_quantity}</td>
                            <td>{item?.sale_amount}</td>
                            <td>{item?.sale_offline}</td>
                            <td>{item?.sale_online}</td>
                            <td>{item?.sale_udhari}</td>
                            <td>{item?.order_completed}</td>
                            <td>{item?.order_confirmed}</td>
                            <td>{item?.order_pending}</td>
                            <td>{item?.order_canceled}</td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
              </>
            )}

            <thead
              style={{
                background: '#8d918e'
              }}
            >
              <tr>
                <th>{FM('total-sum')}</th>
                <th>{totalQuantity}</th>
                <th>{totalSaleAmount}</th>
                <th>{totalSaleOffLine}</th>
                <th>{totalSaleOnline}</th>
                <th>{totalSaleUdhari}</th>
                <th>{totalOrderCompleted}</th>
                <th>{totalOrderConfirmed}</th>
                <th>{totalOrderPending}</th>
                <th>{totalOrderCanceled}</th>
              </tr>
            </thead>
          </Table>
        </CardBody>
      </Card>
      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('order-product-report')}</h3>
        </Col>
        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={dashboardTableRestResponse.isLoading}
            size='sm'
            color='info'
            className='mb-2'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </Col>
      </Row>
      <Card>
        <div className='border-bottom p-1'>
          <Form onSubmit={form.handleSubmit(handleOrderProductReport)}>
            <Row className=''>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <Show IF={user?.role_id === 1}>
                    <FormGroupCustom
                      control={form.control}
                      async
                      noGroup
                      noLabel
                      isClearable
                      label={'cafe'}
                      name='cafe_ids'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.cafeList}
                      selectLabel={(e) => ` ${e.name} `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Show>
                </Col>
              </Show>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_ids')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_ids'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_ids')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_ids'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_ids')?.value}-${form.watch('sub_cafe_ids')?.value}`}
                  control={form.control}
                  noGroup
                  noLabel
                  isClearable
                  async
                  label='Category'
                  name='category_ids'
                  loadOptions={loadDropdown}
                  jsonData={{
                    cafe_id: form.watch('sub_cafe_ids')?.value
                      ? form.watch('sub_cafe_ids')?.value
                      : form.watch('cafe_ids')?.value
                        ? form.watch('cafe_ids')?.value
                        : user?.cafe_id
                  }}
                  path={ApiEndpoints.category_list}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_ids')?.value},${form.watch('category_ids')?.value}-${form.watch('sub_cafe_ids')?.value
                    }`}
                  control={form.control}
                  noGroup
                  noLabel
                  isClearable
                  async
                  label='Menu'
                  name='menu_ids'
                  loadOptions={loadDropdown}
                  jsonData={{
                    cafe_id: form.watch('sub_cafe_ids')?.value
                      ? form.watch('sub_cafe_ids')?.value
                      : form.watch('cafe_ids')?.value
                        ? form.watch('cafe_ids')?.value
                        : user?.cafe_id,
                    category_id: form.watch('category_ids')?.value
                  }}
                  path={ApiEndpoints.menu_list}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              {/* <Col md='4' lg='4' xl='4' sm='12'>
                            <FormGroupCustom
                                key={`${form.watch('cafe_id')?.value}`}
                                control={form.control}
                                noGroup
                                noLabel
                                isClearable
                                async
                                label='Product'
                                name='product_ids'
                                loadOptions={loadDropdown}
                                jsonData={{
                                    cafe_id: form.watch('cafe_id')?.value
                                }}
                                path={ApiEndpoints.products}
                                selectLabel={(e) => `${e.name}  `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col> */}

              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  noGroup
                  isClearable
                  noLabel
                  isDisabled={!!form.watch('start_date') || form.watch('end_date')}
                  placeholder='Today|Week|Month'
                  name='request_fors'
                  selectOptions={createConstSelectOptions(DatedayweakStatus, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    noLabel
                    name={'start_dates'}
                    isDisabled={!!form.watch('request_for')}
                    type={'date'}
                    isClearable
                    label={FM('start-date')}
                    dateFormat={'YYYY-MM-DD hh:mm:ss'}
                    className='mb-0'
                    datePickerOptions={{
                      maxDate: form.watch('end_dates')
                    }}
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>

                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    noLabel
                    isClearable
                    isDisabled={!!form.watch('request_for')}
                    name={'end_dates'}
                    type={'date'}
                    datePickerOptions={{
                      minDate: form.watch('start_dates')
                    }}
                    label={FM('end-date')}
                    dateFormat={'YYYY-MM-DD hh:mm:ss'}
                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
              </>
              <Col md='4' lg='4' xl='4' sm='12'>
                <div className=''>
                  <Button
                    className='btn-icon me-1'
                    tooltip={'Place Order'}
                    color='primary'
                    type='submit'
                  >
                    {FM('filter-Data')}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
          {/* </Col> */}
          {/* </Row> */}
        </div>
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('date')}</th>
                <th>{FM('sale-quantity')}</th>
                <th>{FM('sale-amount')}</th>
              </tr>
            </thead>
            {dashboardOrderTableRestResponse.isLoading ? (
              <>
                <tbody>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {timeViseData &&
                  timeViseData?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody>
                          <tr>
                            <th scope='row' className='w-50'>
                              {formatDate(item?.date, 'DD-MM-YYYY')}
                            </th>
                            <td>{item?.total_sale_quantity}</td>
                            <td>{(item?.sale_amount).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
              </>
            )}

            <thead
              style={{
                background: '#8d918e'
              }}
            >
              <tr>
                <th>{FM('total-sum')}</th>
                <th>{totalTimeQuantity}</th>
                <th>{Number(totalTimeSaleAmount).toFixed(2)}</th>
              </tr>
            </thead>
          </Table>
        </CardBody>
      </Card>

      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('order-time-wise-report')}</h3>
        </Col>
        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={dashboardTableRestResponse.isLoading}
            size='sm'
            color='info'
            className='mb-2'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </Col>
      </Row>
      <Card>
        <div className='border-bottom p-1'>
          <Form onSubmit={form.handleSubmit(handleOrderTimeWiseReport)}>
            <Row className=''>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <Show IF={user?.role_id === 1}>
                    <FormGroupCustom
                      control={form.control}
                      async
                      noGroup
                      noLabel
                      isClearable
                      label={'cafe'}
                      name='cafe_ids1'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.cafeList}
                      selectLabel={(e) => ` ${e.name} `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Show>
                </Col>
              </Show>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_ids1')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_ids1'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_ids1')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_ids1'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_ids1')?.value}-${form.watch('sub_cafe_ids1')?.value}`}
                  control={form.control}
                  noGroup
                  noLabel
                  isClearable
                  async
                  label='Menu'
                  name='menu_id'
                  loadOptions={loadDropdown}
                  jsonData={{
                    cafe_id: form.watch('sub_cafe_ids1')?.value
                      ? form.watch('sub_cafe_ids1')?.value
                      : form.watch('cafe_ids1')?.value
                        ? form.watch('cafe_ids1')?.value
                        : user?.cafe_id
                  }}
                  path={ApiEndpoints.menu_list}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='4'>
                <FormGroupCustom
                  noLabel
                  name={'start_datetime'}
                  type={'datetime'}
                  isClearable
                  label={FM('start-date-time')}
                  datePickerOptions={{
                    maxDate: form.watch('end_datetime')
                  }}
                  // dateFormat={'YYYY-MM-DD hh:mm:ss'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='4'>
                <FormGroupCustom
                  key={`${form.watch('start_datetime')}`}
                  noLabel
                  isClearable
                  isDisabled={!!form.watch('request_for')}
                  name={'end_datetime'}
                  type={'datetime'}
                  label={FM('end-date-time')}
                  datePickerOptions={{
                    minDate: form.watch('start_datetime')
                  }}
                  // dateFormat='YYYY-MM-DD hh:mm'
                  // dateFormat={'YYYY-MM-DD hh:mm:ss'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <div className=''>
                  <LoadingButton
                    loading={dashboardTimeTableResponse?.isLoading}
                    className='btn-icon me-1'
                    tooltip={'Place Order'}
                    color='primary'
                    type='submit'
                  >
                    {FM('filter-Data')}
                  </LoadingButton>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('date')}</th>
                <th>{FM('total-sale-quantity')}</th>
                <th>{FM('sale-amount')}</th>
              </tr>
            </thead>
            {dashboardTimeTableResponse?.isLoading ? (
              <>
                <tbody>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {timeTableOrder &&
                  timeTableOrder?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody>
                          <tr>
                            <th scope='row' className='w-50'>
                              {item?.date}
                            </th>
                            <td>{item?.total_sale_quantity}</td>
                            <td>
                              {item?.sale_amount === null ? 0 : (item?.sale_amount).toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
              </>
            )}
          </Table>
        </CardBody>
      </Card>

      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('wastage-report')}</h3>
        </Col>
        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={dashboardTableRestResponse.isLoading}
            size='sm'
            color='info'
            className='mb-2'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </Col>
      </Row>
      <Card>
        <div className='border-bottom p-1'>
          <Form onSubmit={form.handleSubmit(handleOrderWastageReport)}>
            <Row className=''>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <Show IF={user?.role_id === 1}>
                    <FormGroupCustom
                      control={form.control}
                      async
                      noGroup
                      noLabel
                      isClearable
                      label={'cafe'}
                      name='cafe_id2'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.cafeList}
                      selectLabel={(e) => ` ${e.name} `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Show>
                </Col>
              </Show>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_id2')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id2'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_id2')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label='Sub Cafe'
                    placeholder='Select sub cafe'
                    name='sub_cafe_id2'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.subCafeList}
                    selectLabel={(e) => `${e.name}`}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_id2')?.value}-${form.watch('sub_cafe_id2')?.value}`}
                  control={form.control}
                  noGroup
                  noLabel
                  isClearable
                  async
                  label='Product'
                  name='product_id'
                  loadOptions={loadDropdown}
                  jsonData={{
                    cafe_id: form.watch('cafe_id2')?.value,
                    sub_cafe_id: form.watch('sub_cafe_id2')?.value
                  }}
                  path={ApiEndpoints.products}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              {/* <Col md='4' lg='4' xl='4' sm='12'>
                            <FormGroupCustom
                                // key={`${form.watch('cafe_id')?.value}`}
                                control={form.control}
                                noGroup
                                noLabel
                                isClearable
                                async
                                label='Category'
                                name='category_id_ss'
                                loadOptions={loadDropdown}
                                jsonData={{
                                    // cafe_id: form.watch('cafe_id')?.value
                                }}
                                path={ApiEndpoints.categories}
                                selectLabel={(e) => `${e.name}  `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col>
                        <Col md='4' lg='4' xl='4' sm='12'>
                            <FormGroupCustom
                                key={`${form.watch('category_id_ss')?.value}`}
                                control={form.control}
                                noGroup
                                noLabel
                                isClearable
                                async
                                label='Menu'
                                name='menu_id_ss'
                                loadOptions={loadDropdown}
                                jsonData={{
                                    // cafe_id: form.watch('cafe_id')?.value,
                                    category_id: form.watch('category_id_ss')?.value
                                }}
                                path={ApiEndpoints.menus}
                                selectLabel={(e) => `${e.name}  `}
                                selectValue={(e) => e.id}
                                defaultOptions
                                type='select'
                                className='mb-1'
                                rules={{ required: false }}
                            />
                        </Col> */}
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  noLabel
                  name={'start_datess'}
                  isDisabled={!!form.watch('request_for')}
                  type={'date'}
                  isClearable
                  label={FM('start-date')}
                  dateFormat={'YYYY-MM-DD'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  noLabel
                  isClearable
                  isDisabled={!!form.watch('request_for')}
                  name={'end_datess'}
                  type={'date'}
                  label={FM('end-date')}
                  dateFormat={'YYYY-MM-DD'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  control={form.control}
                  noGroup
                  isClearable
                  noLabel
                  isDisabled={!!form.watch('start_datess') || form.watch('end_datess')}
                  placeholder='Today|Week|Month'
                  name='request_fors_ss'
                  selectOptions={createConstSelectOptions(DatedayweakStatus, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <div className=''>
                  <Button
                    className='btn-icon me-1'
                    tooltip={'Place Order'}
                    color='primary'
                    type='submit'
                  >
                    {FM('filter-Data')}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('date')}</th>
                <th>{FM('total-wastage-product')}</th>

                <th>{FM('total-wastage-menu')}</th>
              </tr>
            </thead>
            {dashboardTableRestResponse?.isLoading ? (
              <>
                <tbody>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                    <td>
                      {' '}
                      <Shimmer height={30}></Shimmer>
                    </td>
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {tData &&
                  tData?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody key={index}>
                          <tr>
                            <th scope='row'>{formatDate(item?.date, 'DD-MM-YYYY')}</th>
                            <td>
                              {item?.total_wastage_product} {item?.unit}
                            </td>

                            <td>{item?.total_wastage_menu}</td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
                <thead
                  style={{
                    background: '#8d918e'
                  }}
                >
                  <tr>
                    <th>Total Sum</th>

                    <th>{TotalWastageProduct}</th>

                    <th>{TotalWastage}</th>
                  </tr>
                </thead>
              </>
            )}
          </Table>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default TableListReport
