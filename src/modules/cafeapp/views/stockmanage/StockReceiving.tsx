import { yupResolver } from '@hookform/resolvers/yup'
import { HandoverData } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import { FM, formatDate, isValid, log, setInputErrors, SuccessToast } from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer } from 'react'
import { ArrowLeft } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'

import { ButtonGroup, Card, CardBody, Form, Table } from 'reactstrap'
import * as yup from 'yup'

import { getUserData } from '@src/auth/utils'

import {
  useCreateOrUpdateStockReceiveConfirmMutation,
  useLoadStockReceivedMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import { getPath } from '@src/router/RouteHelper'

import { useNavigate } from 'react-router-dom'

// validation schema
const StockFormSchema = {
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
  is_confirm: yup.boolean().required('This Field required')
}

// validate
const schema = yup.object(StockFormSchema).required()

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

const defaultValues: any = {}
const StockReceiving = (props: any) => {
  // header menu context categoryResponseTypes
  const navigate = useNavigate()

  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'items'
  })

  // receiving  mutation
  const [createStockReceiveConfirm, createStockReceiveConfirmResponse] =
    useCreateOrUpdateStockReceiveConfirmMutation()

  // load stock report
  const [loadStockManage, loadStockManageResponse] = useLoadStockReceivedMutation()

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
  const loadStock = () => {
    loadStockManage({
      jsonData: {
        status: 0
      }
    })
  }

  // stock report
  useEffect(() => {
    loadStock()
  }, [])

  const payload = Array.isArray(loadStockManageResponse?.data?.payload)
    ? loadStockManageResponse?.data?.payload
    : []

  // handle save stock manage Receive
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createStockReceiveConfirm({
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
      createStockReceiveConfirm({
        jsonData: {
          is_confirm: userData?.is_confirm == 1 ? true : false,
          items: payload?.map((item: any, index: any) => ({
            item_id: item?.id,
            recieved_quantity: Number(form.watch(`items.${index}.recieved_quantity`)),
            comment: form.watch(`items.${index}.comment`)
              ? form.watch(`items.${index}.comment`)
              : null
          }))
        }
      })
    }
  }

  // handle Stock Receiving create response
  useEffect(() => {
    if (!createStockReceiveConfirmResponse.isUninitialized) {
      if (createStockReceiveConfirmResponse.isSuccess) {
        // user?.role_id === 2 || user?.role_id === 6 ? '' : dispatch(handleLogout())
        navigate(getPath('stockmanage'))
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('items-received-successfully')}</>
          ) : (
            <>{FM('items-received-successfully')}</>
          )
        )
      } else if (createStockReceiveConfirmResponse.isError) {
        // handle error
        const errors: any = createStockReceiveConfirmResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createStockReceiveConfirmResponse])

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
        title='Stock Receiving '
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
                  <th>#</th>
                  <th>{FM('product')}</th>

                  <th>{FM('Receiving-Stock')}</th>
                   <th>{('Confirm Stock Receipt')}</th>
                  <th>{FM('unit')}</th>

                  <th>{FM('transfer-from')}</th>
                  <th>{FM('category')}</th>
                  <th>{FM('sub-category')}</th>
                  <th>{FM('brand')}</th>
                  <th>{FM('pack-size')}</th>
                  
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
                              <td>{index + 1}</td>
                              <td>{item?.product?.name}</td>

                              <td>{item?.quantity}</td>
                              <td>
                                <FormGroupCustom
                                  defaultValue={item?.quantity}
                                  name={`items.${index}.recieved_quantity`}
                                  type={'number'}
                                  noLabel
                                  noGroup
                                  label={'recieved_quantity'}
                                  className='mb-0'
                                  control={form.control}
                                  rules={{ required: true, min: 0 }}
                                  onChangeValue={(e) => {
                                    let value = Number(e.target.value)

                                    let stock = Number(item?.quantity)

                                    if (value > stock) {
                                      form.setError(`items.${index}.recieved_quantity` as any, {
                                        type: 'manual',
                                        message: `Received quantity cannot be more than transferred quantity (${stock})`
                                      })
                                      form.setError(`items.${index}.comment` as any, {
                                        type: 'manual',
                                        message: `Comment must be required`
                                      })
                                    } else if (value < stock) {
                                      form.setValue(`items.${index}.current_stock`, value)
                                      form.clearErrors(`items.${index}.recieved_quantity` as any)
                                      form.setError(`items.${index}.comment` as any, {
                                        type: 'manual',
                                        message: `Comment must be required`
                                      })
                                    } else { // value === stock
                                      form.setValue(`items.${index}.current_stock`, value)
                                      form.clearErrors(`items.${index}.recieved_quantity` as any)
                                      form.clearErrors(`items.${index}.comment` as any)
                                    }

                                    // Optionally update value in form state if you need
                                    // form.setValue(`items.${index}.current_stock`, value)
                                  }}
                                />
                              </td> 
                              <td>{item?.unit?.name}</td>

                              <td>{item?.transfer_info?.name}</td>
                              <td>{item?.category?.name}</td>
                              <td>{item?.subcategory?.name}</td>
                              <td>{item?.brand?.name}</td>
                              <td>{item?.packsize?.name}</td>
                            
                            
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
            {/* <div className='p-2'>
              <FormGroupCustom
                name={`reason`}
                type={'textarea'}
                label={'Remarks'}
                className='mb-0'
                control={form.control}
                rules={{ required: false }}
              />
            </div> */}
            <div className='p-1'>
              <div className='px-1'>
                <FormGroupCustom
                  name={`is_confirm`}
                  type={'checkbox'}
                  label={'Stock Received Confirm'}
                  className='mb-0 w-10'
                  control={form.control}
                  rules={{ required: false }}
                />
              </div>
              <div className='text-end'>
                <ButtonGroup>
                  <LoadingButton
                    disabled={createStockReceiveConfirmResponse.isLoading}
                    loading={createStockReceiveConfirmResponse.isLoading}
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

export default StockReceiving
