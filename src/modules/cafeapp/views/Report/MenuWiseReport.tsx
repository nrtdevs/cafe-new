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
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { Download, RefreshCcw } from 'react-feather'
import { useForm } from 'react-hook-form'

import { Button, Card, CardBody, Col, Form, NavItem, Row, Table } from 'reactstrap'
import * as yup from 'yup'

import { tableReportListResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import {
  useLoadExportMenuOrderDataMutation,
  useLoadExportMenuWiseLiveReportMutation,
  useLoadMenuReportTableMutation
} from '../../redux/RTKFiles/common-cafe/DashboardRTK'
import Hide from '@src/utility/Hide'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import toast from 'react-hot-toast'

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
  selectedUser?: any
  enableEdit?: boolean
  editData?: any
}

const MenuWiseReport = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()
  // can add user
  const [orderTable, orderTableRestResponse] = useLoadExportMenuOrderDataMutation()
  const [exportMenuWiseLiveReport, exportMenuWiseLiveReportRestResponse] = useLoadExportMenuWiseLiveReportMutation()
  const [modalExportAdd, toggleExportModalAdd] = useModal()
  const [modalMenuWiseExportAdd, toggleMenuWiseExportModalAdd] = useModal()

  // form hook
  const form = useForm<tableReportListResponseTypes>({
    // resolver: yupResolver(schema),
    // defaultValues
  })

  // load wastage
  const [dashboardTable, dashboardTableRestResponse] = useLoadMenuReportTableMutation()
  const tData = dashboardTableRestResponse?.data?.payload

  // can add order
  const canAddUser = Can(Permissions.orderCreate)

  //get login user detail
  const user1 = getUserData()
  const cafe_id = user1?.cafe_id

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
  const currentDate1 = `${year}-${month}-${day + 1}`
  const [filterData, setFilterData] = useState<any>(false)

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

  useEffect(() => {
    if (orderTableRestResponse?.isSuccess === true) {
      closeExportModal()
    }
  }, [orderTableRestResponse])

  useEffect(() => {
    if (exportMenuWiseLiveReportRestResponse?.isSuccess === true) {
      closeMenuWiseExportModal()
    }
  }, [exportMenuWiseLiveReportRestResponse])

  // load wasted list
  const loadWastedList = () => {
    dashboardTable({
      jsonData: {
        start_date: form.watch('start_date')
          ? form.watch('start_date')
          : formatDate(currentDate, 'YYYY-MM-DD'),
        end_date: form.watch('end_date')
          ? form.watch('end_date')
          : formatDate(currentDate1, 'YYYY-MM-DD'),
        cafe_id: form.watch('cafe_id')?.value ? form.watch('cafe_id')?.value : cafe_id,
        sub_cafe_id: form.watch('sub_cafe_id')?.value
      }
    })
  }

  // handle  load list
  useEffect(() => {
    loadWastedList()
  }, [
    state.lastRefresh
    // form.watch('start_date'),
    // form.watch('end_date'),
    // form.watch('cafe_id'),
    // form.watch('sub_cafe_id'),
  ])

  // reload page
  const reloadData = () => {
    setFilterData(false)
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    }),
      form.reset()
  }

  // close export modal
  const closeExportModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
      form.reset()
    }
    toggleExportModalAdd()

  }


  // close menu wise export modal
  const closeMenuWiseExportModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
      form.reset()
    }
    toggleMenuWiseExportModalAdd()
  }

  const urlDemo = orderTableRestResponse?.data?.payload?.[0]?.file_name

  const urlDemo1 = exportMenuWiseLiveReportRestResponse?.data?.payload?.[0]?.file_name

  useEffect(() => {
    if (urlDemo) {
      window.open(urlDemo, '_blank')
    } else {
      // toast.error('File URL is not available.')
    }
  }, [urlDemo])

  useEffect(() => {
    if (urlDemo1) {
      window.open(urlDemo1, '_blank')
    } else {
      // toast.error('File URL is not available.')
    }
  }, [urlDemo1])

  // export data
  const handleExport = (userData: any) => {
    orderTable({
      jsonData: {
        start_date: formatDate(userData?.start_date, 'YYYY-MM-DD'),
        end_date: formatDate(userData?.end_date, 'YYYY-MM-DD'),
        cafe_id: userData?.cafe_id?.value ? userData?.cafe_id?.value : cafe_id,
        sub_cafe_id: userData?.sub_cafe_id?.value,
        is_overall_report: userData?.is_overall_report ? true : false
      }
    })


  }

  const renderExportModal = () => {
    return (
      <CenteredModal
        open={modalExportAdd}
        title={'Export Order'}
        loading={orderTableRestResponse?.isLoading}
        done={state.enableEdit ? 'Export' : 'Export'}
        handleSave={form.handleSubmit(handleExport)}
        // handleSave={() => {
        //     setState({
        //         enableEdit: true
        //     })
        //     closeViewModal(false)
        //     // toggleModalAdd()
        // }}
        handleModal={() => closeExportModal(true)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleExport)}>
            <Show IF={user?.role_id === 1}>
              <Col md='12' lg='12' xl='12' sm='12'>
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

            <Hide IF={user?.no_of_subcafe === 0}>
              <Col md='12' lg='12' xl='12' sm='12'>
                <FormGroupCustom
                  key={form.watch('cafe_id')}
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
                  jsonData={
                    {
                      // cafe_id: form.watch('cafe_id')?.value ? form.watch('cafe_id')?.value : user?.cafe_id
                    }
                  }
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
            </Hide>

            <Col md='12' lg='12' sm='12' xs='12'>
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
                className='mb-2'
                control={form.control}
                rules={{ required: false }}
              />
            </Col>

            <Col md='12' lg='12' sm='12' xs='12'>
              <FormGroupCustom
                noLabel
                isClearable
                isDisabled={!!form.watch('start_date')}
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

            <Col md='12' lg='12' xl='12' sm='12' className='mt-2'>
              <FormGroupCustom
                defaultValue={'false'}
                control={form.control}
                label={FM('is_overall_report')}
                name={`is_overall_report`}
                type='checkbox'
                className='mb-2'
                inputClassName={''}
                rules={{ required: false }}
              />
            </Col>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  //handle menu wise export
  const handleMenuWiseExport = (data: any) => {
    exportMenuWiseLiveReport({
      jsonData: {
        start_date: formatDate(data?.start_date, 'YYYY-MM-DD'),
        end_date: formatDate(data?.end_date, 'YYYY-MM-DD'),
        cafe_id: data?.cafe_id?.value ? data?.cafe_id?.value : cafe_id,
        sub_cafe_id: data?.sub_cafe_id?.value,
        menu_name: data?.menu_id?.label
      }
    })


  }


  const renderMenuWiseExportModal = () => {
    return (
      <CenteredModal
        open={modalMenuWiseExportAdd}
        title={'Export Menu Wise Report'}
        done={state.enableEdit ? 'Export' : 'Export'}
        loading={exportMenuWiseLiveReportRestResponse?.isLoading}
        handleSave={form.handleSubmit(handleMenuWiseExport)}
        // handleSave={() => {
        //     setState({
        //         enableEdit: true
        //     })
        //     closeViewModal(false)
        //     // toggleModalAdd()
        // }}
        handleModal={() => closeMenuWiseExportModal(true)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleMenuWiseExport)}>
            <Show IF={user?.role_id === 1}>
              <Col md='12' lg='12' xl='12' sm='12'>
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

            {/* <Hide IF={user?.no_of_subcafe === 0}> */}
            <Col md='12' lg='12' xl='12' sm='12'>
              <FormGroupCustom
                key={form.watch('cafe_id') || user?.cafe_id || user?.sub_cafe_id}
                control={form.control}
                async
                noGroup
                noLabel
                isClearable
                isDisabled={form.watch('cafe_id')?.value ? false : user?.no_of_subcafe === 0 ? true : false}
                label='Sub Cafe'
                placeholder='Select sub cafe'
                name='sub_cafe_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.subCafeList}
                selectLabel={(e) => `${e.name}`}
                selectValue={(e) => e.id}
                defaultOptions
                jsonData={
                  {
                    is_parent: form.watch('cafe_id')?.value
                      ? form.watch('cafe_id')?.value
                      : user?.cafe_id
                  }
                }
                type='select'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col>
            {/* </Hide> */}
            <Col md='12' lg='12' xl='12' sm='12'>
              <FormGroupCustom
                control={form.control}
                key={`${form.watch('cafe_id')?.value},${form.watch('category_id')?.value}-${form.watch('sub_cafe_id')?.value
                  }`}
                noGroup
                noLabel
                isClearable
                async
                label='Menu'
                name='menu_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.menu_list}
                jsonData={{
                  cafe_id: form.watch('sub_cafe_id')?.value
                    ? form.watch('sub_cafe_id')?.value
                    : form.watch('cafe_id')?.value
                      ? form.watch('cafe_id')?.value
                      : user?.cafe_id,

                }}
                selectLabel={(e) => `${e.name}  `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
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
                className='mb-2'
                control={form.control}
                rules={{ required: false }}
              />
            </Col>

            <Col md='12' lg='12' sm='12' xs='12'>
              <FormGroupCustom
                noLabel
                isClearable
                isDisabled={!!form.watch('start_date')}
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

          </Form>
        </div>
      </CenteredModal>
    )
  }

  const handleFilter = (userData: any) => {
    if (userData?.is_overall_report === 1) {
      setFilterData(true)
    } else {
      setFilterData(false)
    }

    dashboardTable({
      jsonData: {
        start_date: formatDate(userData?.start_date, 'YYYY-MM-DD'),
        end_date: formatDate(userData?.end_date, 'YYYY-MM-DD'),
        cafe_id: userData?.cafe_id?.value ? userData?.cafe_id?.value : cafe_id,
        sub_cafe_id: userData?.sub_cafe_id?.value,
        is_overall_report: userData?.is_overall_report ? true : false
      }
    })
    // setState({
    //     page: 1,
    //     search: '',
    //     filterData: undefined,
    //     per_page_record: 20,
    //     lastRefresh: new Date().getTime(),

    //     // filterData: {
    //     //     start_date: formatDate(userData?.start_date, 'YYYY-MM-DD'),
    //     //     end_date: formatDate(userData?.end_date, 'YYYY-MM-DD'),
    //     //     cafe_id: userData?.cafe_id?.value ? userData?.cafe_id?.value : cafe_id,
    //     //     sub_cafe_id: userData?.sub_cafe_id?.value,
    //     //     is_overall_report: userData?.is_overall_report ? userData?.is_overall_report : false,

    //     // }
    // })
  }

  return (
    <Fragment>
      {renderExportModal()}
      {renderMenuWiseExportModal()}
      <Row>
        <Col md='8' lg='8' xl='8' sm='12' xs='12'>
          <h3>{FM('menu-wise-report')}</h3>
        </Col>
        {/* <Col md='1' lg='1' xl='1' sm='12' xs='12' className='d-flex justify-content-end'>
                    <Button size='sm' onClick={() => {
                        toggleExportModalAdd()

                    }} className='me-2'>

                        <Download size='14' className='me-75' />
                        <span className='align-middle'>{FM('export')}</span>

                    </Button>
                </Col> */}
        <Col md='4' lg='4' xl='4' sm='12' xs='12' className='d-flex justify-content-end'>
          <LoadingButton
            tooltip={FM('export')}
            loading={false}
            size='sm'
            color='secondary'
            className='mb-2 me-2'
            onClick={() => {
              toggleExportModalAdd()
            }}
          >
            <Download size='14' />
          </LoadingButton>
          <LoadingButton
            tooltip={FM('menu-wise-report')}
            loading={false}
            size='sm'
            color='primary'
            className='mb-2 me-2'
            onClick={() => {
              toggleMenuWiseExportModalAdd()
            }}
          >
            <Download size='14' />
          </LoadingButton>
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

              <Hide IF={user?.no_of_subcafe === 0}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={form.watch('cafe_id')}
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
                    jsonData={
                      {
                        // cafe_id: form.watch('cafe_id')?.value ? form.watch('cafe_id')?.value : user?.cafe_id
                      }
                    }
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Hide>
              <Show IF={user?.role_id === 1}>
                <Col md='4' lg='4' xl='4' sm='12'>
                  <FormGroupCustom
                    key={form.watch('cafe_id')}
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
                    jsonData={{
                      is_parent: form.watch('cafe_id')?.value
                        ? form.watch('cafe_id')?.value
                        : user?.cafe_id
                    }}
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>
              </Show>

              {/* <Col md='4' lg='4' xl='4' sm='12'>
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
                                rules={{ required: true }}
                            />
                        </Col> */}

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
                <Col md='2' lg='2' xl='2' sm='12' className='d-flex'>
                  <FormGroupCustom
                    defaultValue={'false'}
                    control={form.control}
                    label={FM('is_overall_report')}
                    name={`is_overall_report`}
                    type='checkbox'
                    className='mb-2'
                    inputClassName={''}
                    rules={{ required: false }}
                  />
                </Col>
              </>
              <Col xs='2'>
                <div className='d-flex justify-content-end'>
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
                <th>
                  {form.watch('is_overall_report') === 1 && filterData === true
                    ? FM('start-date')
                    : FM('date')}
                </th>
                {form.watch('is_overall_report') === 1 && filterData === true && (
                  <th>{FM('end-date')}</th>
                )}
                <th>{FM('menu-name')}</th>
                <th>{FM('total_quantity_sold')}</th>
                <th>{FM('total_discount')}</th>
                <th>{FM('total_sales_amount')}</th>
                <th>{FM('total_tax')}</th>
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
                {tData &&
                  tData?.map((item: any, index: any) => {
                    return (
                      <>
                        <tbody key={index}>
                          <tr>
                            <th>
                              {form.watch('is_overall_report') === 1 && filterData === true
                                ? formatDate(form.watch('start_date'))
                                : formatDate(item?.sale_date)}
                            </th>
                            {form.watch('is_overall_report') === 1 && filterData === true && (
                              <th>{formatDate(item?.end_date)}</th>
                            )}
                            <td>{item?.menu_name}</td>

                            <td>{item?.total_quantity_sold}</td>
                            <td>
                              {Number(item?.total_discount || 0).toFixed(2)}
                              <CurrencyRupee sx={{ maxHeight: '15px' }} />
                            </td>
                            <td>
                              {item?.total_sales_amount.toFixed(2)}
                              {
                                <CurrencyRupee
                                  sx={{
                                    maxHeight: '15px'
                                  }}
                                />
                              }
                            </td>
                            <td>
                              {Number(item?.total_tax || 0).toFixed(2)}
                              <CurrencyRupee sx={{ maxHeight: '15px' }} />
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
    </Fragment>
  )
}

export default MenuWiseReport
