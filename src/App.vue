<template>
  <div id="app">
   <router-view />

   <!-- <ConfirmDialog /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userAuthStore } from '@/store/Auth.store'
import { useCookies } from "vue3-cookies"

const router = useRouter()

const store = userAuthStore()

const { cookies } = useCookies()

onMounted(async () => {
  if (!await isAvailableToken()) return
  await setUserInfo ()
  await pageRedirect ()
  console.log(`컴포넌트가 마운트 됐습니다.`)
})

const isAvailableToken = () => {
  const access_token = cookies.get('access_token')
  const refresh_token = cookies.get('refresh_token')

  if (!access_token || !refresh_token) {
    alert('토큰이 만료되었습니다. 다시 로그인 해주세요.')
    store.logoutUser()
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

const pageRedirect = async () => {
  try {
    const { session } = await store.getSession()
    
    if (!session && store.isAuth) {
      const { data } = await store.refreshSession()
      if (!data?.user) {
        alert('세션이 만료되었습니다. 다시 로그인 해주세요.')
        return store.logoutUser()
      }
      await store.saveToken(session)
    }
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
    return router.push({ name: 'login-user' })
  }
}

</script>


<style src="./style/global.css" />
