import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
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
import BsPopover from '@src/modules/common/components/popover'
import BsTooltip from '@src/modules/common/components/tooltip'
import { getPath } from '@src/router/RouteHelper'
import { ActionStratus, priorityType } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    SuccessToast,
    createConstSelectOptions,
    emitAlertStatus,
    formatDate,
    getKeyByValue,
    isObjEmpty,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    setValues,
    truncateText
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { ActionItem } from '@src/utility/types/typeMeeting'
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
    CheckCircle,
    Pause,
    Percent,
    Play,
    RefreshCcw,
    X
} from 'react-feather'
import { FileIcon, defaultStyles } from 'react-file-icon'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
    Badge,
    ButtonGroup,
    Col,
    Form,
    InputGroupText,
    Nav,
    NavItem,
    NavLink,
    Progress,
    Row,
    TabContent,
    TabPane
} from 'reactstrap'
import * as yup from 'yup'
import {
    useActionItemActionMutation,
    useCreateOrUpdateActionMutation,
    useLoadActionsMutation
} from '../../redux/RTKQuery/ActionMangement'
import ActionFilter from './ActionFilter'

// validation schema
const userFormSchema = {
    task: yup.string().required(),
    comment: yup.string().required()
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
    selectedItem?: ActionItem
    type?: string
    enableEdit?: boolean
}

const defaultValues: ActionItem = {
    //   meeting_title: '',
    //   meeting_time: '',
    //   meeting_date: '',
    //   agenda_of_meeting: '',
    //   douments: null,
    //   attendees: null
}
const ActionList = (props: any) => {
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // user hook
    const user = useUser()
    // can add action
    const canAddAction = Can(Permissions.adminEmployeeBrowse)
    // can edit action
    const canEditAction = Can(Permissions.dashboardBrowse)
    // can delete action
    const canDeleteAction = Can(Permissions.dashboardBrowse)
    // check read permission
    const canView = Can(Permissions.dashboardBrowse)
    // form hook
    const form = useForm<ActionItem>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update mutation
    const [createAction, createActionResponse] = useCreateOrUpdateActionMutation()
    // load data mutation
    const [loadActions, loadActionResponse] = useLoadActionsMutation()
    // delete mutation
    const [actionItemAction, actionItemActionResponse] = useActionItemActionMutation()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 50,
        filterData: undefined,
        search: '',
        enableEdit: false,
        lastRefresh: new Date().getTime()
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)
    // ** State
    const [active, setActive] = useState('1')

    const toggle = (tab) => {
        if (active !== tab) {
            setActive(tab)
        }
    }

    // close add
    const closeAddModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false
        })
        form.reset()
        toggleModalAdd()
    }

    // close view modal
    const closeViewModal = (reset = true) => {
        if (reset) {
            setState({
                selectedItem: undefined,
                type: undefined
            })
            form.reset()
        }
        toggleModalView()
    }

    // handle save user
    const handleSaveActions = (data: ActionItem) => {
        createAction({
            jsonData: {
                ...data,
                priority: data?.priority?.value,
                meeting_id: data?.meeting_id?.value,
                owner_id: user?.id,
                note_id: data?.note_id?.value
            }
        })
    }

    // load meeting list
    const loadMeetingList = () => {
        if (isValid(user?.id)) {
            loadActions({
                page: state.page,
                per_page_record: state.per_page_record,
                jsonData: {
                    task: !isValid(state.filterData) ? state.search : undefined,
                    ...state.filterData,
                    owner_id: user?.role_id === 2 ? user?.id : state?.filterData?.owner_id ?? undefined
                }
            })
        }
    }

    // handle meeting create response
    useEffect(() => {
        if (!createActionResponse.isUninitialized) {
            if (createActionResponse.isSuccess) {
                closeAddModal()
                loadMeetingList()
                SuccessToast(FM('meeting-created-successfully'))
            } else if (createActionResponse.isError) {
                // handle error
                const errors: any = createActionResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createActionResponse])

    // handle pagination and load list
    useEffect(() => {
        loadMeetingList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh, user])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({
            filterData: {
                ...e,
                owner_id: e?.owner_id?.value,
                status: e?.status?.value,
                priority: e?.priority?.value
            },
            page: 1,
            search: '',
            per_page_record: 50
        })
    }

    // reload Data
    const reloadData = () => {
        setState({
            page: 1,
            search: '',
            filterData: undefined,
            per_page_record: 50,
            lastRefresh: new Date().getTime()
        })
    }

    // handle sort
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadActionResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadActionResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                                ? 'desc'
                                : 'asc'
                            : dir
                }
            }
        })
    }
    //   // create a menu on header
    //   useEffect(() => {
    //     setHeaderMenu(
    //       <>
    //         <NavItem className=''>
    //           <BsTooltip title={FM('new-action')}>
    //             <NavLink className='' onClick={toggleModalAdd}>
    //               <PlaylistAddIcon
    //                 fontSize='large'
    //                 className={' ' + (modalAdd ? 'text-primary' : '')}
    //               />
    //             </NavLink>
    //           </BsTooltip>
    //         </NavItem>
    //       </>
    //     )
    //     return () => {
    //       setHeaderMenu(null)
    //     }
    //   }, [modalAdd])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any, percent?: any) => {
        if (isValidArray(ids)) {
            actionItemAction({
                ids,
                id: ids[0],
                eventId,
                action,
                percent
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (actionItemActionResponse?.isLoading === false) {
            if (actionItemActionResponse?.isSuccess) {
                emitAlertStatus('success', null, actionItemActionResponse?.originalArgs?.eventId)
            } else if (actionItemActionResponse?.error) {
                emitAlertStatus('failed', null, actionItemActionResponse?.originalArgs?.eventId)
            }
        }
    }, [actionItemActionResponse])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedItem)) {
            setValues<ActionItem>(
                {
                    //   id: state.selectedItem?.id,
                    //   name: state.selectedItem?.name,
                    //   email: state.selectedItem?.email,
                    //   mobile_number: state.selectedItem?.mobile_number,
                    //   designation: state.selectedItem?.designation
                },
                form.setValue
            )
            toggleModalView()
        }
    }, [state.selectedItem])

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'edit' : 'save'}
                title={state.enableEdit ? FM('edit') : FM('create-action')}
                hideClose
                scrollControl={false}
                modalClass={'modal-md'}
                // extraButtons={
                //   <LoadingButton loading={false} color='primary'>
                //     {FM('start-now')}
                //   </LoadingButton>
                // }
                handleModal={closeAddModal}
                loading={createActionResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveActions)}
            >
                <div className='p-2' style={{ minHeight: '71vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSaveActions)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Nav pills className='bg-light'>
                            <NavItem>
                                <NavLink
                                    active={active === '1'}
                                    onClick={() => {
                                        toggle('1')
                                    }}
                                >
                                    {FM('action')}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={active === '2'}
                                    onClick={() => {
                                        toggle('2')
                                    }}
                                >
                                    {FM('date')}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={active === '3'}
                                    onClick={() => {
                                        toggle('3')
                                    }}
                                >
                                    {FM('details')}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={active === '4'}
                                    onClick={() => {
                                        toggle('4')
                                    }}
                                >
                                    {FM('images')}
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent className='py-50' activeTab={active}>
                            <TabPane tabId='1'>
                                <Row>
                                    {/* <Col md='12'>
                    <p className='text-dark mb-0'>{FM('basic-details')}</p>
                    <p className='text-muted small'>{FM('basic-details-description')}</p>
                  </Col> */}
                                    {/* <Col md='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('owner')}
                      name='owner_id'
                      loadOptions={loadDropdown}
                      path={ApiEndpoints.users}
                      selectLabel={(e) => `${e.email} | ${e.name} `}
                      selectValue={(e) => e.id}
                      //   noLabel
                      defaultOptions
                      creatable
                      errorMessage={FM('please-enter-a-valid-email')}
                      createLabel='invite'
                      type='select'
                      className='mb-2'
                      rules={{ required: true }}
                    />
                  </Col> */}
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM(' priority')}
                                            name='priority'
                                            selectOptions={createConstSelectOptions(priorityType, FM)}
                                            type='select'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('meeting')}
                                            name='meeting_id'
                                            loadOptions={loadDropdown}
                                            path={ApiEndpoints.meetings}
                                            selectLabel={(e) => `${e.meeting_title} `}
                                            selectValue={(e) => e.id}
                                            //   noLabel
                                            defaultOptions
                                            creatable
                                            //   isMulti
                                            errorMessage={FM('please-enter-a-valid-meeting')}
                                            createLabel='invite'
                                            type='select'
                                            className='mb-2'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('notes')}
                                            name='note_id'
                                            loadOptions={loadDropdown}
                                            path={ApiEndpoints.notes}
                                            selectLabel={(e) => `${e.notes} | ${e.duration} `}
                                            selectValue={(e) => e.id}
                                            //   noLabel
                                            defaultOptions
                                            creatable
                                            errorMessage={FM('please-enter-a-valid-note')}
                                            createLabel='invite'
                                            type='select'
                                            className='mb-2'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId='2'>
                                <Row>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('open-date')}
                                            name='date_opened'
                                            type='date'
                                            className='mb-1'
                                            datePickerOptions={{
                                                minDate: new Date()
                                            }}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('due-date')}
                                            name='due_date'
                                            type='date'
                                            className='mb-1'
                                            datePickerOptions={{
                                                minDate: new Date()
                                            }}
                                            rules={{ required: true }}
                                        />
                                    </Col>

                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('complete-percentage')}
                                            name='complete_percentage'
                                            type='number'
                                            className='mb-1'
                                            rules={{ required: true, max: 100, min: 0.01, maxLength: 5 }}
                                            append={<InputGroupText>%</InputGroupText>}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>

                            <TabPane tabId='3'>
                                <Row>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('task')}
                                            name='task'
                                            type='textarea'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>

                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('comment')}
                                            name='comment'
                                            type='textarea'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId='4'>
                                <Row>
                                    <Col md='12'>
                                        <p className='text-dark mb-0'>{FM('attach-documents')}</p>
                                        {/* <p className='text-muted small mb-2'>
                      {FM('add-documents-required-on-meeting')}
                    </p> */}
                                    </Col>
                                    <Col md='12' className=''>
                                        <div className=''>{/* <DropZone  /> */}</div>
                                    </Col>
                                </Row>
                            </TabPane>
                        </TabContent>
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
                title={state?.type === 'task' ? FM('task') : FM('comment')}
                done='edit'
                hideSave
                hideClose
                disableFooter
                handleModal={() => closeViewModal(true)}
            >
                <div className='p-2'>
                    {state?.type === 'task' ? state?.selectedItem?.task : state?.selectedItem?.comment}
                </div>
            </CenteredModal>
        )
    }

    // handle form errors set active tab
    useEffect(() => {
        if (!isObjEmpty(form.formState.errors)) {
            const keys = Object.keys(form.formState.errors)
            if (
                keys.includes('attendees') &&
                (keys.includes('meeting_title') ||
                    keys.includes('meeting_time') ||
                    keys.includes('meeting_date'))
            ) {
                setActive('1')
            } else {
                setActive('2')
            }

            log('form.formState.errors', form.formState.errors)
        }
    }, [form.formState.errors])

    // table columns
    const columns: TableColumn<ActionItem>[] = [
        {
            name: FM('meeting'),
            minWidth: '200px',
            cell: (row) => (
                <Fragment>
                    <Show IF={isValid(row?.meeting?.id)}>
                        <Link
                            state={{ ...row?.meeting }}
                            to={getPath('meeting.view', { id: row?.meeting?.id })}
                            role={'button'}
                            className={canView ? 'text-primary' : 'pe-none'}
                        >
                            {truncateText(row?.meeting?.meeting_title, 50)}
                        </Link>
                    </Show>
                </Fragment>
            )
        },
        {
            name: FM('task'),
            minWidth: '200px',
            sortable: true,
            id: 'task',
            cell: (row) => (
                <Fragment>
                    {/* <BsPopover content={row?.task}> */}
                    <span
                        role={'button'}
                        className='text-primary'
                        onClick={(e) => {
                            setState({
                                type: 'task',
                                selectedItem: row
                            })
                        }}
                    >
                        {truncateText(row?.task, 50)}
                    </span>
                    {/* </BsPopover> */}
                </Fragment>
            )
        },
        {
            name: FM('comment'),
            minWidth: '200px',
            sortable: true,
            id: 'comment',
            cell: (row) => (
                <Fragment>
                    {/* <BsPopover content={row?.comment}> */}
                    <span
                        role={'button'}
                        className='text-primary'
                        onClick={(e) => {
                            setState({
                                type: 'comment',
                                selectedItem: row
                            })
                        }}
                    >
                        {truncateText(row?.comment, 50)}
                    </span>
                    {/* </BsPopover> */}
                </Fragment>
            )
        },
        {
            name: FM('documents'),
            minWidth: '150px',
            sortable: false,
            id: 'documents',
            cell: (row) => (
                <Fragment>
                    <div className={row?.documents?.length ? '' : 'pe-none'}>
                        <BsPopover
                            title={FM('documents')}
                            content={
                                <>
                                    <div className=''>
                                        {row?.documents?.map((a) => (
                                            <div className='file-list mb-50'>
                                                <FileIcon
                                                    extension={a.file_extension}
                                                    {...defaultStyles[a.file_extension]}
                                                />
                                                <a href={a?.document} target={'_blank'}>
                                                    {a?.uploading_file_name}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            }
                        >
                            <div className={row?.documents?.length ? 'text-primary' : ''} role={'button'}>
                                {FM('documents')}
                            </div>
                        </BsPopover>
                    </div>
                </Fragment>
            )
        },
        {
            name: FM('priority'),
            minWidth: '100px',
            sortable: true,
            id: 'priority',
            cell: (row) => <Fragment>{FM(row?.priority)}</Fragment>
        },
        {
            name: FM('due-date'),
            minWidth: '150px',
            sortable: true,
            id: 'due_date',
            cell: (row) => <Fragment>{formatDate(row?.due_date)}</Fragment>
        },
        {
            name: FM('status'),
            minWidth: '100px',
            sortable: true,
            id: 'status',
            cell: (row) => (
                <Fragment>
                    <Badge
                        color={
                            row?.status === 'completed'
                                ? 'success'
                                : row?.status === 'cancelled'
                                    ? 'danger'
                                    : row?.status === 'on_hold'
                                        ? 'warning'
                                        : row?.status === 'in_progress'
                                            ? 'primary'
                                            : 'secondary'
                        }
                    >
                        {FM(getKeyByValue(ActionStratus, row?.status))}
                    </Badge>
                </Fragment>
            )
        },
        {
            name: FM('complete-percentage'),
            minWidth: '150px',
            sortable: true,
            id: 'complete_percentage',
            cell: (row) => (
                <Fragment>
                    <div className='flex-1'>
                        <BsTooltip title={`${row?.complete_percentage}%`}>
                            <Progress value={row?.complete_percentage}>
                                {/* <Show IF={row?.complete_percentage > 25}>
                  <span className='small' style={{ fontSize: 9, fontWeight: 'bold' }}>
                    {row?.complete_percentage}%
                  </span>
                </Show> */}
                            </Progress>
                        </BsTooltip>
                    </div>
                </Fragment>
            )
        },
        {
            name: FM('completion-date'),
            minWidth: '150px',
            sortable: true,
            id: 'complete_date',
            cell: (row) => <Fragment>{formatDate(row?.complete_date, 'DD MMM YYYY', 'N/A')}</Fragment>
        },

        {
            name: FM('date-opened'),
            minWidth: '150px',
            sortable: true,
            id: 'date_opened',
            cell: (row) => <Fragment>{formatDate(row?.date_opened)}</Fragment>
        },
        {
            name: FM('mm-ref-id'),
            minWidth: '200px',
            sortable: true,
            id: 'mm_ref_id',
            cell: (row) => <Fragment>{row?.mm_ref_id}</Fragment>
        },
        // {
        //   name: FM('created-at'),
        //   minWidth: '100px',

        //   cell: (row) => (
        //     <Fragment>
        //       {formatDate(row?.created_at)}
        //     </Fragment>
        //   )
        // },
        {
            name: FM('action'),
            minWidth: '100px',

            cell: (row) => (
                <Fragment>
                    <Show IF={row?.status !== 'completed'}>
                        <DropDownMenu
                            options={[
                                {
                                    IF: row?.status === 'in_progress' && row?.status !== 'completed',
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<Percent size={14} />}
                                            onDropdown
                                            input={'range'}
                                            percentage={row?.complete_percentage}
                                            eventId={`item-percentage-${row?.id}`}
                                            text={FM('selected-percentage')}
                                            title={FM('percentage-selected', { count: 1 })}
                                            onClickYes={(e: string) => {
                                                handleActions([row?.id], 'percentage', `item-percentage-${row?.id}`, e)
                                            }}
                                            onSuccessEvent={onSuccessEvent}
                                        >
                                            {FM('percentage')}
                                        </ConfirmAlert>
                                    )
                                },
                                {
                                    IF: row?.status !== 'completed',
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<CheckCircle size={14} />}
                                            onDropdown
                                            eventId={`item-complete-${row?.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('complete-selected', { count: 1 })}
                                            onClickYes={() => {
                                                handleActions([row?.id], 'completed', `item-complete-${row?.id}`)
                                            }}
                                            onSuccessEvent={onSuccessEvent}
                                        >
                                            {FM('complete')}
                                        </ConfirmAlert>
                                    )
                                },
                                {
                                    IF: row?.status !== 'on_hold' && row?.status !== 'completed',
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<Pause size={14} />}
                                            onDropdown
                                            eventId={`item-on-hold-${row?.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('on-hold-selected', { count: 1 })}
                                            onClickYes={() => {
                                                handleActions([row?.id], 'on_hold', `item-on-hold-${row?.id}`)
                                            }}
                                            onSuccessEvent={onSuccessEvent}
                                        >
                                            {FM('on-hold')}
                                        </ConfirmAlert>
                                    )
                                },
                                {
                                    IF: row?.status !== 'in_progress' && row?.status !== 'completed',
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<Play size={14} />}
                                            onDropdown
                                            eventId={`item-in-progress-${row.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('in-progress-selected', { count: 1 })}
                                            onClickYes={() => {
                                                handleActions([row?.id], 'in_progress', `item-in-progress-${row.id}`)
                                            }}
                                            onSuccessEvent={onSuccessEvent}
                                        >
                                            {FM('in-progress')}
                                        </ConfirmAlert>
                                    )
                                },
                                {
                                    IF: row?.status !== 'cancelled' && row?.status !== 'completed',
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<X size={14} />}
                                            onDropdown
                                            eventId={`item-cancelled-${row?.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('in-progress-selected', { count: 1 })}
                                            onClickYes={() => {
                                                handleActions([row?.id], 'cancelled', `item-cancelled-${row?.id}`)
                                            }}
                                            onSuccessEvent={onSuccessEvent}
                                        >
                                            {FM('cancelled')}
                                        </ConfirmAlert>
                                    )
                                }
                            ]}
                        />
                    </Show>
                </Fragment>
            )
        }
    ]
    const onSuccessEvent = () => {
        reloadData()
    }
    const options: TableDropDownOptions = (selectedRows) => [
        // {
        //   noWrap: true,
        //   name: (
        //     <ConfirmAlert
        //       menuIcon={<Percent size={14} />}
        //       onDropdown
        //       input={'range'}
        //       percentage={0}
        //       eventId={`item-percentage`}
        //       text={FM('selected-percentage')}
        //       title={FM('percentage-selected', { count: 1 })}
        //       onClickYes={(e: string) => {
        //         handleActions(selectedRows?.ids, 'percentage', `item-percentage`, e)
        //       }}
        //       onSuccessEvent={onSuccessEvent}
        //     >
        //       {FM('percentage')}
        //     </ConfirmAlert>
        //   )
        // },
        {
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<CheckCircle size={14} />}
                    onDropdown
                    eventId={`item-complete`}
                    text={FM('are-you-sure')}
                    title={FM('complete-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'completed', 'item-complete')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('complete')}
                </ConfirmAlert>
            )
        },
        {
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<Pause size={14} />}
                    onDropdown
                    eventId={`item-on-hold`}
                    text={FM('are-you-sure')}
                    title={FM('on-hold-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'on_hold', 'item-on-hold')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('on-hold')}
                </ConfirmAlert>
            )
        },
        {
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<Play size={14} />}
                    onDropdown
                    eventId={`item-in-progress`}
                    text={FM('are-you-sure')}
                    title={FM('in-progress-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'in_progress', 'item-in-progress')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('in-progress')}
                </ConfirmAlert>
            )
        },
        {
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<X size={14} />}
                    onDropdown
                    eventId={`item-cancelled`}
                    text={FM('are-you-sure')}
                    title={FM('in-progress-selected', { count: selectedRows?.selectedCount })}
                    onClickYes={() => {
                        handleActions(selectedRows?.ids, 'cancelled', 'item-cancelled')
                    }}
                    onSuccessEvent={onSuccessEvent}
                >
                    {FM('cancelled')}
                </ConfirmAlert>
            )
        }
    ]
    //   const tests = [
    //     {
    //       project: 'L&T Construction',
    //       profiles: [
    //         {
    //           profile_name: 'RMHS Civil Sheet',
    //           manpower: '10',
    //           work_package: 'L&T Package'
    //         },
    //         {
    //           profile_name: 'Project 3',
    //           manpower: '20',
    //           work_package: 'L&T Package'
    //         }
    //       ]
    //     },
    //     {
    //       project: 'L&T Construction',
    //       profiles: [
    //         {
    //           profile_name: 'RMHS Civil Sheet',
    //           manpower: '5',
    //           work_package: 'L&T Package'
    //         },
    //         {
    //           profile_name: 'Project 3',
    //           manpower: '6',
    //           work_package: 'L&T Package'
    //         }
    //       ]
    //     },
    //     {
    //       project: 'L&T Construction 2',
    //       profiles: [
    //         {
    //           profile_name: 'RMHS Civil Sheet',
    //           manpower: '12',
    //           work_package: 'L&T Package 1'
    //         },
    //         {
    //           profile_name: 'Project 3',
    //           manpower: '22',
    //           work_package: 'L&T Package 2'
    //         }
    //       ]
    //     },
    //     {
    //       project: 'L&T Construction 3',
    //       profiles: [
    //         {
    //           profile_name: 'RMHS Civil Sheet',
    //           manpower: '312',
    //           work_package: 'L&T Package'
    //         },
    //         {
    //           profile_name: 'Project 3',
    //           manpower: '232',
    //           work_package: 'L&T Package 2'
    //         }
    //       ]
    //     },
    //     {
    //       project: 'L&T Construction',
    //       profiles: [
    //         {
    //           profile_name: 'RMHS Civil Sheet',
    //           manpower: '59',
    //           work_package: 'L&T Package'
    //         },
    //         {
    //           profile_name: 'Project 3',
    //           manpower: '5',
    //           work_package: 'L&T Package 2'
    //         }
    //       ]
    //     }
    //   ]
    //   // sum all the manpower by project and work_package
    //   const groupProject = () => {
    //     const re: any[] = []
    //     fastLoop(tests, (test, index) => {
    //       if (re?.hasOwnProperty(test?.project)) {
    //         re[test?.project] = ''
    //       } else {
    //         re[test?.project] = ''
    //       }
    //     })
    //     // log(re)
    //     return re
    //   }

    //   // merge work_package
    //   const getWorkPackage = (key?: string) => {
    //     const oreo: any[] = []
    //     const re: any[] = []
    //     fastLoop(tests, (test, index) => {
    //       if (key) {
    //         if (re?.hasOwnProperty(test?.project)) {
    //           re[test?.project] = {
    //             data: [...re[test?.project]?.data, ...test?.profiles?.map((a) => a)],
    //             project: test?.project
    //           }
    //         } else {
    //           re[test?.project] = { data: test?.profiles?.map((a) => a), project: test?.project }
    //         }
    //       }
    //       fastLoop(test?.profiles, (profile, index) => {
    //         // find name
    //         const findIndex = oreo?.findIndex((a) => a?.name === profile?.work_package)
    //         if (findIndex !== -1) {
    //           oreo[findIndex] = {
    //             name: profile?.work_package,
    //             manpower: key
    //               ? re[key]?.data
    //                   ?.filter((a) => a?.work_package === profile?.work_package)
    //                   ?.map((a) => a?.manpower)
    //                   .reduce((partialSum, a) => Number(partialSum) + Number(a), 0)
    //               : 0,
    //             key
    //           }
    //         } else {
    //           oreo.push({
    //             name: profile?.work_package,
    //             manpower: key
    //               ? re[key]?.data
    //                   ?.filter((a) => a?.work_package === profile?.work_package)
    //                   ?.map((a) => a?.manpower)
    //                   .reduce((partialSum, a) => Number(partialSum) + Number(a), 0)
    //               : 0,
    //             key
    //           })
    //         }
    //       })
    //     })
    //     log(oreo)
    //     return oreo
    //   }

    //   // get the manpower by work_package
    //   const getPackageWiseData = (key: string) => {
    //     const re: any[] = []
    //     fastLoop(getWorkPackage(key), (work_package, index) => {
    //       re.push(<td>{work_package?.manpower ?? 0}</td>)
    //     })
    //     return re
    //   }

    //   // loop through all the projects
    //   const renderTrTd = () => {
    //     const re: any[] = []
    //     for (const [key, value] of Object.entries(groupProject())) {
    //       re.push(
    //         <tr>
    //           <td>{key}</td>
    //           {getPackageWiseData(key)}
    //         </tr>
    //       )
    //     }
    //     return re
    //   }
    return (
        <Fragment>
            {renderCreateModal()}
            {renderViewModal()}
            {/* <Table>
        <thead>
          <tr>
            <th>Project</th>
            {getWorkPackage().map((workPackage, index) => {
              return <th>{workPackage?.name}</th>
            })}
          </tr>
        </thead>
        <tbody>{renderTrTd()}</tbody>
      </Table> */}

            <Header route={props?.route} icon={<CheckCircle size='25' />} title={FM('action')}>
                <ButtonGroup color='dark'>
                    <ActionFilter handleFilterData={handleFilterData} />
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadActionResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<ActionItem>
                initialPerPage={50}
                isLoading={loadActionResponse.isLoading}
                columns={columns}
                options={options}
                onSort={handleSort}
                defaultSortField={loadActionResponse?.originalArgs?.jsonData?.sort}
                selectableRows
                selectableRowDisabled={(row) => row?.status === 'completed'}
                searchPlaceholder='search-action'
                // paginatedData={loadActionResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default ActionList
