import { yupResolver } from '@hookform/resolvers/yup'
import PostAddIcon from '@mui/icons-material/PostAdd'
import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import DropDownMenu from '@src/modules/common/components/dropdown'
import DropZone from '@src/modules/common/components/fileUploader'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { RepeatType } from '@src/utility/Const'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { stateReducer } from '@src/utility/stateReducer'
import { Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
import {
  createConstSelectOptions,
  emitAlertStatus,
  fastLoop,
  FM,
  formatDate,
  isObjEmpty,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues,
  SuccessToast,
  truncateText
} from '@src/utility/Utils'
import { duration } from 'moment'
import { Fragment, useContext, useEffect, useReducer, useState } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  Book,
  BookOpen,
  List,
  PlusSquare,
  RefreshCcw,
  Trash2,
  User,
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
  Alert,
  ButtonGroup,
  Col,
  Form,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane
} from 'reactstrap'
import * as yup from 'yup'
import {
  useActionMeetingMutation,
  useCreateOrUpdateMeetingMutation,
  useLoadMeetingsMutation
} from '../../redux/RTKQuery/MeetingManagement'
import {
  useCreateOrUpdateNoteMutation,
  useDeleteNoteMutation,
  useLoadNotesMutation
} from '../../redux/RTKQuery/NotesManagement'

// validation schema
const userFormSchema = {
  //   meeting_id: yup.string().required(),
  notes: yup.string().required(),
  decision: yup.string().required(),
  duration: yup.string().required()
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
  selectedItem?: MeetingNote
  enableEdit?: boolean
}

const defaultValues: MeetingNote = {
  notes: '',
  decision: '',
  duration: '0',
  meeting_id: undefined
}
const NotesList = () => {
  // header menu context
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  // form hook
  const form = useForm<MeetingNote>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()
  // create or update mutation
  const [createNote, createNoteResponse] = useCreateOrUpdateNoteMutation()
  // load data mutation
  const [loadNotes, loadMeetingResponse] = useLoadNotesMutation()
  // delete mutation
  const [deleteNote, noteDeleteResult] = useDeleteNoteMutation()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 15,
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
        selectedItem: undefined
      })
      form.reset()
    }
    toggleModalView()
  }

  // handle save user
  const handleSaveNotes = (data: MeetingNote) => {
    createNote({
      jsonData: {
        ...data,
        meeting_id: data?.meeting_id?.value
        // attendees: data?.attendees?.map((e) => ({
        //   email: e.value
        // }))
      }
    })
  }

  // load meeting list
  const loadNotesList = () => {
    loadNotes({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle meeting create response
  useEffect(() => {
    if (!createNoteResponse.isUninitialized) {
      if (createNoteResponse.isSuccess) {
        closeAddModal()
        loadNotesList()
        SuccessToast(FM('meeting-created-successfully'))
      } else if (createNoteResponse.isError) {
        // handle error
        const errors: any = createNoteResponse.error
        log(errors)
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [createNoteResponse])

  // handle pagination and load list
  useEffect(() => {
    loadNotesList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({ filterData: e })
  }

  // reload Data
  const reloadData = () => {
    setState({
      page: 1,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  // create a menu on header
  useEffect(() => {
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title={FM('new-notes')}>
            <NavLink className='' onClick={toggleModalAdd}>
              <PlusSquare fontSize='large' className={' ' + (modalAdd ? 'text-primary' : '')} />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      deleteNote({
        ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (
      (noteDeleteResult.status = QueryStatus?.fulfilled) &&
      noteDeleteResult?.isLoading === false
    ) {
      if (noteDeleteResult?.isSuccess) {
        emitAlertStatus('success', null, noteDeleteResult?.originalArgs?.eventId)
      } else if (noteDeleteResult?.error) {
        emitAlertStatus('failed', null, noteDeleteResult?.originalArgs?.eventId)
      }
    }
  }, [noteDeleteResult])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedItem)) {
      setValues<MeetingNote>(
        {
          id: state.selectedItem?.id,
          meeting_id: state.selectedItem?.meeting_id,
          notes: state.selectedItem?.notes,
          decision: state.selectedItem?.decision,
          duration: state.selectedItem?.duration
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
        title={state.enableEdit ? FM('edit') : FM('create-note')}
        hideClose
        scrollControl={false}
        modalClass={'modal-md'}
        // extraButtons={
        //   <LoadingButton loading={false} color='primary'>
        //     {FM('start-now')}
        //   </LoadingButton>
        // }
        handleModal={closeAddModal}
        loading={createNoteResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveNotes)}
      >
        <div className='p-2' style={{ minHeight: '61vh' }}>
          <Form onSubmit={form.handleSubmit(handleSaveNotes)}>
            {/* submit form on enter button!! */}
            <button className='d-none'></button>
            <Row>
              <Col md='6'>
                {/* <FormGroupCustom
                  control={form.control}
                  label={FM('meeting-id')}
                  name='meeting_id'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                /> */}
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
                  className='mb-0'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='6'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('duration')}
                  name='duration'
                  type='time'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('notes')}
                  name='notes'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  label={FM('decision')}
                  name='decision'
                  type='textarea'
                  className='mb-0'
                  rules={{ required: true }}
                />
              </Col>

              {/* <Col md='12'>
                    <p className='text-dark mb-0'>{FM('repeat-meeting')}</p>
                    <p className='text-muted small'>{FM('repeat-meeting-details')}</p>
                  </Col> */}

              {/* <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('date')}
                      name='meeting_date'
                      type='date'
                      className='mb-1'
                      datePickerOptions={{
                        minDate: new Date()
                      }}
                      rules={{ required: true }}
                    />
                  </Col> */}

              {/* <Col md='6'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('time')}
                      name='meeting_time'
                      type='time'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col> */}
              {/* <Col md='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('enable-repeat')}
                      name='is_repeat'
                      type='checkbox'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col> */}
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
        title={state.selectedItem?.notes}
        done='edit'
        hideClose
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
              <BookOpen size={35} />
            </Col>
            <Col md='8'>
              <p className='text-dark mb-0'>{FM('personal-details')}</p>
              <p className='text-muted small mb-0'>{FM('edit-description')}</p>
            </Col>
          </Row> */}
          <Row>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-dark fw-bold text-capitalize'>
                {state.selectedItem?.meeting?.meeting_title}
                {/* <span className='text-dark fw-bold text-capitalize small ms-50'>
                    <span
                      className={state.selectedItem?.status === 1 ? 'text-success' : 'text-danger'}
                    >
                      ({state.selectedItem?.status === 1 ? FM('active') : FM('inactive')})
                    </span>
                  </span> */}
              </p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('decision')}</Label>
              <p className='text-dark fw-bold text-capitalize'>{state.selectedItem?.decision}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('duration')}</Label>
              <p className='text-dark fw-bold text-capitalize'>{state.selectedItem?.duration}</p>
            </Col>
            <Col md='6'>
              <Label className='text-uppercase mb-25'>{FM('designation')}</Label>
              <p className='text-dark fw-bold text-capitalize'>
                {state.selectedItem?.meeting?.agenda_of_meeting}
              </p>
            </Col>
          </Row>
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
  const columns: TableColumn<MeetingNote>[] = [
    {
      name: FM('title'),
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              setState({
                selectedItem: row
              })
            }}
            className='text-primary'
          >
            {row?.notes}
          </span>
        </Fragment>
      )
    },
    {
      name: FM('decision'),
      cell: (row) => <Fragment>{row?.decision}</Fragment>
    },
    {
      name: FM('duration'),
      cell: (row) => <Fragment>{formatDate(`2022-12-12 ${row?.duration}`, 'hh:mm  A')}</Fragment>
    },
    {
      name: FM('agenda'),
      cell: (row) => <Fragment>{truncateText(row?.meeting?.agenda_of_meeting, 10)}</Fragment>
    },
    {
      name: FM('created-at'),
      cell: (row) => (
        <Fragment>
          {formatDate(row?.created_at)}
          {/* <span className={row?.status === 1 ? 'text-success' : 'text-danger'}>
            {row?.status === 1 ? FM('active') : FM('inactive')}
          </span> */}
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
                noWrap: true,
                name: (
                  <ConfirmAlert
                    menuIcon={<Trash2 size={14} />}
                    onDropdown
                    eventId={`item-delete-${row?.id}`}
                    text={FM('are-you-sure')}
                    title={FM('delete-item', { name: row?.notes })}
                    onClickYes={() => {
                      handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                    }}
                    onSuccessEvent={onSuccessEvent}
                  >
                    {FM('delete')}
                  </ConfirmAlert>
                )
              }
              //   {
              //     IF: row?.status !== 1,
              //     noWrap: true,
              //     name: (
              //       <ConfirmAlert
              //         menuIcon={<UserCheck size={14} />}
              //         onDropdown
              //         eventId={`item-active`}
              //         text={FM('are-you-sure')}
              //         title={FM('active-item', { name: row?.name })}
              //         onClickYes={() => {
              //           handleActions(row?.id, 'activate', 'item-active')
              //         }}
              //         onSuccessEvent={onSuccessEvent}
              //       >
              //         {FM('activate')}
              //       </ConfirmAlert>
              //     )
              //   },
              //   {
              //     IF: row?.status === 1,
              //     noWrap: true,
              //     name: (
              //       <ConfirmAlert
              //         menuIcon={<UserX size={14} />}
              //         onDropdown
              //         eventId={`item-inactive`}
              //         text={FM('are-you-sure')}
              //         title={FM('inactive-item', { name: row?.name })}
              //         onClickYes={() => {
              //           handleActions(row?.id, 'inactivate', 'item-inactive')
              //         }}
              //         onSuccessEvent={onSuccessEvent}
              //       >
              //         {FM('inactivate')}
              //       </ConfirmAlert>
              //     )
              //   }
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
            handleActions(selectedRows?.ids, 'activate', 'item-active')
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
            handleActions(selectedRows?.ids, 'inactivate', 'item-inactive')
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
      {renderViewModal()}

      <Header icon={<BookOpen size='25' />} title={FM('notes')}>
        <ButtonGroup color='dark'>
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
        initialPerPage={10}
        isLoading={loadMeetingResponse.isLoading}
        columns={columns}
        options={options}
        selectableRows
        searchPlaceholder='search-meeting-name'
        paginatedData={loadMeetingResponse?.data as any}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default NotesList
