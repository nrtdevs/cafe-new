import { yupResolver } from '@hookform/resolvers/yup'

import { pullData } from '@src/modules/cafeapp/redux/RTKFiles/ResponseTypes'
import {
  useCreateOrUpdatePullDataMutation,
  useLoadCategoryPullDataMutation,
  useLoadMenuPullDataMutation,
  useLoadProductPullDataMutation
} from '@src/modules/cafeapp/redux/RTKFiles/cafe-admin/pulldata'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'

import { pullDataType } from '@src/utility/Const'

import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  isValidArray,
  log,
  setInputErrors
} from '@src/utility/Utils'

import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useEffect, useReducer, useState } from 'react'
import { List } from 'react-feather'
import { useForm } from 'react-hook-form'

import { Card, Col, Form, Row } from 'reactstrap'
import * as yup from 'yup'

// validation schema
const userFormSchema = {}
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
  selectedUser?: any
  enableEdit?: boolean
  editData?: any
}

const defaultValues: any = {}
const PullData = (props: any) => {
  // form hook
  const form = useForm<pullData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  // create or update user mutation
  const [createPull, createCafeResponse] = useCreateOrUpdatePullDataMutation()

  // load Pull Category Data
  const [loadPullCategory, loadPullCategoryResponse] = useLoadCategoryPullDataMutation()
  // load Pull Product
  const [loadPullProduct, loadPullProductResponse] = useLoadProductPullDataMutation()

  //load pull menu
  const [loadPullMenu, loadPullMenuResponse] = useLoadMenuPullDataMutation()

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
  const [selectAll, setSelectAll] = useState(false)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedProductAll, setSelectedProductAll] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<number[]>([])
  const [selectedMenuAll, setSelectedMenuAll] = useState<boolean>(false)
  const [selectedMenu, setSelectedMenu] = useState<number[]>([])

  const obj = {}
  selectedItems.forEach((value, index) => {
    obj[index] = value
  })

  const arrayToObject = (arr: number[]) => {
    return arr.reduce((obj, item) => {
      obj[item] = item // Assign the value to be the same as the key
      return obj
    }, {} as Record<number, number>) // TypeScript type annotation
  }

  const customObjectToString = (obj: Record<number, number>) => {
    return Object.values(obj).join(', ')
  }

  // close add
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      editData: null
    })
    setSelectAll(false)
    setSelectedItems([])
    setSelectedProduct([])
    setSelectedProductAll(false)
    setSelectedMenu([])
    setSelectedMenuAll(false)
    form.reset()
  }

  // handle save pull data
  const handleSaveUser = (userData: any) => {
    const result = arrayToObject(selectedItems)
    const data = customObjectToString(result)
    const productResult = arrayToObject(selectedProduct)
    const data1 = customObjectToString(productResult)
    const menuResult = arrayToObject(selectedMenu)
    const data2 = customObjectToString(menuResult)
    createPull({
      jsonData: {
        category_ids: userData?.type?.value === 'category' ? data : '',
        type: userData?.type?.value,
        menu_ids: userData?.type?.value === 'menu' ? data2 : '',
        product_ids: userData?.type?.value === 'product' ? data1 : ''
      }
    })
  }

  //load pull category data
  useEffect(() => {
    if (form.watch('type')?.value === 'category') {
      loadPullCategory({
        page: state.page,
        per_page_record: 200,
        jsonData: {
          ...state.filterData
        }
      })
    }
  }, [form.watch('type')?.value === 'category'])

  //load product data
  useEffect(() => {
    if (form.watch('type')?.value === 'product') {
      loadPullProduct({
        page: state.page,
        per_page_record: 200,
        jsonData: {
          ...state.filterData
        }
      })
    }
  }, [form.watch('type')?.value === 'product'])

  useEffect(() => {
    if (form.watch('type')?.value === 'menu') {
      loadPullMenu({
        page: state.page,
        per_page_record: 200,
        jsonData: {
          ...state.filterData
        }
      })
    }
  }, [form.watch('type')?.value === 'menu'])

  // handle pull create response
  useEffect(() => {
    if (!createCafeResponse.isUninitialized) {
      if (createCafeResponse.isSuccess) {
        closeAddModal()

        SuccessToast(
          state?.editData?.id ? 'Updated Pull Data Successfully' : 'Created Pull Data Successfully'
        )
      } else if (createCafeResponse.isError) {
        // handle error
        const errors: any = createCafeResponse.error
        log(errors)
        setInputErrors(errors?.data?.data, form.setError)
      }
    }
  }, [createCafeResponse])

  //handle category checkbox change
  const handleCheckboxChange = (event: any, itemId: any) => {
    const isChecked = event.target.checked

    if (isChecked) {
      setSelectedItems([...selectedItems, itemId?.id])
    } else {
      setSelectedItems(selectedItems.filter((id: any) => id !== itemId?.id))
    }
  }

  //handle all Category checkbox change
  const handleSelectAllCheckboxChange = (event) => {
    const isChecked = event.target.checked
    setSelectAll(isChecked)

    if (isChecked) {
      const allItemIds = loadPullCategoryResponse?.data?.payload?.data?.map((item: any) => item.id)
      setSelectedItems(allItemIds)
    } else {
      setSelectedItems([])
    }
  }

  //handle product checkbox change
  const handleCheckboxProductChange = (event: any, itemId: any) => {
    const isChecked = event.target.checked

    if (isChecked) {
      setSelectedProduct([...selectedProduct, itemId?.id])
    } else {
      setSelectedProduct(selectedProduct.filter((id: any) => id !== itemId?.id))
    }
  }

  //handle all Product checkbox change
  const handleSelectAllProductChange = (event) => {
    const isChecked = event.target.checked
    setSelectedProductAll(isChecked)

    if (isChecked) {
      const allItemIds = loadPullProductResponse?.data?.payload?.data?.map((item: any) => item.id)
      setSelectedProduct(allItemIds)
    } else {
      setSelectedProduct([])
    }
  }

  //handle menu checkbox change
  const handleCheckboxMenuChange = (event: any, itemId: any) => {
    const isChecked = event.target.checked

    if (isChecked) {
      setSelectedMenu([...selectedMenu, itemId?.id])
    } else {
      setSelectedMenu(selectedMenu.filter((id: any) => id !== itemId?.id))
    }
  }

  //handle all Menu checkbox change
  const handleSelectAllMenuChange = (event) => {
    const isChecked = event.target.checked
    setSelectedMenuAll(isChecked)

    if (isChecked) {
      const allItemIds = loadPullMenuResponse?.data?.payload?.data?.map((item: any) => item.id)
      setSelectedMenu(allItemIds)
    } else {
      setSelectedMenu([])
    }
  }

  // Use useEffect to log selectedItems when it changes
  useEffect(() => {
    let data = loadPullCategoryResponse?.data?.payload?.data.length === selectedItems.length
    let data1 = selectedItems.length

    if (data && data1 !== 0) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [selectedItems])

  //product to select all data manage
  useEffect(() => {
    let data = loadPullProductResponse?.data?.payload?.data.length === selectedProduct.length
    let data1 = selectedProduct.length

    if (data && data1 !== 0) {
      setSelectedProductAll(true)
    } else {
      setSelectedProductAll(false)
    }
  }, [selectedProduct])

  //menu to select all data manage
  useEffect(() => {
    let data = loadPullMenuResponse?.data?.payload?.data.length === selectedMenu.length
    let data1 = selectedMenu.length

    if (data && data1 !== 0) {
      setSelectedMenuAll(true)
    } else {
      setSelectedMenuAll(false)
    }
  }, [selectedMenu])

  // create push data
  const renderCreateModal = () => {
    return (
      <Card>
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            <Row>
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  isClearable
                  label={FM('type')}
                  name={`type`}
                  selectOptions={createConstSelectOptions(pullDataType, FM)}
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              {form.watch('type')?.value === 'category' ? (
                <>
                  <Col
                    xs='12'
                    md='12'
                    lg='12'
                    sm='12'
                    className='d-flex justify-content-start mb-2'
                  >
                    <div className='me-1'>
                      <input
                        type='checkbox'
                        onChange={handleSelectAllCheckboxChange}
                        checked={selectAll}
                        className='form-check-input'
                      />
                    </div>
                    <div className='me-2'>
                      <label className='form-check-label'>{FM('select-all-category')}</label>
                    </div>
                  </Col>
                  <Col md='12' lg='12' sm='12' xs='12'>
                    <Row className='mb-1 ms-1'>
                      {isValidArray(loadPullCategoryResponse?.data?.payload?.data) ? (
                        loadPullCategoryResponse?.data?.payload?.data.map((d: any, i: any) => {
                          // log('d', d)
                          const isChecked = selectedItems.includes(d.id)

                          return (
                            <>
                              <Col
                                sx='4'
                                md='4'
                                lg='4'
                                className='mb-1 d-flex justify-content-start'
                              >
                                <div className='me-1'>
                                  <input
                                    type='checkbox'
                                    onChange={(event) => handleCheckboxChange(event, d)}
                                    checked={isChecked}
                                    className='form-check-input'
                                  />
                                </div>
                                <div>
                                  <label className='form-check-label text-capitalize'>
                                    {d?.name}
                                  </label>
                                </div>
                              </Col>
                            </>
                          )
                        })
                      ) : (
                        <></>
                      )}
                    </Row>
                  </Col>
                </>
              ) : (
                ''
              )}

              {form.watch('type')?.value === 'product' ? (
                <>
                  <Col xs='12' md='12' className='d-flex justify-content-start mb-2'>
                    <div className='me-1'>
                      <input
                        type='checkbox'
                        onChange={handleSelectAllProductChange}
                        checked={selectedProductAll}
                        className='form-check-input'
                      />
                    </div>
                    <div className='me-2'>
                      <label className='form-check-label'>{FM('select-all-product')}</label>
                    </div>
                  </Col>
                  <Col md='12'>
                    <Row className='mb-1 ms-1'>
                      {isValidArray(loadPullProductResponse?.data?.payload?.data) ? (
                        loadPullProductResponse?.data?.payload?.data.map((d: any, i: any) => {
                          // log('d', d)
                          const isCheckedProduct = selectedProduct.includes(d.id)

                          return (
                            <>
                              <Col
                                sx='4'
                                md='4'
                                lg='4'
                                className='mb-1 d-flex justify-content-start'
                              >
                                <div className='me-1'>
                                  <input
                                    type='checkbox'
                                    onChange={(event) => handleCheckboxProductChange(event, d)}
                                    checked={isCheckedProduct}
                                    className='form-check-input'
                                  />
                                </div>
                                <div>
                                  <label className='form-check-label text-capitalize'>
                                    {d?.name}
                                  </label>
                                </div>
                              </Col>
                            </>
                          )
                        })
                      ) : (
                        <></>
                      )}
                    </Row>
                  </Col>
                </>
              ) : (
                ''
              )}
              {form.watch('type')?.value === 'menu' ? (
                <>
                  <Col xs='12' md='12' className='d-flex justify-content-start mb-2'>
                    <div className='me-1'>
                      <input
                        type='checkbox'
                        onChange={handleSelectAllMenuChange}
                        checked={selectedMenuAll}
                        className='form-check-input'
                      />
                    </div>
                    <div className='me-2'>
                      <label className='form-check-label'>{FM('select-all-menu')}</label>
                    </div>
                  </Col>
                  <Col md='12'>
                    <Row className='mb-1 ms-1'>
                      {isValidArray(loadPullMenuResponse?.data?.payload?.data) ? (
                        loadPullMenuResponse?.data?.payload?.data.map((d: any, i: any) => {
                          // log('d', d)
                          const isCheckedMenu = selectedMenu.includes(d.id)

                          return (
                            <>
                              <Col
                                sx='4'
                                md='4'
                                lg='4'
                                className='mb-1 d-flex justify-content-start'
                              >
                                <div className='me-1'>
                                  <input
                                    type='checkbox'
                                    onChange={(event) => handleCheckboxMenuChange(event, d)}
                                    checked={isCheckedMenu}
                                    className='form-check-input'
                                  />
                                </div>
                                <div>
                                  <label className='form-check-label text-capitalize'>
                                    {d?.name}
                                  </label>
                                </div>
                              </Col>
                            </>
                          )
                        })
                      ) : (
                        <></>
                      )}
                    </Row>
                  </Col>
                </>
              ) : (
                ''
              )}
            </Row>

            <LoadingButton
              tooltip={FM('add-pull-data')}
              loading={createCafeResponse.isLoading}
              size='sm'
              color='primary'
              onSubmit={form.handleSubmit(handleSaveUser)}
            >
              {FM('save')}
            </LoadingButton>
          </Form>
        </div>
      </Card>
    )
  }

  return (
    <Fragment>
      <Header route={props?.route} icon={<List size='25' />} title='Pull Data'></Header>
      {renderCreateModal()}
    </Fragment>
  )
}

export default PullData
