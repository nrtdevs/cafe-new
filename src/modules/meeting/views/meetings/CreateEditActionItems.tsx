import { yupResolver } from '@hookform/resolvers/yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { ActionStratus, priorityType } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import {
    ErrorToast,
    FM,
    SuccessToast,
    addDay,
    createConstSelectOptions,
    enableFutureDates,
    formatDate,
    isObjEmpty,
    isValid,
    log,
    setInputErrors,
    setValues
} from '@src/utility/Utils'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { ActionItem, Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
import { Fragment, useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Col,
    Form,
    InputGroupText,
    Nav,
    Row,
    TabContent,
    TabPane
} from 'reactstrap'
import * as yup from 'yup'
import { useCreateOrUpdateActionMutation } from '../../redux/RTKQuery/ActionMangement'

// validation schema
const formSchema = {
    date_opened: yup.string().required(),
    due_date: yup.string().required(),
    complete_percentage: yup.string().required(),
    status: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    priority: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    owner_id: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required()
        })
        .nullable()
        .required('required'),
    task: yup.string().required(),
    comment: yup.string().required()
}
// validate
const schema = yup.object(formSchema).required()

// states
type States = {
    selectedItem?: ActionItem
    enableEdit?: boolean
    note?: MeetingNote
}
// default values
const defaultValues: ActionItem = {
    documents: undefined,
    comment: '',
    complete_date: '',
    complete_percentage: '0',
    date_opened: formatDate(new Date(), 'YYYY-MM-DD'),
    due_date: formatDate(addDay(new Date(), 3), 'YYYY-MM-DD'),
    image: '',
    mm_ref_id: '',
    owner_id: '',
    task: '',
    status: {
        label: 'Not Started',
        value: 'pending'
    },
    meeting_id: '',
    note_id: '',
    priority: {
        label: 'High',
        value: 'high'
    }
}

// create edit action items
const CreateEditAction = ({
    modal,
    reloadCallback = () => { },
    toggleModal,
    data,
    note,
    meeting
}: {
    reloadCallback?: (e?: any) => void
    toggleModal: () => void
    modal: boolean
    data?: ActionItem
    note?: MeetingNote
    meeting?: Meeting
}) => {
    // form hook
    const form = useForm<ActionItem>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // create or update mutation
    const [create, createResponse] = useCreateOrUpdateActionMutation()

    // default states
    const initState: States = {
        selectedItem: undefined,
        note: undefined,
        enableEdit: false
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

    // close modal
    const closeModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false
        })
        form.reset()
        toggleModal()
    }

    // handle save
    const handleSave = (data: ActionItem) => {
        if (isValid(state?.note?.meeting_id) && isValid(state?.note?.id)) {
            create({
                jsonData: {
                    ...data,
                    documents: data?.documents?.map((e) => ({ file: e?.file_name, ...e })),
                    priority: data?.priority?.value,
                    meeting_id: state?.note?.meeting_id,
                    owner_id: data?.owner_id?.value,
                    status: data?.status?.value,
                    note_id: state?.note?.id
                }
            })
        } else {
            ErrorToast(FM('note-id-not-found'))
        }
    }

    // handle create response
    useEffect(() => {
        if (!createResponse.isUninitialized) {
            if (createResponse.isSuccess) {
                closeModal()
                reloadCallback()
                Emitter.emit('reloadNotes', true)
                SuccessToast(FM('action-items-added-successfully'))
            } else if (createResponse.isError) {
                // handle error
                const errors: any = createResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createResponse])

    // set active tab to 1 on modal close
    useEffect(() => {
        if (!modal) {
            setActive('1')
        }
    }, [modal])

    // open view modal
    useEffect(() => {
        if (isValid(data) || isValid(note)) {
            setState({
                selectedItem: data,
                note: note,
                enableEdit: true
            })
        }
    }, [data, note])

    // open edit modal
    useEffect(() => {
        if (isValid(state.selectedItem)) {
            if (state.selectedItem?.type === 'action') {
                if (isValid(state.selectedItem?.owner_id)) {
                    setValues<ActionItem>(
                        {
                            id: state.selectedItem?.id,
                            comment: state.selectedItem?.comment,
                            complete_date: state.selectedItem?.complete_date,
                            complete_percentage: state.selectedItem?.complete_percentage,
                            date_opened: state.selectedItem?.date_opened,
                            due_date: state.selectedItem?.due_date,
                            image: state.selectedItem?.image,
                            mm_ref_id: state.selectedItem?.mm_ref_id,
                            task: state.selectedItem?.task,
                            meeting_id: state.selectedItem?.meeting_id,
                            note_id: state.selectedItem?.note_id,
                            status: state.selectedItem?.status
                                ? {
                                    label: FM(state.selectedItem?.status),
                                    value: state.selectedItem?.status
                                }
                                : undefined,
                            priority: state.selectedItem?.priority
                                ? {
                                    label: FM(state.selectedItem?.priority),
                                    value: state.selectedItem?.priority
                                }
                                : undefined,
                            owner_id: state.selectedItem?.owner
                                ? {
                                    label:
                                        state.selectedItem?.owner?.email + ' | ' + state.selectedItem?.owner?.name,
                                    value: state.selectedItem?.owner?.id
                                }
                                : undefined,
                            documents: state.selectedItem?.documents
                        },
                        form.setValue
                    )
                }
            }
        }
    }, [state.selectedItem])

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modal}
                done={state.enableEdit ? 'save' : 'save'}
                title={FM('action-item')}
                hideClose
                scrollControl={false}
                modalClass={'modal-md'}
                handleModal={closeModal}
                loading={createResponse.isLoading}
                handleSave={form.handleSubmit(handleSave)}
            >
                <div className='p-2' style={{ minHeight: '60vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Nav pills className='bg-light mb-0'>
                            {/* <NavItem>
                <NavLink
                  active={active === '1'}
                  onClick={() => {
                    toggle('1')
                  }}
                >
                  {FM('date')}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={active === '2'}
                  onClick={() => {
                    toggle('2')
                  }}
                >
                  {FM('details')}
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
              </NavItem> */}
                        </Nav>
                        <TabContent className='py-0' activeTab={active}>
                            <TabPane tabId='1'>
                                <Row>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            async
                                            label={FM('owner')}
                                            name='owner_id'
                                            loadOptions={loadDropdown}
                                            path={ApiEndpoints.users}
                                            selectLabel={(e) => `${e.email} | ${e.name} `}
                                            selectValue={(e) => e.id}
                                            defaultOptions
                                            type='select'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
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
                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('open-date')}
                                            name='date_opened'
                                            type='date'
                                            className='mb-1'
                                            datePickerOptions={{
                                                enable: [
                                                    state?.selectedItem?.date_opened ?? formatDate(new Date(), 'YYYY-MM-DD'),
                                                    enableFutureDates
                                                ]
                                            }}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('due-date')}
                                            name='due_date'
                                            type='date'
                                            className='mb-1'
                                            datePickerOptions={{
                                                enable: [
                                                    state?.selectedItem?.due_date ?? formatDate(new Date(), 'YYYY-MM-DD'),
                                                    enableFutureDates
                                                ],
                                                minDate: form.watch('date_opened')
                                                    ? new Date(form.watch('date_opened'))
                                                    : formatDate(new Date(), 'YYYY-MM-DD')
                                            }}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('status')}
                                            name='status'
                                            type='select'
                                            selectOptions={createConstSelectOptions(ActionStratus, FM)}
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('complete-percentage')}
                                            name='complete_percentage'
                                            type='number'
                                            defaultValue={0}
                                            className='mb-1'
                                            rules={{ required: true, max: 100, min: 0.01, maxLength: 5 }}
                                            append={<InputGroupText>%</InputGroupText>}
                                        />
                                    </Col>
                                </Row>
                                {/* </TabPane>

              <TabPane tabId='2'> */}
                                <Row>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('task')}
                                            name='task'
                                            type='textarea'
                                            className='mb-1'
                                            inputClassName={'height-100'}
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
                                            inputClassName={'height-100'}
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                </Row>
                                {/* </TabPane>
              <TabPane tabId='3'> */}
                                <Row>
                                    <Col md='12' className=''>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('documents')}
                                            name='documents'
                                            type='dropZone'
                                            className='mb-1'
                                            dropZoneOptions={{
                                                excludeFiles: meeting?.documents ?? undefined
                                            }}
                                            //   noLabel
                                            noGroup
                                            rules={{ required: false }}
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
            const keys: string[] = Object.keys(form.formState.errors)
            //   if (
            //     keys.includes('owner_id') ||
            //     keys.includes('priority') ||
            //     keys.includes('open_date') ||
            //     keys.includes('due_date') ||
            //     keys.includes('status') ||
            //     keys.includes('complete_percentage')
            //   ) {
            //     setActive('1')
            //   } else {
            //     setActive('2')
            //   }

            log('form.formState.errors', form.formState.errors)
        }
    }, [form.formState.errors])

    return <Fragment>{renderCreateModal()}</Fragment>
}

export default CreateEditAction
