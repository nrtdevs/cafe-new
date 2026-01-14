import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import { FM, formatDateValue, isValid, setValues } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import { useLoadEmployeeStockTableMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import { getUserData } from '@src/auth/utils'
import Hide from '@src/utility/Hide'
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
  price: ''
}
const WareHouseStockReport = () => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add user
  const canAddUser = Can(Permissions.stockCreate)
  // can edit user
  const canEditUser = Can(Permissions.stockEdit)
  // can delete user
  const canDeleteUser = Can(Permissions.stockDelete)

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
        product_id: form.watch('product_id')?.value,
        cafe_id: form.watch('cafe_id')?.value,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

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

  // order time wise report
  useEffect(() => {
    loadTimeTableOrder()
  }, [])

  const payload = Array.isArray(loadStockManageResponse?.data?.payload)
    ? loadStockManageResponse?.data?.payload
    : []

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<any>({
        id: state.selectedUser?.id
      })
      toggleModalView()
    }
  }, [state.selectedUser])

  const handleFilter = (userData: any) => {
    loadStockManage({
      jsonData: {
        from_date_time: userData?.start_datetime
          ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        end_date_time: userData?.end_datetime
          ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
          : '',
        item_id: userData?.item_id?.value,
        category_id: userData?.category_id?.value,
        subcategory_id: userData?.subcategory_id?.value
      }
    })
  }

  return (
    <Fragment>
      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('warehouse-stock-report')}</h3>
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
          <Form onSubmit={form.handleSubmit(handleFilter)}>
            <Row className=''>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label='Item'
                  name='item_id'
                  placeholder='Select Items'
                  isClearable
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseItem}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('category')}
                  name='category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  key={`${form.watch('category_id')}`}
                  control={form.control}
                  async
                  isClearable
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

              <Col xs='4' className='d-flex justify-content-start'>
                <Button
                  className='btn-icon me-1'
                  tooltip={'Place Order'}
                  color='primary'
                  type='submit'
                >
                  {FM('filter-Data')}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
        <CardBody>
          <Table responsive>
            <thead>
              <tr>
                <th>{FM('item')}</th>
                <th>{FM('category')}</th>
                <th>{FM('sub-category')}</th>
                <th>{FM('unit')}</th>
                <th>{FM('in-stock')}</th>
                <th>{FM('out-stock')}</th>
              </tr>
            </thead>
            {payload &&
              payload.map((item: any, index: any) => {
                return (
                  <>
                    <tbody>
                      <tr>
                        <th>{item?.product}</th>
                        <th>{item?.product}</th>
                        <th>{item?.product}</th>
                        <td>{item?.unit}</td>
                        <td>{item?.inStock}</td>
                        <td>{item?.outStock}</td>
                      </tr>
                    </tbody>
                  </>
                )
              })}
          </Table>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default WareHouseStockReport
