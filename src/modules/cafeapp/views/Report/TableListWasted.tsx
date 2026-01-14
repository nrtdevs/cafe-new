import { getUserData } from '@src/auth/utils'
import { TableFormData } from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useActionUserMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { DatedayweakStatus } from '@src/utility/Const'
import Show from '@src/utility/Show'
import { FM, createConstSelectOptions, formatDate, isValid } from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, Col, Row, Table } from 'reactstrap'
import * as yup from 'yup'
import { tableReportListResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import { useLoadDashboardWastedTableMutation } from '../../redux/RTKFiles/common-cafe/DashboardRTK'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
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
  selectedUser?: tableReportListResponseTypes
  enableEdit?: boolean
  editData?: any
}

const TableListWasted = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()
  // can add user

  // form hook
  const form = useForm<tableReportListResponseTypes>({
    // resolver: yupResolver(schema),
    // defaultValues
  })

  // load users
  const [dashboardTable, dashboardTableRestResponse] = useLoadDashboardWastedTableMutation()
  const tData = dashboardTableRestResponse?.data?.payload

  // delete mutation
  const [userAction, userActionResult] = useActionUserMutation()

  const navigate = useNavigate()

  //load login user detail
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
  const TotalWastage = tData?.reduce((acc: any, curr: any) => acc + curr?.total_wastage_menu, 0)

  const TotalWastageProduct = tData?.reduce(
    (acc: any, curr: any) => acc + +curr.total_wastage_product,
    0
  )

  //order_canceled
  // load user list
  const loadWastedList = () => {
    dashboardTable({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        // cafe_id: user1?.cafe_id,
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        day: form.watch('request_for')?.value,
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
        menu_id: form.watch('menu_id')?.value,
        cafe_id: form.watch('cafe_id')?.value,
        product_id: form.watch('product_id')?.value,
        category_id: form.watch('category_id')?.value
      }
    })
  }

  //Salary message

  // handle pagination and load list
  useEffect(() => {
    loadWastedList()
  }, [
    // state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh
    // state.page,
    state.search,
    // state.per_page_record,
    state.filterData,
    form.watch('menu_id'),
    state.lastRefresh,
    form.watch('request_for'),
    form.watch('start_date'),
    form.watch('end_date'),
    form.watch('cafe_id'),
    form.watch('category_id'),
    form.watch('product_id')
  ])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, role_id: e?.role_id?.value },
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

  return (
    <Fragment>
      <div>
        <h3>Table Formate Report</h3>
      </div>
      <Card>
        <div className='border-bottom p-1'>
          <Row className='justify-content-end'>
            <Show IF={user?.role_id === 1}>
              <Col md='4'>
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
            <Col md='4'>
              <FormGroupCustom
                key={`${form.watch('cafe_id')?.value}`}
                control={form.control}
                noGroup
                noLabel
                isClearable
                async
                label='Category'
                name='category_id'
                loadOptions={loadDropdown}
                jsonData={{
                  cafe_id: form.watch('cafe_id')?.value
                }}
                path={ApiEndpoints.categories}
                selectLabel={(e) => `${e.name}  `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1 me-1'
                rules={{ required: false }}
              />
            </Col>
            <Col md='4'>
              <FormGroupCustom
                key={`${form.watch('cafe_id')?.value}`}
                control={form.control}
                noGroup
                noLabel
                isClearable
                async
                label='Product'
                name='product_id'
                loadOptions={loadDropdown}
                jsonData={{
                  cafe_id: form.watch('cafe_id')?.value
                }}
                path={ApiEndpoints.products}
                selectLabel={(e) => `${e.name}  `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1 me-1'
                rules={{ required: false }}
              />
            </Col>
            <Col md='4'>
              <FormGroupCustom
                key={`${form.watch('cafe_id')?.value},${form.watch('category_id')?.value}`}
                control={form.control}
                noGroup
                noLabel
                isClearable
                async
                label='Menu'
                name='menu_id'
                loadOptions={loadDropdown}
                jsonData={{
                  cafe_id: form.watch('cafe_id')?.value,
                  category_id: form.watch('category_id')?.value
                }}
                path={ApiEndpoints.menus}
                selectLabel={(e) => `${e.name}  `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1 me-1'
                rules={{ required: false }}
              />
            </Col>

            {
              <Col md='4'>
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
                  className='mb-1 me-1'
                  rules={{ required: true }}
                />
              </Col>
            }

            <>
              <Col md='4'>
                <FormGroupCustom
                  noLabel
                  name={'start_date'}
                  isDisabled={!!form.watch('request_for')}
                  type={'date'}
                  isClearable
                  label={FM('start-date')}
                  dateFormat={'YYYY-MM-DD'}
                  className='mb-0 ms-1'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  noLabel
                  isClearable
                  isDisabled={!!form.watch('request_for')}
                  name={'end_date'}
                  type={'date'}
                  label={FM('end-date')}
                  dateFormat={'YYYY-MM-DD'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                />
              </Col>
            </>
          </Row>
          {/* </Col> */}
          {/* </Row> */}
        </div>
        <CardBody>
          {/* <CustomDataTable<tableReportListResponseTypes>
                        initialPerPage={20}
                        isLoading={dashboardtablerestResponse.isLoading}
                        columns={columns}
                        // options={options}
                        hideHeader
                        // pointerOnHover
                        fixedHeaderScrollHeight={'40px'}
                        highlightOnHover
                        // selectableRows={canEditUser || canDeleteUser}
                        tableData={tdata}
                        // searchPlaceholder='search-user-name'
                        onSort={handleSort}
                        defaultSortField={dashboardtablerestResponse?.originalArgs?.jsonData?.sort}
                    //  paginatedData={dashboardtablerestResponse?.data?.payload}
                    // handlePaginationAndSearch={handlePageChange}
                    /> */}
          <Table responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Wastage Menu</th>
                <th>Total Wastage Product</th>
              </tr>
            </thead>
            {tData &&
              tData?.map((item: any, index: any) => {
                return (
                  <>
                    <tbody>
                      <tr>
                        <th scope='row' className='w-50'>
                          {formatDate(item?.date, 'DD-MM-YYYY')}
                        </th>
                        <td>{item?.total_wastage_menu}</td>
                        <td>{item?.total_wastage_product}</td>
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
                <th>{TotalWastage}</th>
                <th>{TotalWastageProduct}</th>
              </tr>
            </thead>
          </Table>
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default TableListWasted
