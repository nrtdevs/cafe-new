import { getUserData } from '@src/auth/utils'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import { DatedayweakStatus } from '@src/utility/Const'
import Hide from '@src/utility/Hide'
import Show from '@src/utility/Show'
import { FM, createConstSelectOptions, formatDate } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import { useLoadMenuWiseLiveReportMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import { CurrencyRupee } from '@mui/icons-material'

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
  selectedUser?: any
  enableEdit?: boolean
  editData?: any
}

const MenuLiveReport = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()
  // can add user

  // form hook
  const form = useForm<any>({
    // resolver: yupResolver(schema),
    // defaultValues
  })

  // load dashboardTable
  const [menuMonitoringReport, menuMonitoringReportResponse] = useLoadMenuWiseLiveReportMutation()

  const tdata = menuMonitoringReportResponse?.data?.payload

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

  // load order list
  const loadUserList = () => {
    menuMonitoringReport({
      jsonData: {
        // day: form.watch('request_for')?.value,
        start_date: currentDate,
        end_date: currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

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
    loadUserList()
  }

  const handleFilter = (data: any) => {
    menuMonitoringReport({
      jsonData: {
        day: data?.request_for?.value,
        start_date: form.watch('start_date') ? form.watch('start_date') : currentDate,
        end_date: form.watch('end_date') ? form.watch('end_date') : currentDate,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  return (
    <Fragment>
      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('menuwise-monitoring-report')}</h3>
        </Col>

        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={menuMonitoringReportResponse.isLoading}
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
                <Col md='3' lg='3' xl='3' sm='12'>
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
                <Col md='3' lg='3' xl='3' sm='12'>
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
                <Col md='3' lg='3' xl='3' sm='12'>
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

              <>
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    noLabel
                    name={'start_date'}
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
                <Col md='3' lg='3' xl='3' sm='12'>
                  <FormGroupCustom
                    noLabel
                    isClearable
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
                <Col md='3' lg='3' xl='3' sm='12'>
                  <div className=''>
                    <LoadingButton
                      loading={menuMonitoringReportResponse.isLoading}
                      className='btn-icon me-1'
                      color='primary'
                      type='submit'
                    >
                      {FM('filter-Data')}
                    </LoadingButton>
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
                <th>{FM('menu-name')}</th>
                <th>{FM('total-quantity-sold')}</th>
                <th>{FM('total_discount')}</th>
                <th>{FM('total_tax')}</th>
                <th>{FM('total_sales_amount')}</th>
              </tr>
            </thead>
            {menuMonitoringReportResponse?.isLoading ? (
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
                            <th>{formatDate(item?.sale_date, 'DD-MM-YYYY')}</th>
                            <td className='text-capitalize'>{item?.menu_name}</td>
                            <td>{item?.total_quantity_sold}</td>
                            <td>
                              {Number(item?.total_discount).toFixed(2)}
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            </td>
                            <td>
                              {Number(item?.total_tax).toFixed(2)}
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            </td>
                            <td>
                              {Number(item?.total_sales_amount).toFixed(2)}{' '}
                              <CurrencyRupee
                                sx={{
                                  maxHeight: '15px'
                                }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </>
                    )
                  })}
              </>
            )}

            {/* <thead
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
            </thead> */}
          </Table>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default MenuLiveReport
