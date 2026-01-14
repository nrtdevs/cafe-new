import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'

import Show, { Can } from '@src/utility/Show'
import { FM, formatDateValue, isValid, log, setValues } from '@src/utility/Utils'

import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer } from 'react'
import { RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import { useLoadEmployeeStockTableMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import { getUserData } from '@src/auth/utils'

import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
// import StockLogFilter from './StockLogFilter'

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

const defaultValues: any = {
  product_id: '',
  unit_id: '',
  quantity: '',
  stock_operation: '',
  resource: '',
  unit: '',
  price: '',
  employee_id: ''
}
const EmployeeStockReport = (props: any) => {
  const user = getUserData()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // load users
  const [loadStockManage, loadStockManageResponse] = useLoadEmployeeStockTableMutation()

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

  // form hook
  const form = useForm<any>({
    // resolver: yupResolver(schema),
    // defaultValues
  })

  //stock time wise
  const loadTimeTableOrder = () => {
    loadStockManage({
      jsonData: {
        from_date_time: form.watch('start_datetime')
          ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        end_date_time:
          form.watch('end_datetime') && form.watch('start_datetime') < form.watch('end_datetime')
            ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
            : '',
        product_id: form.watch('product_id')?.value

        // cafe_id: form.watch('cafe_id')?.value,
        // sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  // order time wise report
  //   useEffect(() => {
  //     loadTimeTableOrder()
  //   }, [])

  const payload = Array.isArray(loadStockManageResponse?.data?.payload)
    ? loadStockManageResponse?.data?.payload
    : []

  // reload page
  const reloadData = () => {
    form.reset(),
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
      setValues<any>({
        id: state.selectedUser?.id
      })
      toggleModalView()
    }
  }, [state.selectedUser])

  const handleFilterReport = (data: any) => {
    loadStockManage({
      jsonData: {
        from_date_time: form.watch('start_datetime')
          ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        end_date_time:
          form.watch('end_datetime') && form.watch('start_datetime') < form.watch('end_datetime')
            ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
            : '',
        product_id: form.watch('product_id')?.value,
        employee_id: form.watch('employee_id')?.value,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value,
        category_id: data?.category_id?.value,
        subcategory_id: data?.subcategory_id?.value
      }
    })
  }

  return (
    <Fragment>
      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('stock-report')}</h3>
        </Col>
        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadStockManageResponse.isLoading}
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
          <Form onSubmit={form.handleSubmit(handleFilterReport)}>
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
                      onChangeValue={(e) => {
                        form.resetField('employee_id')
                      }}
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
                    onChangeValue={(e) => {
                      form.resetField('employee_id')
                    }}
                    type='select'
                    className='mb-1'
                    jsonData={{
                      is_parent: form.watch('cafe_id')?.value
                    }}
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              <Show IF={user?.role_id === 2 || user?.role_id === 4 || user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={`${form.watch('cafe_id')}-${form.watch('sub_cafe_id')}`}
                    control={form.control}
                    async
                    noGroup
                    noLabel
                    isClearable
                    label={'Employee'}
                    name='employee_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.employeList}
                    selectLabel={(e) => ` ${e.name} `}
                    jsonData={{
                      cafe_id: form.watch('cafe_id')?.value,
                      sub_cafe_id: form.watch('sub_cafe_id')?.value
                    }}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Show>
              {/* <Show IF={user?.role_id === 1}>
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
              </Hide> */}
              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_id')}-${form.watch('sub_cafe_id')}`}
                  control={form.control}
                  async
                  noGroup
                  noLabel
                  isClearable
                  label={FM('category')}
                  name='category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  jsonData={{
                    cafe_id: form.watch('cafe_id')?.value,
                    sub_cafe_id: form.watch('sub_cafe_id')?.value
                  }}
                  type='select'
                  className='mb-1 '
                  rules={{ required: false }}
                  onChangeValue={(e) => {
                    let value = e
                    if (value === null || value === undefined) {
                      form.setValue('subcategory_id', null)
                    }
                  }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={`${form.watch('category_id')}`}
                  control={form.control}
                  async
                  noGroup
                  isClearable
                  isDisabled={form.watch('category_id')?.value ? false : true}
                  noLabel
                  label={FM('sub-category')}
                  name='subcategory_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    is_parent: form.watch('category_id')?.value
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' xl='4' sm='12'>
                <FormGroupCustom
                  key={`${form.watch('cafe_id')}-${form.watch('sub_cafe_id')}-${form.watch(
                    'category_id'
                  )}-${form.watch('subcategory_id')}`}
                  control={form.control}
                  noGroup
                  noLabel
                  isClearable
                  async
                  label='Product'
                  name='product_id'
                  loadOptions={loadDropdown}
                  jsonData={{
                    cafe_id: form.watch('cafe_id')?.value,
                    sub_cafe_id: form.watch('sub_cafe_id')?.value,
                    category_id: form.watch('category_id')?.value,
                    subcategory_id: form.watch('subcategory_id')?.value
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

              <>
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
                    // dateFormat={'YYYY-MM-DD hh:mm'}
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
                    name={'end_datetime'}
                    type={'datetime'}
                    label={FM('end-date-time')}
                    datePickerOptions={{
                      minDate: form.watch('start_datetime')
                    }}
                    // dateFormat='YYYY-MM-DD hh:mm'

                    className='mb-0'
                    control={form.control}
                    rules={{ required: false }}
                  />
                </Col>
              </>
              <Col md='4' lg='4' xl='4' sm='12'>
                <div className=''>
                  <LoadingButton
                    loading={loadStockManageResponse.isLoading}
                    className='btn-icon me-1'
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
                <th>{FM('product')}</th>
                <th>{FM('unit')}</th>
                <th>{FM('in-stock')}</th>
                <th>{FM('out-stock')}</th>
              </tr>
            </thead>
            {loadStockManageResponse?.isLoading ? (
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
                  </tr>
                </tbody>
              </>
            ) : (
              <>
                {payload &&
                  payload?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody>
                          <tr>
                            <td className=' text-capitalize'>{item?.product}</td>
                            <td>{item?.unit}</td>
                            <td>{item?.inStock}</td>
                            <td>{item?.outStock}</td>
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
    </Fragment>
  )
}

export default EmployeeStockReport
