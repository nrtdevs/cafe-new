import { yupResolver } from '@hookform/resolvers/yup'
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
import { screens, stock_operation } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
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
  Edit,
  Eye,
  List,
  Plus,
  PlusCircle,
  RefreshCcw,
  Repeat,
  Trash2,
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
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import { stockManagementResponseTypes } from '../../redux/RTKFiles/ResponseTypes'
import { useCreateOrUpdateproductMutation } from '../../redux/RTKFiles/cafe/ProductsRTK'
import {
  useCreateOrUpdatestockMutation,
  useDeleteStockManageByIdMutation,
  useLoadStockManagesMutation
} from '../../redux/RTKFiles/cafe/StockManagementRTK'
import StockFilter from './StockFilter'
import { getPath } from '@src/router/RouteHelper'
import { useNavigate } from 'react-router-dom'

// validation schema
const userFormSchema = {
  product_id: yup.object().typeError('This field is required').required(),
  unit_id: yup.object().typeError('This field is required').required(),
  stock_operation: yup.object().typeError('This field is required').required(),
  recieved_by: yup.object().typeError('This field is required').required(),
  resource: yup.object().typeError('This field is required').required(),
  brand_id: yup.object().required('brand  must be required').typeError('Brand must be required'),
  date: yup.string().required('This field is required'),
  bill_no: yup.string().trim().required('This field is required'),
  quantity: yup
    .number()
    .typeError('This field is required')
    .required('This field is required')
    .min(0)
}

// validate
const schema = yup.object(userFormSchema).required()

const productFormSchema = {
  category_id: yup.object().typeError('This field is required').required(),
  unit_id: yup.object().typeError('This field is required').required(),
  name: yup.string().required('This field is required'),
  current_quanitity: yup
    .number()
    .typeError('This field is required')
    .required('This field is required'),
  price: yup.number().typeError('This field is required').required('This field is required'),
  alert_quanitity: yup
    .number()
    .typeError('This field is required')
    .required('This field is required')
}

// validate
const productSchema = yup.object(productFormSchema).required()

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: stockManagementResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: stockManagementResponseTypes = {
  product_id: '',
  unit_id: '',
  quantity: '',
  stock_operation: '',
  resource: '',
  unit: '',
  price: ''
}

const StockManage = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add stock
  const canAddUser = Can(Permissions.stockCreate)
  // can edit stock
  const canEditUser = Can(Permissions.stockEdit)
  // can delete stock
  const canDeleteUser = Can(Permissions.stockDelete)

  //can read stock
  const canReadUser = Can(Permissions.stockRead)

  //can add product
  const canAddProduct = Can(Permissions.productCreate)

  // form hook
  const form = useForm<stockManagementResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // product form hook
  const productForm = useForm<{
    category_id: any
    subcategory_id: any
    name: string
    current_quanitity: string
    price: string
    alert_quanitity: string
    unit_id: any
    description: string
    image_path: string
  }>({
    resolver: yupResolver(productSchema)
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  //toggle Add Product
  const [modalAddProduct, toggleModalAddProduct] = useModal()
  // create or update stock mutation
  const [createStock, createStockResponse] = useCreateOrUpdatestockMutation()
  // load stocks
  const [loadStockManage, loadStockManageResponse] = useLoadStockManagesMutation()
  // create or update product mutation
  const [createProduct, createProductResponse] = useCreateOrUpdateproductMutation()
  // delete stock mutation
  const [stockDelete, stockRestDelete] = useDeleteStockManageByIdMutation()

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

  //navigation
  const navigate = useNavigate()

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    form.reset()
    toggleModalAdd()
  }

  //close add product
  const closeAddProductModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    productForm.reset()
    toggleModalAddProduct()
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

  //update stock

  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<stockManagementResponseTypes>(
        {
          quantity: state.editData?.quantity,
          price: state.editData?.price,
          shop_name: state.editData?.shop_name,
          bill_no: state.editData?.bill_no,
          address: state.editData?.address,
          date: state.editData?.date,
          purchase_by: state.editData?.purchase_by,
          recieved_by: state.editData?.recieved_by
            ? {
              label: state.editData?.recieved_by?.name,
              value: state.editData?.recieved_by?.id
            }
            : undefined,
          product_id: state.editData?.product_id
            ? {
              label: state.editData?.product?.name,
              value: state.editData?.product_id
            }
            : undefined,
          unit_id: state.editData?.unit_id
            ? {
              label: state.editData?.unit?.name,
              value: state.editData?.unit_id
            }
            : undefined,
          stock_operation: state.editData?.stock_operation
            ? {
              label: state.editData?.stock_operation,
              value: state.editData?.stock_operation
            }
            : undefined,
          resource: state.editData?.resource
            ? {
              label: state.editData?.resource,
              value: state.editData?.resource
            }
            : undefined,
          category_id: state.editData?.category_id
            ? {
              label: state.editData?.category?.name,
              value: state.editData?.category?.id
            }
            : undefined,
          subcategory_id: state.editData?.subcategory_id
            ? {
              label: state.editData?.subcategory?.name,
              value: state.editData?.subcategory?.id
            }
            : undefined,
          brand_id: state.editData?.brand_id
            ? {
              label: state.editData?.brand?.name,
              value: state.editData?.brand?.id
            }
            : undefined,
          pack_size_id: state.editData?.pack_size_id
            ? {
              label: state.editData?.packsize?.name,
              value: state.editData?.packsize?.id
            }
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])
  // handle save user
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      createStock({
        jsonData: {
          ...state?.editData,
          ...userData,
          unit_id: userData?.unit_id?.value,
          stock_operation: userData?.stock_operation?.value,
          product_id: userData?.product_id?.value,
          category_id: userData?.category_id?.value,
          subcategory_id: userData?.subcategory_id?.value,

          pack_size_id: userData?.pack_size_id?.value,
          brand_id: userData?.brand_id?.value,
          resource: userData?.resource?.value,
          recieved_by: userData?.recieved_by?.value
        }
      })
    } else {
      createStock({
        jsonData: {
          ...userData,
          unit_id: userData?.unit_id?.value,
          stock_operation: userData?.stock_operation?.value,
          product_id: userData?.product_id?.value,
          resource: userData?.resource?.value,
          recieved_by: userData?.recieved_by?.value,
          category_id: userData?.category_id?.value,
          subcategory_id: userData?.subcategory_id?.value,

          pack_size_id: userData?.pack_size_id?.value,
          brand_id: userData?.brand_id?.value
        }
      })
    }
  }

  // load Stock list
  const loadStockList = () => {
    loadStockManage({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        product: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  //set the stock unit value

  useEffect(() => {
    if (state.editData) {
    } else {
      if (form.watch('product_id')) {
        form.setValue('unit_id', {
          label: form.watch(`product_id`)?.extra?.unit?.name ?? '',
          value: form.watch(`product_id`)?.extra?.unit_id
        })
      } else {
        form.setValue('unit_id', {
          label: undefined,
          value: undefined
        })
      }
    }
  }, [form.watch('product_id')])

  // handle user create response
  useEffect(() => {
    if (!createStockResponse.isUninitialized) {
      if (createStockResponse.isSuccess) {
        closeAddModal()
        loadStockList()
        SuccessToast(
          state?.editData?.id ? 'Updated Stock Successfully' : 'Created Stock Successfully'
        )
      } else if (createStockResponse.isError) {
        // handle error
        const errors: any = createStockResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createStockResponse])

  // handle pagination and load list
  useEffect(() => {
    loadStockList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, product_id: e?.product_id?.value, resource: e?.resource?.value },
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
          <BsTooltip title='Add Stock'>
            <NavLink className='' onClick={toggleModalAdd}>
              <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
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
      stockDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (stockRestDelete?.isLoading === false) {
      if (stockRestDelete?.isSuccess) {
        emitAlertStatus('success', null, stockRestDelete?.originalArgs?.eventId)
      } else if (stockRestDelete?.error) {
        emitAlertStatus('failed', null, stockRestDelete?.originalArgs?.eventId)
      }
    }
  }, [stockRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<stockManagementResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create stock modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Stock Manage' : 'Create Stock Manage'}
        handleModal={closeAddModal}
        scrollControl={true}
        modalClass={'modal-lg'}
        loading={createStockResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${state?.editData?.brand?.name}`}
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
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${state?.editData?.packsize?.name}`}
                  control={form.control}
                  creatable
                  isClearable
                  label={FM('pack-size')}
                  name='pack_size_id'
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
              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={state.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label='product'
                  name='product_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.products}
                  selectLabel={(e) => `${e.name}`}
                  selectValue={(e) => e.id}
                  defaultOptions
                  onChangeValue={() => {
                    form.setValue(`unit_id`, {
                      label: form.watch(`product_id`)?.extra?.unit?.name,
                      value: form.watch(`product_id`)?.extra?.unit_id
                    }),
                      form.setValue(`category_id`, {
                        label: form.watch(`product_id`)?.extra?.category?.name,
                        value: form.watch(`product_id`)?.extra?.category?.id
                      })
                    form.setValue(`subcategory_id`, {
                      label: form.watch(`product_id`)?.extra?.subcategory?.name,
                      value: form.watch(`product_id`)?.extra?.subcategory?.id
                    })
                  }}
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label={FM('category')}
                  name='category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1 pointer-events-none'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={`${form.watch('category_id')}`}
                  control={form.control}
                  async
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
                  className='mb-1 pointer-events-none'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={state.editData?.id}
                  control={form.control}
                  label='Quantity'
                  name='quantity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true, min: 0 }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  key={form.watch('product_id')}
                  control={form.control}
                  async
                  label='unit'
                  name='unit_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  defaultValue
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='price'
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'stock operation'}
                  name='stock_operation'
                  type='select'
                  selectOptions={createConstSelectOptions(stock_operation, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'resource'}
                  name='resource'
                  type='select'
                  selectOptions={createConstSelectOptions(screens, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='Shop Name'
                  name='shop_name'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='Date'
                  name='date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('bill-no')}
                  name='bill_no'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('purchase-by')}
                  name='purchase_by'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='4' lg='4' sm='6' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('recieved-by')}
                  name='recieved_by'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.employeList}
                  selectLabel={(e) => `${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('shop-address')}
                  name='address'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.product?.name}
        done='edit'
        modalClass={'modal-lg'}
        hideClose
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
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('product')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.product?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.quantity ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('unit-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('price')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.price ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.subcategory?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('brand')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.brand?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('pack-size')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.packsize?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('resource')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.resource ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('stock-operation')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.stock_operation ?? 'N/A'}</p>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase fw-bold  mb-25'>{FM('shopping-detail')}</Label>
              <hr />
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('shop-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.shop_name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('shopping-date')}</Label>
              <p className='text-capitalize'>{formatDate(state.selectedUser?.date) ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('bill-no')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.bill_no ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('purchase-by')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.purchase_by ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('received-by')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.recieved_by?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{'Transferred From'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.transfer_info?.name ?? 'N/A'}</p>
            </Col>
            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('address')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('update-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<stockManagementResponseTypes>[] = [
    {
      name: 'product',
      sortable: false,
      id: 'name',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              setState({
                selectedUser: row
              })
            }}
            className='text-primary text-capitalize'
          >
            {row?.product?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'Quantity',
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity}</Fragment>
    },

    {
      name: 'unit',
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: 'price',
      sortable: false,
      cell: (row) => <Fragment>{row?.price}</Fragment>
    },
    {
      name: 'operation',
      sortable: false,
      cell: (row) => <Fragment>{row?.stock_operation}</Fragment>
    },
    {
      name: 'Transferred From',
      sortable: false,
      cell: (row) => <Fragment>{row?.transfer_info?.name}</Fragment>
    },

    {
      name: 'Created Date',
      sortable: false,
      id: 'Created Date',
      minWidth: '170px',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.created_at)}</Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            {canReadUser ? (
              <>
                <UncontrolledTooltip placement='top' id='view' target='view'>
                  {'view'}
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

            {canEditUser ? (
              <>
                <UncontrolledTooltip placement='top' id='edit' target='edit'>
                  {'edit'}
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
              <></>
            )}

            {canDeleteUser ? (
              <>
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {'delete'}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-danger btn-sm'
                  eventId={`item-delete-${row?.id}`}
                  text={FM('are-you-sure')}
                  title={FM('delete-item', { name: row?.product?.name })}
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
  const options: TableDropDownOptions = (selectedRows) => [
    {
      IF: canDeleteUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<Trash2 size={14} />}
          onDropdown
          eventId={`item-delete`}
          text={FM('are-you-sure')}
          title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'delete', 'item-delete')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('delete')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserCheck size={14} />}
          onDropdown
          eventId={`item-active`}
          text={FM('are-you-sure')}
          title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'active', 'item-active')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('activate')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserX size={14} />}
          onDropdown
          eventId={`item-inactive`}
          text={FM('are-you-sure')}
          title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('inactivate')}
        </ConfirmAlert>
      )
    }
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadStockManageResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadStockManageResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }

  // handle user create response
  useEffect(() => {
    if (!createProductResponse.isUninitialized) {
      if (createProductResponse.isSuccess) {
        closeAddProductModal()
        loadStockList()
        SuccessToast(
          state?.editData?.id ? 'Updated Product Successfully' : 'Created  Product Successfully'
        )
      } else if (createProductResponse.isError) {
        // handle error
        const errors: any = createProductResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, productForm.setError)
      }
    }
  }, [createProductResponse])

  //handel submit

  const handleProductSave = (userData: any) => {
    log(userData)
    createProduct({
      jsonData: {
        ...userData,
        unit_id: userData?.unit_id?.value,
        category_id: userData?.category_id?.value,
        subcategory_id: userData?.subcategory_id?.value,
        image_path: userData?.image_path[0]?.file_name ? userData?.image_path[0]?.file_name : ''
      }
    })
  }

  // create product modal
  const renderCreateProductModal = () => {
    return (
      <CenteredModal
        open={modalAddProduct}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Product' : 'Create Product'}
        handleModal={closeAddProductModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createProductResponse.isLoading}
        handleSave={productForm.handleSubmit(handleProductSave)}
      >
        <div className='p-2'>
          <Form onSubmit={productForm.handleSubmit(handleProductSave)}>
            <Row>
              <Col md='6'>
                <FormGroupCustom
                  control={productForm.control}
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
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  key={`${productForm.watch('category_id')}`}
                  control={productForm.control}
                  async
                  isClearable
                  label={FM('sub-category')}
                  name='subcategory_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    is_parent: productForm.watch('category_id')?.value
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  label={FM('current-quantity')}
                  name='current_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  label='buy price'
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  label={FM('alert-quantity')}
                  name='alert_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  async
                  label='unit'
                  name='unit_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name} | ${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={productForm.control}
                  label={FM('description')}
                  name='description'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='12' lg='12' sm='12' xs='12' className=''>
                <FormGroupCustom
                  control={productForm.control}
                  label={'Upload image'}
                  name='image_path'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>

              {state?.editData?.image_path ? (
                <Col md='12'>
                  <img src={state?.editData?.image_path} width={'100'} height={'100'} />
                </Col>
              ) : (
                ''
              )}
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }
  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}
      {renderCreateProductModal()}

      <Header route={props?.route} icon={<List size='25' />} title='Stock Manage'>
        <div className='me-2'>
          <Button
            // tooltip={FM('add-product')}
            // loading={loadStockManageResponse.isLoading}
            size='sm'
            color='primary'
            onClick={() => {
              navigate(getPath('stock-receive'))
            }}
          >
            <Repeat size={14} /> {FM('stock-transfer-receiving')}
          </Button>
        </div>

        <ButtonGroup color='dark'>
          <StockFilter handleFilterData={handleFilterData} />
          {canAddProduct ? (
            <>
              <LoadingButton
                tooltip={FM('add-product')}
                loading={loadStockManageResponse.isLoading}
                size='sm'
                color='secondary'
                onClick={toggleModalAddProduct}
              >
                <Plus size={14} />
              </LoadingButton>
            </>
          ) : (
            ''
          )}

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadStockManageResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<stockManagementResponseTypes>
        initialPerPage={20}
        isLoading={loadStockManageResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search'
        onSort={handleSort}
        defaultSortField={loadStockManageResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadStockManageResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default StockManage
