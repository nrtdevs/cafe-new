import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'
import BsTooltip from '@src/modules/common/components/tooltip'
import {
    useLoadNotesMutation
} from '@src/modules/meeting/redux/RTKQuery/NotesManagement'
import { ActionStratus } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import { Permissions } from '@src/utility/Permissions'
import Show, { Can } from '@src/utility/Show'
import {
    FM,
    fastLoop,
    formatDate,
    getKeyByValue,
    isValid,
    isValidArray,
    log,
    makeLinksClickable,
    stripHtml,
    truncateText
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import { stateReducer } from '@src/utility/stateReducer'
import { ActionItem, Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
import DOMPurify from 'dompurify'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { Edit } from 'react-feather'
import { FileIcon, defaultStyles } from 'react-file-icon'
import ScrollBar from 'react-perfect-scrollbar'
import { useParams } from 'react-router-dom'
import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Col,
    NavItem,
    NavLink,
    Row,
    Table
} from 'reactstrap'
import * as yup from 'yup'
import CreateEditAction from './CreateEditActionItems'
import CreateEditMeeting from './CreateEditMeeting'
import CreateEditNote from './CreateEditNote'

// validation schema
const notesFormSchema = {
    duration: yup.number().positive().integer().required('hi'),
    notes: yup
        .string()
        .required()
        .test((val) => {
            if (val) {
                return stripHtml(val)
            } else return false
        })
}
// validate
const notesSchema = yup.object(notesFormSchema).required()

// validation schema
const actionFormSchema = {
    task: yup.string().required(),
    comment: yup.string().required()
}
// validate
const actionSchema = yup.object(actionFormSchema).required()
// states
type States = {
    page?: any
    per_page_record?: any
    filterData?: any
    reload?: any
    search?: string
    lastRefresh?: any
    selectedItem?: MeetingNote
    selectedActionItem?: ActionItem
    enableEdit?: boolean
    activeView?: number
    type?: string
    clickedButton?: string
}

const defaultValues: MeetingNote = {
    notes: '',
    documents: undefined,
    decision: '',
    duration: ''
}
const defaultValuesAction: ActionItem = {
    documents: undefined,
    comment: '',
    complete_date: '',
    complete_percentage: '',
    date_opened: '',
    due_date: '',
    image: '',
    mm_ref_id: '',
    owner_id: '',
    task: '',
    meeting_id: '',
    note_id: '',
    priority: ''
}
const MeetingNotes = ({ meeting }: { meeting: Meeting }) => {
    // params
    const params: any = useParams()
    // check edit permission
    const canEditMeeting = Can(Permissions.adminEmployeeBrowse)
    // check delete permission
    const canDeleteMeeting = Can(Permissions.dashboardBrowse)
    // check notes add permission
    const canAddNotes = Can(Permissions.dashboardBrowse)
    // check notes edit permission
    const canEditNotes = Can(Permissions.dashboardBrowse)
    // check notes delete permission
    const canDeleteNotes = Can(Permissions.dashboardBrowse)
    // check action add permission
    const canAddAction = Can(Permissions.dashboardBrowse)
    // check action edit permission
    const canEditAction = Can(Permissions.dashboardBrowse)
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // toggle add modal
    const [modalEdit, toggleModalEdit] = useModal()
    // toggle add modal
    const [modalActionAdd, toggleModalActionAdd] = useModal()
    // toggle view modal
    const [modalView, toggleModalView] = useModal()
    // header menu context
    const { setHeaderMenu } = useContext(RenderHeaderMenu)
    // default states
    const initState: States = {
        page: 1,
        per_page_record: 15,
        filterData: undefined,
        search: '',
        enableEdit: false,
        lastRefresh: new Date().getTime(),
        activeView: 2,
        clickedButton: '1'
    }

    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)
    // load data mutation
    const [loadMeetingNotes, loadMeetingNotesResponse] = useLoadNotesMutation()

    // create a menu on header
    useEffect(() => {
        if (!modalAdd) {
            setState({
                selectedActionItem: undefined,
                selectedItem: undefined,
                enableEdit: false
            })
        }

        setHeaderMenu(
            <>
                <Show IF={canAddNotes}>
                    <NavItem className='' onClick={toggleModalAdd}>
                        <BsTooltip title={FM('add-note')}>
                            <NavLink className=''>
                                <BookmarkAddIcon fontSize='large' className={modalAdd ? 'text-primary' : ''} />
                            </NavLink>
                        </BsTooltip>
                    </NavItem>
                </Show>
                <Show IF={canEditMeeting}>
                    <NavItem className='' onClick={toggleModalEdit}>
                        <BsTooltip title={FM('edit-meeting')}>
                            <NavLink className=''>
                                <Edit fontSize='large' className={modalEdit ? 'text-primary' : ''} />
                            </NavLink>
                        </BsTooltip>
                    </NavItem>
                </Show>
            </>
        )
        return () => {
            setHeaderMenu(null)
        }
    }, [modalAdd, modalEdit, setHeaderMenu, canAddNotes, canEditMeeting])

    useEffect(() => {
        if (!modalEdit) {
            setState({
                selectedActionItem: undefined,
                selectedItem: undefined,
                enableEdit: false
            })
        }
    }, [modalEdit])

    // clear selected item on modal action close
    useEffect(() => {
        if (!modalActionAdd) {
            setState({
                selectedActionItem: undefined,
                selectedItem: undefined,
                enableEdit: false
            })
        }
    }, [modalActionAdd])

    // close add
    const closeAddModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false,
            clickedButton: '1'
        })
        toggleModalAdd()
    }

    // close add action
    const closeActionAddModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false,
            clickedButton: '1'
        })
        toggleModalActionAdd()
    }

    // load meeting note list
    const loadMeetingNoteList = () => {
        if (isValid(params?.id)) {
            loadMeetingNotes({
                page: state.page,
                per_page_record: 0,
                jsonData: {
                    meeting_id: params?.id,
                    name: !isValid(state.filterData) ? state.search : undefined,
                    ...state.filterData
                }
            })
        }
    }

    // reload notes
    useEffect(() => {
        Emitter.on('reloadNotes', loadMeetingNoteList)
        return () => {
            Emitter.off('reloadNotes', () => { })
        }
    }, [params?.id])

    // load details on page load
    useEffect(() => {
        if (isValid(params?.id)) {
            loadMeetingNoteList()
        }
    }, [params?.id])

    // open view modal
    useEffect(() => {
        if (
            (isValid(state.selectedActionItem) && state?.type === 'comment') ||
            state?.type === 'task'
        ) {
            toggleModalView()
        }
    }, [state.selectedActionItem])

    // close view modal
    const closeViewModal = (reset = true) => {
        if (reset) {
            setState({
                selectedActionItem: undefined,
                type: undefined
            })
        }
        toggleModalView()
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
                    {state?.type === 'task'
                        ? state?.selectedActionItem?.task
                        : state?.selectedActionItem?.comment}
                </div>
            </CenteredModal>
        )
    }
    const renderActionItems = (items: any, note: MeetingNote) => {
        const re: any[] = []
        fastLoop(items, (item: ActionItem, index) => {
            re.push(
                <>
                    <tr key={`card-notes-${index}`}>
                        <td>{item?.mm_ref_id ?? 'N/A'}</td>
                        <td>{formatDate(item?.date_opened) ?? 'N/A'}</td>
                        <td
                            role={'button'}
                            onClick={(e) => {
                                setState({
                                    type: 'task',
                                    selectedActionItem: item
                                })
                            }}
                        >
                            {truncateText(item?.task, 50) ?? 'N/A'}
                        </td>
                        <td
                            role={'button'}
                            onClick={(e) => {
                                setState({
                                    type: 'comment',
                                    selectedActionItem: item
                                })
                            }}
                        >
                            {truncateText(item?.comment, 50) ?? 'N/A'}
                        </td>
                        <td>{item?.owner?.name ?? 'N/A'}</td>
                        <td>{item?.priority ?? 'N/A'}</td>
                        <td>{formatDate(item?.due_date) ?? 'N/A'}</td>
                        <td>
                            {' '}
                            <Badge
                                color={
                                    item?.status === 'completed'
                                        ? 'success'
                                        : item?.status === 'cancelled'
                                            ? 'danger'
                                            : item?.status === 'on_hold'
                                                ? 'warning'
                                                : item?.status === 'in_progress'
                                                    ? 'primary'
                                                    : 'secondary'
                                }
                            >
                                {FM(getKeyByValue(ActionStratus, item?.status)) ?? 'N/A'}
                            </Badge>
                        </td>
                        <td>{item?.complete_percentage ?? '0'}%</td>
                        <td>{formatDate(item?.complete_date) ?? 'N/A'}</td>
                        <td>
                            <Show IF={canEditAction}>
                                <BsTooltip title={FM('edit-action')}>
                                    <Edit
                                        style={{ marginTop: -3 }}
                                        role={'button'}
                                        onClick={() => {
                                            setState({
                                                selectedActionItem: item,
                                                selectedItem: note
                                            })
                                            toggleModalActionAdd()
                                        }}
                                        className='ms-50 me-50 text-primary'
                                        size={16}
                                    />
                                </BsTooltip>
                            </Show>
                        </td>
                    </tr>
                </>
            )
        })
        return re
    }

    // render note
    const renderNotes = () => {
        const re: any = []
        fastLoop(loadMeetingNotesResponse.data?.data, (note, index) => {
            if (
                stripHtml(note?.decision ?? '') ||
                stripHtml(note?.notes ?? '') ||
                isValidArray(note.action_items)
            ) {
                re.push(
                    <>
                        <Card className='' key={`card-notes-${index}`}>
                            <CardHeader className='border-bottom p-1 ps-2 pe-2'>
                                <div className='text-dark fw-bolder mb-0'>
                                    <h5 className='mb-0'>
                                        {formatDate(note?.created_at, 'DD MMM YYYY HH:mm A')} by{' '}
                                        {note?.created_by?.name}
                                    </h5>
                                    <Show IF={isValid(note?.edited_by?.name)}>
                                        <p className='small text-muted mb-0'>
                                            {FM('updated-at')} : {formatDate(note?.updated_at, 'DD MMM YYYY HH:mm A')} by{' '}
                                            {note?.edited_by?.name}
                                        </p>
                                    </Show>
                                </div>
                                <p className='text-dark text-uppercase mb-0 d-flex align-items-center'>
                                    {/* <p className='mb-0 me-50'>{note?.created_by?.name}</p> */}
                                    <Show IF={canEditNotes}>
                                        <>
                                            <BsTooltip title={FM('edit-note')}>
                                                <Edit
                                                    style={{ marginTop: -3 }}
                                                    role={'button'}
                                                    onClick={() => {
                                                        log('added item', note)
                                                        setState({
                                                            selectedItem: note
                                                        })
                                                        toggleModalAdd()
                                                    }}
                                                    className='ms-50 me-50 text-primary'
                                                    size={16}
                                                />
                                            </BsTooltip>
                                        </>
                                    </Show>
                                    <Show IF={canAddAction}>
                                        <>
                                            {' | '}
                                            <BsTooltip title={FM('add-action-item')}>
                                                <PlaylistAddIcon
                                                    onClick={() => {
                                                        setState({
                                                            selectedItem: note
                                                        })
                                                        toggleModalActionAdd()
                                                    }}
                                                    role={'button'}
                                                    className='ms-50 text-primary'
                                                />
                                            </BsTooltip>
                                        </>
                                    </Show>
                                </p>
                            </CardHeader>
                            <CardBody className='mb-0 pt-2'>
                                <Row>
                                    <Show IF={stripHtml(note?.notes ?? '')}>
                                        <Col md='12'>
                                            <div className=''>
                                                <div>
                                                    <h5 className='mb-50 fw-bolder text-dark'>{FM('notes')}</h5>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                DOMPurify.sanitize(makeLinksClickable(note?.notes) ?? '') ?? ''
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Show>
                                    <Show IF={stripHtml(note?.decision ?? '')}>
                                        <Col md='12' className='border-top pt-2 mt-2'>
                                            <div className=''>
                                                <div className=''>
                                                    <h5 className='mb-50 fw-bolder text-dark'>{FM('decision')}</h5>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                DOMPurify.sanitize(makeLinksClickable(note?.decision) ?? '') ?? ''
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Col>
                                    </Show>
                                    <Show IF={isValidArray(note.action_items)}>
                                        <Col md='12' className='border-top pt-2 mt-2'>
                                            <div className=''>
                                                <div className=''>
                                                    <h5 className='mb-2 fw-bolder text-dark'>{FM('action-item')}</h5>
                                                    <ScrollBar>
                                                        <Table bordered striped>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ minWidth: 130 }}>{FM('mm-ref-id')}</th>
                                                                    <th style={{ minWidth: 150 }}>{FM('date-opened')}</th>
                                                                    <th style={{ minWidth: 250 }}>{FM('task')}</th>
                                                                    <th style={{ minWidth: 250 }}>{FM('comments')}</th>
                                                                    <th style={{ minWidth: 130 }}>{FM('owner')}</th>
                                                                    <th style={{ minWidth: 130 }}>{FM('priority')}</th>
                                                                    <th style={{ minWidth: 140 }}>{FM('due-date')}</th>
                                                                    <th style={{ minWidth: 140 }}>{FM('status')}</th>
                                                                    <th style={{ minWidth: 150 }}>{FM('complete')} %</th>
                                                                    <th style={{ minWidth: 180 }}>{FM('completion-date')}</th>
                                                                    <th style={{ minWidth: 50 }}>{FM('action')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>{renderActionItems(note.action_items, note)}</tbody>
                                                        </Table>
                                                    </ScrollBar>
                                                </div>
                                            </div>
                                        </Col>
                                    </Show>
                                    <Show IF={isValidArray(note?.documents)}>
                                        <Col md='12' className='border-top pt-2 mt-2'>
                                            <h5 className='mb-1 fw-bolder text-dark'>{FM('documents')}</h5>
                                            {/* <p className='text-muted'>{FM('add-or-download-attachment')}</p> */}
                                            {note?.documents?.map((a) => (
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
                                        </Col>
                                    </Show>
                                </Row>
                            </CardBody>
                        </Card>
                    </>
                )
            }
        })
        return re
    }

    return (
        <Fragment>
            {renderViewModal()}
            <CreateEditMeeting data={{ ...meeting }} modal={modalEdit} toggleModal={toggleModalEdit} />
            <CreateEditAction
                meeting={meeting}
                note={state?.selectedItem}
                data={{ ...state?.selectedActionItem, type: 'action' }}
                modal={modalActionAdd}
                toggleModal={toggleModalActionAdd}
            />
            <CreateEditNote
                meeting={meeting}
                data={{ ...state?.selectedItem, type: 'note' }}
                modal={modalAdd}
                toggleModal={toggleModalAdd}
                toggleNextModal={(e) => {
                    if (e) {
                        log('e', e)
                        toggleModalActionAdd()
                        setTimeout(() => {
                            setState({ selectedItem: e })
                        }, 1000)
                    }
                }}
            />
            <Show IF={loadMeetingNotesResponse?.isLoading}>
                <Card>
                    <CardBody>
                        <Shimmer style={{ height: 25, marginBottom: 10 }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '100%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '70%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '70%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 35, width: '50%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10 }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '100%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '70%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '70%' }} />
                        <Shimmer style={{ height: 25, marginBottom: 10, width: '50%' }} />
                    </CardBody>
                </Card>
            </Show>
            {/* <div className='d-flex align-items-center mb-2 shadow p-50'>
        <ButtonGroup className=''>
          <Button
            color='primary'
            size='sm'
            className='btn-icon'
            onClick={() => {
              setState({
                activeView: 1
              })
            }}
            outline={state?.activeView !== 1}
          >
            <Layout size={18} />
          </Button>
          <Button
            color='primary'
            size='sm'
            onClick={() => {
              setState({
                activeView: 2
              })
            }}
            className='btn-icon'
            outline={state?.activeView !== 2}
          >
            <List size={18} />
          </Button>
        </ButtonGroup>
        <p className='mb-0 ms-1'>
          {FM(
            'change-the-layout-of-meeting-notes-you-can-choose-from-list-view-or-grouped-card-view'
          )}
        </p>
      </div> */}
            <Show IF={state.activeView === 2}>{renderNotes()}</Show>
        </Fragment>
    )
}

export default MeetingNotes
