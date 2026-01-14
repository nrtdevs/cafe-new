import { yupResolver } from '@hookform/resolvers/yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import Emitter from '@src/utility/Emitter'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Meeting } from '@src/utility/types/typeMeeting'
import {
    enableFutureDates,
    FM,
    formatDate,
    isObjEmpty,
    isValid,
    log,
    setInputErrors,
    setValues,
    SuccessToast
} from '@src/utility/Utils'
import { Fragment, useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Col, Form, Row, TabContent, TabPane } from 'reactstrap'
import * as yup from 'yup'
import { useCreateOrUpdateMeetingMutation } from '../../redux/RTKQuery/MeetingManagement'
const URL =
    /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

// validation schema
const userFormSchema = {
    meeting_title: yup.string().required(),
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
const schema = yup.object(userFormSchema).required()

// states
type States = {
    selectedItem?: Meeting
    enableEdit?: boolean
}
// default values
const defaultValues: Meeting = {
    meeting_title: '',
    meeting_link: '',
    meeting_time_start: '',
    meeting_time_end: '',
    meeting_date: '',
    agenda_of_meeting: '',
    documents: [],
    attendees: []
}

// create or edit meeting
const CreateEditMeeting = ({
    modal,
    reloadCallback = () => { },
    toggleModal,
    data
}: {
    reloadCallback?: (e?: any) => void
    toggleModal: () => void
    modal: boolean
    data: Meeting
}) => {
    // form hook
    const form = useForm<Meeting>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // create or update mutation
    const [create, createResponse] = useCreateOrUpdateMeetingMutation()

    // default states
    const initState: States = {
        selectedItem: undefined,
        enableEdit: false
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)
    // ** State
    const [active, setActive] = useState('1')

    // toggle tab
    const toggle = (tab) => {
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
    const handleSave = (data: Meeting) => {
        create({
            jsonData: {
                ...data,
                documents: data?.documents?.map((e) => ({ file: e?.file_name, ...e })),
                attendees: data?.attendees?.map((e) => ({
                    email: e.value
                }))
            }
        })
    }

    // handle create response
    useEffect(() => {
        if (!createResponse.isUninitialized) {
            if (createResponse.isSuccess) {
                closeModal()
                reloadCallback()
                Emitter.emit('reloadMeeting', true)
                SuccessToast(FM('meeting-created-successfully'))
            } else if (createResponse.isError) {
                // handle error
                const errors: any = createResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createResponse])

    // open view modal
    useEffect(() => {
        if (isValid(data)) {
            setState({
                selectedItem: data,
                enableEdit: true
            })
        }
    }, [data])

    // open edit modal
    useEffect(() => {
        if (isValid(state.selectedItem)) {
            setValues<Meeting>(
                {
                    id: state.selectedItem?.id,
                    meeting_title: state.selectedItem?.meeting_title,
                    meeting_time_start: state.selectedItem?.meeting_time_start,
                    meeting_time_end: state.selectedItem?.meeting_time_end,
                    meeting_link: state.selectedItem?.meeting_link ?? '',
                    meeting_date: state.selectedItem?.meeting_date,
                    meeting_ref_no: state.selectedItem?.meeting_ref_no,
                    agenda_of_meeting: state.selectedItem?.agenda_of_meeting,
                    documents: state.selectedItem?.documents,
                    attendees: state.selectedItem?.attendees?.map((e) => ({
                        label: e?.user?.email + ' | ' + e?.user?.name,
                        value: e?.user?.email
                    }))
                },
                form.setValue
            )
            log('state.selectedItem?.documents', state.selectedItem?.documents)
        }
    }, [state.selectedItem])

    // set active tab to 1 on modal close
    useEffect(() => {
        if (!modal) {
            setActive('1')
        }
    }, [modal])

    // watch for form.documents changes
    useEffect(() => {
        log('form.watch', form.watch('documents'))
    }, [form.watch('documents')])

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modal}
                done={state.enableEdit ? 'save' : 'save'}
                title={FM('edit-meeting')}
                hideClose
                scrollControl={false}
                modalClass={'modal-md'}
                handleModal={closeModal}
                loading={createResponse.isLoading}
                handleSave={form.handleSubmit(handleSave)}
            >
                <div className='p-2' style={{ minHeight: '71vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
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

                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('title')}
                                            name='meeting_title'
                                            type='text'
                                            className='mb-1'
                                            rules={{ required: true }}
                                        />
                                    </Col>
                                    <Col md='6'>
                                        <FormGroupCustom
                                            control={form.control}
                                            label={FM('meeting-ref-no')}
                                            name='meeting_ref_no'
                                            type='text'
                                            isDisabled
                                            className='mb-1'
                                            rules={{ required: false }}
                                        />
                                    </Col>
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
                                                enable: [
                                                    state?.selectedItem?.meeting_date ?? formatDate(new Date(), 'YYYY-MM-DD'),
                                                    enableFutureDates
                                                ]
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
                                            rules={{ required: true }}
                                        />
                                    </Col>
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
                                            className='mb-1'
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

    return <Fragment>{renderCreateModal()}</Fragment>
}

export default CreateEditMeeting
