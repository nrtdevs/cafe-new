import { Permissions } from '@src/utility/Permissions'
import { lazy } from 'react'
const UserManagement = lazy(() => import('@modules/meeting/views/users/UserList'))
const Roles = lazy(() => import('@modules/meeting/views/users/Roles'))
const MeetingList = lazy(() => import('@modules/meeting/views/meetings/MeetingList'))
const MeetingDetails = lazy(() => import('@modules/meeting/views/meetings/MeetingDetails'))
const NotesList = lazy(() => import('@modules/meeting/views/notes/NotesList'))
const ActionList = lazy(() => import('@modules/meeting/views/Actions/ActionList'))
const MeetingRoutes = [

    {
        element: <UserManagement />,
        path: '/user/list',
        name: 'user.list',
        meta: {
            ...Permissions.dashboardBrowse
        }
    },
    {
        element: <Roles />,
        path: '/roles',
        name: 'role.list',
        meta: {
            ...Permissions.cafeDelete
        }
    },
    {
        element: <MeetingList />,
        path: '/meetings',
        name: 'meeting.list',
        meta: {
            ...Permissions.cafeBrowse
        }
    },
    {
        element: <MeetingDetails />,
        path: '/meetings/view/:id',
        name: 'meeting.view',
        meta: {
            ...Permissions.cafeRead
        }
    },
    {
        element: <NotesList />,
        path: '/notes/list',
        name: 'notes.list',
        meta: {
            ...Permissions.cafeDelete
        }
    },
    {
        element: <ActionList />,
        path: '/action/list',
        name: 'action.list',
        meta: {
            ...Permissions.cafeRead
        }
    }
] as const

export type MeetingRouteName = (typeof MeetingRoutes)[number]['name']
export default MeetingRoutes
