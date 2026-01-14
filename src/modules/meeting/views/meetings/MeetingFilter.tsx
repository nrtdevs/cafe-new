import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { Meeting } from '@src/utility/types/typeMeeting'
import { FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Label, Row } from 'reactstrap'

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: Meeting = {
    status: '1',
    meeting_title: '',
    meeting_ref_no: '',
    meeting_date: '',
    meeting_time_start: '',
    meeting_time_end: ''
}

const MeetingFilter: FC<FilterProps> = (props) => {
    // toggle modal
    const [modal, toggleModal] = useModal()

    // form hook
    const form = useForm<Meeting>({
        defaultValues
    })

    // RESET FORM ON MODAL CLOSE
    React.useEffect(() => {
        if (!modal) {
            form.reset(defaultValues)
        }
    }, [modal])
    return (
        <Fragment>
            <BsTooltip<ButtonProps>
                onClick={toggleModal}
                Tag={Button}
                title={FM('filter')}
                size='sm'
                color='primary'
            >
                <Sliders size='14' />
            </BsTooltip>
            <SideModal
                handleSave={form.handleSubmit(props.handleFilterData)}
                open={modal}
                handleModal={() => {
                    toggleModal()
                }}
                title={FM('filter')}
                done='filter'
            >
                <Row>
                    <Col md='12'>
                        <p className='text-dark mb-0'>{FM('filter-meeting')}</p>
                        <p className='text-muted small'>{FM('filter-meeting-description')}</p>
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('name')}
                            name='meeting_title'
                            type='text'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('meeting-ref-no')}
                            name='meeting_ref_no'
                            type='text'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('date')}
                            name='meeting_date'
                            type='date'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('meeting-time-start')}
                            name='meeting_time_start'
                            type='time'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('meeting-time-end')}
                            name='meeting_time_end'
                            type='time'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <Label>{FM('status')}</Label>
                        <div className='d-flex'>
                            <FormGroupCustom
                                control={form.control}
                                label={FM('active')}
                                name='status'
                                type='radio'
                                defaultValue={'1'}
                                className='mb-1'
                                rules={{ required: false }}
                            />
                            <FormGroupCustom
                                control={form.control}
                                label={FM('inactive')}
                                name='status'
                                type='radio'
                                defaultValue={'2'}
                                className='ms-2 mb-1'
                                rules={{ required: false }}
                            />
                        </div>
                    </Col>
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default MeetingFilter
