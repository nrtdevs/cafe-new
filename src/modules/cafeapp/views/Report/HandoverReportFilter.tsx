import { customerResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import Hide from '@src/utility/Hide'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { FM, getUserData } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
}

const defaultValues: any = {}
const HandoverReportFilter: FC<FilterProps> = (props) => {
  // toggle modal
  const [modal, toggleModal] = useModal()

  const user = getUserData()
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
        title={'filter Cash Handover'}
        done='filter'
      >
        <Row>
          <Show IF={user?.role_id === 1}>
            <Col md='12' lg='12' xl='12' sm='12'>
              <FormGroupCustom
                control={form.control}
                async
                isClearable
                label={'cafe'}
                name='cafe_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.cafeList}
                selectLabel={(e) => ` ${e.name} `}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col>
          </Show>
          <Show IF={user?.role_id === 1}>
            <Col md='12' lg='12' xl='12' sm='12'>
              <FormGroupCustom
                key={`${form.watch('cafe_id')}`}
                control={form.control}
                async
                isClearable
                label='Sub Cafe'
                placeholder='Select sub cafe'
                name='sub_cafe_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.subCafeList}
                selectLabel={(e) => `${e.name}`}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                jsonData={{
                  is_parent: form.watch('cafe_id')?.value
                }}
                rules={{ required: false }}
              />
            </Col>
          </Show>
          <Hide IF={user?.no_of_subcafe === 0}>
            <Col md='12' lg='12' xl='12' sm='12'>
              <FormGroupCustom
                control={form.control}
                async
                isClearable
                label='Sub Cafe'
                placeholder='Select sub cafe'
                name='sub_cafe_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.subCafeList}
                selectLabel={(e) => `${e.name}`}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col>
          </Hide>

          <Col md='12' lg='12' xl='12' sm='12'>
            <FormGroupCustom
              name={'start_date'}
              type={'date'}
              isClearable
              label={FM('start-date')}
              dateFormat={'YYYY-MM-DD'}
              datePickerOptions={{
                maxDate: form.watch('end_date')
              }}
              className='mb-1'
              control={form.control}
              rules={{ required: false }}
            />
          </Col>
          <Col md='12' lg='12' xl='12' sm='12'>
            <FormGroupCustom
              isClearable
              name={'end_date'}
              type={'date'}
              datePickerOptions={{
                minDate: form.watch('start_date')
              }}
              label={FM('end-date')}
              dateFormat={'YYYY-MM-DD'}
              className='mb-'
              control={form.control}
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default HandoverReportFilter
