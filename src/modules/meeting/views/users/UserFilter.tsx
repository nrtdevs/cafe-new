import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { UserData } from '@src/utility/types/typeAuthApi'
import { FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Label, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
}

const defaultValues: UserData = {
  //   role_id: 2,
  name: '',
  email: '',
  designation: '',
  mobile_number: '',
  status: 'active'
}

const UserFilter: FC<FilterProps> = (props) => {
  // toggle modal
  const [modal, toggleModal] = useModal()

  // form hook
  const form = useForm<UserData>({
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
            <p className='text-dark mb-0'>{FM('filter-users')}</p>
            <p className='text-muted small'>{FM('filter-users-description')}</p>
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('role')}
              name='role_id'
              type='select'
              async
              loadOptions={loadDropdown}
              path={ApiEndpoints.roles}
              selectLabel={(e) => e?.se_name}
              selectValue={(e) => e.id}
              defaultOptions
              className='mb-1'
              rules={{ required: true }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('name')}
              name='name'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('email')}
              name='email'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('designation')}
              name='designation'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('mobile-number')}
              name='mobile_number'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <Label>{FM('status')}</Label>
            <div className='d-flex'>
              <FormGroupCustom
                control={form.control}
                label={FM('active')}
                name='status'
                type='radio'
                defaultValue={'active'}
                className='mb-1'
                rules={{ required: false }}
              />
              <FormGroupCustom
                control={form.control}
                label={FM('inactive')}
                name='status'
                type='radio'
                defaultValue={'inactive'}
                className='ms-2 mb-1'
                rules={{ required: false }}
              />
            </div>
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default UserFilter
