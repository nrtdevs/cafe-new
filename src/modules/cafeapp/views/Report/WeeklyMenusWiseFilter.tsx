import { getUserData } from '@src/auth/utils'
import { orderResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { OrderStatus, PaymentModeWithUdhaar } from '@src/utility/Const'
import Hide from '@src/utility/Hide'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { FM, createConstSelectOptions } from '@src/utility/Utils'
import { FC, Fragment, useEffect } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
  type?: string
}

const defaultValues: any = {
  week_start: '',
  week_end: '',

  menu_id: ''
}

const WeeklyMenusWiseFilter: FC<FilterProps> = (props) => {
  // toggle modal
  const [modal, toggleModal] = useModal()
  const user = getUserData()

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
        title={FM('filter-order')}
        done='filter'
      >
        <Row>
          <Hide IF={props.type === 'cafe'}>
            <Col md='12' lg='12' sm='12' xs='12'>
              <FormGroupCustom
                control={form.control}
                async
                isClearable
                label='Menu'
                placeholder='Select Menu'
                name='menu_id'
                loadOptions={loadDropdown}
                path={ApiEndpoints.menus}
                selectLabel={(e) => `${e.name}`}
                selectValue={(e) => e.id}
                defaultOptions
                type='select'
                className='mb-1'
                rules={{ required: false }}
              />
            </Col>
          </Hide>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('week_start')}
              name='week_start'
              type='datetime'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('week-end')}
              name='week_end'
              type='datetime'
              datePickerOptions={{ minDate: form.watch('week_start') }}
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default WeeklyMenusWiseFilter
