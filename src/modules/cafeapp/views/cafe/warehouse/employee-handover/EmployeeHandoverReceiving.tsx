import { yupResolver } from '@hookform/resolvers/yup'
import { HandoverData } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import {
  useCreateEmployeeHandoverReceivingMutation,
  useCreateOrUpdateEmployeeHandoverMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import {
  FM,
  formatDate,
  formatDateValue,
  isValid,
  log,
  setInputErrors,
  SuccessToast
} from '@src/utility/Utils'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer } from 'react'
import { ArrowLeft } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'

import { ButtonGroup, Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import * as yup from 'yup'

import { getUserData } from '@src/auth/utils'

import { handleLogout } from '@src/redux/authentication'
import { getPath } from '@src/router/RouteHelper'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import BsTooltip from '@src/modules/common/components/tooltip'
import { useLoadEmployeeHandoverMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

// validation schema
const userFormSchema = {
  //   quantity: yup
  //     .number()
  //     .typeError('Quantity must be a number')
  //     .required('Quantity must be a number.')
  //     .min(0),
  //   price: yup
  //     .number()
  //     .typeError('Price must be a number')
  //     .required('Please provide positive.')
  //     .min(0),
  //   purchase_date: yup.date().typeError('date must be required').required(),
  //   item_id: yup
  //     .object()
  //     .required('WareHouse Item must be required')
  //     .typeError('WareHouse Item must be required'),
  //   unit_name: yup
  //     .object()
  //     .required('unit name must be required')
  //     .typeError('unit name must be required'),
  //   brand_id: yup.object().required('brand  must be required').typeError('Brand must be required')
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
  selectedUser?: HandoverData
  enableEdit?: boolean
  editData?: any
}

const defaultValues: any = {
  handover_date: '',
  handover_employee_id: ''
}
const EmployeeHandoverReceiving = (props: any) => {
  // header menu context categoryResponseTypes
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'items'
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  const isChecked = 0
  // create or update purchase mutation
  const [createEmployeeHandover, createEmployeeHandoverResponse] =
    useCreateEmployeeHandoverReceivingMutation()

  // load stock report
  const [loadStockManage, loadStockManageResponse] = useLoadEmployeeHandoverMutation()

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

  const user = getUserData()

  // state
  const [state, setState] = useReducer(reducers, initState)

  //stock time wise
  const loadTimeTableOrder = () => {
    loadStockManage({
      jsonData: {
        // from_date_time: form.watch('start_datetime')
        //   ? formatDateValue(form.watch('start_datetime'), 'YYYY-MM-DD HH:mm:ss')
        //   : formatDate(new Date(), 'YYYY-MM-DD'),
        // end_date_time:
        //   form.watch('end_datetime') && form.watch('start_datetime') < form.watch('end_datetime')
        //     ? formatDateValue(form.watch('end_datetime'), 'YYYY-MM-DD HH:mm:ss')
        //     : formatDate(new Date(), 'YYYY-MM-DD')
        status: 0
      }
    })
  }

  // order time wise report
  useEffect(() => {
    if (form.watch('start_datetime') && form.watch('end_datetime')) {
      loadTimeTableOrder()
    } else {
      loadTimeTableOrder()
    }
  }, [form.watch('start_datetime'), form.watch('end_datetime')])

  const payload = Array.isArray(loadStockManageResponse?.data?.payload)
    ? loadStockManageResponse?.data?.payload
    : []

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    form.setValue('description', '')
    form.reset()
    toggleModalAdd()
  }

  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  // handle save purchase
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createEmployeeHandover({
        jsonData: {
          id: state?.editData?.id,
          handover_employee_id: userData?.handover_employee_id?.value,

          handover_date: userData?.handover_date
            ? formatDate(userData?.handover_date, 'YYYY-MM-DD')
            : undefined,
          items: payload?.map((item: any, index: any) => ({
            item_id: item?.product_id,
            category_id: item?.category?.id,
            subcategory_id: item?.subcategory?.id,
            unit_id: item?.unit_id,
            in_stock: item?.inStock ? Number(item?.inStock) : 0,
            out_stock: item?.outStock ? Number(item?.outStock) : 0,
            remaining_stock: item?.RemainingStock ? Number(item?.RemainingStock) : 0,
            current_stock: Number(form.watch(`items.${index}.current_stock`)),
            comment: form.watch(`items.${index}.comment`)
          }))
        }
      })
    } else {
      createEmployeeHandover({
        jsonData: {
          Recover_status: userData?.status === 1 ? true : false,
          reason: userData?.reason ? userData?.reason : null,

          items: payload?.map((item: any, index: any) => ({
            id: item?.id,
            // category_id: item?.category?.id,
            // subcategory_id: item?.subcategory?.id,
            // unit_id: item?.unit_id,
            // in_stock: item?.inStock ? Number(item?.inStock) : 0,
            // out_stock: item?.outStock ? Number(item?.outStock) : 0,
            remaining_stock: item?.RemainingStock ? Number(item?.RemainingStock) : 0,
            current_stock: Number(form.watch(`items.${index}.current_stock`)),
            comment: form.watch(`items.${index}.comment`)
              ? form.watch(`items.${index}.comment`)
              : null
          }))
        }
      })
    }
  }

  // handle purchase create response
  useEffect(() => {
    if (!createEmployeeHandoverResponse.isUninitialized) {
      if (createEmployeeHandoverResponse.isSuccess) {
        // user?.role_id === 2 || user?.role_id === 6 ? '' : dispatch(handleLogout())
        navigate(getPath('employee-handover'))
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-purchase-item-successfully')}</>
          ) : (
            <>{FM('employee-handover-successfully')}</>
          )
        )
      } else if (createEmployeeHandoverResponse.isError) {
        // handle error
        const errors: any = createEmployeeHandoverResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createEmployeeHandoverResponse])

  const handleCheckboxChange = (event, itemId) => {
    const isChecked = event.target.checked
    // log(`isChecked`, isChecked)

    if (isChecked) {
      //   setSelectedItems([...selectedItems, itemId?.id])
    } else {
      //   setSelectedItems(selectedItems.filter((id) => id !== itemId?.id))
    }
  }

  return (
    <Fragment>
      <Header
        route={props?.route}
        icon={
          <ArrowLeft
            size='25'
            onClick={() => {
              navigate(-1)
            }}
          />
        }
        title='Employee Receiving Handover'
      >
        <ButtonGroup color='dark'></ButtonGroup>
      </Header>

      <Form onSubmit={form.handleSubmit(handleSaveUser)}>
        <Card>
          {/* <Row className='px-1'>
            <Col md='4' lg='4' sm='12' xs='12' className='mt-2'>
              <FormGroupCustom
                key={`${state?.editData?.brand?.name}`}
                control={form.control}
                async
                isClearable
                label={FM('handover-employee')}
                placeholder={FM('handover-employee')}
                name={`handover_employee_id`}
                loadOptions={loadDropdown}
                path={ApiEndpoints.employeList}
                selectLabel={(e) => `${e.name}  `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                rules={{ required: true }}
              />
            </Col>
            <Col md='4' lg='4' sm='12' xs='12' className='mt-2'>
              <FormGroupCustom
                key={`${state?.editData?.purchase_date}`}
                control={form.control}
                label={'Handover Date'}
                name='handover_date'
                type='date'
                className='mb-1'
                datePickerOptions={{
                  minDate: new Date(new Date().setDate(new Date().getDate() - 1)),
                  maxDate: new Date()
                }}
                rules={{ required: true }}
              />
            </Col>
          </Row> */}
          <CardBody>
            <Table responsive>
              <thead>
                <tr>
                  <th>{FM('product')}</th>
                  {/* <th>{FM('category')}</th>
                  <th>{FM('sub-category')}</th> */}
                  <th>{FM('unit')}</th>
                  {/* <th>{FM('in-stock')}</th>
                  <th>{FM('out-stock')}</th> */}
                  <th>{FM('RemainingStock')}</th>
                  <th>{FM('current-stock')}</th>

                  <th>{FM('comment')}</th>
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
                    </tr>
                  </tbody>
                </>
              ) : (
                <>
                  {payload &&
                    payload?.map((item: any, index: any) => {
                      //   log(form.watch(`items.${index}.status`), 'status')
                      return (
                        <>
                          <tbody key={item?.id}>
                            <tr>
                              <td>{item?.product?.name}</td>
                              {/* <td>{item?.category?.name}</td>
                          <td>{item?.subcategory?.name}</td> */}
                              <td>{item?.unit?.name}</td>
                              {/* <td>{item?.inStock}</td>
                          <td>{item?.outStock}</td> */}
                              <td>{item?.remaining_stock}</td>
                              <td>
                                <FormGroupCustom
                                  defaultValue={item?.remaining_stock}
                                  name={`items.${index}.current_stock`}
                                  type={'number'}
                                  noLabel
                                  noGroup
                                  label={'Quantity'}
                                  className='mb-0'
                                  control={form.control}
                                  rules={{ required: true, min: 0 }}
                                  onChangeValue={(e) => {
                                    let value = Number(e.target.value)

                                    let stock = Number(item?.RemainingStock)

                                    if (value === stock) {
                                      form.setValue(`items.${index}.current_stock`, value)
                                      form.clearErrors(`items.${index}.comment` as any)
                                      form.clearErrors(`comment` as any)
                                    } else {
                                      //Show error message
                                      form.setError(`items.${index}.comment` as any, {
                                        type: 'manual',
                                        message: `Comment must bhi required`
                                      })
                                      form.setError(`comment` as any, {
                                        type: 'manual',
                                        message: `Comment must bhi required`
                                      })
                                    }

                                    // Optionally update value in form state if you need
                                    // form.setValue(`items.${index}.current_stock`, value)
                                  }}
                                />
                              </td>

                              <td>
                                <FormGroupCustom
                                  key={index}
                                  noLabel
                                  noGroup
                                  name={`items.${index}.comment`}
                                  type={'textarea'}
                                  label={'comment'}
                                  className='mb-0'
                                  control={form.control}
                                  rules={{ required: true }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </>
                      )
                    })}
                </>
              )}
            </Table>
            <div className='p-2'>
              <FormGroupCustom
                name={`reason`}
                type={'textarea'}
                label={'Remarks'}
                className='mb-0'
                control={form.control}
                rules={{ required: false }}
              />
            </div>
            <div className='p-1'>
              <div className='px-1'>
                <FormGroupCustom
                  name={`status`}
                  type={'checkbox'}
                  label={'Do you want to Recover?'}
                  className='mb-0 w-10'
                  control={form.control}
                  rules={{ required: false }}
                />
              </div>
              <div className='text-end'>
                <ButtonGroup>
                  <LoadingButton
                    disabled={createEmployeeHandoverResponse.isLoading}
                    loading={createEmployeeHandoverResponse.isLoading}
                    color='primary'
                    type='submit'
                  >
                    {FM('Save')}
                  </LoadingButton>
                </ButtonGroup>
              </div>
            </div>
          </CardBody>
        </Card>
      </Form>
    </Fragment>
  )
}

export default EmployeeHandoverReceiving
