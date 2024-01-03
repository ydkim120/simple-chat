export interface singleChatData {
  id: string
  created_at: string
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
  is_me?: boolean, // 나와의 채팅 여부

  usersNameTxt?: string,
  summaryTxt?: string,
  userPhotoList?: string[]
}