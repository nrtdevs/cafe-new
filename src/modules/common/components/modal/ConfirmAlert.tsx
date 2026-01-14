import { Events } from '@src/utility/Const'
import Emitter from '@src/utility/Emitter'
import { FM, isValid, log } from '@src/utility/Utils'
import { useEffect, useState } from 'react'
import { Spinner } from 'reactstrap'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)
/**
 * Show Alert with confirm
 */

interface PropsTypes {
    item?: any | null
    title?: string | null | any
    text?: string | null | any
    enableNo?: boolean
    icon?: any
    confirmButtonText?: any
    showCancelButton?: boolean
    successIcon?: any
    successTitle?: string | null | any
    successText?: string | null | any
    failedIcon?: any
    failedTitle?: string | null | any
    failedText?: string | null | any
    onClickYes?: any | null | undefined
    onClickNo?: any | null | undefined
    children?: any
    id?: string
    style?: any
    className?: any
    onFailedEvent?: any | null | undefined
    onSuccessEvent?: any | null | undefined
    input?: boolean | any | null
    eventId?: string
    onDropdown?: boolean
    menuIcon?: any
    percentage?: any
    loader?: boolean
}
const ConfirmAlert = ({
    onDropdown = false,
    eventId = Events.confirmAlert,
    item = null,
    title = null,
    text = null,
    enableNo = false,
    menuIcon = null,
    icon = 'warning',
    confirmButtonText,
    showCancelButton = true,
    successIcon = 'success',
    successTitle = null,
    successText = null,
    failedIcon = 'error',
    failedTitle = null,
    failedText = null,
    onClickYes = () => { },
    onClickNo = () => { },
    children,
    id = 't',
    percentage,
    style = {},
    className = {},
    onFailedEvent = () => { },
    onSuccessEvent = () => { },
    loader = true,
    input = false
}: PropsTypes) => {
    const [isOpen, setOpen] = useState(true)
    const [reason, setReason] = useState('')
    const [payload, setPayload] = useState(null)

    const [onSuccess, setOnsuccess] = useState(false)
    const [onFailed, setOnFailed] = useState(false)

    title = title ? FM(title) : FM('are-you-sure')
    text = text ? FM(text) : FM('you-wont-be-able-to-revert-this')
    confirmButtonText = confirmButtonText ? FM(confirmButtonText) : FM('yes')
    // Success
    successTitle = successTitle ? FM(successTitle) : FM('success')
    successText = successText ? FM(successText) : FM('executed-successfully')
    // Failed
    failedTitle = failedTitle ? FM(failedTitle) : FM('failed')
    failedText = failedText ? FM(failedText) : FM('execution-failed')

    useEffect(() => {
        if (isValid(item)) {
            setPayload((i: any) => ({ ...i, ...item }))
        }
    }, [item])

    useEffect(() => {
        if (isOpen) {
            Emitter.on(eventId, (e: any) => {
                setPayload((i: any) => ({ ...i, ...e?.payload }))
                if (e?.type === 'success') {
                    log(eventId, 'success rec', e)
                    MySwal.fire({
                        icon: successIcon,
                        title: successTitle,
                        text: successText,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        onSuccessEvent(payload)
                        setOpen(false)
                    })
                } else if (e?.type === 'failed') {
                    log(eventId, 'failed rec', e)
                    MySwal.fire({
                        icon: failedIcon,
                        title: failedTitle,
                        text: failedText,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        onFailedEvent(payload)
                        setOpen(false)
                    })
                } else {
                    log(eventId, 'no match')
                }
            })
        }
    }, [isOpen])

    const popup = () => {
        setOpen(true)
        return MySwal.fire({
            title,
            text,
            icon,
            inputValidator: (value) => {
                if (!value) {
                    setReason(value)
                    return 'You need to write a valid reason!'
                } else {
                    return null
                }
            },
            //   inputLabel: FM('percentage'),
            input: input ? input : undefined,
            inputAttributes: {
                min: '1',
                max: '100',
                step: '1',
                class: 'form-range'
            },
            inputValue: percentage ?? '',
            showDenyButton: enableNo,
            showCancelButton,
            confirmButtonText,
            allowOutsideClick: false,
            customClass: {
                input: 'shadow p-1 pe-0',
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-outline-danger ms-1',
                denyButton: 'btn btn-danger ms-1'
            },
            buttonsStyling: false
        }).then(function (result) {
            if (result.value === true || isValid(result.value)) {
                onClickYes(result.value)
                setOpen(true)
                if (loader) {
                    MySwal.fire({
                        title: (
                            <>
                                <div className=''>
                                    <Spinner animation='border' color='danger' size={'lg'}>
                                        <span className='visually-hidden'>Loading...</span>
                                    </Spinner>
                                </div>
                            </>
                        ),
                        text: 'Please Wait',
                        showConfirmButton: false,
                        showCancelButton: false,
                        allowOutsideClick: false
                    })
                }
            } else if (result.value === false) {
                onClickNo(result.value)
                setOpen(true)
                if (loader) {
                    MySwal.fire({
                        title: (
                            <>
                                <div className=''>
                                    <Spinner animation='border' color='danger' size={'lg'}>
                                        <span className='visually-hidden'>Loading...</span>
                                    </Spinner>
                                </div>
                            </>
                        ),

                        text: 'Please Wait',
                        showConfirmButton: false,
                        showCancelButton: false,
                        allowOutsideClick: false
                    })
                }
            }
        })
    }

    return (
        <>
            <span
                role='button'
                onClick={popup}
                className={onDropdown ? 'dropdown-item d-flex align-items-center' : className}
                style={style}
                id={id ?? 'delete-button'}
            >
                {onDropdown && menuIcon ? (
                    <>
                        <span className='me-1' style={{ marginTop: '-3px' }}>
                            {menuIcon}
                        </span>
                        {children}
                    </>
                ) : (
                    children
                )}
            </span>
        </>
    )
}

export default ConfirmAlert
