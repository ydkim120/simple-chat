import { defineStore } from 'pinia'
import router from '../router'
import { supabase as sb } from '@/supabase'
import { useCookies } from 'vue3-cookies'

import { loginUserType, registerUserType, SystemError, userInfoType,  sessionObjType } from '@/@types'

import { useProfilePhotoStore } from './ProfilePhoto.store'

const { cookies } = useCookies()

interface authState {
  userInfo: null | userInfoType,
  isAuth: boolean
}

export const useUserAuthStore: any = defineStore({
  id: 'auth',
  state: (): authState => ({
    userInfo: null,
    isAuth: false
  }),
  getters: {
    // getMessageAuth: (state) => state.message,
    // isAuth: (state) => state.isAuth,
  },
  actions: {
    // 이메일 로그인
    async loginUserWithEmail (loginForm: loginUserType) {
      try {
        const result = await sb.auth.signInWithPassword({
          email: loginForm.email,
          password: loginForm.password
        })
        const { data, error } = result
        if (error) throw error

        if (data?.session) await this.saveToken(data.session)
        return result

      } catch (error) {
        if (error instanceof Error) throw error
      }
    },

    // 사용자 등록
    async registerUser (registerForm: registerUserType) {
     try {
       const photoStore = useProfilePhotoStore()
       if (registerForm.user_photo) {
         const { data, error } = await photoStore.registerUserPhoto(registerForm.user_photo, registerForm.email)
         if (error) throw error
         if (data) await this.setUserPhotoInfo()
       }

       const result = await sb.auth.signUp({
         email: registerForm.email,
         password: registerForm.password,
         options: {
          data: {
            user_name: registerForm.user_name
          }
         }
       })
       if (result?.error) throw result.error

       return result
     } catch (error) { throw error }
    },
    // 사용자 정보 저장
    async setUserInfo(accessToken: string) {
      if (!accessToken) return 

      const { data: { user }, error } = await sb.auth.getUser(accessToken)
      if (error) this.userInfo = null
      this.userInfo = JSON.parse(JSON.stringify(user))

      await this.setUserPhotoInfo()
    },
    // 사용자 정보 > 프로필 사진 정보 업데이트
    async setUserPhotoInfo() {
      console.log('this.userInfo ????? ', this.userInfo)
      if (!this.userInfo?.email) return

      const { data, error } = await sb
        .storage
        .from('avatars')
        .createSignedUrl(`${this.userInfo?.email}_photo`, 31536000)
      if (error) this.userInfo.photo = null

      this.userInfo.photo = data?.signedUrl || null

      await sb
        .from('profiles')
        .update({
          user_photo: this.userInfo.photo,
        })
        .eq('user_email', this.userInfo.email)
    },

    // 로그아웃
    async logoutUser () {
      const { error } = await sb.auth.signOut()
      this.userInfo = null
      this.isAuth = false
      cookies.remove('access_token')
      cookies.remove('refresh_token')
      router.push({ name: 'login-user' })
      if (error) throw error
      // localStorage.removeItem("todo");
      // this.message = "";
    },

    // 비밀번호 변경
    async updateUserInfo (payload: any) {
      try {
        const data = await sb.auth.updateUser({
          ...payload
        })

        if (data?.error) throw data.error

        const access_token = cookies.get('access_token')
        this.setUserInfo(access_token)
        return data
      } catch(error) { throw error }
    },

    getErrorMessage (error: Error | undefined) {
      if (!error) return ''

      const err = error as SystemError
      if(!err) return ''

      let msg: string = err?.message || ''

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

      // if (status) {
      //   const messageByStatus = {
      //     422: '비밀번호는 최소 6자리 이상으로 설정해주세요.'
      //   }[status]
      //   if (messageByStatus) return `${messageByStatus}`
      // }

      const messageBySupabaseAuth = () => {
        const msgList = [
          { m: 'Invalid login credentials', txt: '이메일 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.'},
          { m: 'JWT expired', txt: '세션이 만료되어 로그인 페이지로 이동합니다.'},
          { m: 'invalid JWT', txt: '세션이 만료되어 로그인 페이지로 이동합니다.'},
          { m: 'User not found', txt: '유저 정보가 없습니다.'},
          { m: 'Email not confirmed', txt: '회원가입 승인을 하지 않은 계정입니다. 이메일을 확인해주세요.'},
          { m: 'Password should be at least', txt: '비밀번호는 최소 6자리 이상으로 설정해주세요.'},
          { m: 'New password should be different from the old password', txt: '현재 비밀번호와 동일합니다. '},
        ]
        const findedItem = msgList.find(item => msg.includes(item.m))
        if (findedItem)  return findedItem.txt
      }
      if (messageBySupabaseAuth()) return messageBySupabaseAuth()
      return msg
    },
    // ====== 세션 관련 ======
    // 세션 유지 위한 토큰 저장
    // 토큰 만료: 1일
    async saveToken (session: sessionObjType) {
      if (session) {
        console.log('session::', session)

        const { access_token, refresh_token }: sessionObjType = session
        cookies.set('access_token', access_token, '1d')
        cookies.set('refresh_token', refresh_token, '1d')

        await this.setUserInfo(access_token)
        console.log('유저 >', this.userInfo)
      }
    },
    // 세션 유지
    // async setSession() {
    //   const access_token = cookies.get('access_token')
    //   const refresh_token = cookies.get('refresh_token')

    //   if (!access_token || !refresh_token) {
    //     this.isAuth = false
    //     return
    //   }

    //   try {
    //     const result = await sb.auth.setSession({
    //       access_token,
    //       refresh_token
    //     })
    //     const { data, error } = result
    //     if (error) throw error
    //     this.isAuth = true
    //     return result

    //   } catch (error) {
    //     this.logoutUser()
    //     if (error instanceof Error) throw error
    //   }
    // },
    // 세션 조회
    async getSession() {
      const result = await sb.auth.getSession()
      const { data: { session }, error } = result

      if (error) throw error
      this.isAuth = true
      return { session }
    },
    // 세션 refresh
    async refreshSession () {
      const result =  await sb.auth.refreshSession()
      const { data, error } = result
      if (error) throw error
      return { data }
    },

    // 가입 한 모든 유저 반환 ()
    async getAllUsers() {
      const { data: users, error } = await sb
        .from('profiles')
        .select()
      if (error) throw error
      return users
    },
    // 유저 ID에 해당하는 유저 정보 반환
    async getUsersByUserIds (userIdList : string[]) {
      if (!userIdList?.length) return []
      const filterTxt = userIdList.reduce((acc, cur) => acc ? `${acc}, id.eq.${cur}` : `id.eq.${cur}`, '')

      const { data: users, error } = await sb
        .from('profiles')
        .select()
        .or(filterTxt)
      if (error) throw error
      return users
    }
  }

})