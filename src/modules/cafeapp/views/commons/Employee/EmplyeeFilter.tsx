import { employeeResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { FM } from '@src/utility/Utils'
import { FC, Fragment, useEffect } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: employeeResponseTypes = {
    name: '',
    email: '',
    mobile: '',

}

const EmployeeFilter: FC<FilterProps> = (props) => {
    // toggle modal
    const [modal, toggleModal] = useModal()

    // form hook
    const form = useForm<employeeResponseTypes>({
        defaultValues
    })

    // reset form on modal close
    useEffect(() => {
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
                title={FM('filter-employee')}
                done='filter'
            >
                <Row>

                    <Col md='12' lg='12' sm='12' xs='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('name')}
                            name='name'
                            type='text'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12' lg='12' sm='12' xs='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('email')}
                            name='email'
                            type='email'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12' lg='12' sm='12' xs='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('mobile')}
                            name='mobile'
                            type='number'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default EmployeeFilter

