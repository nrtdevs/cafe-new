// ** React Imports
import { useState } from 'react'

// ** Third Party Components
import { X } from 'react-feather'
import { Button, ButtonGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

// ** Styles
import { FM } from '@src/utility/Utils'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import LoadingButton from '../buttons/LoadingButton'

interface propsType {
    loading?: boolean
    open?: boolean
    disableSave?: boolean
    handleModal?: any
    children?: any
    handleSave?: any
    title?: any
    done?: any
    close?: any
}
function SideModal<T>({
    loading = false,
    open = false,
    disableSave = false,
    handleModal = () => { },
    children,
    handleSave = () => { },
    title = 'modal-title',
    done = 'done',
    close = 'close'
}: propsType) {
    // ** State
    const [Picker, setPicker] = useState(new Date())

    // ** Custom close btn
    const CloseBtn = <X className='cursor-pointer' size={15} onClick={handleModal} />

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className='sidebar-sm'
            modalClassName='modal-slide-in'
            contentClassName='pt-0 pb-0'
        >
            <ModalHeader className='mb-0' toggle={handleModal} close={CloseBtn} tag='div'>
                <h5 className='modal-title text-capitalize'>{FM(title)}</h5>
            </ModalHeader>
            <ModalBody className='flex-grow-1 pt-2 pb-2' style={{ height: '100vh', overflowY: 'scroll' }}>
                {children}
            </ModalBody>
            <ModalFooter>
                <ButtonGroup className='btn-block'>
                    <Button color='secondary' onClick={handleModal} outline>
                        {FM(close)}
                    </Button>
                    <LoadingButton
                        disabled={disableSave}
                        loading={loading}
                        color='primary'
                        onClick={handleSave}
                    >
                        {FM(done)}
                    </LoadingButton>
                </ButtonGroup>
            </ModalFooter>
        </Modal>
    )
}

export default SideModal
