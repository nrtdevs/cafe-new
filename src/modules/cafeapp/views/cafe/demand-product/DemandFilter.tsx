import { getUserData } from '@src/auth/utils'
import { menusResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import Hide from '@src/utility/Hide'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
    handleFilterData: (e: any) => void
}

const defaultValues: any = {
  warehouse_id:'',
    category_id: '',
    product_id:'',
    subcategory_id:'',
    demand_date:'',
    cafe_id:'',
    warehouse_product_product_id:'',
    warehouse_product_category_id:'',
    warehouse_product_subcategory_id:''
}

const DemandFilter: FC<FilterProps> = (props) => {
    // toggle modal
    const [modal, toggleModal] = useModal()

    const userData=getUserData()
    // form hook
    const form = useForm<any>({
        defaultValues
    })

    // reset form on modal close
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
                title={FM('filter-demand-product')}
                done='filter'
            >
                <Row>
                    <Hide IF={userData?.role_id===7}>
                    <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            async
                            label='Warehouse'
                            name='warehouse_id'
                            isClearable
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.listWarehouse}
                            selectLabel={(e) => `${e.name}  `}
                            selectValue={(e) => e.id}

                            defaultOptions
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    </Hide>
                    <Show IF={userData?.role_id===7}>
                       <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            async
                            label='Cafe'
                            name='cafe_id'
                            isClearable
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.ListWarehouseCafes}
                            selectLabel={(e) => `${e.name}  `}
                            selectValue={(e) => e.id}

                            defaultOptions
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    </Show>
                    <Hide IF={userData?.role_id===7}>
                            <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('category')}
                  name='category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                  onChangeValue={() => {
                    form.setValue('subcategory_id', '')
                    form.setValue('product_id', '')
                  }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  key={`${form.watch('category_id')}`}
                  control={form.control}
                  async
                  isClearable
                  label={FM('sub-category')}
                  name='subcategory_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    is_parent: form.watch('category_id')?.value
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                  onChangeValue={() => {
                    form.setValue('product_id', '')
                  }}
                />
              </Col>

                   <Col md='12'>
                        <FormGroupCustom
                       key={`${form.watch('category_id')}-${form.watch('subcategory_id')}`}
                            control={form.control}
                            async
                            label='product'
                            name='product_id'
                            isClearable
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.products}
                            selectLabel={(e) => `${e.name}  `}
                            selectValue={(e) => e.id}
                            jsonData={{
                          category_id: form.watch('category_id')?.value
                           ? form.watch('category_id')?.value
                           : undefined,
                             subcategory_id: form.watch('subcategory_id')?.value
                           ? form.watch('subcategory_id')?.value
                           : undefined
                    
                           }}
                            defaultOptions
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col>
                    </Hide>
                    <Show IF={userData?.role_id===7}>
                          <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('category')}
                  name='warehouse_product_category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false}}
                  onChangeValue={() => {
                    form.setValue('warehouse_product_subcategory_id', '')
                    form.setValue('warehouse_product_product_id', '')
                  }}
                />
              </Col>

              <Col md='12'>
                <FormGroupCustom
                  key={`${form.watch('warehouse_product_category_id')}`}
                  control={form.control}
                  async
                  isClearable
                  label={FM('sub-category')}
                  name='warehouse_product_subcategory_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  jsonData={{
                    is_parent: form.watch('warehouse_product_category_id')?.value
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                  onChangeValue={() => {
                    form.setValue('warehouse_product_product_id', '')
                  }}
                />
              </Col>
                          <Col md='12'>
                       <FormGroupCustom
                       key={`${form.watch('warehouse_product_category_id')}-${form.watch('warehouse_product_subcategory_id')}`}
                            control={form.control}
                            async
                            label='product'
                            name='warehouse_product_product_id'
                            isClearable
                            loadOptions={loadDropdown}
                            path={ApiEndpoints.listWarehouseItem}
                            selectLabel={(e) => `${e.name}  `}
                            selectValue={(e) => e.id}
                        jsonData={{
                          category_id: form.watch('warehouse_product_category_id')?.value
                           ? form.watch('warehouse_product_category_id')?.value
                           : undefined,
                             subcategory_id: form.watch('warehouse_product_subcategory_id')?.value
                           ? form.watch('warehouse_product_subcategory_id')?.value
                           : undefined
                    
                           }}
                            defaultOptions
                            type='select'
                            className='mb-1'
                            rules={{ required: false }}
                        />
                    </Col> 
                    </Show>
                 <Col md='12'>
                        <FormGroupCustom
                            control={form.control}
                            label={FM('demand-date')}
                            name='demand_date'
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

export default DemandFilter
