import { yupResolver } from '@hookform/resolvers/yup'
import { productsResponseTypes, Purchase } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import {
  useCreateOrUpdateListPurchaseItemMutation,
  useDeletePurchaseItemByIdMutation,
  useLoadPurchaseItemMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  emitAlertStatus,
  formatDate,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  Download,
  Edit,
  Eye,
  List,
  PlusCircle,
  RefreshCcw,
  Trash2,
  Upload,
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'

import {
  Button,
  ButtonGroup,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip,
  ButtonProps
} from 'reactstrap'
import * as yup from 'yup'
import PurchaseItemImport from './PurchaseItemImport'
import PurchaseFilter from './PurchaseFilter'
import { getPath } from '@src/router/RouteHelper'
import { useNavigate } from 'react-router-dom'
import { Typography } from '@mui/material'
import PurchaseExport from './PurchaseExport'
import { PaymentModeWarehouse } from '@src/utility/Const'

// validation schema
const userFormSchema = {
  quantity: yup
    .number()
    .typeError('Quantity must be a number')
    .required('Quantity must be a number.')
    .min(0),

  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Please provide positive.')
    .min(0),

  purchase_date: yup.date().typeError('date must be required').required(),

  item_id: yup
    .object()
    .required('WareHouse Item must be required')
    .typeError('WareHouse Item must be required'),
  unit_name: yup
    .object()
    .required('unit name must be required')
    .typeError('unit name must be required'),
  brand_id: yup.object().required('brand  must be required').typeError('Brand must be required')
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
  item_id: '',
  unit_name: '',
  purchase_date: '',
  price: '',
  quantity: '',
  brand_id: ''
}
const PurchaseItem = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add purchase permission check
  const canAddUser = Can(Permissions.purchaseItemCreate)
  // can edit purchase permission check
  const canEditUser = Can(Permissions.purchaseItemEdit)
  // can delete purchase permission check
  const canDeleteUser = Can(Permissions.purchaseItemDelete)
  // can read purchase permission check
  const canReadUser = Can(Permissions.purchaseItemRead)
  //can import purchase permission check
  const canImportUser = Can(Permissions.purchaseItemImport)

  const navigate = useNavigate()
  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update purchase mutation
  const [createPurchase, createPurchaseResponse] = useCreateOrUpdateListPurchaseItemMutation()
  // load purchase
  const [loadPurchase, loadPurchaseResponse] = useLoadPurchaseItemMutation()
  // delete mutation
  const [purchaseDelete, purchaseRestDelete] = useDeletePurchaseItemByIdMutation()

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

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
      form.reset()
    }
    toggleModalView()
  }

  // handle save purchase
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createPurchase({
        jsonData: {
          id: state?.editData?.id,
          category_id: userData?.category_id?.value,
          subcategory_id: userData?.subcategory_id?.value,
          item_id: userData?.item_id?.label,
          //   unit_name: userData?.unit_name?.label,
          pack_size: userData?.pack_size?.value,
          brand_id: userData?.brand_id?.value,
          price: userData?.price,
          quantity: userData?.quantity,
          contact_number: userData?.contact_number,
          person: userData?.person,
          shop_name: userData?.shop_name,
          payment_mode: userData?.payment_mode?.value,
          unit_id: userData?.unit_name?.label,
          purchase_date: userData?.purchase_date
            ? formatDate(userData?.purchase_date, 'YYYY-MM-DD')
            : undefined
        }
      })
    }
    // else {
    //   createPurchase({
    //     jsonData: {
    //       //   category_id: userData?.category_id?.value,
    //       //   subcategory_id: userData?.subcategory_id?.value,
    //       item_id: userData?.item_id?.value,
    //       unit_name: userData?.unit_name?.label,
    //       pack_size: userData?.pack_size?.value,
    //       brand_id: userData?.brand_id?.value,
    //       price: userData?.price,
    //       quantity: userData?.quantity,
    //       purchase_date: userData?.purchase_date
    //         ? formatDate(userData?.purchase_date, 'YYYY-MM-DD')
    //         : undefined
    //     }
    //   })
    // }
  }

  // load purchase list
  const loadPurchaseList = () => {
    loadPurchase({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle purchase create response
  useEffect(() => {
    if (!createPurchaseResponse.isUninitialized) {
      if (createPurchaseResponse.isSuccess) {
        closeAddModal()
        loadPurchaseList()
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

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<any>(
        {
          id: state?.editData?.id,
          quantity: state?.editData?.quantity,
          price: state?.editData?.price,
          unit_name: state.editData?.unit
            ? {
              label: state.editData?.unit?.name,
              value: state.editData?.unit?.id
            }
            : undefined,

          item_id: state?.editData?.product?.id
            ? {
              label: state.editData?.product?.name,
              value: state.editData?.product?.id
            }
            : undefined,
          category_id: state?.editData?.category?.id
            ? {
              label: state.editData?.category?.name,
              value: state.editData?.category?.id
            }
            : undefined,
          subcategory_id: state?.editData?.subcategory?.id
            ? {
              label: state.editData?.subcategory?.name,
              value: state.editData?.subcategory?.id
            }
            : undefined,
          shop_name: state?.editData?.shop_name,
          person: state?.editData?.person,
          contact_number: Number(state?.editData?.contact_number),
          payment_mode: state?.editData?.payment_mode
            ? {
              label:
                state?.editData?.payment_mode === 'cash'
                  ? 'Cash'
                  : state?.editData?.payment_mode === 'upi'
                    ? 'UPI'
                    : state?.editData?.payment_mode === 'udhaar'
                      ? 'Udhaar'
                      : '',
              value: state?.editData?.payment_mode
            }
            : undefined,
          pack_size: state?.editData?.packsize
            ? {
              label: state.editData?.packsize?.name,
              value: state.editData?.packsize?.id
            }
            : undefined,
          brand_id: state?.editData?.brand_id
            ? {
              label: state.editData?.brand?.name,
              value: state.editData?.brand?.id
            }
            : undefined,
          purchase_date: state?.editData?.date
            ? formatDate(state?.editData?.date, 'YYYY-MM-DD')
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  // handle pagination and load list
  useEffect(() => {
    loadPurchaseList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        start_date: e?.start_date ? e?.start_date : undefined,
        end_date: e?.end_date ? e?.end_date : undefined,
        unit_id: e?.unit_id?.value ? e?.unit_id?.value : undefined,
        brand_id: e?.brand_id?.value ? e?.brand_id?.value : undefined,
        item_id: e?.item_id?.value ? e?.item_id?.value : undefined,
        pack_size_id: e?.pack_size?.value ? e?.pack_size?.value : undefined,
        shop_name: e?.shop_name,
        category_id: e?.category_id?.value ? e?.category_id?.value : undefined,
        subcategory_id: e?.subcategory_id?.value ? e?.subcategory_id?.value : undefined
      },
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

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title={FM('add-purchase-stock')}>
            <NavLink
              className=''
              onClick={() => {
                navigate(getPath('purchase-items-create'))
              }}
            >
              <PlusCircle className={'ficon' + (modalAdd ? 'text-primary' : '')} />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd, canAddUser])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      purchaseDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action  result
  useEffect(() => {
    if (purchaseRestDelete?.isLoading === false) {
      if (purchaseRestDelete?.isSuccess) {
        emitAlertStatus('success', null, purchaseRestDelete?.originalArgs?.eventId)
      } else if (purchaseRestDelete?.error) {
        emitAlertStatus('failed', null, purchaseRestDelete?.originalArgs?.eventId)
      }
    }
  }, [purchaseRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<productsResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create Purchase Item modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Purchase Stock' : 'Create Purchase Stock'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createPurchaseResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Fragment>
                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    key={`${state?.editData?.item?.name}`}
                    control={form.control}
                    async
                    isClearable
                    label={FM('item')}
                    placeholder={FM('select-item')}
                    name='item_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.listWarehouseItem}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    onChangeValue={(e) => {
                      if (e?.extra !== undefined) {
                        form.watch(`item_id`)?.extra?.unit?.name
                          ? form.setValue(`unit_id`, {
                            label: form.watch(`item_id`)?.extra?.unit?.name
                              ? form.watch(`item_id`)?.extra?.unit?.name
                              : undefined,
                            value: form.watch(`item_id`)?.extra?.unit_id
                              ? form.watch(`item_id`)?.extra?.unit_id
                              : undefined
                          })
                          : undefined
                        form.watch(`item_id`)?.extra?.category?.name
                          ? form.setValue(`category_id`, {
                            label: form.watch(`item_id`)?.extra?.category?.name
                              ? form.watch(`item_id`)?.extra?.category?.name
                              : undefined,
                            value: form.watch(`item_id`)?.extra?.category?.id
                              ? form.watch(`item_id`)?.extra?.category?.id
                              : undefined
                          })
                          : undefined
                        form.watch(`item_id`)?.extra?.brand?.name
                          ? form.setValue(`brand_id`, {
                            label: form.watch(`item_id`)?.extra?.brand?.name
                              ? form.watch(`item_id`)?.extra?.brand?.name
                              : undefined,
                            value: form.watch(`item_id`)?.extra?.brand?.id
                              ? form.watch(`item_id`)?.extra?.brand?.id
                              : undefined
                          })
                          : undefined
                        form.watch(`item_id`)?.extra?.packsize?.name
                          ? form.setValue(`pack_size`, {
                            label: form.watch(`item_id`)?.extra?.packsize?.name
                              ? form.watch(`item_id`)?.extra?.packsize?.name
                              : undefined,
                            value: form.watch(`item_id`)?.extra?.packsize?.id
                              ? form.watch(`item_id`)?.extra?.packsize?.id
                              : undefined
                          })
                          : undefined
                        form.watch(`item_id`)?.extra?.subcategory?.name
                          ? form.setValue(`subcategory_id`, {
                            label: form.watch(`item_id`)?.extra?.subcategory?.name
                              ? form.watch(`item_id`)?.extra?.subcategory?.name
                              : undefined,
                            value: form.watch(`item_id`)?.extra?.subcategory?.id
                              ? form.watch(`item_id`)?.extra?.subcategory?.id
                              : undefined
                          })
                          : ''

                        form.setValue(
                          `rate`,
                          Number(form.watch(`item_id`)?.extra?.final_average_price)
                        )
                      } else {
                        form.resetField(`pack_size`)
                        form.resetField(`brand_id`)
                        form.resetField(`category_id`)
                        form.resetField(`subcategory_id`)
                        form.resetField(`unit_id`)
                        form.resetField(`rate`)
                      }

                      form.setValue(`unit_name`, {
                        label: form.watch(`item_id`)?.extra?.unit?.name,
                        value: form.watch(`item_id`)?.extra?.unit_id
                      })
                    }}
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>

                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    key={`${state?.editData?.brand?.name} -${form.watch(`item_id`)}`}
                    control={form.control}
                    async
                    isClearable
                    label={FM('brand')}
                    placeholder={FM('select-brand')}
                    name='brand_id'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.listBrands}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    jsonData={{ view_all: 'no' }}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    key={`${state?.editData?.packsize?.name} -${form.watch(`item_id`)}`}
                    control={form.control}
                    creatable
                    isClearable
                    label={FM('pack-size')}
                    name='pack_size'
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.packSizeList}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>

                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    key={`${form.watch(`item_id`)}`}
                    control={form.control}
                    isClearable
                    creatable
                    label={FM('category')}
                    name={`category_id`}
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.listWarehouseCategory}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>

                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    key={`${form.watch(`category_id`)} -${form.watch(`item_id`)}`}
                    control={form.control}
                    isClearable
                    creatable
                    label={FM('sub-category')}
                    name={`subcategory_id`}
                    loadOptions={loadDropdown}
                    path={ApiEndpoints.listWarehouseCategory}
                    selectLabel={(e) => `${e.name}  `}
                    selectValue={(e) => e.id}
                    jsonData={{
                      is_parent: form.watch(`category_id`)?.value
                    }}
                    defaultOptions
                    type='select'
                    className='mb-1'
                    rules={{ required: false }}
                  />
                </Col>

                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    control={form.control}
                    label={FM('quantity')}
                    name='quantity'
                    type='number'
                    className='mb-1'
                    rules={{ required: true }}
                  />
                </Col>
              </Fragment>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${state?.editData?.unit?.name}-${form.watch(`item_id`)}`}
                  control={form.control}
                  creatable
                  isClearable
                  label={FM('unit')}
                  name='unit_name'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('price')}
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' className=''>
                <FormGroupCustom
                  name={`shop_name`}
                  type={'text'}
                  label={'Shop Name'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false, min: 0 }}
                />
              </Col>
              <Col md='4' className='mt-1'>
                <FormGroupCustom
                  name={`person`}
                  type={'text'}
                  label={'Person Name'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false, min: 0 }}
                />
              </Col>
              <Col md='4' className='mt-1'>
                <FormGroupCustom
                  name={`contact_number`}
                  type={'number'}
                  label={'Contact Number'}
                  className='mb-0'
                  control={form.control}
                  rules={{ required: false }}
                  onChangeValue={(e) => {
                    const value = e.target.value

                    // Check if value length is less than 10 or more than 12
                    if (value.length < 10 || value.length > 12) {
                      form.setError(`contact_number`, {
                        type: 'manual',
                        message: 'Contact number must be between 10 and 12 digits'
                      })
                    } else {
                      form.clearErrors(`contact_number`)
                    }
                  }}
                />
              </Col>
              <Col md='4' className='mt-1'>
                <FormGroupCustom
                  control={form.control}
                  label={'Payment Mode'}
                  name={`payment_mode`}
                  selectOptions={createConstSelectOptions(PaymentModeWarehouse, FM)}
                  type='select'
                  className='mb-0'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12' className=''>
                <Label className='text-capitalize'>{FM('per-unit-price')}</Label>
                <div className='mt-1'>
                  {form.watch('price') || form.watch('quantity')
                    ? Number(form.watch('price')) / Number(form.watch('quantity'))
                    : 0}{' '}
                  (₹)
                </div>
              </Col>
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
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view purchase item modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.product?.name}
        done='edit'
        hideClose
        modalClass={'modal-lg'}
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          <Row>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('item')}</Label>
              <p className='text-capitalize'>{state?.selectedUser?.product?.name}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>{state?.selectedUser?.quantity ?? 'N/A'}</p>
            </Col>

            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('unit-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('price')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.price ?? 'N/A'} ₹</p>
            </Col>

            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('brand')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.brand?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('category')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.category?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.subcategory?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('pack-size')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.packsize?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('shop-name')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.shop_name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('person')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.person ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('contact-number')} </Label>
              <p className='text-capitalize'>{state?.selectedUser?.contact_number ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('purchase-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.purchase_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('update-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state?.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('documents')}</Label>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <div className='space-y-2'>
                {state?.selectedUser?.documents?.map((item: any, index: any) => {
                  // Extract file name from URL
                  const fileName = item.url.split('/').pop() || `Document-${index + 1}`

                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between border rounded p-2 bg-gray-50'
                    >
                      <Typography
                        variant='body1'
                        className='cursor-pointer text-primary truncate'
                        onClick={() => window.open(item.url, '_blank')}
                        title={fileName}
                      >
                        {item?.url}
                      </Typography>

                      {/* <IconButton
                        onClick={() => handleDownload(item.url, fileName)}
                        color='primary'
                      >
                        <DownloadIcon />
                      </IconButton> */}
                    </div>
                  )
                })}
              </div>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<any>[] = [
    {
      name: FM('item'),
      sortable: false,
      id: 'item',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              // setState({
              //     selectedUser: row
              // })
            }}
            className='text-primary text-capitalize'
          >
            {row?.product?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('quantity'),
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity}</Fragment>
    },

    {
      name: FM('unit'),
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: 'price (₹)',
      sortable: false,
      cell: (row) => <Fragment>{parseFloat(row?.price)}</Fragment>
    },
    {
      name: 'shop name',
      sortable: false,
      cell: (row) => <Fragment>{row?.shop_name}</Fragment>
    },
    {
      name: 'payment mode',
      sortable: false,
      cell: (row) => (
        <span
          className={`${row?.payment_mode === 'cash'
              ? 'text-primary text-capitalize'
              : row?.payment_mode === 'credit'
                ? 'text-red text-capitalize'
                : 'text-warning text-capitalize'
            }`}
        >
          {row?.payment_mode}
        </span>
      )
    },
    {
      name: 'purchase date',
      sortable: false,
      id: 'date',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.date)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row: any) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            {canReadUser ? (
              <>
                <UncontrolledTooltip placement='top' id='view' target='view'>
                  {FM('view')}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-secondary btn-sm'
                  id='view'
                  color='secondary'
                  onClick={() => {
                    setState({
                      selectedUser: row
                    })
                  }}
                >
                  <Eye size={14} />
                </Button>
              </>
            ) : (
              ''
            )}

            {/* {canEditUser ? (
              <>
                <UncontrolledTooltip placement='top' id='edit' target='edit'>
                  {FM('edit')}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-dark btn-sm'
                  id='edit'
                  color=''
                  onClick={() => {
                    toggleModalAdd()
                    setState({ editData: row, enableEdit: !state.enableEdit })
                  }}
                >
                  <Edit size={14} />
                </Button>
              </>
            ) : (
              ''
            )} */}

            {canDeleteUser ? (
              <>
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {FM('delete')}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-danger btn-sm'
                  eventId={`item-delete-${row?.id}`}
                  text={FM('are-you-sure')}
                  title={FM('delete-item', { name: row?.item?.name })}
                  onClickYes={() => {
                    handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Trash2 size={14} id='delete' />
                </ConfirmAlert>
              </>
            ) : (
              ''
            )}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]
  const onSuccessEvent = () => {
    reloadData()
  }

  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadPurchaseResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadPurchaseResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }

  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}

      <Header route={props?.route} icon={<List size='25' />} title='Purchase Stock'>
        <div className='me-2'>
          <PurchaseExport<ButtonProps>
            Tag={Button}
            responseData={() => {
              reloadData()
              setState({
                lastRefresh: new Date().getTime(),
                page: 1
              })
            }}
            className='btn btn-primary btn-sm d-flex align-items-center'
            size='sm'
            color='secondary'
          // title={FM('import')}
          >
            <div>
              <Download size='14' />
              <span className='align-middle ms-25'>{FM('export')}</span>
            </div>
          </PurchaseExport>
        </div>
        <ButtonGroup color='dark'>
          {canImportUser && (
            <PurchaseItemImport<ButtonProps>
              Tag={Button}
              responseData={() => {
                reloadData()
                setState({
                  lastRefresh: new Date().getTime(),
                  page: 1
                })
              }}
              className='btn btn-secondary btn-sm d-flex align-items-center'
              size='sm'
              color='secondary'
            // title={FM('import')}
            >
              <div>
                <Upload size='14' />
                <span className='align-middle ms-25'>{FM('import')}</span>
              </div>
            </PurchaseItemImport>
          )}

          <PurchaseFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadPurchaseResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<Purchase>
        initialPerPage={20}
        isLoading={loadPurchaseResponse?.isLoading}
        columns={columns}
        // options={options}
        hideSearch
        // hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadPurchaseResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadPurchaseResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default PurchaseItem
