import { yupResolver } from '@hookform/resolvers/yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import {
    useCreateOrUpdateUserMutation
} from '@src/modules/meeting/redux/RTKQuery/UserManagement'
import { handleLogin } from '@src/redux/authentication'
import { useAppDispatch, useAppSelector } from '@src/redux/store'
import Emitter from '@src/utility/Emitter'
import Hide from '@src/utility/Hide'
import {
    FM,
    SuccessToast,
    isValid,
    log,
    setInputErrors,
    setValues
} from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { UserData } from '@src/utility/types/typeAuthApi'
import { Fragment, useEffect, useReducer } from 'react'
import { User } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Col, Form, Label, Row } from 'reactstrap'
import * as yup from 'yup'

// validation schema
const userFormSchema = {
    name: yup.string().required(),
    email: yup.string().email().required(FM('email-must-be-a-valid-email')),
    designation: yup.string().required(),
    mobile_number: yup
        .string()
        .required()
        .when({
            is: (values: string) => values?.length > 0,
            then: (schema) =>
                schema
                    .min(10, FM('mobile-number-must-be-at-least-10-characters'))
                    .max(12, FM('mobile-number-must-be-at-most-12-characters'))
                    .required(),
            otherwise: (schema) => schema.notRequired().min(0).max(0)
        }),
    password: yup.string().when('id', {
        is: (values: string) => !isValid(values),
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired()
    }),
    'confirm-password': yup.string().when('id', {
        is: (values: string) => !isValid(values),
        then: (schema) => schema.oneOf([yup.ref('password'), null], FM('passwords-must-match')),
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
    role_id: 0,
    name: '',
    email: '',
    designation: '',
    mobile_number: ''
}
const UpdateViewProfile = ({ data }: { data: UserData }) => {
    const dispatch = useAppDispatch()

    const user = useAppSelector((state) => state.auth.userData)
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
            jsonData: userData
        })
    }

    // handle user create response
    useEffect(() => {
        if (!createUserResponse.isUninitialized) {
            if (createUserResponse.isSuccess) {
                const res = createUserResponse.data
                const permissions =
                    res?.data?.permissions?.map((a) => ({
                        action: a.action,
                        subject: a?.subject
                    })) ?? []
                const data = {
                    ...res.data
                }
                dispatch(handleLogin({ ...user, ...data }))
                closeAddModal()
                SuccessToast(FM('update-profile-successfully'))
            } else if (createUserResponse.isError) {
                // handle error
                const errors: any = createUserResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [createUserResponse])

    // check data and set it to selected user
    useEffect(() => {
        Emitter.on('openUserModal', () => {
            if (isValid(data)) {
                setState({
                    selectedUser: data
                })
            }
        })

        return () => {
            Emitter.off('openUserModal', () => { })
        }
    }, [data])

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
                    role_id: state.selectedUser?.role_id
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
                done={'save'}
                title={FM('update-profile')}
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
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('email')}
                                    name='email'
                                    type='email'
                                    isDisabled
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
                            <p className='text-dark fw-bold text-capitalize'>{state.selectedUser?.email}</p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('mobile-number')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>
                                {state.selectedUser?.mobile_number}
                            </p>
                        </Col>
                        <Col md='6'>
                            <Label className='text-uppercase mb-25'>{FM('designation')}</Label>
                            <p className='text-dark fw-bold text-capitalize'>{state.selectedUser?.designation}</p>
                        </Col>
                    </Row>
                </div>
            </CenteredModal>
        )
    }

    return (
        <Fragment>
            {renderCreateModal()}
            {renderViewModal()}
        </Fragment>
    )
}

export default UpdateViewProfile
