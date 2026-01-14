import { yupResolver } from '@hookform/resolvers/yup'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import Emitter from '@src/utility/Emitter'
import {
    ErrorToast,
    FM,
    SuccessToast,
    isValid,
    isValidArray,
    log,
    setInputErrors,
    setValues
} from '@src/utility/Utils'
import { stateReducer } from '@src/utility/stateReducer'
import { Permission, Role } from '@src/utility/types/typeAuthApi'
import { Fragment, useEffect, useReducer } from 'react'
import { Info } from 'react-feather'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import {
    Col,
    Form,
    Input,
    Label,
    Row
} from 'reactstrap'
import * as yup from 'yup'
import {
    useCreateOrUpdateRoleMutation,
    useLoadPermissionsMutation
} from '../../redux/RTKQuery/RoleManagement'

// validation schema
const formSchema = {
    se_name: yup.string().required('Name is required')
}
// validate
const schema = yup.object(formSchema).required()

// states
type States = {
    selectedItem?: Role
    enableEdit?: boolean
    clickedButton?: string
    permissions?: Permission[]
    selectedPermissions?: any[]
}
// default values
const defaultValues: Role = {
    se_name: ''
}

// create edit action items
const CreateEditRole = ({
    modal,
    reloadCallback = () => { },
    toggleModal,
    data,
    toggleNextModal = (e: any) => { }
}: {
    reloadCallback?: (e?: any) => void
    toggleModal: () => void
    modal: boolean
    data?: Role
    toggleNextModal?: (e: any) => void
}) => {
    // params
    const params: any = useParams()
    // form hook
    const form = useForm<Role>({
        resolver: yupResolver(schema),
        defaultValues
    })
    // create or update mutation
    const [create, createResponse] = useCreateOrUpdateRoleMutation()
    // load permissions
    const [loadPermissions, loadPermissionsResponse] = useLoadPermissionsMutation()

    // default states
    const initState: States = {
        selectedItem: undefined,
        enableEdit: false,
        clickedButton: '1',
        selectedPermissions: []
    }
    // state reducer
    const reducers = stateReducer<States>
    // state
    const [state, setState] = useReducer(reducers, initState)

    // close modal
    const closeModal = () => {
        setState({
            selectedItem: undefined,
            enableEdit: false,
            selectedPermissions: []
        })
        form.reset()
        toggleModal()
    }

    // handle save
    const handleSave = (data: Role, invalid: any) => {
        if (String(state?.selectedItem?.name).toLowerCase() === 'admin') {
            return
        }
        if (!isValidArray(state?.selectedPermissions)) {
            ErrorToast(FM('please-select-at-least-one-permission'))
            return
        }
        create({
            jsonData: {
                ...data,
                permissions: state?.selectedPermissions
            }
        })
    }

    // handle create response
    useEffect(() => {
        if (!createResponse.isUninitialized) {
            if (createResponse.isSuccess) {
                closeModal()
                reloadCallback()
                Emitter.emit('reloadRole', true)
                SuccessToast(FM('role-added-successfully'))
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
                enableEdit: true,
                selectedPermissions: data?.permissions?.map((permission: Permission) => permission?.name)
            })
            form.setValue('se_name', data?.se_name)
        }

    }, [data])

    log(data, 'dssd')
    // open edit modal
    useEffect(() => {
        if (isValid(state.selectedItem)) {
            setValues<Role>(
                {
                    id: state?.selectedItem?.id
                },
                form.setValue
            )
        }
    }, [state.selectedItem])

    // load permissions if not loaded on permission state
    useEffect(() => {
        if (!isValid(state.permissions)) {
            loadPermissions({
                jsonData: undefined
            })
        }
    }, [state.permissions])

    // handle load permissions response
    useEffect(() => {
        if (!loadPermissionsResponse.isUninitialized) {
            if (loadPermissionsResponse.isSuccess) {
                setState({
                    permissions: loadPermissionsResponse.data?.data
                })
            } else if (loadPermissionsResponse.isError) {
                // handle error
                const errors: any = loadPermissionsResponse.error
                log(errors)
            }
        }
    }, [loadPermissionsResponse])

    // group permissions
    const groupPermissions = (permissions: Permission[]): any[] => {
        const groups: any[] = []
        permissions.forEach((permission: Permission) => {
            if (isValid(permission?.group_name)) {
                if (permission?.group_name !== 'dashboard' && permission?.group_name !== 'notifications') {
                    if (!isValid(groups[permission?.group_name])) {
                        groups[permission?.group_name] = []
                    }
                    groups[permission?.group_name].push(permission)
                }
            }
        })
        log('groups', groups)
        return groups
    }

    // select permission
    const selectPermission = (permission: Permission) => {
        const selectedPermissions = [...(state?.selectedPermissions ?? [])]
        const index = selectedPermissions.findIndex((p: string) => p === permission?.name)
        const input = document.getElementById('permission-select-all') as HTMLInputElement
        if (index > -1) {
            selectedPermissions.splice(index, 1)
        } else {
            selectedPermissions.push(permission?.name)
        }
        if (
            selectedPermissions.length > 0 &&
            selectedPermissions.length !== state?.permissions?.length
        ) {
            if (isValid(input)) {
                input.indeterminate = true
            }
        } else {
            if (isValid(input)) {
                input.indeterminate = false
            }
        }
        setState({
            selectedPermissions
        })
    }

    // loop through permissions groups
    const renderPermissionsGroups = (groups: any) => {
        const keys = Object.keys(groups)
        return keys.map((key: any) => {
            const desc: any = `${key}-permission-description`
            return (
                <Fragment key={key}>
                    <div className='border-top p-2 ps-0 pe-0'>
                        <Row className='align-items-top'>
                            <Col md={2} className=''>
                                <p className='mb-0 fw-bolder text-uppercase'>
                                    {FM(key)}{' '}
                                    <BsTooltip title={FM(desc)}>
                                        <Info size={14} role={'button'} />
                                    </BsTooltip>
                                </p>
                            </Col>
                            <Col md={10}>
                                <Row className='align-items-center'>
                                    {groups[key].map((permission: Permission) => {
                                        const desc: any = `${removeGroupNamePrefix(permission)}-permission-description`
                                        return (
                                            <Col md={2} key={permission?.id}>
                                                <div className='form-check form-check-inline'>
                                                    <Input
                                                        type='checkbox'
                                                        onChange={(e) => selectPermission(permission)}
                                                        checked={state?.selectedPermissions?.includes(permission?.name)}
                                                        id={`permission-${permission?.id}`}
                                                    />
                                                    <Label for={`permission-${permission?.id}`} className='form-check-label'>
                                                        {FM(removeGroupNamePrefix(permission))}{' '}
                                                        <BsTooltip title={FM(desc, { type: FM(key) })}>
                                                            <Info size={14} role={'button'} />
                                                        </BsTooltip>
                                                    </Label>
                                                </div>
                                            </Col>
                                        )
                                    })}
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </Fragment>
            )
        })
    }

    // remove group_name prefix from permission name
    const removeGroupNamePrefix = (permission: Permission): any => {
        if (permission?.name) {
            const name: string = permission?.name
            const groupName = permission?.group_name
            if (isValid(name) && isValid(groupName)) {
                return name.replace(groupName + '-', '')
            }
            return name
        } else {
            return ''
        }
    }

    // render permissions
    const renderPermissions = () => {
        if (isValid(state.permissions)) {
            if (isValidArray(state.permissions)) {
                const groups = groupPermissions(state.permissions ?? [])
                return renderPermissionsGroups(groups)
            } else {
                return <div className='text-center'>{FM('no-permissions')}</div>
            }
        }
    }

    // toggle select all permissions
    const toggleSelectAllPermissions = () => {
        const permissions = state.permissions
        if (isValidArray(permissions)) {
            if (state.selectedPermissions?.length) {
                setState({
                    selectedPermissions: []
                })
            } else {
                setState({
                    selectedPermissions: permissions?.map((permission: Permission) => {
                        return permission?.name
                    })
                })
            }
        }
    }

    // create modal
    const renderCreateModal = () => {
        return (
            <CenteredModal
                open={modal}
                done={state.enableEdit ? 'save' : 'save'}
                title={state.enableEdit ? FM('edit-role') + ' ' + state.selectedItem?.name : FM('add-role')}
                hideClose
                scrollControl={false}
                modalClass={'modal-xl'}
                handleModal={closeModal}
                loading={createResponse.isLoading && state.clickedButton === '1'}
                hideSave={String(state?.selectedItem?.name).toLowerCase() === 'admin'}
                handleSave={form.handleSubmit(handleSave)}
            >
                <div className='p-1' style={{ minHeight: '60vh' }}>
                    <Form onSubmit={form.handleSubmit(handleSave)}>
                        {/* submit form on enter button!! */}
                        <button className='d-none'></button>
                        <Row className='justify-content-start border-bottom pb-2'>
                            <Col md={2}>
                                <FormGroupCustom
                                    key={`${data}`}
                                    control={form.control}
                                    name={'se_name'}
                                    label={FM('role-name')}
                                    type='text'
                                    className={''}
                                    rules={{ required: true }}
                                />
                            </Col>
                        </Row>
                        <Label className='mt-2 mb-0'>{FM('permissions')}</Label>
                        <p className='small text-muted'>{FM('permissions-description')}</p>
                        <Row className='pb-2 mt-2'>
                            <Col md='2' className='fw-bolder'>
                                Select All
                            </Col>
                            <Col md='10'>
                                <div className='form-check form-check-inline'>
                                    <Input
                                        type='checkbox'
                                        checked={state?.selectedPermissions?.length === state?.permissions?.length}
                                        id={`permission-select-all`}
                                        onChange={toggleSelectAllPermissions}
                                    />
                                    <Label for={`permission-select-all`} className='form-check-label'>
                                        {FM('select-all')}
                                    </Label>
                                </div>
                            </Col>
                        </Row>
                        {renderPermissions()}
                    </Form>
                </div>
            </CenteredModal>
        )
    }

    return <Fragment>{renderCreateModal()}</Fragment>
}

export default CreateEditRole
