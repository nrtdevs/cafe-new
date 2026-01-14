import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { stock_operation } from '@src/utility/Const'
import { FM, createConstSelectOptions } from '@src/utility/Utils'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { FC, Fragment, useEffect } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: any = {
    stock_operation: "",
    product_id: "",
    product: ""

}

const EmployeeStockFilter: FC<FilterProps> = (props) => {
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
                title={FM('employee-stock-report-filter')}
                done='filter'
            >
                <Row>

                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            async
                            isClearable
                            label='product'
                            name='product_id'
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.products}
                            selectLabel={(e) => `${e.name}`}
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
                            label={'stock operation'}
                            name='stock_operation'
                            type='select'
                            selectOptions={createConstSelectOptions(stock_operation, FM)}
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>

                </Row>
            </SideModal>
        </Fragment>
    )
}

export default EmployeeStockFilter