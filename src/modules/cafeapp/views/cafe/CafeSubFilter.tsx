import FormGroupCustom from "@src/modules/common/components/formGroupCustom/FormGroupCustom"
import { useModal } from "@src/modules/common/components/modal/HandleModal"
import SideModal from "@src/modules/common/components/sideModal/sideModal"
import BsTooltip from "@src/modules/common/components/tooltip"
import { sub_type } from "@src/utility/Const"
import { FM, createConstSelectOptions } from "@src/utility/Utils"
import ApiEndpoints from "@src/utility/http/ApiEndpoints"
import { loadDropdown } from "@src/utility/http/Apis/dropdowns"
import { FC, Fragment, useEffect } from "react"
import { Sliders } from "react-feather"
import { useForm } from "react-hook-form"
import { Button, ButtonProps, Col, Row } from "reactstrap"
import { cafeSubResponseTypes } from "../../redux/RTKFiles/ResponseTypes"
type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: cafeSubResponseTypes = {
    cafe_id: '',
    subscription_type: '',
    subscription_start_date: '',
    subscription_end_date: '',
    subscription_charge: '',

}
const CafeSubFilter: FC<FilterProps> = (props) => {
    // toggle modal
    const [modal, toggleModal] = useModal()

    // form hook
    const form = useForm<any>({
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
                title={('filter Cafe Subscription')}
                done='filter'
            >
                <Row>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            async
                            isClearable
                            label='Select Cafe'
                            name='cafe_id'
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.cafeList}
                            selectLabel={(e) => `${e.name}  `}
                            selectValue={(e) => e.id}
                            defaultOptions
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={('subscription type')}
                            name={`subscription_type`}
                            selectOptions={createConstSelectOptions(sub_type, FM)}
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label='subscription charge'
                            name='subscription_charge'
                            type='number'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>

                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label='subscription startDate'
                            name='subscription_start_date'
                            type='date'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label='subscription_endDate'
                            name='subscription_end_date'
                            type='date'
                            className='mb-1'
                            datePickerOptions={{
                                minDate: form.watch('subscription_start_date')
                            }}
                            rules={{ required: false }}
                        />
                    </Col>
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default CafeSubFilter
