
import { supabase as sb } from '@/supabase'

export default {
  // ===== 알람 관련, 읽지 않은 메세지 조회
  /**
   * 알람 "수신인" 기준, 알람 메세지를 조회합니다. 
   * @param {String} userId 
   */
  async getAlarmsByTargetUserId (userId: string) {
    const { data: chatList, error } = await sb
      .from('alarms')
      .select()
      .eq('target_user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error

    return chatList
  },
  /**
   * 알람 "발송인" 기준, 알람 메세지를 조회합니다. 
   * @param {String} userId 
   * @param {String} channelId
   */
  async getAlarmsByFromUserId(userId: string, channelId?: string | string[]) {
    if (channelId) {
      const { data: chatList, error } = await sb
        .from('alarms')
        .select()
        .eq('user_id', userId)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return chatList
    } else {
      const { data: chatList, error } = await sb
        .from('alarms')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return chatList
    }
  },
  /**
  * 알람 메세지를 삭제합니다. (요청 시간 이전에 생성된 알람 메세지만 삭제합니다.)
  * @param {String} userId 
  * @param {String} channelId
  */
  async deleteAlarms (userId: string, channelId: string | string[]) {
    const { error } = await sb
      .from('alarms')
      .delete()
      .eq('target_user_id', userId)
      .eq('channel_id', channelId)
      .lt('created_at', new Date().toISOString())
    if (error) throw error
    return true
  }
}