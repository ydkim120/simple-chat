import { defineStore } from 'pinia'
import router from '../router'
import { supabase as sb } from '@/supabase'
import { useCookies } from "vue3-cookies"
// import { requestLogin, requestRegister } from '../services/auth';
import { loginUserType, registerUserType, SystemError, sessionObjType } from '@/@types'

const { cookies } = useCookies()

export const userAuthStore: any = defineStore({
  id: 'auth',
  state: () => ({
    currentUser: undefined,
    isAuth: false,
    // message: "",
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
        this.isAuth = true
        if (data?.session) this.saveToken(data.session)
        return result

      } catch (error) {
        if (error instanceof Error) throw error
      }
    },

    // 사용자 등록
    async registerUser (registerForm: registerUserType) {
     try {
       const result = await sb.auth.signUp({
         email: registerForm.email,
         password: registerForm.password,
         options: {
          data: {
            userName: registerForm.userName
          }
         }
       })
       if (result?.error) throw result.error
       return result
     } catch (error) { throw error }
    },
    // 사용자 정보 상세 조회
    async getUserInfo(accessToken: string) {
      try {
        const data = await sb.auth.admin.getUserById(accessToken)
        if (data?.error) throw data.error
        return data
      } catch (error) { throw error }
    },

    // 로그아웃
    async logoutUser () {
      try {
        const { error } = await sb.auth.signOut()
        if (error) throw error
        this.currentUser = undefined
        this.isAuth = false
        cookies.remove('access_token')
        cookies.remove('refresh_token')
        router.push({ name: 'login-user' })
      } catch (error) { throw error }
      // localStorage.removeItem("todo");
      // this.message = "";
    },

    // 비밀번호 업데이트
    async updatePasswordHandler (newPassword: string) {
      try {
        const data = await sb.auth.updateUser({
          password: newPassword,
        })

        if (data?.error) throw data.error
        return data
      } catch(error) { throw error }
    },

    getErrorMessage (error: Error | undefined) {
      if (!error) return ''

      const err = error as SystemError
      if(!err) return ''

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
          { m: 'Invalid login credentials', txt: '이메일 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.'},
          { m: 'JWT expired', txt: '세션이 만료되어 로그인 페이지로 이동합니다.'},
          { m: 'invalid JWT', txt: '세션이 만료되어 로그인 페이지로 이동합니다.'}
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
    saveToken (session: sessionObjType) {
      if (session) {
        const { access_token, refresh_token }: sessionObjType = session
        cookies.set('access_token', access_token, '1d')
        cookies.set('refresh_token', refresh_token, '1d')
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
      console.log('session ===>', result)
      if (session) {
        this.isAuth = true
        return session
      }
      if (error) throw error
      return { session }
    },
    // 세션 refresh
    async refreshSession () {
      const result =  await sb.auth.refreshSession()
      const { data, error } = result
      if (error) throw error
      return { data }
    }
  }

})