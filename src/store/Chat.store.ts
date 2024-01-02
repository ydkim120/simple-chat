import { defineStore } from 'pinia'
import { userAuthStore } from './Auth.store'
import { supabase as sb } from '@/supabase'
import { SystemError, userInfoType } from '@/@types'
// import { v4 as uuidv4 } from 'uuid'

const authStore = userAuthStore()
// const uuid = uuidv4()

type newChatType = {
  channel_id: string 
  content: string
}

export const chatStore: any = defineStore({
  id: 'chat',
  state: () => ({

  }),
  getters: {

  },
  actions: {
    // 메신저
    async getAllChatsByChannelId(channelId: string, { from = 1, to = 10 }) {
      const userId = authStore?.userInfo?.id
      console.log('@ userId: ', userId)
      if (!userId) throw new Error('사용자 정보가 없습니다.')

      const { data: chatList, error } = await sb
        .from('chats')
        // .from('channels')
        .select()
        .eq('channel_id', channelId)
        .range(from, to)
        .order('created_at', { ascending: true })
        // .stream(primaryKey: ['id'])
        // .map((maps) => maps
        //   .map((map) => Message.fromMap(map: map, myUserId: myUserId))
        //   .toList());
      if (error) throw error

        // .from('chats')
        // .select('user_id')
        // // .select('user_id, user:chats_users!inner(user_id)')
        // .range(from, to)
        // .order('created_at', { ascending: false })
        // .eq('users.user_id', userId)
      return chatList


      // return await sb
      //   .from('chats')
      //   .select('*, users: chats_users!inner(user:profiles(email))')
      //   .in('id', [chatIds?.map(chat => chat.id)])
    },
    async createNewChat(data: newChatType, userInfo: userInfoType = authStore?.userInfo) {
      const { content, channel_id } = data
      const { id: userId, email, user_metadata } = userInfo

      const offset = new Date().getTimezoneOffset() * 60000
      const today = new Date(Date.now() - offset)

      const payload = {
        // id:uuid,
        user_id: userId,
        content,
        created_at: today,
        user_email: email,
        user_name: user_metadata?.user_name,
        channel_id: channel_id
      }
      const { error } = await sb
        .from('chats')
        .insert(payload)
      if (error) throw error
      return true
    },

    // 채널
    /**
     * 채널 목록 조회
     * 기본: 로그인 한 유저가 포함된 채널 목록 조회
     * @param {Array} userIdList 상대방 유저가 있는 경우, 상대방 유저 ID를 담은 배열
     * @param {Number} from, to 찾는 범위 설정
     */
    async getChannelList(userIdList = [], from = 0 , to = 10) {
      console.log('@@@ >>> ', authStore.userInfo)
      const { data: channels, error } = await sb
        .from('channels')
        .select()
        .contains('user_id_list', [authStore?.userInfo?.id, ...userIdList])
        .order('updated_at', { ascending: true })
        .range(from, to)
      // .stream(primaryKey: ['id'])
      // .map((maps) => maps
      //   .map((map) => Message.fromMap(map: map, myUserId: myUserId))
      //   .toList());
      if (error) throw error
      return channels
    },
    // 채널 생성
    async createChannel(userIdList = [], userInfo: userInfoType = authStore?.userInfo) {
      const offset = new Date().getTimezoneOffset() * 60000
      const today = new Date(Date.now() - offset)
      const user_id_list = [...userIdList, userInfo?.id]
      const user_list = await authStore.getUsersByUserIds (user_id_list)

      const payload = {
        created_at: today,
        updated_at: today,
        user_id_list,
        user_list,
        summary: ''
      }
      const { data, error } = await sb
        .from('channels')
        .insert(payload)
      if (error) throw error
      return data
    },
    // 채널 summary 업데이트
    async updateChannelSummary(channel_id = '', summary = ''){
      const { data, error } = await sb
        .from('channels')
        .update({
          summary
        })
        .eq('channel_id', channel_id)
      if (error) throw error
      return data
    },
    // // 채널 찾기 (참여 유저 ID 목록에 따라)
    // async getChannelListByUserIdList (userIdList = []) {
    //   const { data: channel, error } = await sb
    //     .from('channels')
    //     .select()
    //     .contains('user_id_list', [authStore?.userInfo?.id, ...userIdList])

    //   if (error) throw error
    //   return channel
    // },

    getErrorMessage(error: Error | undefined) {
      if (!error) return ''
  
      const err = error as SystemError
      if (!err) return ''
  
      let msg: string = err?.message || ''
      let status: string | number = err?.status || ''
  
      if (msg.includes('VALUE_IS_NULL')) {
        const s = msg.indexOf(': ') + 1
        const nullValue = msg.substring(s)?.trim()
        const nullValueLabel = {
          EMAIL: '이메일',
          PASSWORD: '비밀번호',
          USER_NAME: '닉네임',
        }[nullValue]
        if (nullValueLabel) return `${nullValueLabel}은(는) 필수입니다.`
      }
  
      if (status) {
        const messageByStatus = {
          422: '비밀번호는 최소 6자리 이상으로 설정해주세요.'
        }[status]
        if (messageByStatus) return `${messageByStatus}`
      }
  
      const messageBySupabaseAuth = () => {
        const msgList = [
          { m: 'Invalid login credentials', txt: '이메일 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.' },
          { m: 'JWT expired', txt: '세션이 만료되어 로그인 페이지로 이동합니다.' },
          { m: 'invalid JWT', txt: '세션이 만료되어 로그인 페이지로 이동합니다.' }
        ]
        const findedItem = msgList.find(item => msg.includes(item.m))
        if (findedItem) return findedItem.txt
      }
      if (messageBySupabaseAuth()) return messageBySupabaseAuth()
      return msg
    }
  },

})