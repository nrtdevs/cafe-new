import { yupResolver } from '@hookform/resolvers/yup'
import { cafeResponseTypes, Purchase } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'

import { useCreateOrUpdateListPurchaseItemMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'

import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'

import Show, { Can } from '@src/utility/Show'
import { FM, SuccessToast, log, setInputErrors, setValues } from '@src/utility/Utils'

import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import httpConfig from '@src/utility/http/httpConfig'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer } from 'react'

import { ArrowLeft } from 'react-feather'
import { useFieldArray, useForm } from 'react-hook-form'

import { ButtonGroup, Col, Form, Row, ButtonProps, Card, CardBody } from 'reactstrap'
import * as yup from 'yup'

import { useNavigate } from 'react-router-dom'

import { PaymentModeWarehouse } from '@src/utility/Const'
import { getPath } from '@src/router/RouteHelper'
import { getUserData } from '@src/auth/utils'
import { useCafeSettingMutation } from '../../redux/RTKFiles/cafe-admin/cafeadminRTK'

// validation schema
const userFormSchema = {
  name: yup.string().min(2, 'min length!').max(50, 'max length!'),
  address: yup.string().min(2, 'min length!').max(200, 'max length!'),

  contact_person_name: yup.string().min(2, 'min length!').max(50, 'max length!'),
  mobile: yup
    .number()
    .required()
    .test(
      'len',
      'Please Enter Valid Mobile Number',
      (val: any) => val && val.toString().length === 10
    )
    .typeError('Please Enter Valid Mobile Number'),

  contact_person_phone: yup
    .number()
    .required()
    .test(
      'len',
      'Please Enter Valid Phone Number',
      (val: any) => val && val.toString().length === 10
    )
    .typeError('Please Enter Valid Phone Number')
}

// validate
const schema = yup.object(userFormSchema).required()

// states
type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: Purchase
  enableEdit?: boolean
  editData?: any
}

const defaultValues: any = {
  purchase_date: ''
}
const CafeSetting = (props: any) => {
  // header menu context categoryResponseTypes
  const navigate = useNavigate()
  // form hook
  const form = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const { fields, append, remove } = useFieldArray({
    control: form?.control,
    name: 'items'
  })

  // create or update purchase mutation
  const [createUpdateSetting, settingCafeResponse] = useCafeSettingMutation()

  const user = getUserData()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    editData: '',
    lastRefresh: new Date().getTime()
  }

  // state reducer
  const reducers = stateReducer<States>

  // state
  const [state, setState] = useReducer(reducers, initState)

  useEffect(() => {
    if (fields?.length === 0) {
      append({})
    }
  }, [fields])

  // handle save purchase
  const handleSaveUser = (userData: any) => {
    createUpdateSetting({
      jsonData: {
        name: userData?.name,
        email: user?.email,
        mobile: userData?.mobile,
        address: userData?.address,
        gst_no: userData?.gst_no,
        contact_person_name: userData?.contact_person_name,
        contact_person_email: user?.contact_person_email,
        contact_person_phone: userData?.contact_person_phone,
        profile_image_path:
          userData?.profile_image_path?.length > 0
            ? userData?.profile_image_path[0]?.file_name
            : user?.profile_image_path
              ? user?.profile_image_path
              : undefined
      }
    })
  }

  // handle purchase create response
  useEffect(() => {
    if (!settingCafeResponse.isUninitialized) {
      if (settingCafeResponse.isSuccess) {
        // navigate(getPath('purchase-items'))
        if (settingCafeResponse?.data?.payload) {
          localStorage.setItem(
            httpConfig.storageUserData,
            JSON.stringify({
              ...user,
              ...settingCafeResponse.data.payload
            })
          )
          setTimeout(() => window.location.reload(), 500)
        }
        SuccessToast(<>{FM('cafe-setting-successfully')}</>)
      } else if (settingCafeResponse.isError) {
        // handle error
        const errors: any = settingCafeResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [settingCafeResponse])

  //setValue On form
  useEffect(() => {
    setValues<cafeResponseTypes>(
      {
        id: user?.cafe_id,
        name: user?.name,

        mobile: user?.mobile,
        address: user?.address,
        website: user.website,
        contact_person_name: user?.contact_person_name,
        contact_person_email: user?.contact_person_email,
        contact_person_phone: user?.contact_person_phone,

        gst_no: user?.gst_no
        // no_of_subcafe: state?.editData?.no_of_subcafe,
        // status: state?.editData?.status
        //   ? {
        //       label:
        //         state?.editData?.status === 1
        //           ? 'Active'
        //           : state?.editData?.status === 2
        //           ? 'InActive'
        //           : '',
        //       value: state?.editData?.status
        //     }
        //   : undefined
      },
      form.setValue
    )
  }, [user])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  useEffect(() => {
    if (state?.editData === null) {
      form.reset()
    }
  }, [state.editData])

  return (
    <Fragment>
      <Header
        route={props?.route}
        icon={
          <ArrowLeft
            size='25'
            onClick={() => {
              navigate(-1)
            }}
          />
        }
        title='Cafe Setting'
      >
        <ButtonGroup color='dark'></ButtonGroup>
      </Header>

      <Form onSubmit={form.handleSubmit(handleSaveUser)}>
        <Card>
          <CardBody className=''>
            <Row className='g'>
              <Col md='12'>
                <Row className='g'>
                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('name')}
                      name='name'
                      type='text'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col>

                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('mobile')}
                      name='mobile'
                      type='number'
                      className='mb-1'
                      rules={{ required: true, min: 0 }}
                    />
                  </Col>
                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('contact-person-name')}
                      name='contact_person_name'
                      type='text'
                      className='mb-1'
                      rules={{ required: true, min: 0 }}
                    />
                  </Col>

                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('contact-person-phone')}
                      name='contact_person_phone'
                      type='number'
                      className='mb-1'
                      rules={{ required: true, min: 0 }}
                    />
                  </Col>
                  <Col md='4'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('gst-no')}
                      name='gst_no'
                      type='text'
                      className='mb-1'
                      rules={{ required: false }}
                    />
                  </Col>
                  <Col md='12'>
                    <FormGroupCustom
                      control={form.control}
                      label={FM('address')}
                      name='address'
                      type='textarea'
                      className='mb-1'
                      rules={{ required: true }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Col md='12' className=''>
          <FormGroupCustom
            control={form.control}
            label={'Upload image'}
            name='profile_image_path'
            type='dropZone'
            className='mb-1'
            dropZoneOptions={{}}
            //   noLabel
            noGroup
            rules={{ required: false }}
          />
        </Col>
        {user?.profile_image_path ? (
          <Col md='12'>
            <img src={user?.profile_image_path} width={'100'} height={'100'} />
          </Col>
        ) : (
          ''
        )}
        <div className='text-start mb-2 mt-2'>
          <ButtonGroup className='me-2'>
            <LoadingButton
              disabled={settingCafeResponse.isLoading}
              loading={settingCafeResponse.isLoading}
              color='primary'
              type='submit'
            >
              {FM('Save')}
            </LoadingButton>
          </ButtonGroup>
        </div>
      </Form>
    </Fragment>
  )
}

export default CafeSetting
