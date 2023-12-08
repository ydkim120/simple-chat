import { defineStore } from "pinia"

export const regExpStore: any = defineStore({
  id: 'regExpStore',
  state: () => ({

  }),
  getters: {
  },
  actions: {
    /**
     * 이메일 형식을 검사합니다.
     * @param {String} email
     * @return {Boolean} 올바른 이메일 형식이면 True 반환
     */
    checkEmailFormat (email: string) {
      if (!email) return false
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i

      return regex.test(email)
    }
  }
})