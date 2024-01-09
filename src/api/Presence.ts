import { supabase as sb } from '@/supabase'

export default {
  // 로그인 시 온라인 상태 Presence 이벤트 발생
  setUserOnlineStatus () {
    sb.channel.on('userStatus', { event: 'join' }, ({ key, newPresences }) => {
      console.log('join', key, newPresences)
    })
    .subscribe()
  }
}