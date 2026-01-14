import { yupResolver } from '@hookform/resolvers/yup'
import {
  useCreateOrUpdateMenuMutation,
  useDeleteMenuByIdMutation,
  useLoadMenusMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/MenusRTK'
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
import Hide from '@src/utility/Hide'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  emitAlertStatus,
  formatDate,
  isValid,
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
import { Edit, Eye, Menu, Plus, PlusCircle, RefreshCcw, Trash2 } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  Button,
  ButtonGroup,
  ButtonProps,
  Card,
  CardBody,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import { menusResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import MenusFilter from './MenusFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Please provide plan cost.')
    .min(0),
  order_duration: yup
    .number()
    .typeError('Order Duration must be a number')
    .required('Please provide plan Order Duration .')
    .min(0),
  recipes: yup.array().of(
    yup.object().shape({
      product_id: yup.object().typeError('Please Select Product').required(),
      unit_id: yup.object().typeError('Please Select Unit').required(),
      quantity: yup
        .number() // Changed from yup.object() to yup.number()
        .typeError('Quantity must be a  Minimum 0')
        .required('Please provide plan Quantity.')
        .min(0, 'Quantity must be at least 0')
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
  selectedUser?: menusResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: menusResponseTypes = {
  category_id: '',
  unit_id: '',
  name: '',
  description: '',
  image_path: '',
  order_duration: '',
  priority_rank: '',
  quantity: '',
  price: '',
  recipes: []
}
const Menus = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add menu
  const canAddUser = Can(Permissions.productMenuCreate)
  // can edit menu
  const canEditUser = Can(Permissions.productMenuEdit)
  // can delete menu
  const canDeleteUser = Can(Permissions.productMenuDelete)
  //can read menu
  const canReadUser = Can(Permissions.productMenuRead)

  // form hook
  const form = useForm<menusResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'recipes'
  })

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // create or update menu mutation
  const [createMenu, createResp] = useCreateOrUpdateMenuMutation()
  // load menus
  const [loadMenu, loadMenuResp] = useLoadMenusMutation()

  // delete mutation
  const [menuDelete, deleteResp] = useDeleteMenuByIdMutation()

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
    append({})
    toggleModalAdd()
  }
  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined,
        editData: null
      })
      form.reset()
    }
    toggleModalView()
  }

  // handle save menu
  const handleSaveUser = (userData: any) => {
    const data = {
      ...userData,
      image_path: '',
      unit_id: userData?.unit_id?.value,
      is_monitoring: userData?.is_monitoring === 1 ? true : false,
      category_id: userData?.category_id?.value,
      recipes: userData?.recipes?.map((item: any) => {
        return {
          product_id: item?.product_id?.value,
          unit_id: item?.unit_id?.value,
          quantity: item?.quantity
        }
      })
    }
    const hasDuplicateProductIds = (arr: any) => {
      const seen = new Set()
      for (const item of arr) {
        if (seen.has(item.product_id)) {
          return true // Duplicate product_id found
        }
        seen.add(item.product_id)
      }
      return false // No duplicates found
    }

    let validation = hasDuplicateProductIds(data?.recipes)
    // log(data, 'data')
    if (validation === true) {
      toast.error('please check the data duplicate entry in recipes')
    } else {
      if (state?.editData?.id) {
        createMenu({
          jsonData: {
            ...data,
            id: state?.editData?.id
          }
        })
      } else {
        createMenu({
          jsonData: {
            ...data
          }
        })
      }
    }
  }
  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  //load menu list
  const loadMenuList = () => {
    loadMenu({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // useEffect(() => {
  //     fields.map((item: any, index: number) => {
  //         log(`item`, item)

  //         if (form.watch(`recipes.${index}.quantity`)) {
  //             const total = (parseInt(form.watch(`recipes.${index}.quantity`))) + parseInt(form.watch('price'))
  //             log('data', form.watch(`recipes.${index}.quantity`))
  //             // form.setValue(`recipes.${index}.total`, total)

  //         }
  //     })

  // }, [form.watch('price')])

  // handle menu create response
  useEffect(() => {
    if (!createResp.isUninitialized) {
      if (createResp.isSuccess) {
        closeAddModal()
        loadMenuList()
        SuccessToast(
          state?.editData?.id ? 'Updated Menu Successfully' : 'Created  Menu Successfully'
        )
      } else if (createResp.isError) {
        // handle error
        const errors: any = createResp.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createResp])

  // handle pagination and load list
  useEffect(() => {
    loadMenuList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, category_id: e?.category_id?.value },
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
          <BsTooltip title={FM('add-menu')}>
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

  //handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValid(ids)) {
      menuDelete({
        id: ids,
        eventId: eventId,
        action,
        ids: []
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (deleteResp?.isLoading === false) {
      if (deleteResp?.isSuccess) {
        emitAlertStatus('success', null, deleteResp?.originalArgs?.eventId)
      } else if (deleteResp?.error) {
        emitAlertStatus('failed', null, deleteResp?.originalArgs?.eventId)
      }
    }
  }, [deleteResp])

  // open view modal
  useEffect(() => {
    if (isValid(state.editData && state?.enableEdit)) {
      setValues<menusResponseTypes>(
        {
          id: state.selectedUser?.id,
          name: state.editData.name,
          quantity: state.editData.quantity,
          price: state.editData.price,
          priority_rank: state.editData.priority_rank,
          order_duration: state.editData.order_duration,
          description: state.editData.description,
          is_monitoring: state.editData.is_monitoring === 1 ? 1 : 0,
          unit_id: state.editData.unit_id
            ? {
                label: state.editData?.unit?.name,
                value: state.editData?.unit_id
              }
            : undefined,
          category_id: state.editData?.category_id
            ? {
                label: state.editData?.category?.name,
                value: state.editData?.category_id
              }
            : undefined,
          recipes: state.editData.recipes.map((recipe: any) => {
            return {
              product_id: recipe?.product
                ? {
                    label: recipe?.product?.name,
                    value: recipe?.product_id
                  }
                : undefined,
              unit_id: recipe?.unit_id
                ? {
                    label: recipe?.unit?.name,
                    value: recipe?.unit_id
                  }
                : undefined,
              quantity: recipe.quantity
            }
          })
        },
        form.setValue
      )
      //   toggleModalView()
    }
  }, [state.editData])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<menusResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create menu modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state?.enableEdit ? 'Update' : 'Save'}
        title={state?.editData ? 'Update Menu' : 'Create Menu'}
        handleModal={closeAddModal}
        modalClass={'modal-xl'}
        loading={createResp?.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Card>
                <Row>
                  <Col md={'2'} className='mt-2'>
                    <FormGroupCustom
                      key={state?.editData}
                      defaultValue={'0'}
                      control={form.control}
                      label={FM('is-monitoring')}
                      name={`is_monitoring`}
                      type='checkbox'
                      className='mb-2 fw-bold text-black'
                      inputClassName={''}
                      rules={{ required: false }}
                    />
                  </Col>
                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      async
                      isClearable
                      label='Category'
                      name='category_id'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.categories}
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
                      control={form.control}
                      label='name'
                      name='name'
                      type='text'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col>

                  <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label='Price'
                      name='price'
                      type='number'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col>

                  <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label='Priority Rank'
                      name='priority_rank'
                      type='number'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>
                  <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label='Order Duration'
                      name='order_duration'
                      type='number'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col>

                  <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label='description'
                      name='description'
                      type='textarea'
                      className='mb-1'
                      rules={{ required: false }}
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
                      {'Recipes'} {index > 0 ? index + 1 : ''}
                      {/* <span className='text-danger fw-bolder'>*</span>{' '} */}
                    </>
                  </h5>

                  <CardBody className='pt-1'>
                    <Row className='g'>
                      <Col md='9'>
                        <Row className='g'>
                          <Col md='4'>
                            <FormGroupCustom
                              control={form.control}
                              async
                              isClearable
                              isDisabled={state.editData?.create_menu === 1}
                              label='Product'
                              name={`recipes.${index}.product_id`}
                              loadOptions={loadDropdown}
                              jsonData={
                                state.editData
                                  ? ''
                                  : form.setValue(`recipes.${index}.unit_id`, {
                                      label: form.watch(`recipes.${index}.product_id`)?.extra?.unit
                                        ?.name,
                                      value: form.watch(`recipes.${index}.product_id`)?.extra
                                        ?.unit_id
                                    })
                              }
                              onChangeValue={(e) => {
                                let isDuplicate = false
                                fields.forEach((i: any, idx) => {
                                  if (i?.product_id?.value === e?.value && idx !== index) {
                                    isDuplicate = true
                                    // toast.error('Duplicate entry');
                                    form.setError(`recipes.${index}.product_id`, {
                                      type: 'manual',
                                      message: 'Duplicate product'
                                    })
                                  }
                                })

                                if (!isDuplicate) {
                                  form.setValue(`recipes.${index}.product_id`, e)
                                  form.clearErrors(`recipes.${index}.product_id`)
                                }
                              }}
                              path={ApiEndpoints.products}
                              selectLabel={(e) => `${e.name} `}
                              selectValue={(e) => e.id}
                              defaultOptions
                              type='select'
                              className='mb-0'
                              rules={{ required: true }}
                            />
                          </Col>

                          <Col md='4'>
                            <FormGroupCustom
                              control={form.control}
                              async
                              isClearable
                              isDisabled={state.editData?.create_menu === 1}
                              label='unit'
                              name={`recipes.${index}.unit_id`}
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
                          <Col md='4'>
                            <FormGroupCustom
                              defaultValue={1}
                              isDisabled={state.editData?.create_menu === 1}
                              name={`recipes.${index}.quantity`}
                              type={'number'}
                              label={'Quantity'}
                              className='mb-0'
                              control={form.control}
                              rules={{ required: true, min: 1 }}
                            />
                          </Col>
                        </Row>
                      </Col>
                      <Col md='3' className='mt-1'>
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
                          <Hide IF={state?.editData?.create_menu === 1}>
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
                                  <Plus size={16} /> {'recipes'}
                                </>
                              </BsTooltip>
                            </Show>
                          </Hide>
                        </Show>
                      </Col>

                      {/* <Show IF = {watch("restriction_type")} */}
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </Row>
            {/* <Row>
              <Col md='12' className=''>
                <FormGroupCustom
                  control={form.control}
                  label={'Image Path'}
                  name='image_path'
                  type='dropZone'
                  className='mb-1'
                  // dropZoneOptions={{
                  //     excludeFiles: meeting?.documents ?? undefined
                  // }}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>
            </Row> */}
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
        modalClass={'modal-lg'}
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
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('category-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('menu-name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('price')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.price ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('order-duration')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.order_duration ?? 'N/A'}
                {'Minute'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('priority-rank')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.priority_rank ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('is-monitoring')}</Label>
              <p
                className={state.selectedUser?.is_monitoring === 1 ? 'text-success' : 'text-danger'}
              >
                {state.selectedUser?.is_monitoring === 1 ? 'True' : 'false'}
              </p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('update-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>

          <div className='row my-2 mx-1 justify-content-center'>
            <table className='table table-striped table-borderless'>
              <thead style={{ backgroundColor: '#84B0CA' }} className='text-black'>
                <tr>
                  <th scope='col'>#</th>
                  <th scope='col'>Product</th>
                  <th scope='col'>Quantity</th>
                  <th scope='col'>Unit name</th>
                </tr>
              </thead>
              <tbody>
                {state.selectedUser?.recipes?.map((item: any, index: any) => {
                  return (
                    <>
                      <tr>
                        <th scope='row'>{index + 1}</th>
                        <td>{item?.product?.name}</td>
                        <td>{item?.quantity}</td>
                        <td>{item?.unit?.name}</td>
                      </tr>
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div>
            <Label className='text-uppercase mb-25'>{FM('description')}</Label>
            <p className='text-dark fw-bold text-capitalize'>
              {state.selectedUser?.description ?? 'N/A'}
            </p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<menusResponseTypes>[] = [
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
            className='text-primary'
          >
            {row?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: 'category',
      sortable: false,
      cell: (row) => <Fragment>{row?.category?.name}</Fragment>
    },
    {
      name: 'count total products',
      sortable: false,
      cell: (row) => (
        <Fragment>
          {row?.recipes_without_product.length !== 0
            ? '0 (please update the recipe)'
            : row?.recipes_count}
        </Fragment>
      )
    },
    {
      name: 'priority_rank',
      sortable: false,
      cell: (row) => <Fragment>{row?.priority_rank}</Fragment>
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
                                icon: <Edit size={'14'} />,
                                name: 'Edit',
                                onClick: () => {
                                    toggleModalAdd()
                                    setState({ editData: row })
                                }
                            },
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
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<Trash2 size={14} />}
                                        onDropdown
                                        eventId={`item-delete-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('delete-item', { name: row?.name })}
                                        onClickYes={() => {
                                            handleActions(row?.id, 'delete', `item-delete-${row?.id}`)
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
                    setState({ editData: row })
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
                  {'delete'}
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
    // {
    //   IF: canDeleteUser,
    //   noWrap: true,
    //   name: (
    //     <ConfirmAlert
    //       menuIcon={<Trash2 size={14} />}
    //       onDropdown
    //       eventId={`item-delete`}
    //       text={FM('are-you-sure')}
    //       title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
    //       onClickYes={() => {
    //         handleActions(selectedRows?.ids, 'delete', 'item-delete')
    //       }}
    //       onSuccessEvent={onSuccessEvent}
    //     >
    //       {FM('delete')}
    //     </ConfirmAlert>
    //   )
    // },
    // {
    //   IF: canEditUser,
    //   noWrap: true,
    //   name: (
    //     <ConfirmAlert
    //       menuIcon={<UserCheck size={14} />}
    //       onDropdown
    //       eventId={`item-active`}
    //       text={FM('are-you-sure')}
    //       title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
    //       onClickYes={() => {
    //         handleActions(selectedRows?.ids, 'active', 'item-active')
    //       }}
    //       onSuccessEvent={onSuccessEvent}
    //     >
    //       {FM('activate')}
    //     </ConfirmAlert>
    //   )
    // },
    // {
    //   IF: canEditUser,
    //   noWrap: true,
    //   name: (
    //     <ConfirmAlert
    //       menuIcon={<UserX size={14} />}
    //       onDropdown
    //       eventId={`item-inactive`}
    //       text={FM('are-you-sure')}
    //       title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
    //       onClickYes={() => {
    //         handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
    //       }}
    //       onSuccessEvent={onSuccessEvent}
    //     >
    //       {FM('inactivate')}
    //     </ConfirmAlert>
    //   )
    // }
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadMenuResp?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadMenuResp?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<Menu size='25' />} title='Menu'>
        <ButtonGroup color='dark'>
          <MenusFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadMenuResp.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<menusResponseTypes>
        initialPerPage={20}
        isLoading={loadMenuResp.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadMenuResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadMenuResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Menus
