import { yupResolver } from '@hookform/resolvers/yup'
import useUser from '@hooks/useUser'
import PostAddIcon from '@mui/icons-material/PostAdd'
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
import { Patterns } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    SuccessToast,
    emitAlertStatus,
    fastLoop,
    formatDate,
    getInitials,
    isObjEmpty,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    truncateText
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Meeting } from '@src/utility/types/typeMeeting'
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import { List, RefreshCcw, UserCheck, UserX } from 'react-feather'
import { useForm } from 'react-hook-form'
import { ButtonGroup, Col, Form, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import * as yup from 'yup'
import {
    useActionMeetingMutation,
    useCreateOrUpdateMeetingMutation,
    useFetchMeetingMutation,
    useLoadMeetingsMutation
} from '../../redux/RTKQuery/MeetingManagement'
import MeetingFilter from './MeetingFilter'
const URL =
    /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

// validation schema
const formSchema = {
    meeting_title: yup
        .string()
        .required()
        .matches(Patterns.AlphaNumericOnly, FM('only-alphabets-and-numbers-are-allowed')),
    meeting_time_start: yup.string().required(),
    meeting_time_end: yup.string().required(),
    meeting_date: yup.string().required(),
    meeting_link: yup.string().when({
        is: (values: string) => isValid(values),
        then: (schema) => schema.matches(URL, 'Enter correct url!').required(),
        otherwise: (schema) => schema.notRequired()
    }),
    attendees: yup
        .array()
        .of(
            yup.object({
                label: yup.string().required(),
                value: yup.string().email('invalid email').required()
            })
        )
        .min(1, FM('attendees-field-must-have-at-least-1-items'))
        .required()
}
// validate
const schema = yup.object(formSchema).required()

// states
type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    search?: string
    lastRefresh?: any
    selectedItem?: Meeting
    enableEdit?: boolean
}

const defaultValues: Meeting = {
    meeting_title: '',
    meeting_time_end: '',
    meeting_time_start: '',
    meeting_date: formatDate(new Date(), 'YYYY-MM-DD'),
    meeting_link: '',
    meeting_ref_no: '',
    agenda_of_meeting: '',
    documents: null,
    attendees: null
}
const MeetingList = (props: any) => {
    // user
    const user = useUser()
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // check add permission
    const canAdd = Can(Permissions.adminEmployeeBrowse)
    // check edit permission
    const canEdit = Can(Permissions.adminEmployeeBrowse)
    // check delete permission
    const canDelete = Can(Permissions.adminEmployeeCreate)
    // check read permission
    const canView = Can(Permissions.adminEmployeeBrowse)

    // form hook
    const form = useForm<Meeting>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // create or update mutation
    const [createMeeting, createMeetingResponse] = useCreateOrUpdateMeetingMutation()
    // load data mutation
    const [loadMeeting, loadMeetingResponse] = useLoadMeetingsMutation()
    // delete mutation
    const [meetingAction, meetingActionResult] = useActionMeetingMutation()
    // fetch meeting
    const [fetchMeeting, fetchMeetingResponse] = useFetchMeetingMutation()

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
    // ** State
    const [active, setActive] = useState('1')

    // toggle tab
    const toggle = (tab: string) => {
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
        setActive('1')
        form.reset({
            meeting_ref_no: String(new Date().getTime())
        })
        toggleModalAdd()
    }

    // handle save
    const handleSaveMeeting = (data: Meeting) => {
        createMeeting({
            jsonData: {
                ...data,
                documents: data?.documents?.map((e) => ({ file: e?.file_name, ...e })),
                attendees: data?.attendees?.map((e) => ({
                    email: e.value
                }))
            }
        })
    }

    // reload meeting list on emit reloadMeeting
    useEffect(() => {
        Emitter.on('reloadMeeting', reloadData)
        return () => {
            Emitter.off('reloadMeeting', () => { })
        }
    }, [])

    // load meeting list
    const loadMeetingList = () => {
        loadMeeting({
            page: state.page,
            per_page_record: state.per_page_record,
            jsonData: {
                meeting_title: !isValid(state.filterData) ? state.search : undefined,
                ...state.filterData
            }
        })
    }

    // handle meeting create response
    useEffect(() => {
        if (!createMeetingResponse.isUninitialized) {
            if (createMeetingResponse.isSuccess) {
                closeAddModal()
                loadMeetingList()
                SuccessToast(FM('meeting-created-successfully'))
            } else if (createMeetingResponse.isError) {
                // handle error
                const errors: any = createMeetingResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createMeetingResponse])

    // handle pagination and load list
    useEffect(() => {
        fetchMeeting(null)
        loadMeetingList()
    }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

    // handle page change
    const handlePageChange = (e: TableFormData) => {
        setState({ ...e })
    }

    // handle filter data
    const handleFilterData = (e: any) => {
        setState({ filterData: e, page: 1, search: '', per_page_record: 20 })
    }

    // reload Data
    const reloadData = () => {
        setState({
            search: '',
            page: 1,
            filterData: undefined,
            per_page_record: 20,
            lastRefresh: new Date().getTime()
        })
    }

    // create meeting ref no
    useEffect(() => {
        if (
            isValid(form.watch('meeting_date')) &&
            isValid(form.watch('meeting_time_start')) &&
            isValid(form.watch('meeting_time_end')) &&
            isValid(form.watch('meeting_title'))
        ) {
            form.setValue(
                'meeting_ref_no',
                `${getInitials(form.watch('meeting_title') ?? '')}${formatDate(
                    form.watch('meeting_date'),
                    'DDMMYY'
                )}${Math.floor(Math.random() * 100 + 1)}`
            )
        }
    }, [
        form.watch('meeting_date'),
        form.watch('meeting_time_start'),
        form.watch('meeting_time_end'),
        form.watch('meeting_title')
    ]),
        // create a menu on header
        useEffect(() => {
            if (!canAdd) return
            setHeaderMenu(
                <>
                    <NavItem className=''>
                        <BsTooltip title={FM('new-meeting')}>
                            <NavLink className='' onClick={toggleModalAdd}>
                                <PostAddIcon fontSize='large' className={' ' + (modalAdd ? 'text-primary' : '')} />
                            </NavLink>
                        </BsTooltip>
                    </NavItem>
                </>
            )
            return () => {
                setHeaderMenu(null)
            }
        }, [modalAdd, canAdd])

    // handle actions
    const handleActions = (ids?: any, action?: any, eventId?: any) => {
        if (isValidArray(ids)) {
            meetingAction({
                ids,
                eventId,
                action
            })
        }
    }

    // handle action result
    useEffect(() => {
        if (meetingActionResult?.isLoading === false) {
            if (meetingActionResult?.isSuccess) {
                emitAlertStatus('success', null, meetingActionResult?.originalArgs?.eventId)
            } else if (meetingActionResult?.error) {
                emitAlertStatus('failed', null, meetingActionResult?.originalArgs?.eventId)
            }
        }
    }, [meetingActionResult])

    // handle sort
    const handleSort = (column: any, dir: string) => {
        setState({
            filterData: {
                ...state.filterData,
                sort: {
                    column: column?.id,
                    dir:
                        loadMeetingResponse?.originalArgs?.jsonData?.sort?.column === column?.id
                            ? loadMeetingResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                                ? 'desc'
                                : 'asc'
                            : dir
                }
            }
        })
    }

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                title={state.enableEdit ? FM('edit') : FM('create-meeting')}
                hideClose
                scrollControl={false}
                modalClass={'modal-md'}
                handleModal={closeAddModal}
                loading={createMeetingResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveMeeting)}
            >
                <div className='p-2' style={{ minHeight: '67vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSaveMeeting)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        {/* <Nav pills className='bg-light'>
              <NavItem>
                <NavLink
                  active={active === '1'}
                  onClick={() => {
                    toggle('1')
                  }}
                >
                  {FM('meeting')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={active === '2'}
                  onClick={() => {
                    toggle('2')
                  }}
                >
                  {FM('attendees')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={active === '3'}
                  onClick={() => {
                    toggle('3')
                  }}
                >
                  {FM('documents')}
                </NavLink>
              </NavItem>
            </Nav> */}
                        <TabContent className='py-50' activeTab={active}>
                            <TabPane tabId='1'>
                                <Row>
                                    <Col md='12'>
                                        <p className='text-dark mb-0'>{FM('basic-details')}</p>
                                        <p className='text-muted small'>{FM('basic-details-description')}</p>
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('title')}
                                            name='meeting_title'
                                            type='text'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    {/* <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('meeting-ref-no')}
                      name='meeting_ref_no'
                      type='text'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col> */}
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('agenda')}
                                            name='agenda_of_meeting'
                                            type='textarea'
                                            className='mb-1'
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('meeting-link')}
                                            name='meeting_link'
                                            type='text'
                                            className='mb-1'
                                            rules={{ required: false }}
                                        />
                                    </Col>
                                    <Col md='12'>
                                        <p className='text-dark mb-0'>{FM('repeat-meeting')}</p>
                                        <p className='text-muted small'>{FM('repeat-meeting-details')}</p>
                                    </Col>

                                    <Col md='4'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('date')}
                                            name='meeting_date'
                                            type='date'
                                            className='mb-1'
                                            datePickerOptions={{
                                                minDate: formatDate(new Date(), 'YYYY-MM-DD')
                                            }}
                                            rules={{ required: true }}
                                        />
                                    </Col>

                                    <Col md='4'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('time-start')}
                                            name='meeting_time_start'
                                            type='time'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='4'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('time-end')}
                                            name='meeting_time_end'
                                            type='time'
                                            className='mb-1'
                                            // datePickerOptions={{
                                            //     minDate: form.watch('meeting_time_start')
                                            //         ? new Date(
                                            //             `${formatDate(new Date())} ${form.watch('meeting_time_start')}` ?? ''
                                            //         )
                                            //         : new Date()
                                            // }}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    {/* <Col md='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('enable-repeat')}
                      name='is_repeat'
                      type='checkbox'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>
                  <Show IF={form.watch('is_repeat') === 1}>
                    <Col md='6'>
                      <FormGroupCustom
                        control={form.control}
                        label={FM('repeat-type')}
                        name='repeat_type'
                        selectOptions={createConstSelectOptions(RepeatType, FM)}
                        type='select'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='6'>
                      <FormGroupCustom
                        control={form.control}
                        label={FM('number-of-events')}
                        name='number_of_event'
                        type='number'
                        className='mb-1'
                        rules={{ required: true }}
                      />
                    </Col>
                    <Col md='12'>
                      <Alert color='warning' className='p-1'>
                        {FM('meeting-will-be-repeated-on-x-basis', {
                          type: form.watch('repeat_type')?.label,
                          times: form.watch('number_of_event'),
                          name:
                            form.watch('repeat_type')?.value === 'every_week'
                              ? FM('weeks')
                              : form.watch('repeat_type')?.value === 'every_month'
                              ? FM('months')
                              : FM('days')
                        })}
                      </Alert>
                    </Col>
                  </Show> */}
                                </Row>
                                {/* </TabPane>
              <TabPane tabId='2'> */}
                                <Row>
                                    <Col md='12'>
                                        <p className='text-dark mb-0'>
                                            {FM('attendees')} <span className='text-danger fw-bold'>*</span>
                                        </p>
                                        <p className='text-muted small  '>{FM('please-add-at-least-one-attendee')}</p>
                                    </Col>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('search')}
                                            name='attendees'
                                            loadOptions={loadDropdown}
                                            path={ApiEndpoints.users}
                                            modifySelectData={(e) => {
                                                const re: any[] = []
                                                fastLoop(e, (data) => {
                                                    if (data?.id !== user?.id) re.push(data)
                                                })
                                                return re
                                            }}
                                            selectLabel={(e) =>
                                                e?.email !== e?.name ? `${e.email} | ${e.name} ` : `${e.email} `
                                            }
                                            selectValue={(e) => e.email}
                                            noLabel
                                            defaultOptions
                                            creatable
                                            isMulti
                                            errorMessage={FM('please-enter-a-valid-email')}
                                            createLabel='invite'
                                            type='select'
                                            className='mb-2'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Row>
                                {/* </TabPane>
              <TabPane tabId='3'> */}
                                <Row>
                                    <Col md='12'>
                                        <p className='text-dark mb-0'>{FM('attach-documents')}</p>
                                        <p className='text-muted small mb-2'>
                                            {FM('add-documents-required-on-meeting')}
                                        </p>
                                    </Col>
                                    <Col md='12' className=''>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('documents')}
                                            name='documents'
                                            type='dropZone'
                                            className='mb-2'
                                            noLabel
                                            noGroup
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                        </TabContent>
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    // handle form errors set active tab
    useEffect(() => {
        if (!isObjEmpty(form.formState.errors)) {
            const keys = Object.keys(form.formState.errors)
            //   if (
            //     keys.includes('attendees') &&
            //     (keys.includes('meeting_title') ||
            //       keys.includes('meeting_time') ||
            //       keys.includes('meeting_date'))
            //   ) {
            //     setActive('1')
            //   } else {
            //     setActive('2')
            //   }

            if (keys.includes('meeting_title')) {
                setActive('1')
            } else if (keys.includes('meeting_time_start')) {
                setActive('1')
            } else if (keys.includes('meeting_time_end')) {
                setActive('1')
            } else if (keys.includes('meeting_date')) {
                setActive('1')
            } else if (keys.includes('attendees')) {
                setActive('2')
            } else if (keys.includes('meeting_link')) {
                setActive('1')
            }
            log('form.formState.errors', form.formState.errors)
        }
    }, [form.formState.errors])

    // table columns
    const columns: TableColumn<Meeting>[] = [
        {
            name: FM('title'),
            minWidth: '200px',
            sortable: true,
            id: 'meeting_title',
            cell: (row) => (
                <Fragment>
                    {/* <Link
                        state={{ ...row }}
                        // to={getPath('dsfsdf', { id: row?.id })}
                        role={'button'}
                        className={canView ? 'text-primary' : 'pe-none'}
                    >
                        {truncateText(row?.meeting_title, 50)}
                    </Link> */}
                </Fragment>
            )
        },
        {
            name: FM('meeting-ref-no'),
            minWidth: '150px',
            sortable: true,
            id: 'meeting_ref_no',
            cell: (row) => <Fragment>{truncateText(row?.meeting_ref_no, 25)}</Fragment>
        },
        {
            name: FM('organizer'),
            minWidth: '150px',
            sortable: false,
            id: 'organised_by',
            cell: (row) => <Fragment>{truncateText(row?.organiser?.name, 25) ?? 'N/A'}</Fragment>
        },
        {
            name: FM('date'),
            minWidth: '150px',
            sortable: true,
            id: 'meeting_date',
            cell: (row) => <Fragment>{formatDate(row?.meeting_date)}</Fragment>
        },
        {
            name: FM('time-start'),
            minWidth: '150px',
            sortable: true,
            id: 'meeting_time_start',
            cell: (row) => (
                <Fragment>
                    {formatDate(`2022-12-12 ${row?.meeting_time_start}`, 'hh:mm  A', 'N/A')}
                </Fragment>
            )
        },
        {
            name: FM('time-end'),
            minWidth: '150px',
            sortable: true,
            id: 'meeting_time_end',
            cell: (row) => (
                <Fragment>{formatDate(`2022-12-12 ${row?.meeting_time_end}`, 'hh:mm  A', 'N/A')}</Fragment>
            )
        },
        {
            name: FM('created-at'),
            minWidth: '150px',
            sortable: true,
            id: 'created_at',
            cell: (row) => <Fragment>{formatDate(row?.created_at)}</Fragment>
        },
        {
            name: FM('status'),
            minWidth: '150px',
            sortable: true,
            id: 'status',
            cell: (row) => (
                <Fragment>
                    <span className={`text-${row?.status === 1 ? 'success' : 'danger'}`}>
                        {FM(row?.status === 1 ? 'active' : 'inactive')}
                    </span>
                </Fragment>
            )
        },
        {
            name: FM('action'),
            minWidth: '50px',
            cell: (row) => (
                <Fragment>
                    <Show IF={canEdit}>
                        <DropDownMenu
                            options={[
                                //   {
                                //     noWrap: true,
                                //     name: (
                                //       <ConfirmAlert
                                //         menuIcon={<Trash2 size={14} />}
                                //         onDropdown
                                //         eventId={`item-delete-${row?.id}`}
                                //         text={FM('are-you-sure')}
                                //         title={FM('delete-item', { name: row?.meeting_title })}
                                //         onClickYes={() => {
                                //           handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                                //         }}
                                //         onSuccessEvent={onSuccessEvent}
                                //       >
                                //         {FM('delete')}
                                //       </ConfirmAlert>
                                //     )
                                //   }
                                {
                                    IF: row?.status !== 1 && canEdit,
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<UserCheck size={14} />}
                                            onDropdown
                                            eventId={`item-active-${row?.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('active-item', { name: row?.meeting_title })}
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
                                    IF: row?.status === 1 && canEdit,
                                    noWrap: true,
                                    name: (
                                        <ConfirmAlert
                                            menuIcon={<UserX size={14} />}
                                            onDropdown
                                            eventId={`item-inactive-${row?.id}`}
                                            text={FM('are-you-sure')}
                                            title={FM('inactive-item', { name: row?.meeting_title })}
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
        // }
        {
            IF: canEdit,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<UserCheck size={14} />}
                    onDropdown
                    eventId={`item-active`}
                    text={FM('are-you-sure')}
                    title={FM('active-selected-meeting', { count: selectedRows?.selectedCount })}
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
            IF: canEdit,
            noWrap: true,
            name: (
                <ConfirmAlert
                    menuIcon={<UserX size={14} />}
                    onDropdown
                    eventId={`item-inactive`}
                    text={FM('are-you-sure')}
                    title={FM('deactivate-selected-meeting', { count: selectedRows?.selectedCount })}
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

    return (
        <Fragment>
            {renderCreateModal()}
            <Header route={props?.route} icon={<List size='25' />} title={FM('meetings')}>
                <ButtonGroup color='dark'>
                    <MeetingFilter handleFilterData={handleFilterData} />
                    <LoadingButton
                        tooltip={FM('reload')}
                        loading={loadMeetingResponse.isLoading}
                        size='sm'
                        color='info'
                        onClick={reloadData}
                    >
                        <RefreshCcw size='14' />
                    </LoadingButton>
                </ButtonGroup>
            </Header>
            <CustomDataTable<Meeting>
                initialPerPage={20}
                isLoading={loadMeetingResponse.isLoading}
                columns={columns}
                options={options}
                selectableRows={canEdit}
                onSort={handleSort}
                defaultSortField={loadMeetingResponse?.originalArgs?.jsonData?.sort}
                searchPlaceholder='search-meeting-name'
                paginatedData={loadMeetingResponse?.data}
                handlePaginationAndSearch={handlePageChange}
            />
        </Fragment>
    )
}

export default MeetingList
