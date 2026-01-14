/* eslint-disable prettier/prettier */
import { Divider } from '@mui/material'
import { useImportPurchaseItemReportMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/PurchaseItemRTK'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { stateReducer } from '@src/utility/stateReducer'
import { FM, formatDate } from '@src/utility/Utils'
import { useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { CardBody, Col, Form, Row, Spinner } from 'reactstrap'

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

export default function PurchaseItemImport<T>(props: T & dataType) {
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
  const [files, setFiles] = useState<any>([])
  const [loadingSample, setLoadingSample] = useState(false)

  const params: any = useParams()

  const storeId = params?.id
  const form = useForm()

  const {
    formState: { errors }
  } = form

  //IMPORT Purchase Item
  const [importPurchase, resultData] = useImportPurchaseItemReportMutation()

  const openModal = () => {
    setOpen(true)
    setState({
      subcatParent: []
      // categoryParent: []
    })
    form.reset()
  }
  const closeModal = () => {
    setFiles([])
    setOpen(false)
    setShowModal(false)
  }

  useEffect(() => {
    if (resultData?.isSuccess === true) {
      closeModal()
    }
  }, [resultData])

  const handleSaveUser = (data) => {
    importPurchase({
      file_url: data?.file_url[0]?.file_name ? data?.file_url[0]?.file_name : '',
      purchase_date: data?.purchase_date ? formatDate(data?.purchase_date, 'YYYY-MM-DD') : undefined
    })
  }

  useEffect(() => {
    if (noView && showModal) {
      openModal()
    }
  }, [noView, showModal])

  //////
  // useEffect(() => {
  //     if (resultData?.isSuccess) {
  //         responseData(true)
  //         closeModal()
  //         setFiles([])
  //     }
  // }, [resultData])
  ///////////
  const sampleBooking = () => {
    setLoadingSample(true)
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '/samples/item-purchase-demo-csv.csv' // public folder path
      link.download = 'item-purchase-demo-csv.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setLoadingSample(false)
    }, 300)
    // PurchaseSample({
    //   loading: setLoadingSample,
    //   success: (e: any) => {
    //     if (isValidUrl(e?.payload)) {
    //       window.open(e?.payload?.[0]?.file_name, '_blank')
    //     } else {
    //       window.open(`${e?.payload?.[0]?.file_name}`, '_blank')
    //     }
    //     //  window.open(`${httpConfig.baseUrl2}${e?.payload}`, '_blank')
    //   }
    // })
  }

  return (
    <>
      {!noView ? (
        <Component role='button' onClick={openModal} {...rest}>
          {children}
        </Component>
      ) : null}
      <CenteredModal
        scrollControl={false}
        modalClass='modal-sm '
        loading={resultData?.isLoading}
        open={open}
        buttonTitle='Import'
        handleModal={closeModal}
        handleSave={form.handleSubmit(handleSaveUser)}
        title={FM(`import-Purchase-Item`)}
      >
        <CardBody className=''>
          <Row className='pt-1'>
            <Divider />
            <div className='text-center text-warning mb-1 mt-2 text-bolder'>
              {loadingSample ? (
                <div className='loader-top me-2 '>
                  <span className='spinner'>
                    <Spinner color='primary' animation='border' size={'xl'}>
                      <span className='visually-hidden'>Loading...</span>
                    </Spinner>
                  </span>
                </div>
              ) : (
                <u onClick={sampleBooking} style={{ cursor: 'pointer' }}>
                  {FM('download-sample-file')}{' '}
                </u>
              )}
            </div>
          </Row>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row className='p-2'>
              <Col md='12' lg='12' sm='12' xs='12' className='mb-1'>
                <FormGroupCustom
                  control={form.control}
                  label={'Purchase Date'}
                  name='purchase_date'
                  type='date'
                  className='mb-1'
                  datePickerOptions={{
                    maxDate: new Date()
                  }}
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12' lg='12' sm='12' xs='12' className=''>
                <FormGroupCustom
                  control={form.control}
                  label={'Excel file import'}
                  accept='.xlsx,.xls,.csv,.xlsm,.xlsb'
                  name='file_url'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
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
