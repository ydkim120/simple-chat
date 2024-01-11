
import { supabase as sb } from '@/supabase'
import dayjs from 'dayjs'
import { userInfoType } from '@/@types'

// @type - 예약 메세지 생성/변경 시 전달 데이터
type reservedChatType = {
  id?: string
  channel_id?: string | string[]
  content: string
  reserved_at_timestamp: string | number | Date
}

export default {
  // ===== 예약 메세지
  // 예약 메세지 조회
  async getReservedChatsByUserId(userId: string, { from = 1, to = 10 }) {
    if (!userId) return []

    const { data: chatList, error } = await sb
      .from('reserved_chats')
      // .select(`
      //     *,
      //     profiles (
      //       user_name,
      //       user_photo
      //     )
      // `)
      .select()
      .eq('user_id', userId)
      .range(from, to)
      .order('reserved_at', { ascending: true })
    if (error) throw error

    return chatList
  },
  // 예약 메세지 생성
  async createReservedChat (data: reservedChatType, userInfo: userInfoType) {
    if (!data || !userInfo) throw new Error()

    const { content, channel_id, reserved_at_timestamp } = data
    const { id: userId, email, user_metadata } = userInfo

    const today = new Date(Date.now())
    const reservedDate = new Date(reserved_at_timestamp).toISOString()

    const payload = {
      user_id: userId,
      content,
      created_at: today,
      user_email: email,
      user_name: user_metadata?.user_name,
      channel_id: channel_id,
      reserved_at: reservedDate,
      reserved_date: dayjs(reservedDate).format('YYYY-MM-DD')
    }
    const { error } = await sb
      .from('reserved_chats')
      .insert(payload)
    if (error) throw error
    return true
  },
  // 예약 메세지 삭제
  async deleteReservedChat(id: string) {
    const { error } = await sb
      .from('reserved_chats')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },
  // 예약 메세지 삭제
  async updateReservedChat(data: reservedChatType) {
    const { id, content, reserved_at_timestamp } = data
    const reservedDate = new Date(reserved_at_timestamp).toISOString()

    const { error } = await sb
      .from('reserved_chats')
      .update({
        content,
        reserved_at: reservedDate,
        reserved_date: dayjs(reservedDate).format('YYYY-MM-DD')
      })
      .eq('id', id)
    if (error) throw error
    return true
  },
  // 채널에 따른 예약 메세지 갯수 조회
  async getReservedChatsCountByChannelId(channelId: string | string[]) {
    const { data: chatList, error } = await sb
      .from('reserved_chats')
      .select()
      .eq('channel_id', channelId)
    if (error) throw error

    return chatList?.length || 0
  },
}