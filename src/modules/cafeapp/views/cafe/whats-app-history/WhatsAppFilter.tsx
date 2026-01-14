import { getUserData } from '@src/auth/utils'
import { orderResponseTypes } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
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

const defaultValues: orderResponseTypes = {
  start_date: '',
  end_date: ''
}

const WhatsAppFilter: FC<FilterProps> = (props) => {
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
        title={FM('filter-order-history')}
        done='filter'
      >
        <Row>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('start-date')}
              name='start_date'
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
              datePickerOptions={{ minDate: form.watch('start_date') }}
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default WhatsAppFilter
