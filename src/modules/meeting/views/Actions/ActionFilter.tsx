import useUser from '@hooks/useUser'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import SideModal from '@src/modules/common/components/sideModal/sideModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { ActionStatusText, ActionStratus, priorityType } from '@src/utility/Const'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import Show from '@src/utility/Show'
import { UserData } from '@src/utility/types/typeAuthApi'
import { ActionItem } from '@src/utility/types/typeMeeting'
import { createConstSelectOptions, FM } from '@src/utility/Utils'
import React, { FC, Fragment } from 'react'
import { Sliders } from 'react-feather'
import { useForm } from 'react-hook-form'
import { Button, ButtonProps, Col, Label, Row } from 'reactstrap'

type FilterProps = {
  handleFilterData: (e: any) => void
}

const defaultValues: ActionItem = {
  task: '',
  comment: '',
  mm_ref_id: '',
  due_date: '',
  owner_id: '',
  priority: '',
  status: ''
}

const ActionFilter: FC<FilterProps> = (props) => {
  // user
  const user = useUser()
  // toggle modal
  const [modal, toggleModal] = useModal()

  // form hook
  const form = useForm<ActionItem>({
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
            <p className='text-dark mb-0'>{FM('filter-actions')}</p>
            <p className='text-muted small'>{FM('filter-actions-description')}</p>
          </Col>
          <Col md='12'>
            <Show IF={String(user?.roles?.name).toLowerCase() === 'admin'}>
              <Col md='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label={FM('owner')}
                  name='owner_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.users}
                  selectLabel={(e) => `${e.email} | ${e.name} `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  isClearable
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
            </Show>
            <FormGroupCustom
              control={form.control}
              label={FM('task')}
              name='task'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('comment')}
              name='comment'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('mm-ref-id')}
              name='mm_ref_id'
              type='text'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('due-date')}
              name='due_date'
              type='date'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM(' priority')}
              name='priority'
              selectOptions={createConstSelectOptions(priorityType, FM)}
              type='select'
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
          <Col md='12'>
            <FormGroupCustom
              control={form.control}
              label={FM('status')}
              name='status'
              type='select'
              selectOptions={createConstSelectOptions(ActionStatusText, FM)}
              className='mb-1'
              rules={{ required: false }}
            />
          </Col>
        </Row>
      </SideModal>
    </Fragment>
  )
}

export default ActionFilter
