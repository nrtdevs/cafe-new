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
 brand_id: '',
  unit_id: '',
  pack_size: '',
  item_id: '',
  category_id: '',
  subcategory_id: ''
}

const WastedItemFilter: FC<FilterProps> = (props) => {
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
                title={FM('filter-quantity-mismatch')}
                done='filter'
            >
                <Row>
                 
                
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
              rules={{ required: false }}
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
            />
          </Col>

          <Col md='12' lg='12' sm='12' xs='12'>
            <FormGroupCustom
              control={form.control}
              async
              isClearable
              label={FM('brand')}
              placeholder={FM('select-brand')}
              name='brand_id'
              loadOptions={loadDropdown}
              path={ApiEndpoints.listBrands}
              selectLabel={(e) => `${e.name}  `}
              selectValue={(e) => e.id}
              jsonData={{ view_all: 'no' }}
              defaultOptions
              type='select'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12' lg='12' sm='12' xs='12'>
            <FormGroupCustom
              control={form.control}
              creatable
              isClearable
              label={FM('pack-size')}
              name='pack_size'
              loadOptions={loadDropdown}
              path={ApiEndpoints.packSizeList}
              selectLabel={(e) => `${e.name}  `}
              selectValue={(e) => e.id}
              jsonData={{ view_all: 'no' }}
              defaultOptions
              type='select'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12' lg='12' sm='12' xs='12'>
            <FormGroupCustom
              key={`${form.watch('category_id')} -${form.watch('subcategory_id')}`}
              control={form.control}
              async
              isClearable
              label={FM('item')}
              placeholder={FM('select-item')}
              name='item_id'
              loadOptions={loadDropdown}
              path={ApiEndpoints.listWarehouseItem}
              selectLabel={(e) => `${e.name}  `}
              jsonData={{
                category_id: form.watch('category_id')?.value,
                subcategory_id: form.watch('subcategory_id')?.value
              }}
              selectValue={(e) => e.id}
              defaultOptions
              type='select'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
                   
                      
                </Row>
            </SideModal>
        </Fragment>
    )
}

export default WastedItemFilter
