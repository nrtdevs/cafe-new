import { customerAccountResponseTypes } from "@src/modules/cafeapp/redux/RTKFiles/ResponseTypes"
import FormGroupCustom from "@src/modules/common/components/formGroupCustom/FormGroupCustom"
import { useModal } from "@src/modules/common/components/modal/HandleModal"
import SideModal from "@src/modules/common/components/sideModal/sideModal"
import BsTooltip from "@src/modules/common/components/tooltip"
import { FM } from "@src/utility/Utils"
import ApiEndpoints from "@src/utility/http/ApiEndpoints"
import { loadDropdown } from "@src/utility/http/Apis/dropdowns"
import { FC, Fragment, useEffect } from "react"
import { Sliders } from "react-feather"
import { useForm } from "react-hook-form"
import { Button, ButtonProps, Col, Row } from "reactstrap"

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: customerAccountResponseTypes = {
    from_date: "",
    customer_id: "",
    end_date: ""
}
const CustAccountFilter: FC<FilterProps> = (props) => {

    // toggle modal
    const [modal, toggleModal] = useModal()

    // form hook
    const form = useForm<customerAccountResponseTypes>({
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
                title={('filter Customer Account')}
                done='filter'
            >
                <Row>

                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            async
                            label='customer name'
                            name='customer_id'
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.customers}
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
                            label={FM('from-date')}
                            name='from_date'
                            type='date'
                            className='mb-1'

                            rules={{ required: false }}
                        />
                    </Col>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('end-date')}
                            name='end_date'
                            type='date'
                            className='mb-1'

                            rules={{ required: false }}
                        />
                    </Col>
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default CustAccountFilter
