import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'

import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
}

const defaultValues: any = {
  item_id: '',
  transfer_to_cafe: '',
  start_date: '',
  end_date: '',
  category_id: '',
  subcategory_id: ''
}

const ItemTransferFilter: FC<FilterProps> = (props) => {
  // toggle modal
  const [modal, toggleModal] = useModal()

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
        title={FM('filter')}
        done='filter'
      >
        <Row>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              async
              isClearable
              label='Transfer to Cafe'
              name='transfer_to_cafe'
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

          <Col md='12'>
            <FormGroupCustom
              key={`${form.watch('category_id')} -${form.watch('subcategory_id')}`}
              control={form.control}
              async
              label='Item'
              name='item_id'
              placeholder='Select Items'
              isClearable
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

          <Col sm='12'>
            <FormGroupCustom
              name={'start_date'}
              type={'date'}
              isClearable
              datePickerOptions={{
                maxDate: form.watch('end_date')
              }}
              label={FM('start-date')}
              dateFormat={'YYYY-MM-DD'}
              className='mb-0'
              control={form.control}
              rules={{ required: false }}
            />
          </Col>
          <Col sm='12'>
            <FormGroupCustom
              isClearable
              name={'end_date'}
              datePickerOptions={{
                minDate: form.watch('start_date')
              }}
              type={'date'}
              label={FM('end-date')}
              dateFormat={'YYYY-MM-DD'}
              className='mb-0'
              control={form.control}
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default ItemTransferFilter
