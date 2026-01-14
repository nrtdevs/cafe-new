// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Third Party Components
import BookmarkIcon from '@mui/icons-material/Bookmark'
import classnames from 'classnames'
import { Bell, CheckCircle, List, RefreshCcw } from 'react-feather'
import PerfectScrollbar from 'react-perfect-scrollbar'
// ** Reactstrap Imports
import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown
} from 'reactstrap'

// ** Avatar Imports
import LoadingButton from '@src/modules/common/components/buttons/LoadingButton'
import { useAppSelector } from '@src/redux/store'
import { getPath } from '@src/router/RouteHelper'
import Emitter from '@src/utility/Emitter'
import Show from '@src/utility/Show'
import { FM, fromNow, isValidArray } from '@src/utility/Utils'
import { useNavigate } from 'react-router-dom'
import Hide from '@src/utility/Hide'
import Shimmer from '@src/modules/common/components/shimmers/Shimmer'

const NotificationDropdown = () => {
  const notifications = useAppSelector((state) => state.navbar.notifications)
  const [loading, setLoading] = useState(false)
  const [loadingR, setLoadingR] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  // ** Notification Array
  const notificationsArray = notifications?.map((a) => ({
    ...a,
    subtitle: a?.message,
    type: a?.type ?? 'note',
    title: (
      <p className='media-heading'>
        <span className={`fw-bolder ${a?.read_status === 0 ? 'text-primary' : 'text-secondary'}`}>
          {a?.title}
        </span>
      </p>
    )
  }))
  //   }))[
  //     ({
  //       img: avatar3,
  //       subtitle: 'Won the monthly best seller badge.',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>Congratulation Sam 🎉</span>winner!
  //         </p>
  //       )
  //     },
  //     {
  //       img: avatar15,
  //       subtitle: 'You have 10 unread messages.',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>New message</span>&nbsp;received
  //         </p>
  //       )
  //     },
  //     {
  //       avatarContent: 'MD',
  //       color: 'light-danger',
  //       subtitle: 'MD Inc. order updated',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>Revised Order 👋</span>&nbsp;checkout
  //         </p>
  //       )
  //     },
  //     {
  //       title: <h6 className='fw-bolder me-auto mb-0'>System Notifications</h6>,
  //       switch: (
  //         <div className='form-check form-switch'>
  //           <Input type='switch' name='customSwitch' id='exampleCustomSwitch' defaultChecked />
  //         </div>
  //       )
  //     },
  //     {
  //       avatarIcon: <X size={14} />,
  //       color: 'light-danger',
  //       subtitle: 'USA Server is down due to hight CPU usage',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>Server down</span>&nbsp;registered
  //         </p>
  //       )
  //     },
  //     {
  //       avatarIcon: <Check size={14} />,
  //       color: 'light-success',
  //       subtitle: 'Last month sales report generated',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>Sales report</span>&nbsp;generated
  //         </p>
  //       )
  //     },
  //     {
  //       avatarIcon: <AlertTriangle size={14} />,
  //       color: 'light-warning',
  //       subtitle: 'BLR Server using high memory',
  //       title: (
  //         <p className='media-heading'>
  //           <span className='fw-bolder'>High memory</span>&nbsp;usage
  //         </p>
  //       )
  //     })
  //   ]

  // receive reload event
  useEffect(() => {
    const reload = (e) => {
      setLoading(e)
    }
    Emitter.on('loadNotificationResponseLoading', reload)
    return () => {
      Emitter.off('loadNotificationResponseLoading', reload)
    }
  }, [])

  // receive reload event
  useEffect(() => {
    const reload = (e) => {
      setLoadingR(e)
    }
    Emitter.on('loadNotificationResponseLoadingR', reload)
    return () => {
      Emitter.off('loadNotificationResponseLoadingR', reload)
    }
  }, [])

  const handleRead = (e, item) => {
    e.preventDefault()
    setOpen(false)
    // Emitter.emit('readNotification', item?.id)
    navigate(
      item?.type === 'action'
        ? getPath('action.list')
        : item?.type === 'meeting'
        ? getPath('meeting.view', { id: item?.data_id })
        : item?.type === 'note'
        ? getPath('meeting.view', { id: item?.data_id })
        : '#'
    )
  }
  // ** Function to render Notifications
  /*eslint-disable */
  const renderNotificationItems = () => {
    return (
      <PerfectScrollbar
        component='li'
        className='media-list scrollable-container'
        options={{
          wheelPropagation: false
        }}
      >
        {notificationsArray.map((item, index) => {
          return (
            <div key={index} className='d-flex' onClick={(e) => handleRead(e, item)}>
              <div
                role={'button'}
                className={classnames('list-item d-flex', {
                  'align-items-start': !item.switch,
                  'align-items-center': item.switch
                })}
              >
                {!item.switch ? (
                  <Fragment>
                    <div className='me-1'>
                      <Avatar
                        {...{
                          icon: (
                            <>
                              <Show IF={item.type === 'meeting'}>
                                <List size={14} />
                              </Show>
                              <Show IF={item.type === 'action'}>
                                <CheckCircle size={14} />
                              </Show>
                              <Show IF={item.type === 'note'}>
                                <BookmarkIcon fontSize='small' />
                              </Show>
                            </>
                          ),
                          color: item?.read_status === 0 ? 'light-primary' : 'light-secondary'
                        }}
                      />
                    </div>
                    <div className='list-item-body flex-grow-1'>
                      {item.title}
                      <small className={`${item?.read_status === 0 ? 'text-dark' : 'text-muted'}`}>
                        {item.subtitle}
                      </small>
                      <p className='text-small-12 notification-text mb-0 mt-3px'>
                        {fromNow(item?.created_at)}
                      </p>
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    {item.title}
                    {item.switch}
                  </Fragment>
                )}
              </div>
            </div>
          )
        })}
      </PerfectScrollbar>
    )
  }
  /*eslint-enable */
  const toggleDropdown = () => {
    setOpen(!open)
  }
  return (
    <UncontrolledDropdown
      isOpen={open}
      toggle={toggleDropdown}
      tag='li'
      className='dropdown-notification nav-item me-25'
    >
      <Show IF={notificationsArray.length > 0}>
        <DropdownToggle tag='a' className='nav-link' href='/' onClick={(e) => e.preventDefault()}>
          <Bell size={21} />
          <Show IF={isValidArray(notifications?.filter((n) => n.read_status === 0))}>
            <Badge pill color='danger' className='badge-up'>
              {notifications?.filter((n) => n.read_status === 0).length}
            </Badge>
          </Show>
        </DropdownToggle>
        <DropdownMenu end tag='ul' className='dropdown-menu-media mt-0'>
          <li className='dropdown-menu-header'>
            <DropdownItem className='d-flex' tag='div' header>
              <h4 className='notification-title mb-0 me-auto'>Notifications</h4>
              <LoadingButton
                tooltip={FM('reload')}
                loading={loading}
                size='sm'
                color='info'
                onClick={() => {
                  Emitter.emit('reloadNotifications', true)
                }}
              >
                <RefreshCcw size='14' />
              </LoadingButton>
            </DropdownItem>
          </li>
          <Show IF={loading}>
            <Shimmer style={{ height: 50, marginBottom: 3 }} />
            <Shimmer style={{ height: 50, marginBottom: 3 }} />
            <Shimmer style={{ height: 50, marginBottom: 3 }} />
            <Shimmer style={{ height: 50, marginBottom: 3 }} />
            <Shimmer style={{ height: 50, marginBottom: 3 }} />
          </Show>
          <Hide IF={loading}>{renderNotificationItems()}</Hide>
          <li className='dropdown-menu-footer'>
            <LoadingButton
              loading={loadingR}
              onClick={() => {
                Emitter.emit('readAllNotifications', true)
              }}
              color='primary'
              block
            >
              Read all notifications
            </LoadingButton>
          </li>
        </DropdownMenu>
      </Show>
    </UncontrolledDropdown>
  )
}

export default NotificationDropdown
