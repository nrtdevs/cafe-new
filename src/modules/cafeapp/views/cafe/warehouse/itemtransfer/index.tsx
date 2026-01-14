import { yupResolver } from '@hookform/resolvers/yup'
import {
  itemTransferType,
  menusResponseTypes
} from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateTransferMutation,
  useDeleteTransferIdMutation,
  useLoadTransferMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'

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
import { Download, Edit, Eye, Menu, Plus, PlusCircle, RefreshCcw, Trash2 } from 'react-feather'
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
import ItemTransferFilter from './ItemTransferFilter'
import ItemTransferExport from './ItemTransferExport'
import { getPath } from '@src/router/RouteHelper'
import { useNavigate } from 'react-router-dom'

// validation schema
const userFormSchema = {
  // file: yup.string().required()

  transfer_date: yup.date().typeError('date must be required').required(),
  transfer_to_cafe: yup.object().typeError('Please Select Cafe').required(),
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
  selectedUser?: itemTransferType
  enableEdit?: boolean
  editData?: any
}

const defaultValues: itemTransferType = {
  id: '',
  transfer_to_cafe: '',
  transfer_date: '',
  items: []
}
const ItemTransfer = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add menu
  const canAddUser = Can(Permissions.itemTransferCreate)
  //   // can edit menu
  const canEditUser = Can(Permissions.itemTransferCreate)
  // can delete menu
  const canDeleteUser = Can(Permissions.itemTransferDelete)
  //can read menu
  const canReadUser = Can(Permissions.itemTransferRead)
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

  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()

  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  // create or update menu mutation
  const [createMenu, createResp] = useCreateOrUpdateTransferMutation()
  // load menus
  const [loadTransferItem, loadTransferItemResp] = useLoadTransferMutation()

  // delete mutation
  const [menuDelete, deleteResp] = useDeleteTransferIdMutation()

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

  // handle save user
  const handleSaveUser = (userData: any) => {
    const data = {
      ...userData,
      transfer_to_cafe: userData?.transfer_to_cafe?.value,
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

    // log(data, 'data')
    if (validation === true) {
      toast.error('please check the data duplicate entry in item')
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

  //load transfer list
  const loadTransferItemList = () => {
    loadTransferItem({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle Transfer create response
  useEffect(() => {
    if (!createResp.isUninitialized) {
      if (createResp.isSuccess) {
        closeAddModal()
        loadTransferItemList()
        SuccessToast(
          state?.editData?.id
            ? 'Updated Transfer Item Successfully'
            : 'Created  Transfer item Successfully'
        )
      } else if (createResp.isError) {
        // handle error
        const errors: any = createResp.error

        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createResp])

  // handle pagination and load list
  useEffect(() => {
    loadTransferItemList()
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
        item_id: e?.item_id?.value,
        transfer_to_cafe: e?.transfer_to_cafe?.value,
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

  // create a transfer on header
  // useEffect(() => {
  //   if (!canAddUser) return
  //   setHeaderMenu(
  //     <>
  //       <NavItem className=''>
  //         <BsTooltip title={FM('add-Item-transfer')}>
  //           <NavLink
  //             className=''
  //             onClick={() => {
  //               navigate(getPath('item-transfers-create'))
  //             }}
  //           >
  //             <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
  //           </NavLink>
  //         </BsTooltip>
  //       </NavItem>
  //     </>
  //   )
  //   return () => {
  //     setHeaderMenu(null)
  //   }
  // }, [modalAdd, canAddUser])

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
  //   useEffect(() => {
  //     if (isValid(state.editData && state?.enableEdit)) {
  //       setValues<any>(
  //         {
  //           id: state.selectedUser?.id,
  //           transfer_date: state?.editData?.transfer_date
  //             ? formatDate(state?.editData?.transfer_date, 'YYYY-MM-DD')
  //             : undefined,
  //           transfer_to_cafe: state.editData.transfer_to_cafe
  //             ? {
  //                 label: state.editData?.transfer_to_cafe?.name,
  //                 value: state.editData?.transfer_to_cafe?.id
  //               }
  //             : undefined
  //         },
  //         form.setValue
  //       )
  //     }
  //   }, [state.editData])

  //reset form
  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<any>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create Transfer modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state?.enableEdit ? 'Update' : 'Save'}
        title={state?.editData ? FM('update-transfer-item') : FM('create-transfer-item')}
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
                      key={`${state?.editData?.transfer_date}`}
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
                </Row>
              </Card>
            </Row>

            <Row className='mb-0'>
              {fields.map((field, index) => (
                <Card key={field?.id}>
                  <h5 className='border-bottom mt-1'>
                    <>
                      {'Items'} {index > 0 ? index + 1 : ''}
                      {/* <span className='text-danger fw-bolder'>*</span>{' '} */}
                    </>
                  </h5>

                  <CardBody className='pt-1'>
                    <Row className='g'>
                      <Col md='10'>
                        <Row className='g'>
                          <Col md='3'>
                            <FormGroupCustom
                              control={form.control}
                              async
                              isClearable
                              label='Item'
                              name={`items.${index}.item_id`}
                              loadOptions={loadDropdown}
                              //   jsonData={
                              //     state.editData
                              //       ? ''
                              //       : form.setValue(
                              //           `items.${index}.rate`,
                              //           Number(
                              //             form.watch(`items.${index}.item_id`)?.extra
                              //               ?.final_average_price
                              //           )
                              //         )
                              //   }
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
                              control={form.control}
                              async
                              label='unit'
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
                            <FormGroupCustom
                              defaultValue={1}
                              name={`items.${index}.quantity`}
                              type={'number'}
                              label={'Quantity'}
                              className='mb-0'
                              control={form.control}
                              rules={{ required: true, min: 1 }}
                              onChangeValue={(e) => {
                                let value = e.target.value
                                let stock = Number(
                                  form.watch(`items.${index}.item_id`)?.extra?.current_quanitity
                                )
                                let rate = Number(form.watch(`items.${index}.rate`))
                                form.setValue(`items.${index}.totalRate`, value * rate)
                                if (value > stock) {
                                  // Show error message
                                  form.setError(`items.${index}.quantity` as any, {
                                    type: 'manual',
                                    message: `Quantity cannot be more than available stock (${stock})`
                                  })
                                } else {
                                  // Clear error if within limit
                                  form.clearErrors(`items.${index}.quantity` as any)
                                }

                                // Optionally update value in form state if you need
                                form.setValue(`items.${index}.quantity`, value)
                              }}
                            />
                            Available Stock:
                            {Number(form.watch(`items.${index}.item_id`)?.extra?.current_quanitity)
                              ? Number(
                                  form.watch(`items.${index}.item_id`)?.extra?.current_quanitity
                                )
                              : 0}
                          </Col>
                          <Col md='2'>
                            <FormGroupCustom
                              key={`${form.watch(`items.${index}.item_id`)}`}
                              name={`items.${index}.rate`}
                              type={'number'}
                              label={'Rate'}
                              className='mb-0'
                              control={form.control}
                              rules={{ required: true, min: 0 }}
                            />
                          </Col>
                          <Col md='2'>
                            <FormGroupCustom
                              name={`items.${index}.totalRate`}
                              type={'number'}
                              label={'Total Rate'}
                              className='mb-0 pointer-events-none'
                              control={form.control}
                              rules={{ required: false, min: 0 }}
                            />
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
                                  <Plus size={16} /> {'Item'}
                                </>
                              </BsTooltip>
                            </Show>
                          </Hide>
                        </Show>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view Transfer modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.product?.name}
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
              <Label className='text-uppercase mb-25'>{FM('transfer-cafe')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.transfer_info?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('item')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.product?.name}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.category?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('sub-category')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.subcategory?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('brand')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.brand?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('pack-size')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.packsize?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('quantity')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.quantity ?? 'N/A'} {state.selectedUser?.unit?.name ?? 'N/A'}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('rate')} </Label>
              <p className='text-capitalize'>{state.selectedUser?.rate} ₹</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('total-rate')}</Label>
              <p className='text-capitalize'>
                {Number(state.selectedUser?.rate) * Number(state.selectedUser?.quantity)} ₹
              </p>
            </Col>
   <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('delivery-person')}</Label>
              <p className='text-capitalize'>
               {state?.selectedUser?.delivery_person}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('transfer-date')}</Label>
              <p className='text-capitalize'>{formatDate(state.selectedUser?.date) ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('created-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<itemTransferType>[] = [
    {
      name: 'item',
      id: 'product',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.product?.name}</Fragment>
    },
    {
      name: 'transfer to cafe',
      id: 'transfer_to_cafe',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.transfer_info?.name}</Fragment>
    },
    {
      name: 'quantity',
      id: 'quantity',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.quantity}</Fragment>
    },
    {
      name: 'unit',
      id: 'unit',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.unit?.name}</Fragment>
    },
    {
      name: 'rate (₹)',
      id: 'final_average_price',
      minWidth: '200px',
      sortable: false,
      cell: (row) => <Fragment>{row?.final_average_price}</Fragment>
    },
    {
      name: 'category',
      id: 'category',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.category?.name}</Fragment>
    },
    {
      name: 'sub category',
      id: 'subcategory',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.subcategory?.name}</Fragment>
    },
    {
      name: 'brand',
      id: 'brand',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.brand?.name}</Fragment>
    },
    {
      name: 'packsize',
      id: 'packsize',
      sortable: false,
      minWidth: '200px',
      cell: (row) => <Fragment>{row?.packsize?.name}</Fragment>
    },

    {
      name: FM('delivery-person'),
      sortable: false,
      cell: (row) => <Fragment>{row?.delivery_person}</Fragment>
    },
    // {
    //   name: FM('sub-category'),
    //   sortable: false,
    //   cell: (row) => <Fragment>{row?.subcategory?.name}</Fragment>
    // },
    {
      name: FM('transfer-date'),
      sortable: false,
      id: 'date',
      minWidth: '200px',
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
            {formatDate(row?.date)}
          </span>
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

            {/* {canEditUser ? (
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
            )} */}

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

  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadTransferItemResp?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadTransferItemResp?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<Menu size='25' />} title='Transfer Items'>
        <div className='me-2'>
          <ItemTransferExport<ButtonProps>
            Tag={Button}
            responseData={() => {
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
              <Download size='14' />
              <span className='align-middle ms-25'>{FM('export')}</span>
            </div>
          </ItemTransferExport>
        </div>
        <ButtonGroup color='dark'>
          <ItemTransferFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadTransferItemResp.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<itemTransferType>
        initialPerPage={20}
        isLoading={loadTransferItemResp.isLoading}
        columns={columns}
        // options={options}
        hideSearch
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadTransferItemResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadTransferItemResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default ItemTransfer
