import { yupResolver } from '@hookform/resolvers/yup'
import { itemTransferType } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import BsTooltip from '@src/modules/common/components/tooltip'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { ArrowLeft, Plus, Trash2 } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Button, ButtonGroup, ButtonProps, Card, CardBody, Col, Form, Row } from 'reactstrap'
import toast from 'react-hot-toast'
import { useCreateOrUpdateTransferMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'
import { FM, formatDate, isValid, log, setInputErrors, setValues, SuccessToast } from '@src/utility/Utils'
import Header from '@src/modules/common/components/header'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import { getPath } from '@src/router/RouteHelper'
import { useReactToPrint } from 'react-to-print'
import ItemTransferPrint from './ItemTransferPrint'
import { Divider } from '@mui/material'
import { useViewDemandsMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/MenusRTK'

// form validation schema
const userFormSchema = {
  // file: yup.string().required()

  transfer_date: yup.date().typeError('date must be required').required(),
  transfer_to_cafe: yup.object().typeError('Please Select Cafe').required(),
  delivery_person:yup.string().trim().typeError('Delivery Person Name must be required').required(),
  items: yup.array().of(
    yup.object().shape({
      item_id: yup.object().typeError('Please Select Item').required(),
      unit_id: yup.object().typeError('Please Select Unit').required(),
      quantity: yup
        .number() // Changed from yup.object() to yup.number()
        .typeError('Quantity must be a  Minimum')
        .required('Please provide plan Quantity.')
        .min(0, 'Quantity must be at least 0'),

      rate: yup
        .number() // Changed from yup.object() to yup.number()
        .typeError('Rate must be a  Minimum 0')
        .required('Please provide Rate.')
        .min(0, 'Rate must be at least 0')
    })
  )
}

const schema = yup.object(userFormSchema).required()

//set defaultValues
const defaultValues: itemTransferType = {
  transfer_to_cafe: '',
  transfer_date: '',
  items: []
}

const CreateTransferItem = (props: any) => {
  const navigate = useNavigate()
  const componentRef = useRef<HTMLElement | any>(null)
  const [printData, setPrintData] = useState<any>(null)
  const params = useParams()

 const [viewOrder, viewOrderRes] = useViewDemandsMutation()
   const viewOrders: any = viewOrderRes?.data?.payload
   //get view order details
  useEffect(() => {
    if (isValid(params.id) && viewOrderRes.isUninitialized) {
      viewOrder({
        id: Number(params?.id),
        eventId: '',
        action: '',
        ids: []
      })
    }
  }, [params.id, viewOrder, viewOrderRes.isUninitialized])

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,

    onAfterPrint: () => {
      setPrintData(null)
    }
  })
  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })

  //useFields  array in use form
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'items'
  })

  //handel print
  useEffect(() => {
    if (isValid(printData)) {
      handlePrint()
      // const dateTimeStr = '05-07-2024 14:30';
      // log(formatDateTime(dateTimeStr))
    }
  }, [printData])

  //append fields
  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  // create or update  mutation
  const [createTransfer, createTransferResp] = useCreateOrUpdateTransferMutation()

  // handle save Transfer Item
  const handleSaveUser = (userData: any) => {
    const data = {
      ...userData,
      transfer_to_cafe: userData?.transfer_to_cafe?.value,
     
      delivery_person:userData?.delivery_person,
      transfer_date: userData?.transfer_date
        ? formatDate(userData?.transfer_date, 'YYYY-MM-DD')
        : undefined,
      items: userData?.items?.map((item: any, index: any) => {
        let stock = Number(form.watch(`items.${index}.item_id`)?.extra?.current_quanitity)
        let quantity = item?.quantity

        if (quantity > stock) {
          {
            form.setError(`items.${index}.quantity` as any, {
              type: 'manual',
              message: `Quantity cannot be more than available stock (${stock})`
            })
          }
        } else {
      
          return {
          
            demand_request_product_id: viewOrders?.requested_products?.[index]?.id,
            item_id: item?.item_id?.value,
            unit_id: item?.unit_id?.value,
            quantity: item?.quantity,
            rate: item?.rate
          }
        }
      })
    }
    const hasDuplicateProductIds = (arr: any) => {
      const seen = new Set()
      for (const item of arr) {
        if (seen.has(item.item_id)) {
          return true // Duplicate product_id found
        }
        seen.add(item.item_id)
      }
      return false // No duplicates found
    }

    let validation = hasDuplicateProductIds(data?.items)
    // setPrintData(userData)

    // log(data, 'data')
    if (validation === true) {
      toast.error('please check the data duplicate entry in item')
    } else {
      {
        createTransfer({
          jsonData: {
            ...data
          }
        })
      }
    }
    // const getDuplicateItemNames = (arr: any[]) => {
    //   const seen = new Set()
    //   const duplicates: string[] = []

    //   for (const item of arr) {
    //     log(item, 'item')
    //     if (seen.has(item.item_id)) {
    //       duplicates.push(item.name || `Unnamed Item (${item.item_id?.label})`)
    //     } else {
    //       seen.add(item.item_id)
    //     }
    //   }

    //   return duplicates
    // }

    // const duplicateItems = getDuplicateItemNames(data?.items || [])

    // if (duplicateItems.length > 0) {
    //   toast.error(`Duplicate items found: ${duplicateItems.join(', ')}. Please check the data.`)
    // } else {
    //   createTransfer({
    //     jsonData: {
    //       ...data
    //     }
    //   })
    // }
  }


  // console.log(viewOrders,'viewOrders')

  // open view modal
  useEffect(() => {
    if (viewOrderRes.isSuccess && isValid(viewOrders)) {
      setValues<any>(
        {
          transfer_to_cafe: viewOrders?.cafe
            ? {
                label: viewOrders?.cafe?.name,
                value: viewOrders?.cafe?.id
              }
            : undefined,
          transfer_date: viewOrders?.demand_date,
          items: viewOrders?.requested_products?.map((item: any) => {
            console.log(item?.warehouse_product?.warehouse_product?.current_quanitity,'item?.warehouse_product?.warehouse_product?.current_quanitity')
            return {
              item_id: item?.warehouse_product
                ? {
                    label: item?.warehouse_product?.name,
                    value: item?.warehouse_product_product_id,
                    extra: {
                      unit: item?.warehouse_unit,
                      unit_id: item?.warehouse_product_unit_id,
                      last_average_price: item?.warehouse_product_last_average_price,
                      current_quanitity: item?.warehouse_product?.current_quanitity,
                      brand: item?.warehouse_brand,
                      packsize: item?.warehouse_packsize,
                      category: item?.warehouse_category,
                      subcategory: item?.warehouse_subcategory
                    }
                  }
                : undefined,
              unit_id: item?.warehouse_unit
                ? {
                    label: item?.warehouse_unit?.name,
                    value: item?.warehouse_product_unit_id
                  }
                : undefined,
              quantity: item?.quantity,
              rate: item?.warehouse_product_last_average_price,
              totalRate: (item?.quantity * item?.warehouse_product_last_average_price) || 0
            }
          })
        },
        form.setValue
      )
    }
  }, [viewOrderRes.isSuccess, viewOrders])

  // handle menu create response
  useEffect(() => {
    if (!createTransferResp.isUninitialized) {
      if (createTransferResp.isSuccess) {
        navigate(getPath('item-transfers'))
        SuccessToast('Created  Transfer item Successfully')
      } else if (createTransferResp.isError) {
        // handle error
        const errors: any = createTransferResp.error

        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createTransferResp])

  const getTotalForItem = (index: any) => {
    const price = Number(form.watch(`items.${index}.totalRate`)) || 0

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
    <>
      <span style={{ display: 'none' }}>
        <ItemTransferPrint key={printData?.id} props={printData} ref={componentRef} />
      </span>
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
        title={FM('create-transfer-item')}
      >
        <ButtonGroup color='dark'></ButtonGroup>
      </Header>

      <div className='p-2'>
        <Form onSubmit={form.handleSubmit(handleSaveUser)}>
          <Row>
            <Card>
              <Row>
                <Col md='3'>
                  <FormGroupCustom
                    control={form.control}
                    async
                    isClearable
                    label='Transfer to Cafe'
                    name='transfer_to_cafe'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.ListWarehouseCafes}
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
                    // key={`${state?.editData?.transfer_date}`}
                    control={form.control}
                    label={'Transfer Date'}
                    name='transfer_date'
                    type='date'
                    className='mb-1'
                    datePickerOptions={{
                      maxDate: new Date()

                      //   ? new Date(form.watch('birth_date'))
                      //   : formatDate(new Date(), 'YYYY-MM-DD')
                    }}
                    // dateFormat='YYYY-MM-DD'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='3' lg='3' sm='12' xs='12' >
                   <FormGroupCustom
                            name={`delivery_person`}
                            type='text'
                            label='Delivery Person'
                            className='mb-0'
                            control={form.control}
                            rules={{ required: true }}
                           
                          />
                </Col>
              </Row>
            </Card>
          </Row>

          <Row className='mb-0'>
            {fields.map((field, index) => (
              <Card key={field?.id}>
                <h5 className='border-bottom mt-1'>
                  <>
                    {'Items'} {index > 0 ? index + 1 : '1'}
                    {/* <span className='text-danger fw-bolder'>*</span>{' '} */}
                  </>
                </h5>

                <CardBody className='pt-1'>
                  <Row className='g'>
                    <Col md='10'>
                      <Row className='g'>
                        <Col md='3'>
                          <FormGroupCustom
                            key={`${field?.id} -${viewOrders?.requested_products[index]?.warehouse_product?.name}`}
                            control={form.control}
                            async
                            isClearable
                            defaultValue={{
                              label: viewOrders?.requested_products[index]?.warehouse_product?.name,
                              value: viewOrders?.requested_products[index]?.warehouse_product_product_id
                            }}
                            label='Item'
                            name={`items.${index}.item_id`}
                            loadOptions={loadDropdown}
                            onChangeValue={(e) => {
                              form.setValue(`items.${index}.unit_id`, {
                                label: form.watch(`items.${index}.item_id`)?.extra?.unit?.name,
                                value: form.watch(`items.${index}.item_id`)?.extra?.unit_id
                              })
                              form.setValue(
                                `items.${index}.rate`,
                                Number(
                                  form.watch(`items.${index}.item_id`)?.extra?.last_average_price
                                )
                              )
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
                        

                        <Col md='2'>
                           <FormGroupCustom
                            key={`${field?.id} -${viewOrders?.requested_products[index]?.warehouse_product_product_id?.extra?.unit?.name}`}
                            control={form.control}
                            async
                            label='unit'
                            defaultValue={{
                              label: viewOrders?.requested_products[index]?.warehouse_product_product_id?.extra?.unit?.name,
                              value: viewOrders?.requested_products[index]?.warehouse_product_product_id?.extra?.unit?.id
                            }}
                            name={`items.${index}.unit_id`}
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.unitList}
                            selectLabel={(e) => `${e.name} `}
                            selectValue={(e) => e.id}
                            defaultOptions
                            type='select'
                            className='mb-0 pointer-events-none'
                            rules={{ required: true }}
                          />
                        </Col>
                        <Col md='3'>
                          {/* <FormGroupCustom
                            name={`items.${index}.quantity`}
                            type={'number'}
                            label={'Quantity'}
                            className='mb-0'
                            control={form.control}
                            rules={{ required: true }}
                            // onChangeValue={(e) => {
                            //   let value = e.target.value
                            //   let stock = Number(
                            //     form.watch(`items.${index}.item_id`)?.extra?.current_quanitity
                            //   )
                            //   let rate = Number(form.watch(`items.${index}.rate`))
                            //   form.setValue(`items.${index}.totalRate`, value * rate)
                            //   if (value > stock) {
                            //     // Show error message
                            //     form.setError(`items.${index}.quantity` as any, {
                            //       type: 'manual',
                            //       message: `Quantity cannot be more than available stock (${stock})`
                            //     })
                            //   } else {
                            //     // Clear error if within limit
                            //     form.clearErrors(`items.${index}.quantity` as any)
                            //   }

                            //   // Optionally update value in form state if you need
                            //   form.setValue(`items.${index}.quantity`, value)
                            // }}
                            onChangeValue={(e) => {
                              let rawValue = e.target.value

                              // Convert to float
                              let value = parseFloat(rawValue)
                              if (isNaN(value) || value < 0) value = 0

                              let stock = Number(
                                form.watch(`items.${index}.item_id`)?.extra?.current_quanitity
                              )
                              let rate = Number(form.watch(`items.${index}.rate`))

                              // ✅ Calculate total correctly
                              const total = (value * rate).toFixed(2)
                              form.setValue(`items.${index}.totalRate`, value * rate)

                              // ✅ Check stock limit
                              if (value > stock) {
                                form.setError(`items.${index}.quantity` as any, {
                                  type: 'manual',
                                  message: `Quantity cannot be more than available stock (${stock})`
                                })
                              }
                              // ✅ Check decimal places (max 2)
                              else if (!/^\d+(\.\d{1,2})?$/.test(rawValue)) {
                                form.setError(`items.${index}.quantity` as any, {
                                  type: 'manual',
                                  message: 'Quantity can have at most 2 decimal places'
                                })
                              } else {
                                form.clearErrors(`items.${index}.quantity` as any)
                              }

                              // ✅ Save raw typed value (so input shows what user typed)
                              form.setValue(`items.${index}.quantity`, rawValue)
                            }}
                          /> */}
                          <FormGroupCustom
                            key={`${field?.id} - ${viewOrders?.requested_products[index]?.quantity}`}
                            name={`items.${index}.quantity`}
                            type='number'
                            label='Quantity'
                            className='mb-0'
                            control={form.control}
                            defaultValue={viewOrders?.requested_products[index]?.quantity}
                            rules={{ required: true }}
                            onChangeValue={(e) => {
                              let value = parseFloat(e.target.value) // ✅ Always parse as float
                              let stock = Number(
                                form.watch(`items.${index}.item_id`)?.extra?.current_quanitity ?? 0 // ✅ Safe fallback
                              )
                              let rate = Number(form.watch(`items.${index}.rate`) ?? 0) // ✅ Safe fallback

                              form.setValue(`items.${index}.totalRate`, value * rate)

                              if (value > stock) {
                                form.setError(`items.${index}.quantity` as any, {
                                  type: 'manual',
                                  message: `Quantity cannot be more than available stock (${stock})`
                                })
                              } else {
                                form.clearErrors(`items.${index}.quantity` as any)
                              }

                              // ✅ Save float or int value in form state
                              form.setValue(`items.${index}.quantity`, value)
                            }}
                          />
                          Available Stock:
                          {Number(form.watch(`items.${index}.item_id`)?.extra?.current_quanitity)
                            ? Number(form.watch(`items.${index}.item_id`)?.extra?.current_quanitity)
                            : 0}
                        </Col>
                        <Col md='2'>
                          <FormGroupCustom
                            key={`${field?.id} - ${viewOrders?.requested_products[index]?.warehouse_product_last_average_price}`}
                            name={`items.${index}.rate`}
                            defaultValue={viewOrders?.requested_products[index]?.warehouse_product_last_average_price}
                            type={'number'}
                            label={'Rate'}
                            className='mb-0'
                            control={form.control}
                            rules={{ required: true, min: 0 }}
                          />
                        </Col>
                        <Col md='2'>
                          <FormGroupCustom
                            key={`${field?.id} - ${viewOrders?.requested_products[index]?.warehouse_product_last_average_price} - ${viewOrders?.requested_products[index]?.quantity}`}
                            name={`items.${index}.totalRate`}
                            defaultValue={viewOrders?.requested_products[index]?.quantity  * viewOrders?.requested_products[index]?.warehouse_product_last_average_price}
                            type={'number'}
                            label={'Total Rate'}
                            className='mb-0 pointer-events-none'
                            control={form.control}
                            rules={{ required: false, min: 0 }}
                          />
                        </Col>
                        <Col md={3} className='d-flex justify-content-start'>
                          <div className='me-1 fw-bold'>{FM('brand')} :</div>
                          <div>
                            {form.watch(`items.${index}.item_id`)?.extra?.brand?.name
                              ? form.watch(`items.${index}.item_id`)?.extra?.brand?.name
                              : ''}
                          </div>
                        </Col>
                        <Col md={2} className='d-flex justify-content-start'>
                          <div className='me-1 fw-bold'>{FM('pack-size')} :</div>
                          <div>
                            {form.watch(`items.${index}.item_id`)?.extra?.packsize?.name
                              ? form.watch(`items.${index}.item_id`)?.extra?.packsize?.name
                              : ''}
                          </div>
                        </Col>
                        <Col md={3} className='d-flex justify-content-start'>
                          <div className='me-1 fw-bold'>{FM('category')} :</div>
                          <div>
                            {form.watch(`items.${index}.item_id`)?.extra?.category?.name
                              ? form.watch(`items.${index}.item_id`)?.extra?.category?.name
                              : ''}
                          </div>
                        </Col>
                        <Col md={3} className='d-flex justify-content-start'>
                          <div className='me-1 fw-bold'>{FM('sub-category')} :</div>
                          <div>
                            {form.watch(`items.${index}.item_id`)?.extra?.subcategory?.name
                              ? form.watch(`items.${index}.item_id`)?.extra?.subcategory?.name
                              : ''}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col md='2' className='mt-1'>
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
                              <Trash2 size={16} />
                            </>
                          </BsTooltip>
                        </Show>

                        {/* <Show IF={index === fields?.length - 1}>
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
                              <Plus size={16} />
                            </>
                          </BsTooltip>
                        </Show> */}
                      </Show>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </Row>
          <div className='text-start'>
            <ButtonGroup className='me-2'>
              <LoadingButton
                disabled={createTransferResp.isLoading}
                loading={createTransferResp.isLoading}
                color='primary'
                type='submit'
              >
                {FM('Save')}
              </LoadingButton>
            </ButtonGroup>
            <span className='fw-bold text-primary  fs-4'>Total :</span>
            <span className='fw-bold text-primary fs-3 mt-1'>₹{grandTotal}</span>
          </div>
        </Form>
      </div>
    </>
  )
}

export default CreateTransferItem
