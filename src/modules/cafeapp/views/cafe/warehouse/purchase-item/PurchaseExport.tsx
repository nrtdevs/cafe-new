/* eslint-disable prettier/prettier */
import {
  useExportPurchaseReportMutation,
  useExportTransferItemReportMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe/ItemTransferRTK'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { FM, formatDate, log } from '@src/utility/Utils'
import { useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { CardBody, Col, Form, Row } from 'reactstrap'

interface States {
  lastRefresh?: any
  subCategoryArr?: Array<any>
  categoryParent?: any
  subcatParent?: any
  categoryList?: Array<any>
  categoryListFlat?: Array<any>
  ip?: boolean
  patient?: boolean
  languageList?: any
  language_id?: any
  loading?: boolean
  text?: string
  list?: any

  search?: any
}
type FormData = {
  qr_code: string
  email_address: string
  contact_person_name: string
  contact_person_number: number
  street_address: string
  city: string
  state: string
  zip_code: number
  latitude: string | number
  longitude: string | number
  subscription_type: any
  payment_type: any | null
  amount_per_transaction: number | null
  amount: number | null
}
interface dataType {
  edit?: any
  noView?: boolean
  subCatStoreID?: any
  showModal?: boolean
  active?: boolean
  responseData?: (e: boolean) => void
  setShowModal?: (e: boolean) => void
  Component?: any
  loading?: boolean
  children?: any
  // rest?: any
}

export default function PurchaseExport<T>(props: T & dataType) {
  const {
    edit = null,
    noView = false,
    active = false,
    showModal = false,
    responseData = () => {},
    setShowModal = () => {},
    Component = 'span',
    children = null,
    ...rest
  } = props

  const initState: States = {
    lastRefresh: new Date().getTime(),
    languageList: [],
    categoryList: [],
    categoryListFlat: [],
    subCategoryArr: [],
    language_id: null,
    ip: false,
    patient: false,
    loading: false,
    search: undefined,
    text: '',
    list: []
  }
  const reducers = stateReducer<States>
  const [state, setState] = useReducer(reducers, initState)
  const [open, setOpen] = useState(false)

  const params: any = useParams()

  const storeId = params?.id
  const form = useForm()

  const {
    formState: { errors }
  } = form

  //IMPORT Purchase Item
  const [exportItemData, resultData] = useExportPurchaseReportMutation()

  const openModal = () => {
    setOpen(true)
    setState({
      subcatParent: []
      // categoryParent: []
    })
    form.reset()
  }
  const closeModal = () => {
    setOpen(false)
    setShowModal(false)
  }

  useEffect(() => {
    if (resultData?.isSuccess === true) {
      responseData(true)
      closeModal()
    }
  }, [resultData])

  //handle purchase Export
  const handleSaveUser = (data) => {
    exportItemData({
      page: 1,
      per_page_record: 50,
      item_id: data?.item_id?.value,
      category_id: data?.category_id?.value,
      subcategory_id: data?.subcategory_id?.value,
      start_date: data?.start_date ? formatDate(data?.start_date, 'YYYY-MM-DD') : undefined,
      end_date: data?.end_date ? formatDate(data?.end_date, 'YYYY-MM-DD') : undefined
    })
  }

  useEffect(() => {
    if (noView && showModal) {
      openModal()
    }
  }, [noView, showModal])

  useEffect(() => {
    if (resultData?.isSuccess === true) {
      window.open(resultData?.data?.payload?.[0]?.file_name, '_blank')
    }
  }, [resultData])

  return (
    <>
      {!noView ? (
        <Component role='button' onClick={openModal} {...rest}>
          {children}
        </Component>
      ) : null}
      <CenteredModal
        scrollControl={false}
        modalClass='modal-lg'
        loading={resultData?.isLoading}
        open={open}
        buttonTitle='Export'
        handleModal={closeModal}
        handleSave={form.handleSubmit(handleSaveUser)}
        title={FM(`export-purchase-item`)}
      >
        <CardBody className=''>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row className='p-2'>
              <Col md='4'>
                <FormGroupCustom
                  control={form.control}
                  async
                  label='Item'
                  name='item_id'
                  placeholder='Select Items'
                  isClearable
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseItem}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  onChangeValue={(e) => {
                    form.setValue('category_id', {
                      label: form.watch(`item_id`)?.extra?.category?.name,
                      value: form.watch(`item_id`)?.extra?.category?.id
                    })
                    form.setValue('subcategory_id', {
                      label: form.watch(`item_id`)?.extra?.subcategory?.name,
                      value: form.watch(`item_id`)?.extra?.subcategory?.id
                    })
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>
              <Col md='4'>
                <FormGroupCustom
                  key={form.watch(`item_id`)}
                  control={form.control}
                  async
                  isClearable
                  label={FM('category')}
                  name='category_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouseCategory}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  onChangeValue={(e) => {
                    form.resetField('subcategory_id')
                  }}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='4'>
                <FormGroupCustom
                  key={`${form.watch('category_id')}-${form.watch(`item_id`)}`}
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
              <Col sm='4'>
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
              <Col sm='4'>
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
          </Form>
        </CardBody>
      </CenteredModal>
    </>
  )
}
