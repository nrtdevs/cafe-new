import { yupResolver } from '@hookform/resolvers/yup'
import { HandoverData } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import { useCreateOrUpdateEmployeeHandoverMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'
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
import { Fragment, useEffect, useReducer, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import { ButtonGroup, Card, CardBody, Col, Form, Row, Table } from 'reactstrap'
import * as yup from 'yup'

import { getUserData } from '@src/auth/utils'
import { useLoadEmployeeStockTableMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/DashboardRTK'
import { handleLogout } from '@src/redux/authentication'
import { getPath } from '@src/router/RouteHelper'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
const CreateEmployeeHandover = (props: any) => {
  // header menu context categoryResponseTypes
  const navigate = useNavigate()
  const dispatch = useDispatch()
  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })

  //   const { fields, append, remove } = useFieldArray({
  //     control: form?.control,
  //     name: 'items'
  //   })

  // Watch the items array values reactively
  const watchedItems = useWatch({
    control: form.control,
    name: 'items'
  })

  // create or update purchase mutation
  const [createEmployeeHandover, createEmployeeHandoverResponse] =
    useCreateOrUpdateEmployeeHandoverMutation()

  // load stock report
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

  const user = getUserData()

  // state
  const [state, setState] = useReducer(reducers, initState)

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

  //   useEffect(() => {
  //     if (fields?.length === 0) {
  //       append({})
  //     }
  //   }, [fields])



  // handle save handover
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createEmployeeHandover({
        jsonData: {
          id: state?.editData?.id,
          handover_employee_id: userData?.handover_employee_id?.value,
          status: 1,
          handover_date: userData?.handover_date
            ? formatDate(userData?.handover_date, 'YYYY-MM-DD')
            : undefined,
          items: payload?.map((item: any, index: any) => {
            const watchedStock = form.watch(`items.${index}.current_stock`)
            return {
              product_id: item?.product_id,
              category_id: item?.category?.id,
              subcategory_id: item?.subcategory?.id,
              unit_id: item?.unit_id,
              in_stock: item?.inStock ? Number(item?.inStock) : 0,
              out_stock: item?.outStock ? Number(item?.outStock) : 0,
              remaining_stock: item?.RemainingStock ? Number(item?.RemainingStock) : 0,
              current_stock: watchedStock !== undefined && watchedStock !== '' ? Number(watchedStock) : Number(item?.RemainingStock || 0),
              comment: form.watch(`items.${index}.comment`)
            }
          })
        }
      })
    } else {
      createEmployeeHandover({
        jsonData: {
          handover_employee_id: userData?.handover_employee_id?.value,
          handover_date: userData?.handover_date
            ? formatDate(userData?.handover_date, 'YYYY-MM-DD')
            : undefined,
          items: payload?.map((item: any, index: any) => {
            const watchedStock = form.watch(`items.${index}.current_stock`)
            return {
              product_id: item?.product_id,
              category_id: item?.category?.id,
              subcategory_id: item?.subcategory?.id,
              unit_id: item?.unit_id,
              in_stock: item?.inStock ? Number(item?.inStock) : 0,
              out_stock: item?.outStock ? Number(item?.outStock) : 0,
              remaining_stock: item?.RemainingStock ? Number(item?.RemainingStock) : 0,
              current_stock: watchedStock !== undefined && watchedStock !== '' ? Number(watchedStock) : Number(item?.RemainingStock || 0),
              comment: form.watch(`items.${index}.comment`)
            }
          })
        }
      })
    }
  }

  // handle handover create response
  useEffect(() => {
    if (!createEmployeeHandoverResponse.isUninitialized) {
      if (createEmployeeHandoverResponse.isSuccess) {
        user?.role_id === 2 || user?.role_id === 6 ? '' : dispatch(handleLogout())
        navigate(getPath('employee-handover'))
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-purchase-item-successfully')}</>
          ) : (
            <>{FM('employee-handover-successfully')}</>
          )
        )
      } else if (createEmployeeHandoverResponse.isError) {
        // handle  error
        const errors: any = createEmployeeHandoverResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createEmployeeHandoverResponse])

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
        title='Employee Handover'
      >
        <ButtonGroup color='dark'></ButtonGroup>
      </Header>

      <Form onSubmit={form.handleSubmit(handleSaveUser)}>
        <Card>
          <Row className='px-1'>
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
          </Row>
          <CardBody>
            <Table responsive>
              <thead>
                <tr>
                  <th>{FM('product')}</th>
                  <th>{FM('category')}</th>
                  <th>{FM('sub-category')}</th>
                  <th>{FM('unit')}</th>
                  <th>{FM('in-stock')}</th>
                  <th>{FM('out-stock')}</th>
                  <th>{FM('RemainingStock')}</th>
                  <th>{FM('current-stock')}</th>
                  <th>{FM('loss-stock')}</th>
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
                    payload.map((item: any, index: any) => {
                      return (
                        <tbody key={item?.id ?? index}>
                          <tr>
                            <td>{item?.product}</td>
                            <td>{item?.category?.name}</td>
                            <td>{item?.subcategory?.name}</td>
                            <td>{item?.unit}</td>
                            <td>{item?.inStock}</td>
                            <td>{item?.outStock}</td>
                            <td>{item?.RemainingStock}</td>
                            <td>
                              <FormGroupCustom
                                defaultValue={item?.RemainingStock ?? ''}
                                name={`items.${index}.current_stock`}
                                type={'number'}
                                noLabel
                                noGroup
                                label={'Quantity'}
                                className='mb-0'
                                control={form.control}
                                rules={{ required: true, min: 0 }}
                              />
                            </td>
                            <td>
                              {(() => {
                                const watched = watchedItems?.[index]?.current_stock
                                const currentStock = watched !== undefined && watched !== '' ? Number(watched) : Number(item?.RemainingStock || 0)
                                const difference = Number(item?.RemainingStock || 0) - currentStock
                                return isNaN(difference) ? 0 : difference
                              })()}
                            </td>
                            <td>
                              <FormGroupCustom
                                defaultValue={item?.comment ?? ''}
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
                      )
                    })}
                </>
              )}
            </Table>
          </CardBody>
        </Card>
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
      </Form>
    </Fragment>
  )
}

export default CreateEmployeeHandover
