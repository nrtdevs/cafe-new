import { yupResolver } from '@hookform/resolvers/yup'
import {
  productsResponseTypes,
  WarehouseItemType
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateItemMutation,
  useDeleteItemByIdMutation,
  useLoadItemsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/WarehouseItemRTK'
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
  emitAlertStatus,
  FM,
  formatDate,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues,
  SuccessToast
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
  PlusCircle,
  RefreshCcw,
  Trash2,
  Upload,
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'

import {
  Badge,
  Button,
  ButtonGroup,
  ButtonProps,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import ItemFilter from './ItemFilter'
import ItemImport from './ItemImport'

// validation schema
const userFormSchema = {
  category_name: yup
    .object()
    .required('Category must be required')
    .typeError('Category must be required'),
  name: yup.string().trim().typeError('Name is required').required('Name is required'),
  unit_name: yup.object().required('Unit must be required').typeError('Unit must be required'),
  brand_name: yup.object().required('Brand must be required').typeError('Brand must be required'),
  packsize_name: yup.object().required('Pack Size must be required').typeError('Pack Size must be required'),
  subcategory_name: yup.object().required('Sub Category must be required').typeError('Sub Category must be required'),
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
    .min(0)
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
  selectedUser?: WarehouseItemType
  enableEdit?: boolean
  editData?: any
}

//defaultValues
const defaultValues: any = {
  category_id: '',
  subcategory_id: '',
  name: ''
}

const WarehouseItem = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add product
  const canAddUser = Can(Permissions.itemCreate)
  // can edit product
  const canEditUser = Can(Permissions.itemEdit)
  // can delete product
  const canDeleteUser = Can(Permissions.itemDelete)
  // can read product
  const canReadUser = Can(Permissions.itemRead)

  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation
  const [createItem, createItemResponse] = useCreateOrUpdateItemMutation()
  // load users
  const [loadItem, loadItemResponse] = useLoadItemsMutation()
  // delete mutation
  const [itemDelete, itemRestDelete] = useDeleteItemByIdMutation()

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

  // handle save item
  const handleSaveUser = (userData: any) => {
    if (isValid(state?.editData?.id && state?.editData?.id)) {
      createItem({
        jsonData: {
          id: state?.editData?.id,
          category_name: userData?.category_name?.label,
          subcategory_name: userData?.subcategory_name?.label,
          unit_name: userData?.unit_name?.label,
          brand_name: userData?.brand_name?.label,
          packsize_name: userData?.packsize_name?.label,
          name: userData?.name,
          current_quanitity: userData?.current_quanitity,
          price: userData?.price,
          alert_quanitity: userData?.alert_quanitity
        }
      })
    } else {
      createItem({
        jsonData: {
          category_name: userData?.category_name?.label,
          subcategory_name: userData?.subcategory_name?.label,
          unit_name: userData?.unit_name?.label,
          brand_name: userData?.brand_name?.label,
          packsize_name: userData?.packsize_name?.label,
          name: userData?.name,
          current_quanitity: userData?.current_quanitity,
          price: userData?.price,
          alert_quanitity: userData?.alert_quanitity
        }
      })
    }
  }

  // load item list
  const loadItemList = () => {
    loadItem({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,

      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle item create response
  useEffect(() => {
    if (!createItemResponse.isUninitialized) {
      if (createItemResponse.isSuccess) {
        closeAddModal()
        loadItemList()
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-item-successfully')}</>
          ) : (
            <>{FM('created-item-successfully')}</>
          )
        )
      } else if (createItemResponse.isError) {
        // handle error
        const errors: any = createItemResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createItemResponse])

  // updated value in form
  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<any>(
        {
          id: state?.editData?.id,
          name: state?.editData?.name,
          category_name: state?.editData?.category?.name
            ? {
              label: state.editData?.category?.name,
              value: state.editData?.category?.id
            }
            : undefined,
          subcategory_name: state.editData?.subcategory?.name
            ? {
              label: state.editData?.subcategory?.name,
              value: state.editData?.subcategory?.id
            }
            : undefined,
          unit_name: state?.editData?.unit_id
            ? {
              label: state.editData?.unit?.name,
              value: state.editData?.unit_id
            }
            : undefined,
          brand_name: state?.editData?.brand
            ? {
              label: state.editData?.brand?.name,
              value: state.editData?.brand?.id
            }
            : undefined,
          packsize_name: state?.editData?.packsize
            ? {
              label: state.editData?.packsize?.name,
              value: state.editData?.packsize?.id
            }
            : undefined,
          current_quanitity: state?.editData?.current_quanitity,
          alert_quanitity: state?.editData?.alert_quanitity,
          price: state?.editData?.price
        },
        form.setValue
      )
    }
  }, [state.editData])

  //reset the value in the form
  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  // handle pagination and load list
  useEffect(() => {
    loadItemList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: {
        ...e,
        subcategory_id: e?.subcategory_id?.value ? e?.subcategory_id?.value : undefined,
        category_id: e?.category_id?.value ? e?.category_id?.value : undefined
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
    // if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title={FM('add-item')}>
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
      itemDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (itemRestDelete?.isLoading === false) {
      if (itemRestDelete?.isSuccess) {
        emitAlertStatus('success', null, itemRestDelete?.originalArgs?.eventId)
      } else if (itemRestDelete?.error) {
        emitAlertStatus('failed', null, itemRestDelete?.originalArgs?.eventId)
      }
    }
  }, [itemRestDelete])

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

  // create Item modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? FM('update-item') : FM('create-item')}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        scrollControl={false}
        loading={createItemResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state?.editData?.category?.name}
                  control={form.control}
                  isClearable
                  creatable
                  label={FM('category')}
                  name='category_name'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  onChangeValue={(e) => {
                    form.resetField('subcategory_name')
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${form.watch('category_name')}`}
                  control={form.control}
                  creatable
                  isClearable
                  label={FM('sub-category')}
                  name='subcategory_name'
                  isDisabled={!form.watch('category_name')}
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    is_parent: form.watch('category_name')?.value
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state?.editData?.brand?.name}
                  control={form.control}
                  creatable
                  isClearable
                  label={FM('brand')}
                  name='brand_name'
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
                  key={state?.editData?.packsize?.name}
                  control={form.control}
                  creatable
                  isClearable
                  label={FM('pack-size')}
                  name='packsize_name'
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
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state?.editData?.name}
                  control={form.control}
                  label={FM('name')}
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state?.editData?.current_quanitity}
                  control={form.control}
                  label={FM('current-quantity')}
                  name='current_quanitity'
                  type='number'
                  className={`mb-1 ${state?.editData?.id ? 'pointer-events-none' : ''}`}
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={`${state?.editData?.unit?.name}`}
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
                  key={state?.editData?.price}
                  control={form.control}
                  label={FM('buy-price')}
                  name='price'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  key={state?.editData?.alert_quanitity}
                  control={form.control}
                  label={FM('alert-quantity')}
                  name='alert_quanitity'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view item modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.name}
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
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>

            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('category')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.subcategory?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('brand')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.brand?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('pack-size')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.packsize?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('current-quanitity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.current_quanitity}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('alert-quanitity')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.alert_quanitity}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('unit')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.unit?.name ?? 'N/A'}</p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('buy-price')} </Label>
              <p className='text-capitalize'>
                {state.selectedUser?.price ? <>{state.selectedUser?.price} ₹</> : 'N/A'}
              </p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('last-average-price')} </Label>
              <p className='text-capitalize'>
                {state.selectedUser?.last_average_price ? (
                  <>{state.selectedUser?.last_average_price} ₹</>
                ) : (
                  'N/A'
                )}
              </p>
            </Col>

            <Col md='4' lg='4' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='4' lg='4' sm='12' xs='12'>
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
  const columns: TableColumn<any>[] = [
    {
      name: FM('name'),
      sortable: false,
      id: 'name',
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
            {row?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('category'),
      sortable: false,
      id: 'category',
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
            {row?.category?.name}
          </span>
        </Fragment>
      )
    },
    {
      name: FM('brand'),
      sortable: false,
      id: 'brand_id',
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
            {row?.brand?.name}
          </span>
        </Fragment>
      )
    },
    {
      name: FM('pack-size'),
      sortable: false,
      id: 'pack_size_id',
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
            {row?.packsize?.name}
          </span>
        </Fragment>
      )
    },
    {
      name: FM('quantity'),
      sortable: false,
      id: 'current_quanitity',
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
            {row?.current_quanitity}
          </span>
        </Fragment>
      )
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
      id: 'unit',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              // setState({
              //     selectedUser: row
              // })
            }}
            className='text-primary '
          >
            {row?.unit?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('buy-price'),
      sortable: false,
      id: 'unit',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              // setState({
              //     selectedUser: row
              // })
            }}
            className='text-primary '
          >
            {row?.price} ₹
          </span>
        </Fragment>
      )
    },
    // {
    //   name: FM('last-average-price'),
    //   sortable: false,
    //   id: 'last_average_price',
    //   cell: (row) => (
    //     <Fragment>
    //       <span
    //         role={'button'}
    //         onClick={() => {
    //           // setState({
    //           //     selectedUser: row
    //           // })
    //         }}
    //         className='text-primary text-capitalize'
    //       >
    //         {row?.last_average_price} ₹
    //       </span>
    //     </Fragment>
    //   )
    // },
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
              ''
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
            loadItemResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadItemResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Products'>
        <ButtonGroup color='dark'>
          <ItemImport<ButtonProps>
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
          </ItemImport>
          <ItemFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadItemResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<WarehouseItemType>
        initialPerPage={20}
        isLoading={loadItemResponse.isLoading}
        columns={columns}
        // options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search'
        onSort={handleSort}
        defaultSortField={loadItemResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadItemResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default WarehouseItem
