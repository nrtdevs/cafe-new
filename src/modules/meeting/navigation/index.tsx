// ** Icons Import
import { getPath } from '@src/router/RouteHelper'
import { Permissions } from '@src/utility/Permissions'
import { CheckCircle, List, Lock, Users } from 'react-feather'

export default [
  {
    header: 'Meeting',
    ...Permissions.dashboardBrowse
  },
  {
    id: 'meeting-list',
    title: 'Meetings',
    icon: <List size={20} />,
    navLink: getPath('meeting.list'),
    ...Permissions.dashboardBrowse
  },
  {
    id: 'action',
    title: 'action',
    icon: <CheckCircle size={12} />,
    navLink: getPath('action.list'),
    ...Permissions.dashboardBrowse
  },
  {
    header: 'users',
    ...Permissions.dashboardBrowse
  },
  {
    id: 'userList',
    title: 'all-users',
    icon: <Users size={12} />,
    navLink: getPath('user.list'),
    ...Permissions.dashboardBrowse
  },
  {
    id: 'roleList',
    title: 'roles',
    icon: <Lock size={12} />,
    navLink: getPath('role.list'),
    ...Permissions.dashboardBrowse
  }
]
