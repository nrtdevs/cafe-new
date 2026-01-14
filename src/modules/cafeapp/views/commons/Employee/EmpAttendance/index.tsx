import { yupResolver } from '@hookform/resolvers/yup'
import { getUserData } from '@src/auth/utils'
import { employeeAttendanceResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdateEmpAttandanceMutation,
  useLoadEmpAttendencesMutation,
  useLoadEmpAttendencesdateMutation,
  useUpdateEmpAttandanceMutation
} from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeAttendanceRTK'
import { useLoadEmpsMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeRTK'
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
  List,
  PenTool,
  PlusCircle,
  RefreshCcw,
  Search,
  Trash2,
  UserCheck,
  UserX
} from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'
import {
  Badge,
  ButtonGroup,
  Col,
  Form,
  InputGroupText,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import * as yup from 'yup'
import EmpAttendanceFilter from './EmpAttendanceFilter'

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
  selectedUser?: employeeAttendanceResponseTypes
  enableEdit?: boolean
  editData?: any
}

const defaultValues: employeeAttendanceResponseTypes = {
  id: '',
  date: '',
  employee_attendence: '',
  employee_id: '',
  attendences: '',
  attendence: [
    {
      value: ''
    }
  ],

  created_at: '',
  updated_at: ''
}
const EpmloyeeAttendance = (props: any) => {
  // header menu context categoryResponseTypes
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
  const form = useForm<employeeAttendanceResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'attendences'
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update user mutation

  const [createAttendance, createAttRes] = useCreateOrUpdateEmpAttandanceMutation()
  // load users
  // update attendance
  const [updateAttendance, updateAttRes] = useUpdateEmpAttandanceMutation()

  const [loadAttendance, attendanceRes] = useLoadEmpAttendencesMutation()
  const [loadAttendancedate, attendancedateRes] = useLoadEmpAttendencesdateMutation()
  //
  const [loadEmployee, employeeRes] = useLoadEmpsMutation()
  const employeeData = employeeRes?.data?.payload
  // delete mutation
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
      //   const attendencess = state.editData?.attendences?.map((item: any) => {
      //     return {
      //       employee_id: item?.employee_id,
      //       attendence: item?.attendence,
      //       id: item?.id
      //     }
      //   })
      //   setValues<employeeAttendanceResponseTypes>(
      //     {
      //       attendences: attendencess
      //     },
      //     form.setValue
      //   )
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
            attendence: ''
          }
        })
        setValues<employeeAttendanceResponseTypes>(
          {
            attendences: attendencess
          },
          form.setValue
        )
      }
    }
  }, [employeeData, state.editData])

  // handle save user
  const handleSaveUser = (userData: any) => {
    // if (state.editData) {
    //     updateAttendance({
    //         jsonData: {
    //             date: formatDate(userData?.date, 'YYYY-MM-DD'),
    //             attendences: userData?.attendences
    //         }
    //     })
    // } else {
    createAttendance({
      jsonData: {
        date: formatDate(userData?.date, 'YYYY-MM-DD'),
        // attendences: userData?.attendences
        attendences: userData?.attendences?.map((item: any) => {
          return {
            employee_id: item?.employee_id?.value,
            attendence: parseInt(item?.attendence),
            id: item?.id
          }
        })
      }
    })
    // }
  }

  // load user list
  const loadUserList = () => {
    loadAttendance({
      page: state.search ? 1 : state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        cafe_id: user1?.cafe_id,
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData,
        date: state?.filterData ? '' : formatDate(new Date(), 'YYYY-MM-DD')
      }
    })
  }

  useEffect(() => {
    // if (modalAdd) {
    loadEmployee({
      jsonData: {
        cafe_id: user1?.cafe_id,
        name: isValid(form?.watch('search')) ? form?.watch('search') : null
      }
    })
    // }
  }, [modalAdd, form?.watch('search')])

  //   updatelist
  const updateLIst = (date: any) => {
    if (date) {
      loadAttendancedate({
        jsonData: {
          name: !isValid(state.filterData) ? state.search : undefined,
          ...state.filterData,
          date: date
        }
      })
      toggleModalAdd()
    }
  }
  //   useEffect(() => {
  //     setState({
  //       editData: attendancedateRes?.data?.payload
  //     })
  //   }, [attendancedateRes?.data?.payload])

  useEffect(() => {
    // updateLIst()
    if (employeeRes.isSuccess && attendanceRes.isSuccess) {
      if (attendanceRes.isSuccess) {
        const data = employeeData?.map((d) => {
          const matchingObj = attendanceRes?.data?.payload?.attendences?.data?.find(
            (s) => d.id === s.employee_id
          )
          if (matchingObj) {
            return {
              name: matchingObj?.employee?.name,
              employee_id: matchingObj?.employee_id,
              attendence: matchingObj?.attendence,
              id: matchingObj?.id
            }
          } else {
            return {
              name: d.name,
              employee_id: d.id,
              attendence: '',
              id: ''
            }
          }
        })
        if (data !== undefined) {
          setState({
            editData: data
          })
        }
        //   log('dd', data)
        if (isValidArray(data)) {
          setValues<employeeAttendanceResponseTypes>(
            {
              attendences: data?.map((item: any) => {
                return {
                  employee_id: item?.employee_id
                    ? {
                        label: item?.name,
                        value: item?.employee_id
                      }
                    : undefined,
                  attendence: item?.attendence,
                  id: item.id
                }
              })
            },
            form.setValue
          )
        }
      }
    }
  }, [employeeRes, attendanceRes, employeeData])
  //   useEffect(() => {
  //     if (employeeRes.isSuccess && loadEmpLeaveyearmonthResponse.isSuccess) {
  //         const data = employeeData?.map((d) => {
  //             const matchingObj = loadEmpLeaveyearmonthResponse?.data?.payload?.leaves?.find(
  //                 (s) => d.id === s.employee_id
  //             )
  //             if (matchingObj) {
  //                 return {
  //                     name: matchingObj?.employee?.name,
  //                     employee_id: matchingObj?.employee_id,
  //                     no_of_leaves: matchingObj?.no_of_leaves,
  //                     id: matchingObj?.id
  //                 }
  //             } else {
  //                 return {
  //                     name: d.name,
  //                     employee_id: d.id,
  //                     no_of_leaves: '0',
  //                     id: ''
  //                 }
  //             }
  //         })

  //         if (isValidArray(data)) {
  //             setValues<employeeLeaveResponseTypes>(
  //                 {
  //                     leaves: data?.map((item: any) => {
  //                         return {
  //                             employee_id: item?.employee_id
  //                                 ? {
  //                                     label: item?.name,
  //                                     value: item?.employee_id
  //                                 }
  //                                 : undefined,
  //                             no_of_leaves: item?.no_of_leaves,
  //                             id: item.id
  //                         }
  //                     })
  //                 },
  //                 form.setValue
  //             )
  //         }
  //     }
  // }, [loadEmpLeaveyearmonthResponse?.data?.payload, employeeRes])
  // handle user create response
  useEffect(() => {
    if (!createAttRes.isUninitialized) {
      if (createAttRes.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          attendancedateRes?.data?.payload
            ? 'Updated Employee  Attendance  Successfully'
            : 'Created Employee Attendance Successfully'
        )
      } else if (createAttRes.isError) {
        // handle error
        const errors: any = createAttRes.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createAttRes])

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
      filterData: { ...e, employee_id: e?.employee_id?.value },
      page: 1,
      search: '',
      per_page_record: 20
    })
  }

  // reload Data
  const reloadData = () => {
    setState({
      // page: 1,
      search: '',
      filterData: undefined,
      // per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        {attendanceRes?.data?.payload?.attendences?.data?.length === 0 ? (
          <>
            <NavItem className=''>
              <BsTooltip title='Create Attendance'>
                <NavLink className='' onClick={toggleModalAdd}>
                  <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
                </NavLink>
              </BsTooltip>
            </NavItem>
          </>
        ) : (
          ''
        )}
        {/* <Hide IF={attendancedateRes.data?.payload?.attendences?.data.length !== 0}></Hide> */}
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd, attendanceRes, canAddUser])

  // handle actions
  const handleActions = (id?: any, eventId?: any, row?: any, leaveType?: any) => {
    // log("handleAction", row)
    if (isValid(row?.employee?.id)) {
      updateAttendance({
        jsonData: {
          date: formatDate(row?.date, 'YYYY-MM-DD'),
          attendences: [
            {
              id,
              employee_id: row?.employee?.id,
              attendence: leaveType
            }
          ]
        },
        eventId
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (updateAttRes?.isLoading === false) {
      if (updateAttRes?.isSuccess) {
        emitAlertStatus('success', null, updateAttRes?.originalArgs?.eventId)
      } else if (updateAttRes?.error) {
        emitAlertStatus('failed', null, updateAttRes?.originalArgs?.eventId)
      }
    }
  }, [updateAttRes])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<employeeAttendanceResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  //SET CURRENT DATE IN DATE FIELD
  useEffect(() => {
    if (modalAdd) {
      form.setValue('date', formatDate(new Date()))
    }
  }, [modalAdd])
  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={state.enableEdit ? 'Attendance' : 'Attendance'}
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createAttRes.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  isDisabled={true}
                  label={'date'}
                  name='date'
                  type='text'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={'Search Employee'}
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
              <Col md='12'>
                <Row className='bg-primary p-1'>
                  <Col>
                    <h4 className='text-white'>Employee</h4>
                  </Col>
                  <Col>
                    <h4 className='text-white'>Present</h4>
                  </Col>
                  <Col>
                    <h4 className='text-white'>Absent</h4>
                  </Col>
                  <Col>
                    <h4 className='text-white'>Half Day</h4>
                  </Col>
                </Row>
                {fields.map((field, index) => (
                  <Row className='p-1'>
                    <Col md='6'>
                      <FormGroupCustom
                        control={form.control}
                        async
                        isClearable
                        noGroup
                        noLabel
                        isDisabled={true}
                        label='Product'
                        name={`attendences.${index}.employee_id`}
                        loadOptions={loadDropdown}
                        path={ApiEndpoints.employeList}
                        selectLabel={(e) => `${e.name} `}
                        selectValue={(e) => e.id}
                        defaultOptions
                        type='select'
                        className='mb-0'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col>
                      <FormGroupCustom
                        key={index}
                        defaultValue={
                          form.watch(`attendences.${index}.attendence`) === 2
                            ? form.watch(`attendences.${index}.attendence`)
                            : '2'
                        }
                        control={form.control}
                        label='Present'
                        name={`attendences.${index}.attendence`}
                        type='radio'
                        className=''
                        inputClassName={''}
                        rules={{ required: false }}
                      />
                    </Col>

                    <Col>
                      <FormGroupCustom
                        key={index}
                        defaultValue={
                          form.watch(`attendences.${index}.attendence`) === 1
                            ? form.watch(`attendences.${index}.attendence`)
                            : '1'
                        }
                        control={form.control}
                        label='Absent'
                        name={`attendences.${index}.attendence`}
                        type='radio'
                        className=''
                        rules={{ required: false }}
                      />
                    </Col>
                    <Col>
                      <FormGroupCustom
                        key={index}
                        defaultValue={
                          form.watch(`attendences.${index}.attendence`) === 3
                            ? form.watch(`attendences.${index}.attendence`)
                            : '3'
                        }
                        control={form.control}
                        label='HalfDay/Short Leave'
                        name={`attendences.${index}.attendence`}
                        type='radio'
                        className=''
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
        title={state.selectedUser?.date}
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
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.date}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{'email'}</Label>
              <p className=''>{state.selectedUser?.created_at ?? 'N/A'}</p>
            </Col>

            <Col md='6'>
              <Label className='text-uppercase mb-25'>Create Date</Label>
              <p className=''>{formatDate(state.selectedUser?.created_at) ?? 'N/A'}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className=''>{formatDate(state.selectedUser?.updated_at) ?? 'N/A'}</p>
            </Col>
          </Row>
        </div>
      </CenteredModal>
    )
  }

  // table columns
  const columns: TableColumn<employeeAttendanceResponseTypes>[] = [
    {
      name: FM('name'),
      sortable: false,
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
      name: FM('email'),
      sortable: false,

      cell: (row) => <Fragment>{row?.employee?.email}</Fragment>
    },
    {
      name: FM('date'),
      sortable: false,

      cell: (row) => <Fragment>{formatDate(row?.date)}</Fragment>
    },
    {
      name: FM('attendances'),
      sortable: false,

      cell: (row) => (
        <Fragment>
          <Fragment>
            {row?.attendence === 2 ? (
              <Badge pill color='light-success'>
                Present
              </Badge>
            ) : row?.attendence === 3 ? (
              <Badge pill color='light-primary'>
                Half Day
              </Badge>
            ) : (
              <Badge pill color='light-danger'>
                Absent
              </Badge>
            )}
          </Fragment>
        </Fragment>
      )
    },

    {
      name: FM('action'),
      minWidth: '10px',
      cell: (row) => (
        <Fragment>
          {/* <DropDownMenu
                        options={[
                            {
                                IF: Permissions.attendanceEdit && row?.attendence !== 2,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<PenTool size={14} />}
                                        onDropdown
                                        eventId={`attendance-${row?.id}`}
                                        text={FM('update-attendance')}
                                        title={FM('update-attendance', { name: row?.employee?.name })}
                                        onClickYes={() => {
                                            handleActions(row?.id, `attendance-${row?.id}`, row, '2')
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('mark-as-present')}
                                    </ConfirmAlert>
                                )
                            },
                            {
                                IF: Permissions.attendanceEdit && row?.attendence !== 1,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<PenTool size={14} />}
                                        onDropdown
                                        eventId={`attendance-${row?.id}`}
                                        text={FM('update-attendance')}
                                        title={FM('update-attendance', { name: row?.employee?.name })}
                                        onClickYes={() => {
                                            handleActions(row?.id, `attendance-${row?.id}`, row, '1')
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('mark-as-absent')}
                                    </ConfirmAlert>
                                )
                            },
                            {
                                IF: Permissions.attendanceEdit && row?.attendence !== 3,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<PenTool size={14} />}
                                        onDropdown
                                        eventId={`attendance-${row?.id}`}
                                        text={FM('update-attendance')}
                                        title={FM('update-attendance', { name: row?.employee?.name })}
                                        onClickYes={() => {
                                            handleActions(row?.id, `attendance-${row?.id}`, row, '3')
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('mark-as-half-day')}
                                    </ConfirmAlert>
                                )
                            }
                        ]}
                    /> */}
          <ButtonGroup role='group' className='my-2'>
            <Show IF={Permissions.attendanceEdit && row?.attendence !== 2}>
              <UncontrolledTooltip
                placement='top'
                id={`grid-delete-${row?.id}`}
                target={`grid-delete-${row?.id}`}
              >
                {FM('mark-as-present')}
              </UncontrolledTooltip>
              {}
              <ConfirmAlert
                className='d-flex waves-effect btn btn-success btn-sm'
                eventId={`attendance-${row?.id}`}
                text={FM('update-attendance')}
                title={FM('update-attendance', { name: row?.employee?.name })}
                onClickYes={() => {
                  handleActions(row?.id, `attendance-${row?.id}`, row, '2')
                }}
                onSuccessEvent={onSuccessEvent}
                id={`grid-delete-${row?.id}`}
              >
                <PenTool size={14} id={`grid-delete-${row?.id}`} />
              </ConfirmAlert>
            </Show>
            <Show IF={Permissions.attendanceEdit && row?.attendence !== 1}>
              <UncontrolledTooltip
                placement='top'
                id={`mark-as-absent-${row?.id}`}
                target={`mark-as-absent-${row?.id}`}
              >
                {FM('mark-as-absent')}
              </UncontrolledTooltip>
              <ConfirmAlert
                className='d-flex waves-effect btn btn-danger btn-sm'
                eventId={`attendance-${row?.id}`}
                text={FM('update-attendance')}
                title={FM('update-attendance', { name: row?.employee?.name })}
                onClickYes={() => {
                  handleActions(row?.id, `attendance-${row?.id}`, row, '1')
                }}
                onSuccessEvent={onSuccessEvent}
                id={`mark-as-absent-${row?.id}`}
              >
                <PenTool size={14} id={`mark-as-absent-${row?.id}`} />
              </ConfirmAlert>
            </Show>
            <Show IF={Permissions.attendanceEdit && row?.attendence !== 3}>
              <UncontrolledTooltip
                placement='top'
                id={`mark-as-half-day-${row?.id}`}
                target={`mark-as-half-day-${row?.id}`}
              >
                {FM('mark-as-half-day')}
              </UncontrolledTooltip>
              <ConfirmAlert
                className='d-flex waves-effect btn btn-primary btn-sm'
                eventId={`attendance-${row?.id}`}
                text={FM('update-attendance')}
                title={FM('update-attendance', { name: row?.employee?.name })}
                onClickYes={() => {
                  handleActions(row?.id, `attendance-${row?.id}`, row, '3')
                }}
                onSuccessEvent={onSuccessEvent}
                id={`mark-as-half-day-${row?.id}`}
              >
                <PenTool size={14} id={`mark-as-half-day-${row?.id}`} />
              </ConfirmAlert>
            </Show>
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
            attendanceRes?.originalArgs?.jsonData?.sort?.column === column?.id
              ? attendanceRes?.originalArgs?.jsonData?.sort?.dir === 'asc'
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

      <Header route={props?.route} icon={<List size='25' />} title='Attendance List'>
        <ButtonGroup color='dark'>
          <EmpAttendanceFilter handleFilterData={handleFilterData} />

          <LoadingButton
            tooltip={FM('attendance-update')}
            loading={attendancedateRes.isLoading}
            size='sm'
            color='secondary'
            onClick={() => {
              updateLIst(formatDate(new Date(), 'YYYY-MM-DD'))
            }}
          >
            <Edit size='14' />
          </LoadingButton>

          <LoadingButton
            tooltip={FM('reload')}
            loading={attendanceRes.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<employeeAttendanceResponseTypes>
        initialPerPage={20}
        isLoading={attendanceRes.isLoading}
        columns={columns}
        options={options}
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search'
        onSort={handleSort}
        defaultSortField={attendanceRes?.originalArgs?.jsonData?.sort}
        paginatedData={attendanceRes?.data?.payload?.attendences}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default EpmloyeeAttendance
