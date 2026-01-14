import { yupResolver } from '@hookform/resolvers/yup'
import CustomDataTable, {
    TableDropDownOptions,
    TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import DropDownMenu from '@src/modules/common/components/dropdown'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import {
    useActionUserMutation,
    useCreateOrUpdateUserMutation,
    useLoadUsersMutation
} from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import Hide from '@src/utility/Hide'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
    FM,
    SuccessToast,
    emitAlertStatus,
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
import { UserData } from '@src/utility/types/typeAuthApi'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import { RefreshCcw, Trash2, User, UserCheck, UserPlus, UserX, Users } from 'react-feather'
import { useForm } from 'react-hook-form'
import { ButtonGroup, Col, Form, Label, NavItem, NavLink, Row } from 'reactstrap'
import * as yup from 'yup'
import UserFilter from './UserFilter'

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
    selectedUser?: UserData
    enableEdit?: boolean
}

const defaultValues: UserData = {
    role_id: undefined,
    name: '',
    email: '',
    designation: '',
    mobile_number: ''
}
const UserList = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // can add user
    const canAddUser = Can(Permissions.dashboardBrowse)
    // can edit user
    const canEditUser = Can(Permissions.dashboardBrowse)
    // can delete user
    const canDeleteUser = Can(Permissions.dashboardBrowse)

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
    const [createUser, createUserResponse] = useCreateOrUpdateUserMutation()
    // load users
    const [loadUsers, loadUserResponse] = useLoadUsersMutation()
    // delete mutation
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
    const handleSaveUser = (userData: UserData) => {
        createUser({
            jsonData: {
                ...userData,
                role_id: userData.role_id?.value
            }
        })
    }

    // load user list
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
    useEffect(() => {
        if (!canAddUser) return
        setHeaderMenu(
            <>
                <NavItem className=''>
                    <BsTooltip title={FM('create-user')}>
                        <NavLink className='' onClick={toggleModalAdd}>
                            <UserPlus className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
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
                    id: state.selectedUser?.id,
                    name: state.selectedUser?.name,
                    email: state.selectedUser?.email,
                    mobile_number: state.selectedUser?.mobile_number,
                    designation: state.selectedUser?.designation,
                    role_id: {
                        label: state.selectedUser?.role?.se_name,
                        value: state.selectedUser?.role?.id
                    }
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
                title={state.enableEdit ? FM('edit') : FM('create-user')}
                handleModal={closeAddModal}
                loading={createUserResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row>
                            <Col md='12'>
                                <p className='text-dark mb-0'>{FM('personal-details')}</p>
                                <p className='text-muted small'>{FM('personal-details-description')}</p>
                            </Col>
                            <Col md='12'>
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
                                    label={FM('mobile-number')}
                                    name='mobile_number'
                                    type='number'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('designation')}
                                    name='designation'
                                    type='text'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <p className='text-dark mb-0'>{FM('login-details')}</p>
                                <p className='text-muted small'>{FM('login-details-description')}</p>
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('email')}
                                    name='email'
                                    type='email'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='6'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('role')}
                                    name='role_id'
                                    type='select'
                                    async
                                    loadOptions={loadDropdown}
                                    path={ApiEndpoints.roles}
                                    selectLabel={(e) => e?.se_name}
                                    selectValue={(e) => e.id}
                                    defaultOptions
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Hide IF={state.enableEdit ?? false}>
                                <Col md='6'>
                                    <FormGroupCustom
                                        control={form.control}
                                        label={FM('password')}
                                        name='password'
                                        type='password'
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                                <Col md='6'>
                                    <FormGroupCustom
                                        control={form.control}
                                        label={FM('confirm-password')}
                                        name='confirm-password'
                                        type='password'
                                        className='mb-1'
                                        rules={{ required: true }}
                                    />
                                </Col>
                            </Hide>
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
                    <Row className='align-items-center mb-1'>
                        <Col md='1'>
                            <User size={35} />
                        </Col>
                        <Col md='8'>
                            <p className='text-dark mb-0'>{FM('personal-details')}</p>
                            <p className='text-muted small mb-0'>{FM('edit-description')}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('name')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.name}
                                <span className='text-dark fw-bold text-capitalize small ms-50'>
                                    <span
                                        className={state.selectedUser?.status === 1 ? 'text-success' : 'text-danger'}
                                    >
                                        ({state.selectedUser?.status === 1 ? FM('active') : FM('inactive')})
                                    </span>
                                </span>
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('email')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.email ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('mobile-number')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.mobile_number ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('designation')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.designation ?? 'N/A'}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('role')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.role?.se_name ?? 'N/A'}
                            </p>
                        </Col>
                    </Row>
                </div>
            </CenteredModal>
        )
    }

    // table columns
    const columns: TableColumn<UserData>[] = [
        {
            name: FM('name'),
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
                        {row?.name}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('email'),
            sortable: true,
            id: 'email',
            cell: (row) => <Fragment>{row?.email}</Fragment>
        },
        {
            name: FM('mobile-number'),
            sortable: true,
            id: 'mobile_number',
            cell: (row) => <Fragment>{row?.mobile_number}</Fragment>
        },
        {
            name: FM('designation'),
            sortable: true,
            id: 'designation',
            cell: (row) => <Fragment>{row?.designation}</Fragment>
        },
        {
            name: FM('role'),
            sortable: true,
            id: 'role_id',
            cell: (row) => <Fragment>{row?.role?.se_name}</Fragment>
        },
        {
            name: FM('status'),
            sortable: true,
            id: 'status',
            cell: (row) => (
                <Fragment>
                    <span className={row?.status === 1 ? 'text-success' : 'text-danger'}>
                        {row?.status === 1 ? FM('active') : FM('inactive')}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('action'),
            cell: (row) => (
                <Fragment>
                    <DropDownMenu
                        options={[
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
                            },
                            {
                                IF: row?.status !== 1 && canEditUser,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<UserCheck size={14} />}
                                        onDropdown
                                        eventId={`item-active-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('active-item', { name: row?.name })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'active', `item-active-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('activate')}
                                    </ConfirmAlert>
                                )
                            },
                            {
                                IF: row?.status === 1 && canEditUser,
                                noWrap: true,
                                name: (
                                    <ConfirmAlert
                                        menuIcon={<UserX size={14} />}
                                        onDropdown
                                        eventId={`item-inactive-${row?.id}`}
                                        text={FM('are-you-sure')}
                                        title={FM('inactive-item', { name: row?.name })}
                                        onClickYes={() => {
                                            handleActions([row?.id], 'inactive', `item-inactive-${row?.id}`)
                                        }}
                                        onSuccessEvent={onSuccessEvent}
                                    >
                                        {FM('inactivate')}
                                    </ConfirmAlert>
                                )
                            }
                        ]}
                    />
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
            {renderCreateModal()}
            {renderViewModal()}

            <Header route={props?.route} icon={<Users size='25' />} title={FM('user-accounts')}>
                <ButtonGroup color='dark'>
                    <UserFilter handleFilterData={handleFilterData} />
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
            <CustomDataTable<UserData>
                initialPerPage={20}
                isLoading={loadUserResponse.isLoading}
                columns={columns}
                options={options}
                selectableRows={canEditUser || canDeleteUser}
                searchPlaceholder='search-user-name'
                onSort={handleSort}
                defaultSortField={loadUserResponse?.originalArgs?.jsonData?.sort}
                // paginatedData={loadUserResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default UserList
