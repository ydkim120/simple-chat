export interface singleChatData {
  id: string
  created_at?: string | undefined
  created_date?: string | undefined
  content: string | undefined
  user_email: string
  user_id: string
  user_name: string
  user_photo: string | undefined
}
export interface singleChannelData {
  channel_id: string
  created_at: string
  updated_at: string
  created_user_id: string | undefined
  user_id_list: string[]
  user_list: any[],
  summary?: string | undefined,
  summary_created_at: string | undefined // 요약 생긴 시간
  is_me?: boolean, // 나와의 채팅 여부

  usersNameTxt?: string,
  summaryTxt?: string,
  userPhotoList?: string[]
}
export interface singleReservedChatData {
  id: string
  channel_id?: string
  created_at?: string | undefined
  reserved_at?: string | undefined
  reserved_date?: string | undefined
  content: string | undefined
  user_email: string
  user_id: string
  user_name: string,

  usersNameTxt?: string,
  contentTxt?: string,
  userPhotoList?: string[],
  reservedDateTime: string
}

export interface singleAlarmData {
  id: string
  channel_id: string
  created_at: string | undefined
  user_id: string
  user_email: string
  target_user_id: string
  target_user_email: string
  content: string | undefined
}