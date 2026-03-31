import { yupResolver } from '@hookform/resolvers/yup'
import {
    useActionMismatchQuantityIdMutation,
    useDeleteDemandByIdMutation,
    useLoadMismatchListMutation,
    useLoadWasteListMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/MenusRTK'
import CustomDataTable, {
    TableDropDownOptions,
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    emitAlertStatus,
    FM,
    formatDate,
    isValid,
    log,
    setInputErrors,
    setValues,
    SuccessToast
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Activity, Eye, List, PlusCircle, RefreshCcw, X } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import {
    Badge,
    Button,
    ButtonGroup,
    Card,
    Col,
    Form,
    Label,
    NavItem,
    NavLink,
    Row,
    UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import { menusResponseTypes, StockItem } from '../../../redux/RTKFiles/ResponseTypes'
// import DemandFilter from './DemandFilter'
import { useNavigate } from 'react-router-dom'
import QuantityMismatchFilter from '../qunatity-mismatch-list/QuantityMismatchFilter'
import WastedItemFilter from './WasteItemFilter'



// validation schema
const userFormSchema = {
  // file: yup.string().required()
 warehouse_remarks: yup.string().trim().typeError('Please Select Warehouse').required(),
//   items: yup.array().of(
//     yup.object().shape({
//       item_id: yup.object().typeError('Please Select Product').required(),
//       unit_id: yup.object().typeError('Please Select Unit').required(),
//       quantity: yup-
//         .number() // Changed from yup.object() to yup.number()
//         .typeError('Quantity must be a  Minimum 0')
//         .required('Please provide plan Quantity.')
//         .min(0, 'Quantity must be at least 0')
//     })
//   )
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
  selectedUser?: StockItem 
  enableEdit?: boolean
  selectedStatus?:string
  editData?: any
}

const defaultValues: any = {
warehouse_remarks:''
}
const WasteItems = (props: any) => {
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

  //can create transfer
    const canAddTransfer = Can(Permissions.itemTransferCreate)

    // console.log(userData,'userdata')

  const navigate=useNavigate()

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
  const [createMenu, createResp] = useActionMismatchQuantityIdMutation()
  // load menus
  const [loadMenu, loadMenuResp] = useLoadWasteListMutation()

  // delete mutation
  const [menuDelete, deleteResp] = useDeleteDemandByIdMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    editData: '',
    selectedStatus:'',
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
      editData: null,
      selectedStatus:''
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
  
 
      if (state?.editData?.id) {
        if(state?.selectedStatus==='approved'){
       createMenu({
          jsonData: {
            warehouse_remarks:userData?.warehouse_remarks,
            status:1,
            add_to_stock:userData?.add_to_stock===1?'yes':'no',
            id: state?.editData?.id
          }
        })
        }else{
             createMenu({
          jsonData: {
            warehouse_remarks:userData?.warehouse_remarks,
            status:2,

            id: state?.editData?.id
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
          state?.editData?.id ? 'Status updated successfully' : 'Status updated successfully'
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
      filterData: {
        item_id: e?.item_id?.value ? e?.item_id?.value : undefined,
        brand_id: e?.brand_id?.value ? e?.brand_id?.value : undefined,
        unit_id: e?.unit_id?.value ? e?.unit_id?.value : undefined,
        pack_size: e?.pack_size?.value ? e?.pack_size?.value : undefined,
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
          <BsTooltip title={FM('add-demand')}>
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
              warehouse_id: state.editData.warehouse_id
            ? {
                label: state.editData?.warehouse?.name,
                value: state.editData?.warehouse_id
              }
            : undefined,

           


          demand_date: state?.editData.demand_date,
   
          items: state?.editData?.requested_products?.map((recipe: any) => {
            return {
              item_id: recipe?.product
                ? {
                    label: recipe?.product?.name,
                    value: recipe?.product?.id
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
//   const renderCreateModal = () => {
//     return (
//       <CenteredModal
//         open={modalAdd}
//         done={state?.selectedStatus==='approved' ? 'Approved' : 'Reject'}
//         title={state?.selectedStatus==='approved' ? 'Action Approved' : 'Action Reject'}
//         handleModal={closeAddModal}
//         modalClass={'modal-sm'}
//         loading={createResp?.isLoading}
//         handleSave={form.handleSubmit(handleSaveUser)}
//       >
//         <div className='p-2'>
//           <Form onSubmit={form.handleSubmit(handleSaveUser)}>
//             <Row>
//               <Card>
//                 <Row>
                  
//                   <Col md='12'>
//                             <FormGroupCustom
                             
//                               name={`warehouse_remarks`}
//                               type={'textarea'}
//                               label={'Warehouse Remarks'}
//                               className='mb-2 mt-2'
//                               control={form.control}
//                               rules={{ required: true }}
//                             />
//                   </Col>

//                   <Show IF={state?.selectedStatus==='approved'}>
            
//              <Col md='12' className='mb-2'>
//                 <FormGroupCustom
//                   name={`add_to_stock`}
//                   type={'checkbox'}
//                   label={'Add to Stock'}
//                   className='mb-0 w-10'
//                   control={form.control}
//                   rules={{ required: false }}
//                 />
            
//             </Col>
//             </Show>
//                 </Row>
//               </Card>
//             </Row>

//             {/* <Row className='mb-0'>
//               {fields.map((field, index) => (
//                 <Card key={field?.id}>
//                   <h5 className='border-bottom mt-1'>
//                     <>
//                       {'items'} {index > 0 ? index + 1 : ''}
                     
//                     </>
//                   </h5>

//                   <CardBody className='pt-1'>
//                     <Row className='g'>
//                       <Col md='9'>
//                         <Row className='g'>
//                           <Col md='4'>
//                             <FormGroupCustom
//                               control={form.control}
//                               async
//                               isClearable
//                               isDisabled={state.editData?.create_menu === 1}
//                               label='Product'
//                               name={`items.${index}.item_id`}
//                               loadOptions={loadDropdown}
//                               jsonData={
//                                 state.editData
//                                   ? ''
//                                   : form.setValue(`items.${index}.unit_id`, {
//                                       label: form.watch(`items.${index}.item_id`)?.extra?.unit
//                                         ?.name,
//                                       value: form.watch(`items.${index}.item_id`)?.extra
//                                         ?.unit_id
//                                     })
//                               }
//                               onChangeValue={(e) => {
//                                 let isDuplicate = false
//                                 fields.forEach((i: any, idx) => {
//                                   if (i?.item_id?.value === e?.value && idx !== index) {
//                                     isDuplicate = true
                               
//                                     form.setError(`items.${index}.item_id`, {
//                                       type: 'manual',
//                                       message: 'Duplicate product'
//                                     })
//                                   }
//                                 })

//                                 if (!isDuplicate) {
//                                   form.setValue(`items.${index}.item_id`, e)
//                                   form.clearErrors(`items.${index}.item_id`)
//                                 }
//                               }}
//                               path={ApiEndpoints.products}
//                               selectLabel={(e) => `${e.name} `}
//                               selectValue={(e) => e.id}
//                               defaultOptions
//                               type='select'
//                               className='mb-0'
//                               rules={{ required: true }}
//                             />
//                           </Col>

//                           <Col md='4'>
//                             <FormGroupCustom
//                               control={form.control}
//                               async
//                               isClearable
//                               isDisabled={state.editData?.create_menu === 1}
//                               label='unit'
//                               name={`items.${index}.unit_id`}
//                               loadOptions={loadDropdown}
//                               path={ApiEndpoints.unitList}
                              
//                               selectLabel={(e) => `${e.name} `}
//                               selectValue={(e) => e.id}
//                               defaultOptions
//                               type='select'
//                               className='mb-0 pointer-events-none'
//                               rules={{ required: true }}
//                             />
//                           </Col>
//                           <Col md='4'>
//                             <FormGroupCustom
//                               defaultValue={1}
//                               isDisabled={state.editData?.create_menu === 1}
//                               name={`items.${index}.quantity`}
//                               type={'number'}
//                               label={'Quantity'}
//                               className='mb-0'
//                               control={form.control}
//                               rules={{ required: true, min: 1 }}
//                             />
//                           </Col>
//                         </Row>
//                       </Col>
//                       <Col md='3' className='mt-1'>
//                         <Show IF={index > 0 || index === fields?.length - 1}>
//                           <Show IF={index > 0}>
//                             <BsTooltip<ButtonProps>
//                               Tag={Button}
//                               role={'button'}
//                               color='danger'
//                               size='sm'
//                               className='btn-icon me-1 m-1'
//                               title={'Remove'}
//                               onClick={() => {
//                                 remove(index)
//                               }}
//                             >
//                               <>
//                                 <Trash2 size={16} /> {'Remove'}
//                               </>
//                             </BsTooltip>
//                           </Show>
//                           <Hide IF={state?.editData?.create_menu === 1}>
//                             <Show IF={index === fields?.length - 1}>
//                               <BsTooltip<ButtonProps>
//                                 Tag={Button}
//                                 color='primary'
//                                 size='sm'
//                                 title={'Add More'}
//                                 role={'button'}
//                                 className='btn-icon m-1'
//                                 onClick={() => {
//                                   append({})
//                                 }}
//                               >
//                                 <>
//                                   <Plus size={16} /> {'items'}
//                                 </>
//                               </BsTooltip>
//                             </Show>
//                           </Hide>
//                         </Show>
//                       </Col>

                   
//                     </Row>
//                   </CardBody>
//                 </Card>
//               ))}
//             </Row> */}
//             {/* <Row>
//               <Col md='12' className=''>
//                 <FormGroupCustom
//                   control={form.control}
//                   label={'Image Path'}
//                   name='image_path'
//                   type='dropZone'
//                   className='mb-1'
//                   // dropZoneOptions={{
//                   //     excludeFiles: meeting?.documents ?? undefined
//                   // }}
//                   //   noLabel
//                   noGroup
//                   rules={{ required: false }}
//                 />
//               </Col>
//             </Row> */}
//           </Form>
//         </div>
//       </CenteredModal>
//     )
//   }

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={'Waste Item View'}
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
              <Label className='text-uppercase mb-25'>{FM('item')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'brand'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item?.brand?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'category'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item?.category?.name}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'sub category'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item?.subcategory?.name}</p>
            </Col>
                  <Col md='6'>
              <Label className='text-uppercase mb-25'>{'packsize'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.item?.packsize?.name}</p>
            </Col>
              <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className=''>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='12'>
              <Label className='text-uppercase mb-25'>{'comment'}</Label>
              <p className='text-capitalize'>{state.selectedUser?.comment}</p>
            </Col>
             
          </Row>

     
          
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<StockItem >[] = [
 
    {
      name: 'Item',
      sortable: false,
      cell: (row) => <Fragment>{row?.item?.name}</Fragment>
    },
    
       {
      name: 'brand',
      sortable: false,
      cell: (row) => <Fragment>{row?.item?.brand?.name}</Fragment>
    },
     {
      name: 'category',
      sortable: false,
      cell: (row) => <Fragment>{row?.item?.category?.name}</Fragment>
    },
    
    
    {
      name: 'quantity',
      sortable: false,
      cell: (row) => <Fragment>{row?.quantity} {row?.item?.unit?.name}</Fragment>
    },
 
   
     {
      name: 'comment',
      sortable: false,
      cell: (row) => <Fragment>{row?.comment} </Fragment>
    },
    
    {
      name: FM('action'),
      cell: (row) => (
        <Fragment>
     
          <ButtonGroup role='group' className='my-2'>
      
            
          
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
            
            {canAddTransfer ? (
              <>
               <Show IF={row?.status === 0}>
                <UncontrolledTooltip placement='top' id='approve' target='approve'>
                  {'Approve'}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-dark btn-sm'
                  id='approve'
                  color=''
                  onClick={() => {
                    toggleModalAdd()
                    setState({ editData: row })
                    setState({selectedStatus:'approved'})
                  }}
                >
                  <Activity size={14} />
                </Button>
                </Show>
              </>
            ) : (
              ''
            )}
              {canAddTransfer ? (
              <>
               <Show IF={row?.status === 0}>
                <UncontrolledTooltip placement='top' id='reject' target='reject'>
                  {'Reject'}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-danger btn-sm'
                  id='reject'
                  color=''
                  onClick={() => {
                    toggleModalAdd()
                    setState({ editData: row })
                    setState({selectedStatus:'reject'})
                  }}
                >
                  <X size={14} />
                </Button>
                </Show>
              </>
            ) : (
              ''
            )}
{/* 
            {canDeleteUser ? (
              <>
                <Show IF={row?.status === 0}>
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
                  title={FM('delete-item', { name: row })}
                  onClickYes={() => {
                    handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Trash2 size={14} id='delete' />
                </ConfirmAlert>
                </Show>
              </>
            ) : (
              ''
            )} */}
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
       {/* {renderCreateModal()} */}
      {renderViewModal()} 

      <Header route={props?.route} icon={<List size='25' />} title='Waste Items'>
        <ButtonGroup color='dark'>
          <WastedItemFilter handleFilterData={handleFilterData} />
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

      <CustomDataTable<StockItem >
        initialPerPage={20}
        isLoading={loadMenuResp.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        hideSearch
        onSort={handleSort}
        defaultSortField={loadMenuResp?.originalArgs?.jsonData?.sort}
        paginatedData={loadMenuResp?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default WasteItems
