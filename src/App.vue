<template>
  <div id="app">
   <router-view />

   <!-- <ConfirmDialog /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase as sb } from '@/supabase'

const router = useRouter()

onMounted(() => {
  pageRedirect ()
  console.log(`컴포넌트가 마운트 됐습니다.`)
})

const pageRedirect = () => {
  const session = sb.auth.currentSession
  console.log('session ===> ', session)

  if (session === null) { 
    alert('세션이 만료되어 로그인 페이지로 이동합니다.')
    return router.push({ name: 'login-user' })
  } else if (session === undefined) return router.push({ name: 'login-user' })
  else return false
}

</script>


<style src="./style/global.css" />
