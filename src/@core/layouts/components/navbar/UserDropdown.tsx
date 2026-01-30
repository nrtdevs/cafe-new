// ** React Imports
import { Fragment, useEffect, useReducer, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Store & Actions
import { handleLogout } from '@store/authentication'
import { useDispatch } from 'react-redux'

// ** Third Party Components
import { Lock, Power, Settings } from 'react-feather'

// ** Reactstrap Imports
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import { getUserData, isUserLoggedIn } from '@src/auth/utils'
import { useModal } from '@src/modules/common/components/modal/HandleModal'
import { useAppSelector } from '@src/redux/store'
import Emitter from '@src/utility/Emitter'
import { FM, log } from '@src/utility/Utils'
import httpConfig from '@src/utility/http/httpConfig'
import { stateReducer } from '@src/utility/stateReducer'
import { useForm } from 'react-hook-form'
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import { getPath } from '@src/router/RouteHelper'
import { Permissions } from '@src/utility/Permissions'
import { Can } from '@src/utility/Show'

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
  data?: any
}

const defaultValues: any = {
  user_id: '',
  from_date: '',
  to_date: '',
  export: ''
}

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const user = useAppSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const canAddUser = Can(Permissions.cafeSettings)

  // toggle add modal
  const [modalView, toggleModalView] = useModal()

  // ** State
  const [userData, setUserData] = useState<any>(null)
  const initState: States = {
    lastRefresh: new Date().getTime()
  }

  // form hook
  const form = useForm<any>({
    defaultValues
  })

  // state reducer
  const reducers = stateReducer<States>
  // state
  const [state, setState] = useReducer(reducers, initState)

  // close add
  const closeViewModal = (reset = true) => {
    if (reset) {
      setState({
        selectedUser: undefined
      })
    }
    toggleModalView()
  }

  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn() !== null) {
      setUserData(user)
    }
  }, [user])

  const handleModal = (e: any) => {
    // prevent default
    e.preventDefault()
    // open modal
    Emitter.emit('openUserModal', true)
  }

  const handlePassModal = (e: any) => {
    // prevent default
    e.preventDefault()
    // open modal
    Emitter.emit('openChangePasswordModal', true)
  }

  //** Vars
  const userAvatar = userData?.avatar ? httpConfig.baseUrl2 + userData.avatar : defaultAvatar

  const handleSaveUser = (userData: any) => {
    // if (state?.editData?.id) {
    //   createEmp({
    //     jsonData: {
    //       ...state?.editData,
    //       ...userData,
    //       gender: userData?.gender?.value,
    //       document_type: userData?.document_type.value,
    //       role_id: userData?.role_id?.value,
    //       birth_date: formatDate(userData?.birth_date, 'YYYY-MM-DD'),
    //       profile_image_path: userData?.profile_image_path
    //         ? userData?.profile_image_path[0]?.file_name
    //         : state?.editData?.profile_image_path
    //         ? state?.editData?.profile_image_path
    //         : ''
    //     }
    //   })
    // } else {
    //   createEmp({
    //     jsonData: {
    //       ...userData,
    //       gender: userData?.gender?.value,
    //       document_type: userData?.document_type.value,
    //       birth_date: formatDate(userData?.birth_date, 'YYYY-MM-DD'),
    //       role_id: userData?.role_id?.value,
    //       profile_image_path: userData?.profile_image_path
    //         ? userData?.profile_image_path[0]?.file_name
    //         : ''
    //     }
    //   })
    // }
  }

  //   const renderViewModal = () => {
  //       return (
  //           <CenteredModal
  //               open={modalView}
  //               title={'Export Order'}
  //               done={state.enableEdit ? 'save' : 'save'}

  //               handleSave={form.handleSubmit(handleSaveUser)}
  //               // handleSave={() => {
  //               //     setState({
  //               //         enableEdit: true
  //               //     })
  //               //     closeViewModal(false)
  //               //     // toggleModalAdd()
  //               // }}
  //               handleModal={() => closeViewModal(true)}
  //           >
  //               <div className='p-2'>
  //                   <Form onSubmit={form.handleSubmit(handleSaveUser)}>
  //                       <Show IF={user1?.role_id === 2}>
  //                           <Col md='12' lg='12' xl='12' sm='12'>
  //                               <Show IF={user?.role_id === 2}>
  //                                   <FormGroupCustom
  //                                       control={form.control}
  //                                       async
  //                                       isClearable
  //                                       label={'employee'}
  //                                       name='user_id'
  //                                       loadOptions={loadDropdown}
  //                                       path={ApiEndpoints.employeList}
  //                                       selectLabel={(e) => ` ${e.name} `}
  //                                       selectValue={(e) => e.id}
  //                                       defaultOptions
  //                                       type='select'
  //                                       className='mb-1'
  //                                       rules={{ required: false }}
  //                                   />
  //                               </Show>
  //                           </Col>
  //                       </Show>
  //                       <Col md='12' lg='12' sm='12' xs='12'>
  //                           <FormGroupCustom
  //                               control={form.control}
  //                               label={'select exportData'}
  //                               name='export'
  //                               type='select'
  //                               selectOptions={createConstSelectOptions(exportData, FM)}
  //                               className='mb-1'
  //                               rules={{ required: true }}
  //                           />
  //                       </Col>

  //                       <Col md='12' lg='12' sm='12' xs='12'>
  //                           <FormGroupCustom
  //                               control={form.control}
  //                               label={'from date'}
  //                               name='from_date'
  //                               type='date'
  //                               className='mb-1'

  //                               // dateFormat='YYYY-MM-DD'
  //                               rules={{ required: true }}
  //                           />
  //                       </Col>

  //                       {form.watch('from_date') ? <Col md='12' lg='12' sm='12' xs='12'>
  //                           <FormGroupCustom
  //                               control={form.control}
  //                               label={'to date'}
  //                               name='to_date'
  //                               type='date'
  //                               // dateFormat='YYYY-MM-DD'
  //                               className='mb-1'

  //                               datePickerOptions={{
  //                                   minDate: form.watch('from_date')

  //                               }}

  //                               rules={{ required: true }}
  //                           />
  //                       </Col> : ''}
  //                   </Form>

  //               </div>
  //           </CenteredModal>
  //       )
  //   }

  return (
    <Fragment>
      {/* {renderViewModal()} */}
      <UncontrolledDropdown tag='li' className='dropdown-user nav-item'>
        <DropdownToggle
          href='/'
          tag='a'
          className='nav-link dropdown-user-link'
          onClick={(e) => e.preventDefault()}
        >
          <div className='user-nav d-sm-flex d-none'>
            <span className='user-name fw-bold'>
              {(userData && userData['name']) || 'John Doe'}
            </span>
            <span className='user-status'>
              {((userData && userData.role) || userData?.email) ?? ''}
            </span>
          </div>
          <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' />
        </DropdownToggle>
        <DropdownMenu end>
          {/* <Show IF={userData?.role_id === 2}> */}
          {/* <DropdownItem tag={Link} onClick={() => {
                        toggleModalView()

                    }}>
                        <Download size={14} className='me-75' />
                        <span className='align-middle'>{FM('export-order')}</span>
                    </DropdownItem> */}
          {canAddUser === true && (
            <DropdownItem
              // tag={Link}
              onClick={() => {
                navigate(getPath('cafe-setting'))
              }}
            >
              <Settings size={14} className='me-75' />
              <span className='align-middle'>{FM('cafe-setting')}</span>
            </DropdownItem>
          )}

          <DropdownItem onClick={handlePassModal}>
            <Lock size={14} className='me-75' />
            <span className='align-middle'>{FM('change-password')}</span>
          </DropdownItem>
          {/* </Show> */}
          {/* 
        <DropdownItem tag={Link} to='/apps/email'>
          <Mail size={14} className='me-75' />
          <span className='align-middle'>Inbox</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/apps/todo'>
          <CheckSquare size={14} className='me-75' />
          <span className='align-middle'>Tasks</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/apps/chat'>
          <MessageSquare size={14} className='me-75' />
          <span className='align-middle'>Chats</span>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem tag={Link} to='/pages/account-settings'>
          <Settings size={14} className='me-75' />
          <span className='align-middle'>Settings</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/pages/pricing'>
          <CreditCard size={14} className='me-75' />
          <span className='align-middle'>Pricing</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/pages/faq'>
          <HelpCircle size={14} className='me-75' />
          <span className='align-middle'>FAQ</span>
        </DropdownItem> */}
          <DropdownItem tag={Link} to='/login' onClick={() => dispatch(handleLogout())}>
            <Power size={14} className='me-75' />
            <span className='align-middle'>Logout</span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </Fragment>
  )
}

export default UserDropdown
