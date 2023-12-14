<template>
  <div id="app">
   <router-view />

   <!-- <ConfirmDialog /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { userAuthStore } from '@/store/Auth.store'
import { useCookies } from "vue3-cookies"


const store = userAuthStore()

const { cookies } = useCookies()

onMounted(async () => {
  if (store.isAuth) {
    if (!await isAvailableToken()) return
    await setUserInfo ()
  }
  console.log(`컴포넌트가 마운트 됐습니다.`)
})

const isAvailableToken = async () => {
  const access_token = cookies.get('access_token')
  const refresh_token = cookies.get('refresh_token')

  if (!access_token || !refresh_token) {
    alert('토큰이 만료되었습니다. 다시 로그인 해주세요.')
    await store.logoutUser()
    return false
  }
  return true
}

const setUserInfo = async () => {
  try {
    const accessToken = cookies.get('access_token')
    await store.setUserInfo(accessToken)
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

</script>


<style src="./style/global.css" />
