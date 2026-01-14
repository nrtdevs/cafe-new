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
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
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
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Badge,
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
import { productsResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateproductMutation,
  useDeleteProductByIdMutation,
  useDownLoadProductsMutation,
  useLoadProductsMutation
} from '../../../redux/RTKFiles/cafe/ProductsRTK'
import ProductFilter from './ProductFilter'

// validation schema
const userFormSchema = {
  name: yup.string().min(2, 'min length!').max(50, 'max length!'),
  current_quanitity: yup
    .number()
    .typeError('Current Quantity must be a number')
    .required('Please provide plan cost.')
    .min(0),

  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Please provide plan cost.')
    .min(0),

  alert_quanitity: yup
    .number()
    .typeError('Alert Quantity must be a number')
    .required('Please provide plan cost.')
    .min(0),

  category_id: yup
    .object()
    .required('Category must be required')
    .typeError('Category must be required')
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
  selectedUser?: productsResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: productsResponseTypes = {
  name: '',
  unit_id: '',
  description: '',
  image_path: '',
  current_quanitity: '',
  alert_quanitity: '',
  status: '',
  create_menu: false,
  category_id: '',
  quantity: 1,
  price: '',
  priority_rank: '',
  order_duration: ''
}
const Product = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add product
  const canAddUser = Can(Permissions.productCreate)
  // can edit product
  const canEditUser = Can(Permissions.productEdit)
  // can delete product
  const canDeleteUser = Can(Permissions.productDelete)
  // can read product
  const canReadUser = Can(Permissions.productRead)

  // form hook
  const form = useForm<productsResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation
  const [createProduct, createProductResponse] = useCreateOrUpdateproductMutation()
  // load users
  const [loadProduct, loadProductResponse] = useLoadProductsMutation()
  // delete mutation
  const [productDelete, productRestDelete] = useDeleteProductByIdMutation()

  //download products
  const [downloadProducts, downloadProductsResponse] = useDownLoadProductsMutation()

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

  // handle save user
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createProduct({
        jsonData: {
          ...state?.editData,
          ...userData,
          unit_id: userData?.unit_id?.value,
          category_id: userData?.category_id?.value,
          subcategory_id: userData?.subcategory_id?.value,

          image_path: userData?.image_path
            ? userData?.image_path[0]?.file_name
            : state?.editData?.image_path
            ? state?.editData?.image_path
            : ''
        }
      })
    } else {
      if (
        (userData?.create_menu === 1 && Number(userData?.menu_price) >= userData?.price) ||
        (userData?.create_menu === false && userData?.price)
      ) {
        createProduct({
          jsonData: {
            ...userData,
            create_menu: userData?.create_menu === 1 ? 'true' : userData?.create_menu,
            unit_id: userData?.unit_id?.value,
            category_id: userData?.category_id?.value,
            is_product_monitoring: userData?.is_product_monitoring === 1 ? 'true' : 'false',
            subcategory_id: userData?.subcategory_id?.value,
            quantity: userData?.create_menu === 1 ? 1 : 0,
            image_path: userData?.image_path[0]?.file_name ? userData?.image_path[0]?.file_name : ''
          }
        })
      } else {
        toast.error('Please Purchase Only If The price is lower than  menu price')
      }
    }
  }

  // load product list
  const loadProductList = () => {
    loadProduct({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle product create response
  useEffect(() => {
    if (!createProductResponse.isUninitialized) {
      if (createProductResponse.isSuccess) {
        closeAddModal()
        loadProductList()
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-product-successfully')}</>
          ) : (
            <>{FM('created-product-successfully')}</>
          )
        )
      } else if (createProductResponse.isError) {
        // handle error
        const errors: any = createProductResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createProductResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<productsResponseTypes>(
        {
          id: state?.editData?.id,
          name: state.editData?.name,
          current_quanitity: state?.editData?.current_quanitity,
          menu_price: state?.editData?.menu_price,
          price: state?.editData?.price,
          alert_quanitity: state?.editData?.alert_quanitity,
          description: state?.editData?.description,
          status: state?.editData?.status,
          unit_id: state.editData?.unit_id
            ? {
                label: state.editData?.unit?.name,
                value: state.editData?.unit_id
              }
            : undefined,
          category_id: state?.editData?.category_id
            ? {
                label: state.editData?.category?.name,
                value: state.editData?.category?.id
              }
            : undefined,
          subcategory_id: state?.editData?.subcategory_id
            ? {
                label: state.editData?.subcategory?.name,
                value: state.editData?.subcategory?.id
              }
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
    loadProductList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, unit_id: e?.unit_id?.value },
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
          <BsTooltip title={FM('add-product')}>
            <NavLink className='' onClick={toggleModalAdd}>
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
      productDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (productRestDelete?.isLoading === false) {
      if (productRestDelete?.isSuccess) {
        emitAlertStatus('success', null, productRestDelete?.originalArgs?.eventId)
      } else if (productRestDelete?.error) {
        emitAlertStatus('failed', null, productRestDelete?.originalArgs?.eventId)
      }
    }
  }, [productRestDelete])

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

  // create product modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Product' : 'Create Product'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createProductResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              {state?.editData ? (
                ''
              ) : (
                <>
                  <Col md='6'>
                    <FormGroupCustom
                      defaultValue={'false'}
                      control={form.control}
                      label={FM('without-recipes-create-menu')}
                      name={`create_menu`}
                      type='checkbox'
                      className='mb-2 fw-bold text-black'
                      inputClassName={''}
                      rules={{ required: false }}
                    />
                  </Col>
                </>
              )}

              {form.watch('create_menu') ? (
                <Fragment>
                  <Col md='6' lg='6' sm='12' xs='12'>
                    <FormGroupCustom
                      control={form.control}
                      async
                      label={FM('category')}
                      name='category_id'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.categories}
                      selectLabel={(e) => `${e.name}  `}
                      selectValue={(e) => e.id}
                      defaultOptions
                      type='select'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>

                  <Col md='6' lg='6' sm='12' xs='12'>
                    <FormGroupCustom
                      control={form.control}
                      isDisabled={true}
                      placeholder='1'
                      label={FM('quantity')}
                      name='quantity'
                      type='number'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>

                  <Col md='6' lg='6' sm='12' xs='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('menu-price')}
                      name='menu_price'
                      type='number'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>

                  <Col md='6' lg='6' sm='12' xs='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('priority-rank')}
                      name='priority_rank'
                      type='number'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>

                  <Col md='6' lg='6' sm='12' xs='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('order-duration')}
                      name='order_duration'
                      type='number'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>
                </Fragment>
              ) : (
                ''
              )}
              <Col md='6'>
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
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
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

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('current-quantity')}
                  name='current_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('buy-price')}
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('alert-quantity')}
                  name='alert_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('unit')}
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
                  control={form.control}
                  label={FM('description')}
                  name='description'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='12' lg='12' sm='12' xs='12' className=''>
                <FormGroupCustom
                  control={form.control}
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

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.name}
        done='edit'
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
              <Label className='text-uppercase mb-25'>{FM('category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.subcategory?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('brand')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.brand?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('pack-size')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.packsize?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.current_quanitity ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('alert-quantity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.alert_quanitity ?? 'N/A'}</p>
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
            {state?.selectedUser?.image_path ? (
              <Col md='6' lg='6' sm='12' xs='12'>
                <Label className='text-uppercase mb-25'>{FM('image')}</Label>
                <p className='text-capitalize'>
                  <img src={state?.selectedUser?.image_path} width={'100'} height={'100'} />
                </p>
              </Col>
            ) : (
              ''
            )}
          </Row>
          <div>
            <Label className='text-uppercase mb-25'>{FM('description')}</Label>
            <p className='text-capitalize'>{state.selectedUser?.description ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<productsResponseTypes>[] = [
    {
      name: FM('name'),
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
            {row?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('quantity'),
      sortable: false,
      cell: (row) => <Fragment>{parseFloat(row?.current_quanitity).toFixed(3)}</Fragment>
    },
    {
      name: 'alert qty',
      sortable: false,

      cell: (row) => (
        <Fragment>
          {row?.current_quanitity <= row?.alert_quanitity ? (
            <Badge className='danger' color='danger'>
              Low {row?.alert_quanitity}
            </Badge>
          ) : (
            <Badge className='success' color='success'>
              High {row?.alert_quanitity}
            </Badge>
          )}
        </Fragment>
      )
    },
    {
      name: FM('unit'),
      sortable: false,
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: FM('category'),
      sortable: false,
      cell: (row) => <Fragment>{row?.category?.name}</Fragment>
    },

    {
      name: FM('sub-category'),
      sortable: false,
      cell: (row) => <Fragment>{row?.subcategory?.name}</Fragment>
    },
    {
      name: 'Created Date',
      sortable: false,
      id: 'Created Date',
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
          {/* <DropDownMenu
                        options={[
                            {
                                icon: <Eye size={'14'} />,
                                name: 'View',
                                onClick: () => {
                                    setState({
                                        selectedUser: row
                                    })
                                }
                            },
                            {
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                onClick: () => {
                                    toggleModalAdd()
                                    setState({ editData: row, enableEdit: !state.enableEdit })
                                }
                            },
                            {
                                IF: canDeleteUser,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.name })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('delete')}
                                    </ConfirmAlert>
                                )
                            }

                        ]}
                    /> */}
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

            {canEditUser ? (
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
              <> </>
            )}

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
                  title={FM('delete-item', { name: row?.name })}
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
              <> </>
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
            loadProductResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadProductResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }

  const downloadData = () => {
    downloadProducts({
      jsonData: {
        data: downloadProductsResponse?.data
      }
    })
  }

  // handle user create response
  useEffect(() => {
    if (downloadProductsResponse.isSuccess) {
      SuccessToast('Product exported Successfully')
      const url = downloadProductsResponse?.data?.payload[0].file_name
      const d = window.open(url, '_blank')
    }
  }, [downloadProductsResponse])

  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}

      <Header route={props?.route} icon={<List size='25' />} title='Product'>
        <ButtonGroup color='dark'>
          <LoadingButton
            tooltip={FM('download')}
            loading={downloadProductsResponse.isLoading}
            size='sm'
            color='secondary'
            onClick={downloadData}
          >
            <Download size='14' />
          </LoadingButton>
          <ProductFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadProductResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<productsResponseTypes>
        initialPerPage={20}
        isLoading={loadProductResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadProductResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadProductResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Product
