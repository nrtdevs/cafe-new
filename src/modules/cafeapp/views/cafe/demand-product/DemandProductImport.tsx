/* eslint-disable prettier/prettier */
import { Divider } from '@mui/material'
import { useImportDemandProductMutation } from '@src/modules/cafeapp/redux/RTKFiles/cafe/MenusRTK'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import { stateReducer } from '@src/utility/stateReducer'
import { FM, formatDate, SuccessToast } from '@src/utility/Utils'
import { useEffect, useReducer, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { CardBody, Col, Form, Row, Spinner } from 'reactstrap'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'

interface States {
  lastRefresh?: any
  loading?: boolean
  text?: string
  list?: any
  search?: any
}

interface dataType {
  edit?: any
  noView?: boolean
  showModal?: boolean
  responseData?: (e: boolean) => void
  setShowModal?: (e: boolean) => void
  Component?: any
  loading?: boolean
  children?: any
}

export default function DemandProductImport<T>(props: T & dataType) {
  const {
    edit = null,
    noView = false,
    showModal = false,
    responseData = () => { },
    setShowModal = () => { },
    Component = 'span',
    children = null,
    ...rest
  } = props

  const initState: States = {
    lastRefresh: new Date().getTime(),
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
  const form = useForm()

  const {
    formState: { errors }
  } = form

  // IMPORT Demand Product
  const [importDemand, resultData] = useImportDemandProductMutation()

  const openModal = () => {
    setOpen(true)
    form.reset()
  }
  const closeModal = () => {
    setFiles([])
    setOpen(false)
    setShowModal(false)
  }

  useEffect(() => {
    if (resultData?.isSuccess === true) {
      SuccessToast(FM('demand-product-imported-successfully'))
      responseData(true)
      closeModal()
    }
  }, [resultData])

  const handleSaveUser = (data) => {
    importDemand({
      file_url: data?.file_url[0]?.file_name ? data?.file_url[0]?.file_name : '',
      warehouse_id: data?.warehouse_id?.value
    })
  }

  useEffect(() => {
    if (noView && showModal) {
      openModal()
    }
  }, [noView, showModal])

  const sampleBooking = () => {
    setLoadingSample(true)
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = '/samples/demand_request.xlsx' // public folder path - update if you have a real one
      link.download = 'demand_request.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setLoadingSample(false)
    }, 300)
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
        title={FM(`import-demand-product`)}
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
                  async
                  isClearable
                  label='Warehouse'
                  name='warehouse_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.listWarehouse}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
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
                  noGroup
                  rules={{ required: true }}
                />
              </Col>
            </Row>
          </Form>
        </CardBody>
      </CenteredModal>
    </>
  )
}
