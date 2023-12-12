<template>
  <div class="chat-side-nav-wrap">
    <ul class="chat-side-nav -menu-info">
      <li>홈</li>
    </ul>
    <ul class="chat-side-nav -user-info">
      <li>유저 정보</li>
      <li>
        <Button @click="handleLogout" label="로그아웃" />
      </li>
    </ul>

  </div>
</template>

<script setup lang="ts">
import { userAuthStore } from '@/store/Auth.store'

const store = userAuthStore()

const handleLogout = async () => {
  const done = confirm('로그아웃 하시겠습니까?')
  if (!done) return

  try {
    await store.logoutUser()
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}
</script>

<style scoped>
.chat-side-nav-wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
  background-color: var(--main-green2);
  color: var(--white);
  .chat-side-nav {
    display: flex;
    flex-direction: column;
    gap:var(--gap-s);
  }
}
</style>