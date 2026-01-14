import { yupResolver } from '@hookform/resolvers/yup'
import { useChangePasswordMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/SubCafe'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { useModal } from '@src/modules/common/components/modal/HandleModal'

import Emitter from '@src/utility/Emitter'
import Show from '@src/utility/Show'
import { FM, SuccessToast, isValid, log, setInputErrors, setValues } from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { Password, UserData } from '@src/utility/types/typeAuthApi'
import { Fragment, useEffect, useReducer } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Alert, Col, Form, Row } from 'reactstrap'
import * as yup from 'yup'


// validation schema
const userFormSchema = {
    // password: yup
    //     .string()
    //     .required()
    //     .matches(Patterns.Password, FM('invalid-password')),
    // old_password: yup.string().required(),
    // 'confirm-password': yup
    //     .string()
    //     .required()
    //     .oneOf([yup.ref('password')], FM('passwords-must-match'))
}
// validate
const schema = yup.object(userFormSchema).required()

// states
type States = {
    page?: any
    doNotClose?: boolean
    per_page_record?: any
    filterData?: any
    reload?: any
    isAddingNewData?: boolean
    search?: string
    lastRefresh?: any
    selectedUser?: UserData
    enableEdit?: boolean
}

const defaultValues: Password = {
    old_password: '',
    password: ''
}
const ChangePassword = ({ data }: { data: UserData }) => {
    // form hook
    const form = useForm<Password>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // toggle add modal
    const [modalAdd, toggleModalAdd] = useModal()
    // create or update user mutation
    const [changePassword, changePasswordResponse] = useChangePasswordMutation()
    const navigate = useNavigate()

    // default states
    const initState: States = {
        page: 1,
        per_page_record: 15,
        filterData: undefined,
        search: '',
        enableEdit: false,
        doNotClose: false,
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

    // handle save user
    const handleSaveUser = (userData: Password) => {
        // log(userData, 'userData')
        changePassword({ jsonData: userData })
    }
    // log(changePasswordResponse, 'changePasswordResponse')
    // handle user create response
    useEffect(() => {
        if (!changePasswordResponse.isUninitialized) {
            if (changePasswordResponse.isSuccess) {
                closeAddModal()
                SuccessToast(FM('change-password-successfully'))
                localStorage.clear()
                window.location.href = '/login'
            } else if (changePasswordResponse.isError) {
                // handle error
                const errors: any = changePasswordResponse.error
                log(errors)
                setInputErrors(errors?.data?.data, form.setError)
            }
        }
    }, [changePasswordResponse])

    // check data and set it to selected user
    useEffect(() => {
        Emitter.on('openChangePasswordModal', (e: any) => {
            if (isValid(data)) {
                setState({
                    doNotClose: e?.doNotClose ?? false,
                    selectedUser: data
                })
            }
        })

        return () => {
            Emitter.off('openChangePasswordModal', () => { })
        }
    }, [data])

    // open view modal
    useEffect(() => {
        if (isValid(state.selectedUser)) {
            setValues<any>(
                {
                    id: state.selectedUser?.id
                },
                form.setValue
            )
            toggleModalAdd()
        }
    }, [state.selectedUser])

    // create user modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modalAdd}
                done={state.enableEdit ? 'save' : 'save'}
                title={FM('change-password')}
                handleModal={closeAddModal}
                loading={changePasswordResponse.isLoading}
                handleSave={form.handleSubmit(handleSaveUser)}
                hideClose={state.doNotClose}
            // disableHeader={state.doNotClose}
            >
                <div className='p-2'>
                    <Form onSubmit={form.handleSubmit(handleSaveUser)}>
                        {/* submit form on enter button!! */}
                        {/* <button className='d-none'></button> */}
                        <Show IF={state.doNotClose ?? false}>
                            <Alert color='danger'>
                                <p className='mb-0 p-2'>{FM('please-change-your-password')}</p>
                            </Alert>
                        </Show>
                        <Row>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('old-password')}
                                    name='old_password'
                                    type='password'
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={('new password')}
                                    name='password'
                                    type='password'
                                    tooltip={FM('password-must-contain-at-least-one-number')}
                                    className='mb-1'
                                    rules={{ required: true }}
                                />
                            </Col>
                            {/* <Col md='12'>
                                <FormGroupCustom
                                    control={form.control}
                                    label={FM('confirm-password')}
                                    name='confirm-password'
                                    type='password'
                                    className='mb-1'
                                    rules={{ required: true, pattern: Patterns.Password }}
                                />
                            </Col> */}
                        </Row>
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    return <Fragment>{renderCreateModal()}</Fragment>
}

export default ChangePassword
