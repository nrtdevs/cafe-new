import { yupResolver } from '@hookform/resolvers/yup'
import { productsResponseTypes, Purchase } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import { useCreateOrUpdateListPurchaseItemMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'

import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'

import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'

import Show, { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  formatDate,
  isValid,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'

import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer } from 'react'

import { ArrowLeft, Plus, Trash2 } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'

import { Button, ButtonGroup, Col, Form, Row, ButtonProps, Card, CardBody } from 'reactstrap'
import * as yup from 'yup'

import { useNavigate } from 'react-router-dom'

import { PaymentModeWarehouse } from '@src/utility/Const'
import { getPath } from '@src/router/RouteHelper'

// validation schema
const userFormSchema = {
  purchase_date: yup.date().typeError('date must be required').required(),
  items: yup.array().of(
    yup.object().shape({
      item_id: yup
        .object()
        .required('WareHouse Item must be required')
        .typeError('WareHouse Item must be required'),
      price: yup
        .number()
        .typeError('Price must be a number')
        .required('Please provide positive.')
        .min(0),
      unit_id: yup
        .object()
        .required('unit name must be required')
        .typeError('unit name must be required'),
      category_id: yup
        .object()
        .required('Category must be required')
        .typeError('Category must be required'),
      subcategory_id: yup
        .object()
        .required('Sub Category must be required')
        .typeError('Sub Category must be required'),

      payment_mode: yup
        .object()
        .required('payment Mode must be required')
        .typeError('payment Mode must be required'),
      quantity: yup
        .number()
        .typeError('Quantity must be a number')
        .required('Quantity must be a number.')
        .min(0),
      brand_id: yup
        .object()
        .required('brand  must be required')
        .typeError('Brand must be required'),
      pack_size: yup
        .object()
        .required('Pack Size  must be required')
        .typeError('Pack Size must be required'),
      shop_name: yup
        .string()
        .typeError('Shop Name must be required ')
        .required('Shop Name  must be required'),
      person: yup
        .string()
        .typeError('Person Name must be required ')
        .required('Person Name  must be required')
    })
  )
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
  selectedUser?: Purchase
  enableEdit?: boolean
  editData?: any
}

const defaultValues: any = {
  purchase_date: new Date()
}
const CreatePurchase = (props: any) => {
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

  // create or update purchase mutation
  const [createPurchase, createPurchaseResponse] = useCreateOrUpdateListPurchaseItemMutation()

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

  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  // handle save purchase
  const handleSaveUser = (userData: any) => {
    createPurchase({
      jsonData: {
        purchase_date: userData?.purchase_date
          ? formatDate(userData?.purchase_date, 'YYYY-MM-DD')
          : undefined,
        documents: userData?.documents?.map((data) => ({
          url: data?.file_name
        })),
        items: userData?.items?.map((item) => ({
          item_id: item?.item_id?.label,
          pack_size: item?.pack_size?.label,
          brand_id: item?.brand_id?.label,
          price: item?.price,
          quantity: item?.quantity,
          shop: item?.shop_name,
          person: item?.person,
          contact_number: item?.contact_number,
          payment_mode: item?.payment_mode?.value,
          unit_id: item?.unit_id?.label,
          category_id: item?.category_id?.label,
          subcategory_id: item?.subcategory_id?.label,
          purchase_date: userData?.purchase_date
            ? formatDate(userData?.purchase_date, 'YYYY-MM-DD')
            : undefined
        }))
      }
    })
    // }
  }

  // handle purchase create response
  useEffect(() => {
    if (!createPurchaseResponse.isUninitialized) {
      if (createPurchaseResponse.isSuccess) {
        navigate(getPath('purchase-items'))

        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-purchase-item-successfully')}</>
          ) : (
            <>{FM('created-purchase-item-successfully')}</>
          )
        )
      } else if (createPurchaseResponse.isError) {
        // handle error
        const errors: any = createPurchaseResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createPurchaseResponse])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  const getTotalForItem = (index: any) => {
    const price = Number(form.watch(`items.${index}.price`)) || 0
    return price
  }

  // Calculate grand total for all items
  const getGrandTotal = () => {
    return fields?.reduce((total, _, index) => {
      return total + getTotalForItem(index)
    }, 0)
  }

  const grandTotal = getGrandTotal()

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
        title='Create Purchase Item'
      >
        <ButtonGroup color='dark'></ButtonGroup>
      </Header>

      <Form onSubmit={form.handleSubmit(handleSaveUser)}>
        <Row className='px-1'>
          <Col md='4' lg='4' sm='12' xs='12'>
            <FormGroupCustom
              key={`${state?.editData?.purchase_date}`}
              control={form.control}
              label={'Purchase Date'}
              name='purchase_date'
              type='date'
              className='mb-1'
              datePickerOptions={{
                maxDate: new Date()
              }}
              rules={{ required: true }}
            />
          </Col>
        </Row>
        {fields.map((field, index) => (
          <Card key={field?.id}>
            <h5 className='border-bottom mt-1 px-2'>
              <>
                {'Items'} {index > 0 ? index + 1 : '1'}
                {/* <span className='text-danger fw-bolder'>*</span>{' '} */}
              </>
            </h5>

            <CardBody className='pt-1'>
              <Row className='g'>
                <Col md='12'>
                  <Row className='g'>
                    <Col md='3'>
                      <FormGroupCustom
                        control={form.control}
                        isClearable
                        creatable
                        label='Item'
                        name={`items.${index}.item_id`}
                        loadOptions={loadDropdown}
                        jsonData={
                          state.editData
                            ? ''
                            : form.setValue(
                                `items.${index}.rate`,
                                Number(
                                  form.watch(`items.${index}.item_id`)?.extra?.final_average_price
                                )
                              )
                        }
                        onChangeValue={(e) => {
                          if (e?.extra !== undefined) {
                            form.watch(`items.${index}.item_id`)?.extra?.unit?.name
                              ? form.setValue(`items.${index}.unit_id`, {
                                  label: form.watch(`items.${index}.item_id`)?.extra?.unit?.name
                                    ? form.watch(`items.${index}.item_id`)?.extra?.unit?.name
                                    : undefined,
                                  value: form.watch(`items.${index}.item_id`)?.extra?.unit_id
                                    ? form.watch(`items.${index}.item_id`)?.extra?.unit_id
                                    : undefined
                                })
                              : undefined
                            form.watch(`items.${index}.item_id`)?.extra?.category?.name
                              ? form.setValue(`items.${index}.category_id`, {
                                  label: form.watch(`items.${index}.item_id`)?.extra?.category?.name
                                    ? form.watch(`items.${index}.item_id`)?.extra?.category?.name
                                    : undefined,
                                  value: form.watch(`items.${index}.item_id`)?.extra?.category?.id
                                    ? form.watch(`items.${index}.item_id`)?.extra?.category?.id
                                    : undefined
                                })
                              : undefined
                            form.watch(`items.${index}.item_id`)?.extra?.brand?.name
                              ? form.setValue(`items.${index}.brand_id`, {
                                  label: form.watch(`items.${index}.item_id`)?.extra?.brand?.name
                                    ? form.watch(`items.${index}.item_id`)?.extra?.brand?.name
                                    : undefined,
                                  value: form.watch(`items.${index}.item_id`)?.extra?.brand?.id
                                    ? form.watch(`items.${index}.item_id`)?.extra?.brand?.id
                                    : undefined
                                })
                              : undefined
                            form.watch(`items.${index}.item_id`)?.extra?.packsize?.name
                              ? form.setValue(`items.${index}.pack_size`, {
                                  label: form.watch(`items.${index}.item_id`)?.extra?.packsize?.name
                                    ? form.watch(`items.${index}.item_id`)?.extra?.packsize?.name
                                    : undefined,
                                  value: form.watch(`items.${index}.item_id`)?.extra?.packsize?.id
                                    ? form.watch(`items.${index}.item_id`)?.extra?.packsize?.id
                                    : undefined
                                })
                              : undefined
                            form.watch(`items.${index}.item_id`)?.extra?.subcategory?.name
                              ? form.setValue(`items.${index}.subcategory_id`, {
                                  label: form.watch(`items.${index}.item_id`)?.extra?.subcategory
                                    ?.name
                                    ? form.watch(`items.${index}.item_id`)?.extra?.subcategory?.name
                                    : undefined,
                                  value: form.watch(`items.${index}.item_id`)?.extra?.subcategory
                                    ?.id
                                    ? form.watch(`items.${index}.item_id`)?.extra?.subcategory?.id
                                    : undefined
                                })
                              : ''

                            form.setValue(
                              `items.${index}.rate`,
                              Number(
                                form.watch(`items.${index}.item_id`)?.extra?.final_average_price
                              )
                            )
                          } else {
                            form.resetField(`items.${index}.pack_size`)
                            form.resetField(`items.${index}.brand_id`)
                            form.resetField(`items.${index}.category_id`)
                            form.resetField(`items.${index}.subcategory_id`)
                            form.resetField(`items.${index}.unit_id`)
                            form.resetField(`items.${index}.rate`)
                          }

                          let isDuplicate = false
                          fields.forEach((i: any, idx) => {
                            if (i?.product_id?.value === e?.value && idx !== index) {
                              isDuplicate = true
                              // toast.error('Duplicate entry');
                              form.setError(`items.${index}.item_id`, {
                                type: 'manual',
                                message: 'Duplicate item'
                              })
                            }
                          })

                          if (!isDuplicate) {
                            form.setValue(`items.${index}.item_id`, e)
                            form.clearErrors(`items.${index}.item_id`)
                          }
                        }}
                        path={ApiEndpoints.listWarehouseItem}
                        selectLabel={(e) => `${e.name} `}
                        selectValue={(e) => e.id}
                        defaultOptions
                        type='select'
                        className='mb-0'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='3' lg='3' sm='12' xs='12'>
                      <FormGroupCustom
                        key={`${state?.editData?.brand?.name} -${`items.${index}.item_id`}`}
                        control={form.control}
                        isClearable
                        creatable
                        label={FM('brand')}
                        placeholder={FM('select-brand')}
                        name={`items.${index}.brand_id`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.listBrands}
                        selectLabel={(e) => `${e.name}  `}
                        selectValue={(e) => e.id}
                        // jsonData={{ view_all: 'no' }}
                        defaultOptions
                        type='select'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>

                    <Col md='3' lg='3' sm='12' xs='12'>
                      <FormGroupCustom
                        key={`${state?.editData?.packsize?.name}-${`items.${index}.item_id`}`}
                        control={form.control}
                        creatable
                        isClearable
                        label={FM('pack-size')}
                        name={`items.${index}.pack_size`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.packSizeList}
                        selectLabel={(e) => `${e.name}  `}
                        selectValue={(e) => e.id}
                        defaultOptions
                        type='select'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='3' lg='3' sm='12' xs='12'>
                      <FormGroupCustom
                        control={form.control}
                        isClearable
                        creatable
                        label={FM('category')}
                        name={`items.${index}.category_id`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.listWarehouseCategory}
                        selectLabel={(e) => `${e.name}  `}
                        selectValue={(e) => e.id}
                        onChangeValue={(e) => {
                          form.resetField(`items.${index}.subcategory_id`)
                        }}
                        defaultOptions
                        type='select'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>

                    <Col md='3' lg='3' sm='12' xs='12'>
                      <FormGroupCustom
                        key={`${form.watch(`items.${index}.category_id`)}`}
                        control={form.control}
                        isClearable
                        creatable
                        label={FM('sub-category')}
                        name={`items.${index}.subcategory_id`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.listWarehouseCategory}
                        selectLabel={(e) => `${e.name}  `}
                        selectValue={(e) => e.id}
                        jsonData={{
                          is_parent: form.watch(`items.${index}.category_id`)?.value
                        }}
                        defaultOptions
                        type='select'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='3'>
                      <FormGroupCustom
                        control={form.control}
                        creatable
                        isClearable
                        label='unit'
                        name={`items.${index}.unit_id`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.unitList}
                        selectLabel={(e) => `${e.name} `}
                        selectValue={(e) => e.id}
                        defaultOptions
                        type='select'
                        className='mb-0'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='3'>
                      <FormGroupCustom
                        defaultValue={1}
                        name={`items.${index}.quantity`}
                        type={'number'}
                        label={'Quantity'}
                        className='mb-0'
                        control={form.control}
                        rules={{ required: true, min: 1 }}
                        onChangeValue={(e) => {
                          let value = Number(e.target.value)

                          let rate = Number(form.watch(`items.${index}.price`))
                          let calculate = rate / value
                          form.setValue(`items.${index}.per_unit_price`, calculate)
                        }}
                      />
                    </Col>
                    <Col md='3'>
                      <FormGroupCustom
                        name={`items.${index}.price`}
                        type={'number'}
                        label={'price'}
                        className='mb-0'
                        control={form.control}
                        onChangeValue={(e) => {
                          let value = Number(e.target.value)

                          let quantity = Number(form.watch(`items.${index}.quantity`))
                          let calculate = value / quantity
                          form.setValue(`items.${index}.per_unit_price`, calculate)
                        }}
                        rules={{ required: true, min: 0 }}
                      />
                    </Col>
                    <Col md='3' className='mt-1'>
                      <FormGroupCustom
                        name={`items.${index}.per_unit_price`}
                        type={'number'}
                        label={'Per Unit Price'}
                        className='mb-0 pointer-events-none'
                        control={form.control}
                        rules={{ required: false, min: 0 }}
                      />
                    </Col>
                    <Col md='3' className='mt-1'>
                      <FormGroupCustom
                        name={`items.${index}.shop_name`}
                        type={'text'}
                        label={'Shop Name'}
                        className='mb-0'
                        control={form.control}
                        rules={{ required: true, min: 0 }}
                      />
                    </Col>
                    <Col md='3' className='mt-1'>
                      <FormGroupCustom
                        name={`items.${index}.person`}
                        type={'text'}
                        label={'Shop Contact Person Name'}
                        className='mb-0'
                        control={form.control}
                        rules={{ required: true, min: 0 }}
                      />
                    </Col>
                    <Col md='3' className='mt-1'>
                      <FormGroupCustom
                        name={`items.${index}.contact_number`}
                        type={'number'}
                        label={'Shop Contact Number'}
                        className='mb-0'
                        control={form.control}
                        rules={{ required: false }}
                        onChangeValue={(e) => {
                          const value = e.target.value

                          // Check if value length is less than 10 or more than 12
                          if (value.length < 10 || value.length > 12) {
                            form.setError(`items.${index}.contact_number`, {
                              type: 'manual',
                              message: 'Contact number must be between 10 and 12 digits'
                            })
                          } else {
                            form.clearErrors(`items.${index}.contact_number`)
                          }
                        }}
                      />
                    </Col>
                    <Col md='3' className='mt-1'>
                      <FormGroupCustom
                        control={form.control}
                        label={'Payment Mode'}
                        name={`items.${index}.payment_mode`}
                        selectOptions={createConstSelectOptions(PaymentModeWarehouse, FM)}
                        type='select'
                        className='mb-0'
                        rules={{ required: true }}
                      />
                    </Col>

                    <Col md='2' className='mt-2'>
                      <Show IF={index > 0 || index === fields?.length - 1}>
                        <Show IF={index > 0}>
                          <BsTooltip<ButtonProps>
                            Tag={Button}
                            role={'button'}
                            color='danger'
                            size='sm'
                            className='btn-icon me-1 m-1'
                            title={'Remove'}
                            onClick={() => {
                              remove(index)
                            }}
                          >
                            <>
                              <Trash2 size={16} /> {'Remove'}
                            </>
                          </BsTooltip>
                        </Show>

                        <Show IF={index === fields?.length - 1}>
                          <BsTooltip<ButtonProps>
                            Tag={Button}
                            color='primary'
                            size='sm'
                            title={'Add More'}
                            role={'button'}
                            className='btn-icon m-1'
                            onClick={() => {
                              append({})
                            }}
                          >
                            <>
                              <Plus size={16} /> {'Item'}
                            </>
                          </BsTooltip>
                        </Show>
                      </Show>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}
        <Col md='12' className=''>
          <FormGroupCustom
            isMulti
            control={form.control}
            label={'Documents'}
            name='documents'
            type='dropZone'
            className='mb-1'
            dropZoneOptions={{}}
            //   noLabel
            noGroup
            rules={{ required: false }}
          />
        </Col>
        <div className='text-start mb-2'>
          <ButtonGroup className='me-2'>
            <LoadingButton
              disabled={createPurchaseResponse.isLoading}
              loading={createPurchaseResponse.isLoading}
              color='primary'
              type='submit'
            >
              {FM('Save')}
            </LoadingButton>
          </ButtonGroup>
          <span className='fw-bold text-primary me-1 fs-5'>Total :</span>
          <span className='fw-bold text-primary fs-3'>₹ {grandTotal}</span>
        </div>
      </Form>
    </Fragment>
  )
}

export default CreatePurchase
