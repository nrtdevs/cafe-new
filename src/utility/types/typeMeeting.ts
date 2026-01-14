import { UserData } from './typeAuthApi'

export interface Meeting {
  id?: number
  meetRandomId?: string
  meeting_title?: string
  meeting_ref_no?: string
  agenda_of_meeting?: string
  meeting_date?: string
  meeting_time_start?: string
  meeting_time_end?: string
  meeting_link?: string
  is_repeat?: number
  created_at?: string
  updated_at?: string
  deleted_at?: any
  attendees?: AttendeesEntity[] | null
  documents?: any[] | null
  organised_by?: number
  organiser?: UserData | null
  number_of_event?: any
  repeat_type?: any
  status?: any
}
export interface AttendeesEntity {
  id?: number
  meeting_id?: number
  user_id?: number
  value?: any
  email?: any
  created_at?: string
  updated_at?: string
  user?: UserData | null
}

export interface MeetingNote {
  id?: number
  meeting_id?: any
  duration?: string
  notes?: string
  decision?: string
  type?: string
  created_by?: {
    name?: string
    email?: string
    id?: number
  }
  edited_by?: any
  edited_date?: string
  created_at?: string
  updated_at?: string
  meeting?: Meeting
  action_items?: ActionItem[] | null
  documents?: DocumentsEntity[] | null
}

export interface DocumentsEntity {
  id?: number
  meeting_id?: number
  document?: string
  file_extension?: string
  file_name?: string
  uploading_file_name?: string
  created_at?: string
  updated_at?: string
}

export interface ActionItem {
  id?: number
  meeting_id?: any
  owner_id?: any
  note_id?: any
  mm_ref_id?: any
  date_opened?: any
  task?: any
  priority?: any
  type?: string
  documents?: DocumentsEntity[] | null
  due_date?: any
  complete_percentage?: any
  image?: any
  status?: any
  meeting?: Meeting
  owner?: {
    name?: string
    email?: string
    id?: any
  }
  complete_date?: any
  comment?: any
  created_at?: any
  updated_at?: any
}
