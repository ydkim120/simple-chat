import { defineStore } from 'pinia'
import { supabase as sb } from '@/supabase'

export const useProfilePhotoStore: any = defineStore({
  id: 'profilePhoto',
  state: () => ({}),
  getters: {

  },
  actions: {
    // 프로필 사진 등록
    async registerUserPhoto(photo: File, email: string) {
      // const base64 = photo.split('base64,')[1]

      const { data, error } = await sb
        .storage
        .from('avatars')
        .upload(`${email}_photo`, photo, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })
      if (error) throw error
      else {
        return { data, error }
      }

    },
    // 프로필 사진 버킷에 업데이트 (변경 또는 삭제)
    async updateUserPhoto(photo: File, email: string) {
      // const base64 = photo ? photo.split('base64,')[1] : ''

      const { data, error } = photo
        ? await sb // 변경
          .storage
          .from('avatars')
          .update(`${email}_photo`, photo, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          })
        : await sb // 제거
          .storage
          .from('avatars')
          .remove([`${email}_photo`])

      if (error) throw error
      else {
        return { data, error }
      }
    },
    // 사용자 정보 > 프로필 사진 정보 업데이트
    // async setUserPhotoInfo() {
      
    //   console.log('this.userInfo ????? ', authStore.userInfo)
    //   if (!authStore.userInfo?.email) return

    //   const { data, error } = await sb
    //     .storage
    //     .from('avatars')
    //     .createSignedUrl(`${authStore.userInfo?.email}_photo`, 60)
    //   if (error) authStore.userInfo.photo = null

    //   authStore.userInfo.photo = data?.signedUrl || null

    //   await sb
    //     .from('profiles')
    //     .update({
    //       user_photo: authStore.userInfo.photo,
    //     })
    //     .eq('user_email', authStore.userInfo.email)
    // },
    // 사진 > url 멀티 생성 (이메일에 따라)
    async createPhotoUrlsByEmails (emailList: string[]) {
      if (!emailList?.length) return []

      const photoSourceNames = emailList.map(email => `${email}_photo`)

      const { data, error } = await sb
        .storage
        .from('avatars')
        .createSignedUrls([...photoSourceNames], 60)
      if (error) return emailList.map(item => '')

      return data
    }
  }
})