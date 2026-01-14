import { yupResolver } from '@hookform/resolvers/yup'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import Emitter from '@src/utility/Emitter'
import {
    FM,
    SuccessToast,
    isObjEmpty,
    isValid,
    log,
    setInputErrors,
    setValues,
    stripHtml
} from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { Meeting, MeetingNote } from '@src/utility/types/typeMeeting'
import { Fragment, useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
    Col,
    Form,
    Nav,
    Row,
    TabContent,
    TabPane
} from 'reactstrap'
import * as yup from 'yup'
import { useCreateOrUpdateNoteMutation } from '../../redux/RTKQuery/NotesManagement'

// validation schema
const formSchema = {
    //   duration: yup.number().positive().integer().required('hi'),
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
const schema = yup.object(formSchema).required()

// states
type States = {
    selectedItem?: MeetingNote
    enableEdit?: boolean
    clickedButton?: string
}
// default values
const defaultValues: MeetingNote = {
    notes: '',
    documents: undefined,
    decision: '',
    duration: '10'
}

// create edit action items
const CreateEditNote = ({
    modal,
    reloadCallback = () => { },
    toggleModal,
    data,
    toggleNextModal = (e: any) => { },
    meeting
}: {
    reloadCallback?: (e?: any) => void
    toggleModal: () => void
    modal: boolean
    data?: MeetingNote
    meeting?: Meeting
    toggleNextModal?: (e: any) => void
}) => {
    // params
    const params: any = useParams()
    // form hook
    const form = useForm<MeetingNote>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // create or update mutation
    const [create, createResponse] = useCreateOrUpdateNoteMutation()

    // default states
    const initState: States = {
        selectedItem: undefined,
        enableEdit: false,
        clickedButton: '1'
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
    const handleSave = (data: MeetingNote, invalid: any, next: boolean = false) => {
        if (stripHtml(data?.notes)) {
            create({
                next,
                jsonData: {
                    ...data,
                    documents: data?.documents?.map((e) => ({ file: e?.file_name, ...e })),
                    meeting_id: params?.id,
                    duration: '10'
                }
            })
        }
    }

    // handle create response
    useEffect(() => {
        if (!createResponse.isUninitialized) {
            if (createResponse.isSuccess) {
                closeModal()
                reloadCallback()
                Emitter.emit('reloadNotes', true)
                SuccessToast(FM('meeting-note-added-successfully'))
                if (createResponse.originalArgs?.next) {
                    //   log(createResponse?.data?.data)
                    setState({
                        clickedButton: '1',
                        selectedItem: createResponse?.data?.data
                    })
                    log('eaaaaaaaaaaaaaa', createResponse?.data?.data)

                    toggleNextModal(createResponse?.data?.data)
                }
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
            if (state.selectedItem?.type === 'note') {
                setValues<MeetingNote>(
                    {
                        id: state?.selectedItem?.id,
                        notes: state?.selectedItem?.notes,
                        decision: state?.selectedItem?.decision,
                        duration: state.selectedItem?.duration,
                        documents: state.selectedItem?.documents
                    },
                    form.setValue
                )
            }
        }
    }, [state.selectedItem])

    // set active tab to 1 on modal close
    useEffect(() => {
        if (!modal) {
            setActive('1')
        }
    }, [modal])

    // handle action modal
    const handleActionModalOpen = () => {
        setState({
            clickedButton: '2'
        })
        form.handleSubmit((e) => handleSave(e, null, true))()
    }

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modal}
                done={state.enableEdit ? 'save' : 'save'}
                title={FM('meeting-note')}
                hideClose
                extraButtons={
                    <>
                        <LoadingButton
                            color='primary'
                            onClick={handleActionModalOpen}
                            loading={createResponse.isLoading && state.clickedButton === '2'}
                        >
                            {FM('save-and-add-action-items')}
                        </LoadingButton>
                    </>
                }
                scrollControl={false}
                modalClass={'modal-lg'}
                handleModal={closeModal}
                loading={createResponse.isLoading && state.clickedButton === '1'}
                handleSave={form.handleSubmit(handleSave)}
            >
                <div className='p-1' style={{ minHeight: '60vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Nav pills className='bg-light'>
                            {/*  <NavItem>
                <NavLink
                  active={active === '1'}
                  onClick={() => {
                    toggle('1')
                  }}
                >
                  {FM('notes')}
                </NavLink>
              </NavItem>
           <NavItem>
                <NavLink
                  active={active === '2'}
                  onClick={() => {
                    toggle('2')
                  }}
                >
                  {FM('decision')}
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
                        <TabContent className='py-0 mb-2' activeTab={active}>
                            <TabPane tabId='1'>
                                <Row>
                                    {/* <Col md='12'>
                    <FormGroupCustom
                      label={FM('duration-in-min')}
                      type='number'
                      className={'mb-2'}
                      control={form.control}
                      name='duration'
                      rules={{ required: true }}
                    />
                  </Col> */}
                                    <Col md='12'>
                                        <FormGroupCustom
                                            label={FM('notes')}
                                            type='editor'
                                            defaultValue={state.selectedItem?.notes}
                                            noGroup
                                            control={form.control}
                                            rules={{ required: true }}
                                            name='notes'
                                            className={'mb-1'}
                                        />
                                    </Col>
                                </Row>
                                {/* </TabPane>
              <TabPane tabId='2'> */}
                                <Row>
                                    <Col md='12'>
                                        <FormGroupCustom
                                            label={FM('decision')}
                                            type='editor'
                                            noGroup
                                            defaultValue={state.selectedItem?.decision}
                                            //   noLabel
                                            control={form.control}
                                            name='decision'
                                            className={'mb-1'}
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

            setActive('1')

            log('form.formState.errors', form.formState.errors)
        }
    }, [form.formState.errors])
    return <Fragment>{renderCreateModal()}</Fragment>
}

export default CreateEditNote
