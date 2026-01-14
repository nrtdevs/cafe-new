// ** Reducers Imports
import { MeetingManagement } from './RTKQuery/MeetingManagement'
import { MeetingUserManagement } from './RTKQuery/UserManagement'
import { RoleManagement } from './RTKQuery/RoleManagement'
import { NoteManagement } from './RTKQuery/NotesManagement'
import { AppSettings } from './RTKQuery/AppSettingRTK'
import { ActionManagement } from './RTKQuery/ActionMangement'
const meetingReducers = {
  // RTK
  [MeetingUserManagement.reducerPath]: MeetingUserManagement.reducer,
  [MeetingManagement.reducerPath]: MeetingManagement.reducer,
  [RoleManagement.reducerPath]: RoleManagement.reducer,
  [NoteManagement.reducerPath]: NoteManagement.reducer,
  [AppSettings.reducerPath]: AppSettings.reducer,
  [ActionManagement.reducerPath]: ActionManagement.reducer
}
const meetingMiddleware = [
  ActionManagement.middleware,
  MeetingUserManagement.middleware,
  MeetingManagement.middleware,
  RoleManagement.middleware,
  NoteManagement.middleware,
  AppSettings.middleware
]

export { meetingReducers, meetingMiddleware }

