import { yupResolver } from '@hookform/resolvers/yup'
import {
    useImportFileMutation,
    useTaskPredListMutation,
    useTaskViewMutation
} from '@src/modules/cafeapp/redux/RTKFiles/ImportsRTK'
import CustomDataTable, {
    TableDropDownOptions,
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { useActionUserMutation } from '@src/modules/meeting/redux/RTKQuery/UserManagement'
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
import { UserData, predListParam } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { List, RefreshCcw, Trash2, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import { ButtonGroup, Col, Label, Row } from 'reactstrap'
import * as yup from 'yup'

// validation schema
const userFormSchema = {
    name: yup.string().required(),
    role_id: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    email: yup.string().email().required(FM('email-must-be-a-valid-email')),
    designation: yup.string().required(),
    mobile_number: yup
        .string()
        .required()
        .test((value) => {
            if (value?.includes('-')) {
                return false
            } else {
                return true
            }
        })
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema
                    .min(10, FM('mobile-number-must-be-at-least-10-characters'))
                    .max(12, FM('mobile-number-must-be-at-most-12-characters'))
                    .required(),
            otherwise: (schema) => schema.required()
        }),
    password: yup.string().when('id', {
        is: (values: string) => !isValid(values),
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired()
    }),
    'confirm-password': yup.string().when('id', {
        is: (values: string) => !isValid(values),
        then: (schema) =>
            schema.required().oneOf([yup.ref('password'), null], FM('passwords-must-match')),
        otherwise: (schema) => schema.notRequired().oneOf([])
    })
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
    selectedUser?: predListParam
    enableEdit?: boolean
}

const defaultValues: UserData = {
    role_id: undefined,
    name: '',
    email: '',
    designation: '',
    mobile_number: ''
}
const TaskList = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // can add user
    const canAddUser = Can(Permissions.cafeCreate)
    // can edit user
    const canEditUser = Can(Permissions.cafeEdit)
    // can delete user
    const canDeleteUser = Can(Permissions.cafeDelete)

    // form hook
    const form = useForm<UserData>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update user mutation
    const [createUser, createUserResponse] = useImportFileMutation()
    // load users
    const [loadUsers, loadUserResponse] = useTaskPredListMutation()
    // delete mutation

    const [taskDetails, loadTaskDetails] = useTaskViewMutation()
    const [userAction, userActionResult] = useActionUserMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 20,
        filterData: undefined,
        search: '',
        enableEdit: false,
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
            enableEdit: false
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

    // handle save user

    const loadUserList = () => {
        loadUsers({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                name: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }

    const vieTaskDetails = (id: any) => {
        taskDetails({ jsonData: { id } })
    }

    useEffect(() => {
        vieTaskDetails(state.selectedUser?.task_id)
    }, [state.selectedUser])
    // handle user create response
    useEffect(() => {
        if (!createUserResponse.isUninitialized) {
            if (createUserResponse.isSuccess) {
                closeAddModal()
                loadUserList()
                SuccessToast(FM('user-created-successfully'))
            } else if (createUserResponse.isError) {
                // handle error
                const errors: any = createUserResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createUserResponse])

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
    // useEffect(() => {
    //   if (!canAddUser) return
    //   setHeaderMenu(
    //     <>
    //       <NavItem className=''>
    //         <BsTooltip title={FM('create-user')}>
    //           <NavLink className='' onClick={toggleModalAdd}>
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

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            userAction({
                ids,
                eventId,
                action
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (userActionResult?.isLoading === false) {
            if (userActionResult?.isSuccess) {
                emitAlertStatus('success', null, userActionResult?.originalArgs?.eventId)
            } else if (userActionResult?.error) {
                emitAlertStatus('failed', null, userActionResult?.originalArgs?.eventId)
            }
        }
    }, [userActionResult])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedUser)) {
            setValues<UserData>(
                {
                    id: state.selectedUser?.id
                    // name: state.selectedUser?.name,
                    // email: state.selectedUser?.email,
                    // mobile_number: state.selectedUser?.mobile_number,
                    // designation: state.selectedUser?.designation,
                    // role_id: {
                    //   label: state.selectedUser?.role?.se_name,
                    //   value: state.selectedUser?.role?.id
                    // }
                },
                form.setValue
            )
            toggleModalView()
        }
    }, [state.selectedUser])

    // view User modal
    const renderViewModal = () => {
        return (
            <CenteredModal
                open={modalView}
                title={state.selectedUser?.proj_id}
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
                    {/* <Row className='align-items-center mb-1'>
            <Col md='1'>
              <User size={35} />
            </Col>
            <Col md='8'>
              <p className='text-dark mb-0'>{FM('personal-details')}</p>
              <p className='text-muted small mb-0'>{FM('edit-description')}</p>
            </Col>
          </Row> */}
                    <Row>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Project ID</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.proj_id}
                                <span className='text-dark fw-bold text-capitalize small ms-50'>
                                    <span className={'text-danger'}>{state.selectedUser?.predtask_status_code}</span>
                                </span>
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Lag Hr CNT</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.lag_hr_cnt ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>PredTask Proj Wbs Full name</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.predtask_projwbs_wbs_full_name ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Prod Task RSRC ID</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.predtask_rsrc_id ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Task ID</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.task_id ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Pred Type</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.pred_type ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Pred Proj ID</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.pred_proj_id ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Pred Task ID</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.pred_task_id ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Pred Task Name</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.predtask_task_name ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Pred Task Name</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.predtask_task_name ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Create Date</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>Delete Date</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {formatDate(state.selectedUser?.deleted_at) ?? 'N/A'}
                            </p>
                        </Col>
                    </Row>
                </div>
            </CenteredModal>
        )
    }
    // table columns
    const columns: TableColumn<predListParam>[] = [
        {
            name: 'Project ID',
            sortable: true,
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
                        {row?.proj_id}
                    </span>
                </Fragment>
            )
        },
        {
            name: 'Task Id',
            sortable: true,
            id: 'email',
            cell: (row) => <Fragment>{row?.task_id}</Fragment>
        },
        {
            name: 'Pred Project ID',
            sortable: true,
            id: 'mobile_number',
            cell: (row) => <Fragment>{row?.pred_proj_id}</Fragment>
        },
        {
            name: 'Pred Task Id',
            sortable: true,
            id: 'task',
            cell: (row) => <Fragment>{row?.pred_task_id}</Fragment>
        },
        // {
        //   name: FM('role'),
        //   sortable: true,
        //   id: 'role_id',
        //   cell: (row) => <Fragment>{row?.role?.se_name}</Fragment>
        // },
        {
            name: 'Pred Type',
            sortable: true,
            id: 'status',
            cell: (row) => (
                <Fragment>
                    <span className={'text-success'}>{row?.pred_type}</span>
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
        //                 title={FM('delete-item', { name: row?.name })}
        //                 onClickYes={() => {
        //                   handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
        //                 }}
        //                 onSuccessEvent={onSuccessEvent}
        //               >
        //                 {FM('delete')}
        //               </ConfirmAlert>
        //             )
        //           },
        //           {
        //             IF: row?.status !== 1 && canEditUser,
        //             noWrap: true,
        //             name: (
        //               <ConfirmAlert
        //                 menuIcon={<UserCheck size={14} />}
        //                 onDropdown
        //                 eventId={`item-active-${row?.id}`}
        //                 text={FM('are-you-sure')}
        //                 title={FM('active-item', { name: row?.name })}
        //                 onClickYes={() => {
        //                   handleActions([row?.id], 'active', `item-active-${row?.id}`)
        //                 }}
        //                 onSuccessEvent={onSuccessEvent}
        //               >
        //                 {FM('activate')}
        //               </ConfirmAlert>
        //             )
        //           },
        //           {
        //             IF: row?.status === 1 && canEditUser,
        //             noWrap: true,
        //             name: (
        //               <ConfirmAlert
        //                 menuIcon={<UserX size={14} />}
        //                 onDropdown
        //                 eventId={`item-inactive-${row?.id}`}
        //                 text={FM('are-you-sure')}
        //                 title={FM('inactive-item', { name: row?.name })}
        //                 onClickYes={() => {
        //                   handleActions([row?.id], 'inactive', `item-inactive-${row?.id}`)
        //                 }}
        //                 onSuccessEvent={onSuccessEvent}
        //               >
        //                 {FM('inactivate')}
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
                        loadUserResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadUserResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                                ? 'desc'
                                : 'asc'
                            : dir
                }
            }
        })
    }
    return (
        <Fragment>
            {renderViewModal()}
            <Header route={props?.route} icon={<List size='25' />} title='Pred List'>
                <ButtonGroup color='dark'>
                    {/* <UserFilter handleFilterData={handleFilterData} /> */}
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadUserResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<predListParam>
                initialPerPage={20}
                isLoading={loadUserResponse.isLoading}
                columns={columns}
                options={options}
                hideHeader
                // selectableRows={canEditUser || canDeleteUser}
                searchPlaceholder='search-user-name'
                onSort={handleSort}
                defaultSortField={loadUserResponse?.originalArgs?.jsonData?.sort}
                // paginatedData={loadUserResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default TaskList
