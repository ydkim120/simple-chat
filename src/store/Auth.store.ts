import { defineStore } from "pinia"
import { supabase as sb } from '@/supabase'
// import Cookies from "js-cookie";
// import { requestLogin, requestRegister } from "../services/auth";
import { loginUserType, registerUserType, SystemError } from "@/@types";

export const userAuthStore: any = defineStore({
  id: "auth",
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
        const data = await sb.auth.signInWithPassword({
          email: loginForm.email,
          password: loginForm.password
        })
        if (data?.error) throw data.error
        this.isAuth = true
        return data

      } catch (error) {
        if (error instanceof Error) throw error
      }
    },

    // 사용자 등록
    async registerUser (registerForm: registerUserType) {
     try {
       const data = await sb.auth.signUp({
         email: registerForm.email,
         password: registerForm.password,
         data: { 'userName': registerForm.userName }
       })
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
      } catch (error) { throw error }
      // Cookies.remove("token");
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

      const messageBySupabaseAuth = {
        'Invalid login credentials': '이메일 또는 비밀번호를 잘못 입력했습니다. 입력하신 내용을 다시 확인해주세요.'
      }[msg]
      if (messageBySupabaseAuth) return messageBySupabaseAuth
      return msg
    }
  }
})