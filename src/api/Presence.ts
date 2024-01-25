import { supabase as sb } from '@/supabase'

export default {
  // 온라인 상태 유저 추가
  async insertOnlinedUser(user_email: string) {
    const { error } = await sb
      .from('online_users')
      .insert({
        user_email,
        online_at: new Date()
      })
    if (error) throw error
  },
  // 오프라인 상태 유저 제거
  async deleteOfflineUser(user_email: string) {
    const { error } = await sb
      .from('online_users')
      .delete()
      .eq('user_email', user_email)
    if (error) throw error
    return true
  },
  // 로그인/로그아웃 시 온라인 상태 Presence 이벤트 발생
  async getUserStatusPresence () {
    sb
      .from('online_users')
      .select('*')
      .then((result) => {
        const users = result.data;
        console.log('모든 사용자의 Presence 정보:');
        console.log(users);

        // 여기에서 각 사용자의 Presence 정보를 UI 등에 표시할 수 있습니다.
      })
      // .catch((error) => {
      //   console.error('Presence 정보 조회 오류:', error);
      // });
    // const room = sb.channel('online_users')

    // room
    //   .on('presence', { event: 'sync' }, () => {
    //     const newState = room.presenceState()
    //     console.log('🍓 sync', { ...newState })
    //   })
      // .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      //   console.log('🍓 join', key, newPresences)
      // })
      // .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      //   console.log('🍓 leave', key, leftPresences)
      // })
      // .subscribe(async (status) => {
      //     if (status !== 'SUBSCRIBED') return
      //     const presenceTrackStatus = await room.track('하하하하')
      //     console.log(presenceTrackStatus)
    // })


    // channel.on('presence', { event: 'sync' }, () => {
    //   /** Get the presence state from the channel, keyed by realtime identifier */
    //   const presenceState = channel.presenceState();

    //   /** transform the presence */
    //   const users = Object.keys(presenceState)
    //     .map((presenceId) => {
    //       const presences = presenceState[presenceId] as unknown as { username: string }[];
    //       return presences.map((presence) => presence.username);
    //     })
    //     .flat();
    //   /** sort and set the users */
    //   setUsers(users.sort());
    // });
  },
  // async getUserOnlinePresence (email: string) {
  //   const room = sb.channel('online_users')
  //   const userStatus = {
  //     user_email: email,
  //     online_at: new Date().toISOString()
  //   }
  //   room.subscribe(async (status) => {
  //     if (status !== 'SUBSCRIBED') { return }
  //     const presenceTrackStatus = await room.track(userStatus)
  //     console.log(presenceTrackStatus)
  //   })
  // }
  /*
  * [presence] 이벤트 subscribe
  */
  async presenceSubscription () {
    const roomOne = sb.channel('online_users')
    roomOne.subscribe()
    // type userStatusPresenceType = {
    //   user_email: string
    //   status: string
    //   last_online_at: Date
    // }

    // await sb
    //   .from('online_users')
    //   .on('INSERT', (payload: userStatusPresenceType) => {
    //     // Presence 이벤트 처리
    //     const { user_email, status, last_online_at } = payload.new ?? {}
    //     console.log(`사용자 ${user_email}이(가) ${status} 상태로 표시됨. 마지막 로그인: ${last_online_at}`)
    //   })
    //   .subscribe()
  },
  /*
  * [presence] 이벤트 unsubscribe
  */
  async presenceUnsubscription () {
    const roomOne = sb.channel('online_users')
    roomOne.unsubscribe()
  },
  /**
   * [presence] 사용자 로그인 시 Presence를 설정합니다.
   * @param {String} user_email
   */
  async setPresenceOnLogin (user_email: string) {
    try {
      const { error } = await sb
        // .from('online_users')
        // .upsert(
        //   [
        //     {
        //       user_email,
        //       status: 'online',
        //       last_online_at: new Date().toISOString()
        //     }
        //   ],
        //   { onConflict: 'user_email' }
        // )
        // presence 사용은 우선 보류

        .from('profiles')
        .update({
          status: 'online'
        })
        .eq('user_email', user_email)

      if (error) throw new Error(`Presence 설정 중 오류 발생: ${error.message}`)

      console.log(`사용자 ${user_email}의 Presence가 설정되었습니다.`)
    } catch (err: Error) {
      if (err?.message) console.error(err.message)
    }
  },
  /**
  * [presence] 사용자 로그아웃 시 Presence를 업데이트 합니다.
  * @param {String} user_email
  */
  async setPresenceOnLogout(user_email: string) {
    try {
      const { error } = await sb
        // .from('online_users')
        // .upsert(
        //   [
        //     {
        //       user_email,
        //       status: 'offline'
        //     }
        //   ],
        //   { onConflict: 'user_email' }
        // )
        // presence 사용은 우선 보류
        .from('profiles')
        .update({
          status: 'offline',
        })
        .eq('user_email', user_email)

      if (error) throw new Error(`Presence 설정 중 오류 발생: ${error.message}`)

      console.log(`사용자 ${user_email}의 Presence가 업데이트되었습니다.`);
    } catch (err) {
      if (err?.message) console.error(err.message)
    }
  }
}
