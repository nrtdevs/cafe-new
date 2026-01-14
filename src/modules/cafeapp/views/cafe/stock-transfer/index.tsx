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
import { Resource, stock_operation } from '@src/utility/Const'
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
import { Eye, List, Plus, PlusCircle, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
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

import { stockManagementResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import { useCreateOrUpdateproductMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/ProductsRTK'
import {
  useCreateOrUpdatestockMutation,
  useDeleteStockManageByIdMutation,
  useLoadStockManagesMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/StockManagementRTK'
import StockFilter from '../../stockmanage/StockFilter'
// import StockFilter from './StockFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
  // price: yup.number()
  //     .positive("Must be more than 0")
  //     .integer("Must be more than 0")
  //     .required("This field is required"),
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
  selectedUser?: stockManagementResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: stockManagementResponseTypes = {
  product_id: '',
  unit_id: '',
  quantity: '',
  transfer_cafe_id: '',
  stock_operation: {
    label: 'Out',
    value: 'Out'
  },

  resource: {
    label: 'Transfer',
    value: 'Transfer'
  },
  unit: '',
  price: '',
  comment: ''
}
const StockTransfer = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add stock
  const canAddUser = Can(Permissions.stockTransferCreate)
  // can edit stock
  const canEditUser = Can(Permissions.stockTransferEdit)
  // can delete stock
  const canDeleteUser = Can(Permissions.stockTransferDelete)
  //can read stock
  const canReadUser = Can(Permissions.stockTransferRead)

  //can add Product
  const canAddProduct = Can(Permissions.productCreate)

  // form hook
  const form = useForm<stockManagementResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  //toggle Add Product
  const [modalAddProduct, toggleModalAddProduct] = useModal()
  // create or update user mutation

  const [createStock, createStockResponse] = useCreateOrUpdatestockMutation()
  // load users

  const [loadStockManage, loadStockManageResponse] = useLoadStockManagesMutation()

  // create or update user mutation
  const [createProduct, createProductResponse] = useCreateOrUpdateproductMutation()

  // delete mutation

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
    form.reset()
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
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  // handle save stock transfer
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      createStock({
        jsonData: {
          ...state?.editData,
          ...userData,
          unit_id: userData?.unit_id?.value,
          stock_operation: userData?.stock_operation?.value,
          product_id: userData?.product_id?.value,
          resource: userData?.resource?.value,
          recieved_by: userData?.recieved_by?.value,
          transfer_cafe_id: userData?.transfer_cafe_id?.value
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
          transfer_cafe_id: userData?.transfer_cafe_id?.value
        }
      })
    }
  }

  // load stock transfer list
  const loadStockTransferList = () => {
    loadStockManage({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        product: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        resource: 'Transfer'
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

  // handle stock transfer create response
  useEffect(() => {
    if (!createStockResponse.isUninitialized) {
      if (createStockResponse.isSuccess) {
        closeAddModal()
        loadStockTransferList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Stock Transfer Successfully'
            : 'Created Stock Transfer Successfully'
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
    loadStockTransferList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, product_id: e?.product_id?.value },
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
          <BsTooltip title='Add Transfer'>
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

  // create stock transfer modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Update Stock Transfer' : 'Create Stock Transfer'}
        handleModal={closeAddModal}
        scrollControl={false}
        modalClass={'modal-lg'}
        loading={createStockResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label='product'
                  placeholder='Select Product'
                  name='product_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.products}
                  selectLabel={(e) => `${e.name}`}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state.editData?.id}
                  control={form.control}
                  label='Quantity'
                  name='quantity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true, min: 0 }}
                  onChangeValue={(e) => {
                    let value = e.target.value
                    let stock = Number(form.watch('product_id')?.extra?.current_quanitity)

                    if (value > stock) {
                      // Show error message
                      form.setError(`quantity` as any, {
                        type: 'manual',
                        message: `Quantity cannot be more than available stock (${stock})`
                      })
                    } else {
                      // Clear error if within limit
                      form.clearErrors(`quantity` as any)
                    }

                    // Optionally update value in form state if you need
                    form.setValue(`quantity`, value)
                  }}
                />
                {form.watch('product_id')?.extra?.current_quanitity ? (
                  <>
                    <p> current Quantity:{form.watch('product_id')?.extra?.current_quanitity}</p>
                  </>
                ) : (
                  ''
                )}
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={form.watch('product_id')}
                  control={form.control}
                  async
                  label='unit'
                  placeholder='Select Unit'
                  name='unit_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.unitList}
                  selectLabel={(e) => `${e.name} | ${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  defaultValue
                  type='select'
                  className='mb-1 pointer-events-none'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='price'
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  isDisabled
                  control={form.control}
                  label={'stock operation'}
                  name='stock_operation'
                  type='select'
                  selectOptions={createConstSelectOptions(stock_operation, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  isDisabled
                  control={form.control}
                  label={'resource'}
                  name='resource'
                  type='select'
                  selectOptions={createConstSelectOptions(Resource, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  key={state.editData?.id}
                  control={form.control}
                  async
                  isClearable
                  label='Transfer cafe'
                  placeholder='Select cafe'
                  name='transfer_cafe_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.subCafeList}
                  selectLabel={(e) => `${e.name}`}
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
                  label='Date'
                  name='date'
                  type='date'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              {/* <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('bill-no')}
                                    name='bill_no'
                                    type='number'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col> */}

              {/* <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('purchase-by')}
                                    name='purchase_by'
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col> */}
              {/* 
                            const [ImgSingle, setImgSingle] = useState()
                          useEffect(() => {
                                setValue("image", ImgSingle)
                            }, [ImgSingle])

                        const handleImageSingle = (e) => {

                           if (e.target.files) {

                                setImgSingle(e.target.files[0])
                            }
                             } */}

              {/* <Col md='4'>
                                <FormGroupCustom
                                    control={form.control}
                                    async
                                    isClearable
                                    label={FM('recieved-by')}
                                    name='recieved_by'
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.employeList}
                                    selectLabel={(e) => `${e.name} | ${e.name} `}
                                    selectValue={(e) => e.id}
                                    defaultOptions
                                    type='select'
                                    className='mb-1'
                                    rules={{ required: false }}
                                />
                            </Col> */}
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
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('comment')}
                  name='comment'
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

  // view stock transfer modal
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
              <Label className='text-uppercase mb-25'>{FM('resource')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.resource ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('stock-operation')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.stock_operation ?? 'N/A'}</p>
            </Col>

            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase fw-bold  mb-25'>{FM('transfer-info')}</Label>
              <hr />
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('cafe-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.transfer_info?.name ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('mobile')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.transfer_info?.mobile ?? 'N/A'}
              </p>
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

            <Col md='12' lg='12' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('address')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('comment')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.comment ?? 'N/A'}</p>
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
      name: 'cafe name',
      sortable: false,
      cell: (row) => <Fragment>{row?.transfer_info?.name}</Fragment>
    },
    {
      name: 'operation',
      sortable: false,
      cell: (row) => <Fragment>{row?.stock_operation}</Fragment>
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
        loadStockTransferList()
        SuccessToast(
          state?.editData?.id ? 'Updated Product Successfully' : 'Created  Product Successfully'
        )
      } else if (createProductResponse.isError) {
        // handle error
        const errors: any = createProductResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createProductResponse])

  //handel submit
  const handleProductSave = (userData: any) => {
    createProduct({
      jsonData: {
        ...userData,
        unit_id: userData?.unit_id?.value,
        category_id: userData?.category_id?.value,
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
        handleSave={form.handleSubmit(handleProductSave)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleProductSave)}>
            <Row>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('current-quantity')}
                  name='current_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label='buy price'
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('alert-quantity')}
                  name='alert_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
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

              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('description')}
                  name='description'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='12' className=''>
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
  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}
      {renderCreateProductModal()}

      <Header route={props?.route} icon={<List size='25' />} title='Stock Transfer'>
        <ButtonGroup color='dark'>
          <StockFilter handleFilterData={handleFilterData} />

          {/* {canAddProduct ? (
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
          )} */}

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
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadStockManageResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadStockManageResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default StockTransfer
