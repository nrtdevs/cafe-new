import { yupResolver } from '@hookform/resolvers/yup'
import { getUserData } from '@src/auth/utils'
import base64 from 'base-64'
import { useLoadSalryEmployeeMutation } from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeAttendanceRTK'
import {
  useCreateOrUpdateEmpMutation,
  useDeleteEmpByIdMutation,
  useLoadEmpsMutation
} from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/EmployeeRTK'
import CustomDataTable, {
  TableDropDownOptions,
  TableFormData
} from '@src/modules/common/components/CustomDataTable/CustomDataTable'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import FormGroupCustom from '@src/modules/common/components/formGroupCustom/FormGroupCustom'
import Header from '@src/modules/common/components/header'
import CenteredModal from '@src/modules/common/components/modal/CenteredModal'
import ConfirmAlert from '@src/modules/common/components/modal/ConfirmAlert'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import BsTooltip from '@src/modules/common/components/tooltip'
import { documentType, gender } from '@src/utility/Const'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'
import {
  FM,
  SuccessToast,
  createConstSelectOptions,
  emailValidation,
  emitAlertStatus,
  formatDate,
  isValid,
  isValidArray,
  log,
  setInputErrors,
  setValues
} from '@src/utility/Utils'
import { RenderHeaderMenu } from '@src/utility/context/RenderHeader'
import ApiEndpoints from '@src/utility/http/ApiEndpoints'
import { loadDropdown } from '@src/utility/http/Apis/dropdowns'
import { stateReducer } from '@src/utility/stateReducer'
import { Fragment, useContext, useEffect, useReducer } from 'react'
import { TableColumn } from 'react-data-table-component'
import {
  DollarSign,
  Edit,
  Eye,
  Key,
  List,
  PlusCircle,
  RefreshCcw,
  Trash2,
  UserCheck,
  UserX
} from 'react-feather'
import { useForm } from 'react-hook-form'
import {
  Button,
  ButtonGroup,
  Col,
  Form,
  Label,
  NavItem,
  NavLink,
  Row,
  UncontrolledTooltip
} from 'reactstrap'
import { useDispatch } from 'react-redux'
import * as yup from 'yup'
import { employeeResponseTypes } from '../../../redux/RTKFiles/ResponseTypes'
import EmployeeFilter from './EmplyeeFilter'
import {
  useEmployeeChLoginMutation,
  useSubCafeChLoginMutation
} from '@src/modules/cafeapp/redux/RTKFiles/common-cafe/AuthRTK'
import { handleLogin } from '@src/redux/authentication'
const requiredErrorMessage = 'This field is required'
const numberErrorMessage = 'This field is must be numerical'
// validation schema
const userFormSchema = {
  // file: yup.string().required()
  email: yup.string().matches(emailValidation, 'please valid email').required(),
  birth_date: yup.date().typeError('date must be required').required(),
  name: yup.string().required('name must be required'),
  mobile: yup
    .number()
    .required()
    .min(1000000000, 'min length 10!')
    .max(9999999999, 'max length 10!')
    .typeError('mobile must be required'),
  gender: yup.object().required('gender must be required').typeError('gender must be required'),
  document_type: yup
    .object()
    .required('document_type must be required')
    .typeError('document_type must be required'),
  salary: yup
    .number()
    .min(1000, 'min length 4!')
    .max(9999999999, 'max length 10!')
    .typeError(numberErrorMessage)
    .required(requiredErrorMessage),
  designation: yup
    .string()
    .required('designation must be required')
    .typeError('designation must be required'),
  document_number: yup
    .string()
    .required('document_number must be required')
    .typeError('document_number must be required'),
  address: yup.string().required('address must be required'),
  role_id: yup.object().required('role must be required').typeError('role must be required')
}
// validate
const schema = yup.object(userFormSchema)

// states

type States = {
  page?: any
  per_page_record?: any
  filterData?: any
  reload?: any
  isAddingNewData?: boolean
  search?: string
  lastRefresh?: any
  selectedUser?: employeeResponseTypes
  enableEdit?: boolean
  enableView?: boolean
  editData?: any
  editViewData?: any
}

const defaultValues: employeeResponseTypes = {
  uuid: '',
  cafe_id: '',
  parent_id: '',
  is_parent: '',
  name: '',
  email: '',
  subscription_status: '',
  email_verified_at: '',
  role_id: '',
  mobile: '',
  designation: '',
  document_type: '',
  document_number: '',
  address: '',
  birth_date: '',
  joining_date: '',
  gender: '',
  salary: '',
  salary_balance: '',
  image: '',
  account_balance: '',
  created_at: '',
  updated_at: ''
}
const Employee = (props: any) => {
  // header menu context categoryResponseTypes
  const { setHeaderMenu } = useContext(RenderHeaderMenu)
  const dispatch = useDispatch()
  const user = getUserData()
  // can add user
  const canAddUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeCreate) : Can(Permissions.employeeCreate)
  // can edit user
  const canEditUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeEdit) : Can(Permissions.employeeEdit)
  // can delete user
  const canDeleteUser =
    user?.role_id === 1 ? Can(Permissions.adminEmployeeDelete) : Can(Permissions.employeeDelete)

  // form hook
  const form = useForm<employeeResponseTypes>({
    resolver: yupResolver(schema),
    defaultValues
  })
  // toggle add modal
  const [modalAdd, toggleModalAdd] = useModal()
  // toggle view modal
  const [modalView, toggleModalView] = useModal()

  //Salary View Modal
  const [modalSalary, toggleModalSalary] = useModal()
  // create or update user mutation
  const [createEmp, createEmpResponse] = useCreateOrUpdateEmpMutation()
  // load users
  const [loadEmployee, loadEmpRestResponse] = useLoadEmpsMutation()
  //load employee salary
  const [loadEmployeeSalary, loadRestEmpSalary] = useLoadSalryEmployeeMutation()
  // delete mutation
  const [empDelete, empRestDelete] = useDeleteEmpByIdMutation()

  //child login
  const [ChildLogin, createChildLogin] = useSubCafeChLoginMutation()

  //load login user detail
  const user1 = getUserData()

  // default states
  const initState: States = {
    page: 1,
    per_page_record: 20,
    filterData: undefined,
    search: '',
    enableEdit: false,
    enableView: false,
    editData: '',
    editViewData: '',
    lastRefresh: new Date().getTime()
  }

  // state reducer
  const reducers = stateReducer<States>

  // state
  const [state, setState] = useReducer(reducers, initState)

  // close add modal
  const closeAddModal = () => {
    setState({
      selectedUser: undefined,
      enableEdit: false,
      enableView: false,
      editViewData: null,
      editData: null
    })

    form.reset()
    toggleModalAdd()
  }

  // close view modal
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })

      form.reset()
    }
    toggleModalView()
  }

  // close Salary Modal
  const closeSalaryModal = (reset = true) => {
    if (reset) {
      setState({
        enableEdit: false,
        editData: null,
        editViewData: null
      })

      form.reset()
    }
    toggleModalSalary()

    form.setValue('year_month', null)
  }

  //cafe child
  useEffect(() => {
    if (!createChildLogin.isUninitialized) {
      if (createChildLogin.isSuccess) {
        // closeAddModal()
        // loadUserList()

        const data = createChildLogin.data

        const p =
          data?.payload?.permissions?.map((a) => ({
            action: a.se_name,
            subject: a?.group_name
          })) ?? []
        // Extract browse permissions
        const browsePermissions = p.filter((perm: any) => perm.action?.includes('-browse'))
        log(browsePermissions, 'Browse Permissions')

        const firstPermission = browsePermissions?.[0]
        if (!firstPermission) {
          console.warn('No browse permission found, cannot redirect.')
          return
        }

        // Optional: filtered permission list (can be used if needed)
        const filteredPermissions = p.filter((item: any) =>
          browsePermissions.some(
            (perm: any) => perm.action === item.action && perm.subject === item.subject
          )
        )
        log(filteredPermissions, 'Filtered Permissions')

        const m = {
          ...data?.payload,
          ability: p
        }
        dispatch(handleLogin(m))
        SuccessToast('Employee child login')
        // Subject to route mapping
        const redirectMap: Record<string, string> = {
          dashboard: '/dashboard',
          unit: '/unit',
          cafe: '/cafe',
          order: '/order',
          adminEmployee: '/commons/employee',
          menu: '/menus',
          category: '/category',
          product: '/product',
          employee: '/commons/employee',
          salary: '/commons/salary',
          customer: '/customer',
          customerAccount: '/account',
          expense: '/expense',
          attendence: '/attendance',
          OnlyForCafe: '/sub-cafe',
          role: '/role',
          wastage: '/manage-wastage',
          'stock-history-browse': '/stock-manage-log',
          'stock-transfer': '/stock-transfer',
          'pull-data': '/pull-data',
          'opening-stock': '/cafe-opening-stock',
          brand: '/brand',
          catsubcat: '/warehouse-category',
          item: '/item',
          'item-prchase': '/purchase-item',
          stockManage: '/stockmanage'
        }

        const redirectPath = redirectMap[firstPermission.subject]
        if (redirectPath) {
          window.location.href = redirectPath
        } else {
          console.warn('No redirect path matched for:', firstPermission.subject)
        }

        // window.location.href = '/dashboard'
      } else if (createChildLogin.isError) {
        // handle error
        const errors: any = createChildLogin.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createChildLogin])

  //Load Salary slip
  useEffect(() => {
    if (form.watch('year_month')) {
      loadEmployeeSalary({
        jsonData: {
          employee_id: state?.editViewData?.id,
          year_month: formatDate(form.watch('year_month'), 'YYYY-MM')
        }
      })
    }
  }, [loadEmployeeSalary, state?.editViewData?.id, form.watch('year_month')])

  // handle save user
  const handleSaveUser = (userData: any) => {
    if (state?.editData?.id) {
      createEmp({
        jsonData: {
          ...state?.editData,
          ...userData,
          gender: userData?.gender?.value,
          document_type: userData?.document_type.value,
          role_id: userData?.role_id?.value,
          birth_date: formatDate(userData?.birth_date, 'YYYY-MM-DD'),
          profile_image_path: userData?.profile_image_path
            ? userData?.profile_image_path[0]?.file_name
            : state?.editData?.profile_image_path
            ? state?.editData?.profile_image_path
            : ''
        }
      })
    } else {
      createEmp({
        jsonData: {
          ...userData,
          gender: userData?.gender?.value,
          document_type: userData?.document_type.value,
          birth_date: formatDate(userData?.birth_date, 'YYYY-MM-DD'),
          role_id: userData?.role_id?.value,
          profile_image_path: userData?.profile_image_path
            ? userData?.profile_image_path[0]?.file_name
            : ''
        }
      })
    }
  }

  // load user list
  const loadUserList = () => {
    loadEmployee({
      page: state.page,
      per_page_record: state.per_page_record,
      jsonData: {
        cafe_id: user1?.cafe_id,
        name: !isValid(state.filterData) ? state.search : undefined,
        ...state.filterData
      }
    })
  }

  // handle user create response
  useEffect(() => {
    if (!createEmpResponse.isUninitialized) {
      if (createEmpResponse.isSuccess) {
        closeAddModal()
        loadUserList()
        SuccessToast(
          state?.editData?.id ? (
            <>{FM('updated-employee-successfully')}</>
          ) : (
            <>{FM('created-employee-successfully')}</>
          )
        )
      } else if (createEmpResponse.isError) {
        // handle error
        const errors: any = createEmpResponse.error
        log(errors)
        setInputErrors(errors?.data?.payload, form.setError)
      }
    }
  }, [createEmpResponse])

  //Salary message
  useEffect(() => {
    if (loadRestEmpSalary?.isSuccess) {
      SuccessToast('Salary Data fetched Successfully')
    }
  }, [loadRestEmpSalary])

  // handle pagination and load list and filterData
  useEffect(() => {
    loadUserList()
  }, [state.page, state.search, state.per_page_record, state.filterData, state.lastRefresh])

  // handle page change
  const handlePageChange = (e: TableFormData) => {
    setState({ ...e })
  }

  // handle filter data
  const handleFilterData = (e: any) => {
    setState({
      filterData: { ...e, role_id: e?.role_id?.value },
      page: 1,
      search: '',
      per_page_record: 20
    })
  }

  // reload Data
  const reloadData = () => {
    setState({
      page: 1,
      search: '',
      filterData: undefined,
      per_page_record: 20,
      lastRefresh: new Date().getTime()
    })
  }

  // create a menu on header
  useEffect(() => {
    if (!canAddUser) return
    setHeaderMenu(
      <>
        <NavItem className=''>
          <BsTooltip title='Add Employee'>
            <NavLink className='' onClick={toggleModalAdd}>
              <PlusCircle className={'ficon ' + (modalAdd ? 'text-primary' : '')} />
            </NavLink>
          </BsTooltip>
        </NavItem>
      </>
    )
    return () => {
      setHeaderMenu(null)
    }
  }, [modalAdd, canAddUser])

  // handle actions
  const handleActions = (ids?: any, action?: any, eventId?: any) => {
    if (isValidArray(ids)) {
      empDelete({
        id: ids,
        eventId,
        action
      })
    }
  }

  // handle action result
  useEffect(() => {
    if (empRestDelete?.isLoading === false) {
      if (empRestDelete?.isSuccess) {
        emitAlertStatus('success', null, empRestDelete?.originalArgs?.eventId)
      } else if (empRestDelete?.error) {
        emitAlertStatus('failed', null, empRestDelete?.originalArgs?.eventId)
      }
    }
  }, [empRestDelete])

  // update employee

  useEffect(() => {
    if (state.editData && state.enableEdit) {
      setValues<employeeResponseTypes>(
        {
          id: state?.editData?.id,
          name: state.editData?.name,
          email: state.editData?.email,
          birth_date: formatDate(state.editData?.birth_date, 'YYYY-MM-DD'),
          joining_date: formatDate(state?.editData?.joining_date, 'YYYY-MM-DD'),
          document_number: state?.editData?.document_number,
          salary: state?.editData?.salary,
          address: state?.editData?.address,
          salary_balance: state?.editData?.salary_balance,
          profile_image_path: state?.editData?.profile_image_path,
          designation: state?.editData?.designation,
          mobile: state?.editData?.mobile,
          gender: state.editData?.gender
            ? {
                label: state.editData?.gender === 1 ? 'male' : 'female',
                value: state.editData?.gender
              }
            : undefined,

          document_type: state.editData?.document_type
            ? {
                label: state.editData?.document_type,
                value: state.editData?.document_type
              }
            : undefined,
          role_id: state?.editData?.role_id
            ? {
                label: state?.editData?.role?.name,
                value: state?.editData?.role_id
              }
            : undefined
        },
        form.setValue
      )
    }
  }, [state.editData])

  // open view modal
  useEffect(() => {
    if (isValid(state.selectedUser)) {
      setValues<employeeResponseTypes>(
        {
          id: state.selectedUser?.id
        },
        form.setValue
      )
      toggleModalView()
    }
  }, [state.selectedUser])

  // create user modal
  const renderCreateModal = () => {
    return (
      <CenteredModal
        open={modalAdd}
        done={state.enableEdit ? 'save' : 'save'}
        title={
          state.enableEdit && state?.editData ? (
            <>{FM('update-employee')}</>
          ) : (
            <>{FM('create-employee')}</>
          )
        }
        handleModal={closeAddModal}
        modalClass={'modal-lg'}
        loading={createEmpResponse.isLoading}
        handleSave={form.handleSubmit(handleSaveUser)}
      >
        <div className='p-2'>
          <Form onSubmit={form.handleSubmit(handleSaveUser)}>
            {/* submit form on enter button!! */}
            {/* <button className='d-none'></button> */}
            <Row>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='name'
                  name='name'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='email'
                  name='email'
                  type='email'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  async
                  isClearable
                  label={FM('role')}
                  name='role_id'
                  loadOptions={loadDropdown}
                  path={ApiEndpoints.cafeRoles}
                  selectLabel={(e) => `${e.name}  `}
                  selectValue={(e) => e.id}
                  defaultOptions
                  type='select'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='mobile'
                  name='mobile'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'select gender'}
                  name='gender'
                  type='select'
                  selectOptions={createConstSelectOptions(gender, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'select document type'}
                  name='document_type'
                  type='select'
                  selectOptions={createConstSelectOptions(documentType, FM)}
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='document number'
                  name='document_number'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='password'
                  name='password'
                  type='password'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='designation'
                  name='designation'
                  type='text'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'birth date'}
                  name='birth_date'
                  type='date'
                  className='mb-1'
                  // dateFormat='YYYY-MM-DD'
                  rules={{ required: true }}
                />
              </Col>
              {form.watch('birth_date') ? (
                <Col md='4' lg='4' sm='12' xs='12'>
                  <FormGroupCustom
                    control={form.control}
                    label={'joining date'}
                    name='joining_date'
                    type='date'
                    // dateFormat='YYYY-MM-DD'
                    className='mb-1'
                    datePickerOptions={{
                      minDate: form.watch('birth_date')

                      //   ? new Date(form.watch('birth_date'))
                      //   : formatDate(new Date(), 'YYYY-MM-DD')
                    }}
                    rules={{ required: true }}
                  />
                </Col>
              ) : (
                ''
              )}

              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='salary'
                  name='salary'
                  type='number'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='4' lg='4' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='salary balance'
                  name='salary_balance'
                  type='number'
                  className='mb-1'
                  rules={{ required: false }}
                />
              </Col>

              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label='address'
                  name='address'
                  type='textarea'
                  className='mb-1'
                  rules={{ required: true }}
                />
              </Col>
              <Col md='12' lg='12' sm='12' xs='12'>
                <FormGroupCustom
                  control={form.control}
                  label={'profile image path'}
                  name='profile_image_path'
                  type='dropZone'
                  className='mb-1'
                  dropZoneOptions={{}}
                  //   noLabel
                  noGroup
                  rules={{ required: false }}
                />
              </Col>
              {state?.editData?.profile_image_path ? (
                <Col md='12'>
                  <img src={state?.editData?.profile_image_path} width={'100'} height={'100'} />
                </Col>
              ) : (
                ''
              )}
            </Row>
          </Form>
        </div>
      </CenteredModal>
    )
  }

  // view User modal
  const renderViewModal = () => {
    return (
      <CenteredModal
        open={modalView}
        title={state.selectedUser?.name}
        done='edit'
        hideClose
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeViewModal(false)
          toggleModalAdd()
        }}
        handleModal={() => closeViewModal(true)}
      >
        <div className='p-2'>
          {/* <Row className='align-items-center mb-1'>
            <Col md='1'>
              <User size={35} />
            </Col>
            <Col md='8'>
              <p className='text-dark mb-0'>{FM('personal-details')}</p>
              <p className='text-muted small mb-0'>{FM('edit-description')}</p>
            </Col>
          </Row> */}
          <Row>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('name')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.name}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('email')}</Label>
              <p className=''>{state.selectedUser?.email ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('role')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.role?.name ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('gender')}</Label>
              <p className='text-capitalize'>
                {state.selectedUser?.gender === 1 ? 'male' : 'female'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('mobile')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.mobile ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('date-of-birth')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.birth_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('joining-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.joining_date) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('designation')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.designation ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('salary')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.salary ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('salary-balance')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.salary_balance ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('document-type')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.document_type ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('document-number')}</Label>
              <p className='text-capitalize'>{state.selectedUser?.document_number ?? 'N/A'}</p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>{FM('create-date')}</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.created_at) ?? 'N/A'}
              </p>
            </Col>
            <Col md='6' lg='6' sm='12' xs='12'>
              <Label className='text-uppercase mb-25'>Update Date</Label>
              <p className='text-capitalize'>
                {formatDate(state.selectedUser?.updated_at) ?? 'N/A'}
              </p>
            </Col>
            {state?.selectedUser?.profile_image_path ? (
              <Col md='6' lg='6' sm='12' xs='12'>
                <Label className='text-uppercase mb-25'>Cafe Logo</Label>
                <p className='text-capitalize'>
                  <img src={state?.selectedUser?.profile_image_path} width={'50'} height={'50'} />
                </p>
              </Col>
            ) : (
              ''
            )}
          </Row>
          <div>
            <Label className='text-uppercase mb-25'>{FM('address')}</Label>
            <p className='text-capitalize'>{state.selectedUser?.address ?? 'N/A'}</p>
          </div>
        </div>
      </CenteredModal>
    )
  }

  // Salary Slip Modal
  const renderSalaryModal = () => {
    return (
      <CenteredModal
        open={modalSalary}
        title={state.editViewData?.name}
        done='edit'
        modalClass={'modal-lg'}
        hideClose
        disableFooter
        hideSave={!canEditUser}
        handleSave={() => {
          setState({
            enableEdit: true
          })
          closeSalaryModal(true)
        }}
        handleModal={() => closeSalaryModal(false)}
      >
        <div className='container mt-5 mb-5'>
          <div className='row'>
            <div className='col-md-12'>
              <div className='text-center lh-1 mb-2'>
                <h6 className='fw-bold'>Payslip</h6>{' '}
                <span className='fw-normal'>
                  Payment slip for the month of {loadRestEmpSalary?.data?.payload?.year_month}
                </span>
              </div>
              <div>
                <Form>
                  <Row>
                    <Col md='6'></Col>
                    <Col md='6'>
                      <FormGroupCustom
                        control={form.control}
                        label={'Please Select Date/month'}
                        name='year_month'
                        type='date'
                        className='mb-1'
                        rules={{ required: false }}
                      />
                    </Col>
                  </Row>
                </Form>
              </div>
              <hr />

              <div className='row'>
                <div className='col-md-10'>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div>
                        {' '}
                        <span className='fw-bolder'>{FM('emp-name')}</span>{' '}
                        <small className='ms-3'>{state?.editViewData?.name}</small>{' '}
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div>
                        {' '}
                        <span className='fw-bolder'>{FM('email')}</span>{' '}
                        <small className='ms-3'>{state?.editViewData?.email}</small>{' '}
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-md-6'>
                      <div>
                        {' '}
                        <span className='fw-bolder'>{FM('designation')}</span>{' '}
                        <small style={{ marginLeft: '30px' }}>
                          {state.editViewData?.designation}
                        </small>{' '}
                      </div>
                    </div>
                    <div className='col-md-6'>
                      <div>
                        {' '}
                        <span className='fw-bolder'>{FM('gender')}</span>{' '}
                        <small className='' style={{ marginLeft: '30px' }}>
                          {state.editViewData?.gender === 1 ? 'male' : 'female'}
                        </small>{' '}
                      </div>
                    </div>
                  </div>
                </div>

                {loadRestEmpSalary?.data?.payload && form.watch('year_month') ? (
                  <table className='mt-2 table table-bordered'>
                    <tbody>
                      <tr>
                        <th scope='row'>{FM('days-in-month')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.days_in_month}</td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('total-days-present')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.total_days_present}</td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('total-days-halfDay')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.total_days_halfday} </td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('total-days-absent')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.total_days_absent} </td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('total-full-day')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.total_full_day}</td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('employee-monthly-salary')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.employeeSalary}</td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('current-month-advance')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.currentMonthAdvance.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th scope='row'>{FM('current-month-salary')}</th>
                        <td>{loadRestEmpSalary?.data?.payload?.currentMonthSalary.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  ''
                )}
              </div>
              {loadRestEmpSalary?.data?.payload && form.watch('year_month') ? (
                <div className='row'>
                  <div className='col-md-4'>
                    {' '}
                    <span className='fw-bold'>
                      {FM('net-pay')} :{' '}
                      {loadRestEmpSalary?.data?.payload?.currentMonthSalary.toFixed(2) -
                        loadRestEmpSalary?.data?.payload?.currentMonthAdvance.toFixed(2)}
                    </span>{' '}
                  </div>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </CenteredModal>
    )
  }

  //child login

  const childLoginButton = (row: any) => {
    const encoded = base64.encode(row?.uuid)
    ChildLogin({
      jsonData: {
        account_uuid: encoded
        // is_back_to_self_account: null
      }
    })
  }

  // table columns
  const columns: TableColumn<employeeResponseTypes>[] = [
    {
      name: FM('name'),
      sortable: false,
      id: 'name',
      cell: (row) => (
        <Fragment>
          <span
            role={'button'}
            onClick={() => {
              setState({
                selectedUser: row
              })
            }}
            className='text-primary text-capitalize'
          >
            {row?.name}
          </span>
        </Fragment>
      )
    },

    {
      name: FM('email'),
      sortable: false,

      cell: (row) => <Fragment>{row?.email}</Fragment>
    },

    {
      name: FM('mobile'),
      sortable: false,

      cell: (row) => <Fragment>{row?.mobile}</Fragment>
    },
    {
      name: FM('gender'),
      sortable: false,
      cell: (row) => (
        <Fragment>
          {row?.gender === 1 ? <Fragment>{'male'}</Fragment> : <Fragment>{'female'}</Fragment>}
        </Fragment>
      )
    },

    {
      name: FM('role'),
      sortable: false,
      minWidth: '150',
      cell: (row) => <Fragment>{row?.role?.name}</Fragment>
    },
    {
      name: FM('action'),
      center: true,
      cell: (row) => (
        <Fragment>
          <ButtonGroup role='group' className='my-2'>
            {user?.role_id === 1 || user?.role_id === 6 || user?.role_id === 2 ? (
              <>
                <UncontrolledTooltip placement='top' id='childLogin' target='childLogin'>
                  {FM('child-login')}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-success btn-sm'
                  id='childLogin'
                  color='success'
                  onClick={() => {
                    childLoginButton(row)
                  }}
                >
                  <Key size={14} />
                </Button>
              </>
            ) : (
              ''
            )}

            <UncontrolledTooltip placement='top' id='view' target='view'>
              {FM('view')}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-secondary btn-sm'
              id='view'
              color='secondary'
              onClick={() => {
                setState({
                  selectedUser: row
                })
              }}
            >
              <Eye size={14} />
            </Button>
            {canEditUser ? (
              <>
                <UncontrolledTooltip placement='top' id='edit' target='edit'>
                  {FM('edit')}
                </UncontrolledTooltip>
                <Button
                  className='d-flex waves-effect btn btn-dark btn-sm'
                  id='edit'
                  color=''
                  onClick={() => {
                    toggleModalAdd()
                    setState({ editData: row, enableEdit: !state.enableEdit })
                  }}
                >
                  <Edit size={14} />
                </Button>
              </>
            ) : (
              ''
            )}

            <UncontrolledTooltip placement='top' id='salary' target='salary'>
              {FM('salary')}
            </UncontrolledTooltip>
            <Button
              className='d-flex waves-effect btn btn-warning btn-sm'
              id='salary'
              color=''
              onClick={() => {
                toggleModalSalary()
                setState({ editViewData: row, enableEdit: !state.enableEdit })
              }}
            >
              <DollarSign size={14} />
            </Button>
            {canDeleteUser ? (
              <>
                <UncontrolledTooltip
                  placement='top'
                  id={`grid-delete-${row?.id}`}
                  target={`grid-delete-${row?.id}`}
                >
                  {FM('delete')}
                </UncontrolledTooltip>
                <ConfirmAlert
                  className='d-flex waves-effect btn btn-danger btn-sm'
                  eventId={`item-delete-${row?.id}`}
                  text={FM('are-you-sure')}
                  title={FM('delete-item', { name: row?.name })}
                  onClickYes={() => {
                    handleActions([row?.id], 'delete', `item-delete-${row?.id}`)
                  }}
                  onSuccessEvent={onSuccessEvent}
                  id={`grid-delete-${row?.id}`}
                >
                  <Trash2 size={14} id='delete' />
                </ConfirmAlert>
              </>
            ) : (
              ''
            )}
          </ButtonGroup>
        </Fragment>
      )
    }
  ]
  const onSuccessEvent = () => {
    reloadData()
  }

  const options: TableDropDownOptions = (selectedRows) => [
    {
      IF: canDeleteUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<Trash2 size={14} />}
          onDropdown
          eventId={`item-delete`}
          text={FM('are-you-sure')}
          title={FM('delete-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'delete', 'item-delete')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('delete')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserCheck size={14} />}
          onDropdown
          eventId={`item-active`}
          text={FM('are-you-sure')}
          title={FM('active-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'active', 'item-active')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('activate')}
        </ConfirmAlert>
      )
    },
    {
      IF: canEditUser,
      noWrap: true,
      name: (
        <ConfirmAlert
          menuIcon={<UserX size={14} />}
          onDropdown
          eventId={`item-inactive`}
          text={FM('are-you-sure')}
          title={FM('inactive-selected-user', { count: selectedRows?.selectedCount })}
          onClickYes={() => {
            handleActions(selectedRows?.ids, 'inactive', 'item-inactive')
          }}
          onSuccessEvent={onSuccessEvent}
        >
          {FM('inactivate')}
        </ConfirmAlert>
      )
    }
  ]
  // handle sort
  const handleSort = (column: any, dir: string) => {
    setState({
      filterData: {
        ...state.filterData,
        sort: {
          column: column?.id,
          dir:
            loadEmpRestResponse?.originalArgs?.jsonData?.sort?.column === column?.id
              ? loadEmpRestResponse?.originalArgs?.jsonData?.sort?.dir === 'asc'
                ? 'desc'
                : 'asc'
              : dir
        }
      }
    })
  }
  return (
    <Fragment>
      {renderCreateModal()}
      {renderViewModal()}
      {renderSalaryModal()}
      <Header route={props?.route} icon={<List size='25' />} title='Employee List'>
        <ButtonGroup color='dark'>
          <EmployeeFilter handleFilterData={handleFilterData} />

          {/* <LoadingButton
                        tooltip={('Attendences')}
                        loading={loadEmprestResponse.isLoading}
                        size='sm'
                        color='primary'
                        onClick={() => { navigate(getPath('employeeAttendance')) }}
                    >
                        <Plus size='14' />
                    </LoadingButton> */}

          <LoadingButton
            tooltip={FM('reload')}
            loading={loadEmpRestResponse.isLoading}
            size='sm'
            color='info'
            onClick={reloadData}
          >
            <RefreshCcw size='14' />
          </LoadingButton>
        </ButtonGroup>
      </Header>

      <CustomDataTable<employeeResponseTypes>
        initialPerPage={20}
        isLoading={loadEmpRestResponse.isLoading}
        columns={columns}
        options={options}
        //hideHeader
        // selectableRows={canEditUser || canDeleteUser}
        searchPlaceholder='search-user-name'
        onSort={handleSort}
        defaultSortField={loadEmpRestResponse?.originalArgs?.jsonData?.sort}
        paginatedData={loadEmpRestResponse?.data?.payload}
        handlePaginationAndSearch={handlePageChange}
      />
    </Fragment>
  )
}

export default Employee
