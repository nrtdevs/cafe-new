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
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { Edit, List, PlusCircle, RefreshCcw, Search, Trash2, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import { ButtonGroup, Col, Form, InputGroupText, Label, NavItem, NavLink, Row } from 'reactstrap'
import * as yup from 'yup'

import { getUserData } from '@src/auth/utils'
import { employeeLeaveResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateEmpLeaveMutation,
  useDeleteEmpLeaveByIdMutation,
  useLoadEmpLeavesMutation,
  useLoadEmpLeavesmonthyearMutation,
  useUpdateEmpLeaveMutation
} from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeLeaveRTK'
import { useLoadEmpsMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeRTK'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import EmpLeaveFilter from './EmpLeaveFilter'

// validation schema
const userFormSchema = {
  // file: yup.string().required()
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
  selectedUser?: employeeLeaveResponseTypes
  enableEdit?: boolean
  editData?: any
  data?: any
}

const defaultValues: employeeLeaveResponseTypes = {
  cafe_id: '',
  employee_id: '',
  year_month: '',
  year: '',
  no_of_leaves: '',
  leaves: [],
  created_at: '',
  updated_at: ''
}
const EmployeeLeave = (props: any) => {
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const user = getUserData()
  // can add user
  const canAddUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeCreate) : Can(Permissions.employeeCreate)
  // can edit user
  const canEditUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeEdit) : Can(Permissions.employeeEdit)
  // can delete user
  const canDeleteUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeDelete) : Can(Permissions.employeeDelete)

  // form hook
  const form = useForm<employeeLeaveResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // const { fields, append, remove } = useFieldArray({
  //     control: form?.control,
  //     name: 'leaves'
  // })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation
  const [createEmpLeave, createEmpLeaveResponse] = useCreateOrUpdateEmpLeaveMutation()
  const [updateEmpLeave, updateEmpEmpLeaveResponse] = useUpdateEmpLeaveMutation()
  // load users
  const [loadEmpLeave, loadEmpLeaveResponse] = useLoadEmpLeavesMutation()
  const [loadEmployee, employeeRes] = useLoadEmpsMutation()
  // delete mutation
  const [empLeaveDelete, empLeaveRestDelete] = useDeleteEmpLeaveByIdMutation()
  const [loadEmpLeaveYearMonth, loadEmpLeaveYearMonthResponse] = useLoadEmpLeavesmonthyearMutation()
  const employeeData = employeeRes?.data?.payload
  //load login user detail
  const user1 = getUserData()
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
  useEffect(() => {
    if (state.editData) {
      // setValues<employeeLeaveResponseTypes>(
      //     {
      //         leaves: state.editData?.leaves?.map((item: any) => {
      //             return {
      //                 employee_id: item?.employee_id,
      //                 no_of_leaves: item?.no_of_leaves,
      //                 id: item.id
      //             }
      //         })
      //     },
      //     form.setValue
      // )
    } else {
      if (isValidArray(employeeData)) {
        const attendencess = employeeData?.map((item: any) => {
          return {
            employee_id: item?.id
              ? {
                  label: item?.name,
                  value: item?.id
                }
              : undefined,
            no_of_leaves: ''
          }
        })
        setValues<employeeLeaveResponseTypes>(
          {
            leaves: attendencess
          },
          form.setValue
        )
      }
    }
  }, [employeeData, state.editData, form.watch('search')])
  const handleSaveUser = (userData: any) => {
    // if (state.editData) {
    //   createEmpLeave({
    //     jsonData: {
    //       year_month: formatDate(userData?.year_month, 'YYYY-MM'),
    //       //   leaves: userData?.leaves,
    //       leaves: userData?.leaves?.map((item: any) => {
    //         return {
    //           employee_id: item?.employee_id?.value,
    //           no_of_leaves: item.no_of_leaves,
    //           id: item.id
    //         }
    //       })
    //     }
    //   })
    // } else {
    createEmpLeave({
      jsonData: {
        year_month: formatDate(userData?.year_month, 'YYYY-MM'),
        leaves: userData?.leaves?.map((item: any) => {
          return {
            employee_id: item?.employee_id?.value,
            no_of_leaves: item.no_of_leaves,
            id: item.id
          }
        })
      }
    })
    // }
  }

  // load user list
  const loadUserList = () => {
    loadEmpLeave({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        cafe_id: user1?.cafe_id,
        ...state.filterData
      }
    })
  }

  //   load yea month list
  const updateLIst = (dates: any) => {
    loadEmpLeaveYearMonth({
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        cafe_id: user?.cafe_id,
        month: state.filterData ? '' : formatDate(dates, 'MM'),
        year: state.filterData ? '' : formatDate(dates, 'YYYY')
      }
    })
  }

  useEffect(() => {
    if (loadEmpLeaveYearMonthResponse.isSuccess) {
      toggleModalAdd()
    }
  }, [loadEmpLeaveYearMonthResponse])

  //set the update value
  useEffect(() => {
    if (employeeRes.isSuccess && loadEmpLeaveYearMonthResponse.isSuccess) {
      const data = employeeData?.map((d) => {
        const matchingObj = loadEmpLeaveYearMonthResponse?.data?.payload?.leaves?.find(
          (s) => d?.id === s?.employee_id
        )
        if (matchingObj) {
          return {
            name: matchingObj?.employee?.name,
            employee_id: matchingObj?.employee_id,
            no_of_leaves: matchingObj?.no_of_leaves,
            id: matchingObj?.id
          }
        } else {
          return {
            name: d.name,
            employee_id: d.id,
            no_of_leaves: '0',
            id: ''
          }
        }
      })

      if (isValidArray(data)) {
        setValues<employeeLeaveResponseTypes>(
          {
            leaves: data?.map((item: any) => {
              return {
                employee_id: item?.employee_id
                  ? {
                      label: item?.name,
                      value: item?.employee_id
                    }
                  : undefined,
                no_of_leaves: item?.no_of_leaves,
                id: item?.id
              }
            })
          },
          form.setValue
        )
      }
    }
  }, [loadEmpLeaveYearMonthResponse?.data?.payload, employeeRes])

  useEffect(() => {
    if (modalAdd) {
      const timer = setTimeout(() => {
        loadEmployee({
          jsonData: {
            cafe_id: user1?.cafe_id,
            name: isValid(form?.watch('search')) ? form?.watch('search') : null
          }
        })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [modalAdd, form?.watch('search')])

  // handle user create response
  useEffect(() => {
    if (!createEmpLeaveResponse.isUninitialized || !updateEmpEmpLeaveResponse.isUninitialized) {
      if (createEmpLeaveResponse.isSuccess || updateEmpEmpLeaveResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          loadEmpLeaveResponse.data?.payload?.leaves?.data.length !== 0 ? (
            <>{FM('updated-employee-leaves-successfully')}</>
          ) : (
            <>{FM('created-employee-leaves-successfully')}</>
          )
        )
      } else if (createEmpLeaveResponse.isError || updateEmpEmpLeaveResponse.isError) {
        // handle error
        const errors: any = createEmpLeaveResponse.error || updateEmpEmpLeaveResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createEmpLeaveResponse, updateEmpEmpLeaveResponse])

  // handle pagination and load list
  useEffect(() => {
    loadUserList()
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
        employee_id: e?.employee_id?.value,
        month: formatDate(e?.date, 'MM'),
        year: formatDate(e?.date, 'YYYY')
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
        {loadEmpLeaveResponse.data?.payload?.leaves?.data.length === 0 ? (
          <>
            <NavItem className=''>
              <BsTooltip title={FM('add-employee-leave')}>
                <NavLink className='' onClick={toggleModalAdd}>
                  <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
                </NavLink>
              </BsTooltip>
            </NavItem>
          </>
        ) : (
          ''
        )}
        {/* <Hide IF={loadEmpLeaveResponse.data?.payload?.leaves?.data.length !== 0}></Hide> */}
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd, canAddUser, loadEmpLeaveResponse])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      empLeaveDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  //SET CURRENT DATE IN DATE FIELD
  useEffect(() => {
    if (modalAdd) {
      form.setValue('year_month', formatDate(new Date()))
    }
  }, [modalAdd])

  // handle action result
  useEffect(() => {
    if (empLeaveRestDelete?.isLoading === false) {
      if (empLeaveRestDelete?.isSuccess) {
        emitAlertStatus('success', null, empLeaveRestDelete?.originalArgs?.eventId)
      } else if (empLeaveRestDelete?.error) {
        emitAlertStatus('failed', null, empLeaveRestDelete?.originalArgs?.eventId)
      }
    }
  }, [empLeaveRestDelete])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<employeeLeaveResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={
          loadEmpLeaveResponse.data?.payload?.leaves?.data.length !== 0 ? (
            <>{FM('update-employee-leave')}</>
          ) : (
            <>{FM('create-employee-leave')}</>
          )
        }
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createEmpLeaveResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  isDisabled={true}
                  label={FM('date')}
                  name='year_month'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='6' lg='6' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('search-employee')}
                  name='search'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                  append={
                    <InputGroupText>
                      <Search size={14} />
                    </InputGroupText>
                  }
                />
              </Col>
              <Col md='12' lg='12' sm='12' xs='12'>
                <Row className='bg-primary p-1'>
                  <Col>
                    <h4 className='text-white'>{FM('employee')}</h4>
                  </Col>
                  <Col>
                    <h4 className='text-white'>{FM('assign-No.of-Leave')}</h4>
                  </Col>
                </Row>

                {employeeData &&
                  employeeData.map((item: any, index) => (
                    <Row className='p-1'>
                      <Col md='4' className='text-capitalize'>
                        {item?.name}
                      </Col>
                      <Col md='2'>
                        <FormGroupCustom
                          control={form.control}
                          async
                          isClearable
                          noGroup
                          noLabel
                          isDisabled={true}
                          label={FM('employee')}
                          name={`leaves.${index}.employee_id`}
                          loadOptions={loadDropdown}
                          path={ApiEndpoints.employeList}
                          selectLabel={(e) => `${e.name} `}
                          selectValue={(e) => e.id}
                          defaultOptions
                          type='hidden'
                          className='mb-0'
                          rules={{ required: true }}
                        />
                      </Col>
                      <Col md='6'>
                        <FormGroupCustom
                          noGroup
                          noLabel
                          key={index}
                          control={form.control}
                          label='no of leaves'
                          name={`leaves.${index}.no_of_leaves`}
                          type='number'
                          className=''
                          inputClassName={''}
                          rules={{ required: false }}
                        />
                      </Col>
                    </Row>
                  ))}
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
        title={state.selectedUser?.employee_id}
        done='edit'
        hideClose
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          // closeViewModal(false)
          toggleModalAdd()
        }}
        // handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          <Row>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.employee_id}</p>
            </Col>

            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Start Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>End Date</Label>
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
  const columns: TableColumn<employeeLeaveResponseTypes>[] = [
    {
      name: FM('name'),
      sortable: true,
      id: 'name',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            // onClick={() => {
            //     setState({
            //         selectedUser: row
            //     })
            // }}
            className='text-primary'
          >
            {row?.employee?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('no-of-leaves'),
      sortable: true,
      cell: (row) => <Fragment>{row?.no_of_leaves}</Fragment>
    },

    {
      name: FM('created-date'),
      sortable: true,
      id: 'Created Date',
      cell: (row) => (
        <Fragment>
          <Fragment>{formatDate(row?.created_at)}</Fragment>
        </Fragment>
      )
    }

    // {
    //   name: FM('action'),
    //   cell: (row) => (
    //     <Fragment>
    //       <DropDownMenu
    //         options={[
    //           {
    //             IF: canDeleteUser,
    //             noWrap: true,
    //             name: (
    //               <ConfirmAlert
    //                 menuIcon={<Trash2 size={14} />}
    //                 onDropdown
    //                 eventId={`item-delete-${row?.id}`}
    //                 text={FM('are-you-sure')}
    //                 title={FM('delete-item', { name: row?.employee?.name })}
    //                 onClickYes={() => {
    //                   handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
    //                 }}
    //                 onSuccessEvent={onSuccessEvent}
    //               >
    //                 {FM('delete')}
    //               </ConfirmAlert>
    //             )
    //           }

    //         ]}
    //       />
    //     </Fragment>
    //   )
    // }
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
            loadEmpLeaveResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadEmpLeaveResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Employee Leave List'>
        <ButtonGroup color='dark'>
          <EmpLeaveFilter handleFilterData={handleFilterData} />
          <LoadingButton
            tooltip={'Leave Update'}
            loading={loadEmpLeaveResponse.isLoading || loadEmpLeaveYearMonthResponse.isLoading}
            size='sm'
            color='secondary'
            onClick={() => {
              updateLIst(formatDate(new Date(), 'YYYY-MM'))
            }}
          >
            <Edit size='14' />
          </LoadingButton>
          <LoadingButton
            tooltip={FM('reload')}
            loading={loadEmpLeaveResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<employeeLeaveResponseTypes>
        initialPerPage={20}
        isLoading={loadEmpLeaveResponse.isLoading}
        columns={columns}
        options={options}
        hideHeader
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadEmpLeaveResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadEmpLeaveResponse?.data?.payload?.leaves}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default EmployeeLeave
