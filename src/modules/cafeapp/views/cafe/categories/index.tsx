import { yupResolver } from '@hookform/resolvers/yup'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
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
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, List, Plus, RefreshCcw, Save, Trash2, UserCheck, UserX, X } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonGroup, ButtonProps, Form, UncontrolledTooltip } from 'reactstrap'
import * as yup from 'yup'
import { categoryResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdatecategoryMutation,
  useDeleteCategoryByIdMutation,
  useLoadCategoriesMutation
} from '../../../redux/RTKFiles/cafe/categoryRTK'
import CategoriesFilter from './CategoriesFilter'

// validation schema jkdsadkjas
const userFormSchema = {
  name: yup.string().required()
  // tax: yup.number().label('tax').min(0.0).max(99).positive().required().moreThan(0, 'tax should not be zero or less than zero')
  //     .lessThan(100, "tax should not be more than 2 digits"),
}
// validate
const schema = yup.object(userFormSchema).required()
//fgffhgfhfghgf
// statmes
// sdkdjlkd

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  addCategory?: boolean
  reload?: any
  isAddingNewData?: boolean
  editCategory?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: categoryResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: categoryResponseTypes = {
  name: '',
  image: '',
  tax: ''
}
const Category = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // can add category
  const canAddUser = Can(Permissions.categoryCreate)
  // can edit category
  const canEditUser = Can(Permissions.categoryEdit)
  // can delete category
  const canDeleteUser = Can(Permissions.categoryDelete)

  // form hook
  const form = useForm<categoryResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  const [createCategory, createCategoryResponse] = useCreateOrUpdatecategoryMutation()
  // load users
  const [loadCategory, loadCategoryResponse] = useLoadCategoriesMutation()
  // delete mutation
  const [categorydelete, categoryrestDelete] = useDeleteCategoryByIdMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    addCategory: false,

    filterData: undefined,
    search: '',
    enableEdit: false,
    editCategory: false,
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
      addCategory: false,
      editData: null
    })
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
  log(state.editData, 'editdata')

  // handle save user
  const handleSaveUser = (userData: any) => {
    createCategory({
      jsonData: {
        ...state.editData,
        ...userData
        // ...getFIleBinaries(userData?.files)
      }
    })
  }

  // load category list
  const loadCategoryList = () => {
    loadCategory({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle pagination and load list
  useEffect(() => {
    loadCategoryList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, role_id: e?.role_id?.value },
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
  //   useEffect(() => {
  //     if (!canAddUser) return
  //     setHeaderMenu(
  //       <>
  //         <NavItem className=''>
  //           <BsTooltip title='Add Cafe'>
  //             <NavLink className='' onClick={toggleModalAdd}>
  //               <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
  //             </NavLink>
  //           </BsTooltip>
  //         </NavItem>
  //       </>
  //     )
  //     return () => {
  //       setHeaderMenu(null)
  //     }
  //   }, [modalAdd, canAddUser])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      categorydelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle user create response
  useEffect(() => {
    if (!createCategoryResponse.isUninitialized) {
      if (createCategoryResponse.isSuccess) {
        setState({ addCategory: false })
        reloadData()
        SuccessToast(
          state?.editData?.id ? 'Updated Category Successfully' : 'Created Category Successfully'
        )
      } else if (createCategoryResponse.isError) {
        // handle error
        const errors: any = createCategoryResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createCategoryResponse])

  // useEffect(() => {
  //     if (state?.editData) {
  //         form.setValue('name', state.editData?.name)
  //         form.setValue('tax', state.editData?.tax)

  //     } else {
  //         form.setValue('name', '')
  //         form.setValue('tax', '')
  //     }
  // }, [state.editData, state.editData?.name, state.editData?.tax])

  //setValue in form
  useEffect(() => {
    if (state.editData) {
      form.setValue('name', state.editData?.name)
      form.setValue('tax', state.editData?.tax)
    }
  }, [state.editData, state.editData?.name, state.editData?.tax])

  // handle action result
  useEffect(() => {
    if (categoryrestDelete?.isLoading === false) {
      if (categoryrestDelete?.isSuccess) {
        emitAlertStatus('success', null, categoryrestDelete?.originalArgs?.eventId)
      } else if (categoryrestDelete?.error) {
        emitAlertStatus('failed', null, categoryrestDelete?.originalArgs?.eventId)
      }
    }
  }, [categoryrestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<categoryResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create user modal

  // view User modal

  // table columns
  const columns: TableColumn<categoryResponseTypes>[] = [
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
      name: FM('tax'),
      sortable: false,
      id: 'tax',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            //   onClick={() => {
            //     setState({
            //       selectedUser: row
            //     })
            //   }}
            className='text-primary'
          >
            {row?.tax}
          </span>
        </Fragment>
      )
    },
    // {
    //   name: FM('role'),
    //   sortable: true,
    //   id: 'role_id',
    //   cell: (row) => <Fragment>{row?.role?.se_name}</Fragment>
    // },
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
                                    setState({ editData: row, addCategory: true })
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
                    setState({ editData: row, addCategory: true })
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

  useEffect(() => {
    if (!createCategoryResponse.isLoading && createCategoryResponse.isSuccess) {
      reloadData()
      form.reset()
    }
  }, [createCategoryResponse])
  const options: TableDropDownOptions = (selectedRows) => [
    {
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
            loadCategoryResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadCategoryResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  return (
    <Fragment>
      <Header route={props?.route} icon={<List size='25' />} title='Categories'>
        <Show IF={state?.addCategory === true}>
          <div className='animate__animated animate__bounceInLeft animate__faster'>
            <Form className='me-1' onSubmit={form.handleSubmit(handleSaveUser)}>
              <ButtonGroup>
                <FormGroupCustom
                  key={`${state?.editData?.name}`}
                  noLabel
                  // noGroup
                  control={form.control}
                  label='name'
                  name='name'
                  type='text'
                  className='mb-0'
                  // inputGroupClassName={'input-group-sm'}
                  // inputClassName={'input-sm'}
                  //   append={
                  //     <>
                  //       <LoadingButton
                  //         loading={createCategoryResponse?.isLoading}
                  //         color='primary'
                  //         type='submit'
                  //         size='sm'
                  //       >
                  //         {state.editData?.id ? <Edit size={14} /> : <Save size={14} />}
                  //       </LoadingButton>
                  //     </>
                  //   }
                  rules={{ required: true }}
                />

                <FormGroupCustom
                  key={`${state?.editData?.tax}`}
                  noLabel
                  // noGroup

                  control={form.control}
                  label='tax'
                  name='tax'
                  type='number'
                  className='mb-0 w-50'
                  append={
                    <>
                      <LoadingButton
                        loading={createCategoryResponse?.isLoading}
                        color='primary'
                        type='submit'
                        size='sm'
                      >
                        {<Save size={14} />}
                      </LoadingButton>
                    </>
                  }
                  rules={{ required: false }}
                />
              </ButtonGroup>
            </Form>
          </div>
        </Show>
        <ButtonGroup color='dark'>
          {canAddUser ? (
            <>
              <BsTooltip<ButtonProps>
                Tag={Button}
                title={state?.addCategory === true ? 'Cancel Category' : 'Create Category'}
                className='btn-icon'
                onClick={(e: any) => {
                  setState({
                    editData: null,
                    addCategory: !state.addCategory
                  })
                  if (state.editData?.id) {
                    form.reset()
                  }
                  // setEdit(item)
                }}
                // size='sm'
                color={state?.addCategory === true ? 'danger' : 'secondary'}
              >
                <>
                  <Show IF={state?.addCategory === true}>
                    <X size='14' onClick={() => closeAddModal()} />
                  </Show>
                  <Hide IF={state?.addCategory === true}>
                    <Plus size='14' onClick={() => closeAddModal()} />
                  </Hide>
                </>
              </BsTooltip>
            </>
          ) : (
            ''
          )}

          <CategoriesFilter handleFilterData={handleFilterData} />
          {/* </Show> */}
          <LoadingButton
            className='btn-icon'
            tooltip={FM('reload')}
            loading={loadCategoryResponse.isLoading}
            // size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>
      <CustomDataTable<categoryResponseTypes>
        initialPerPage={20}
        isLoading={loadCategoryResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadCategoryResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadCategoryResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Category
