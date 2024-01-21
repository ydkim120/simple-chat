<template>
  <div class="landing-wrap page-wrap">
    <div class="landing-contents">
      <h1 class="landing-logo">
        <i class="pi pi-send" style="font-size: 2.8rem" />
        SIMPLE<br>&nbsp;&nbsp;&nbsp;MESSENGER
      </h1>
      <img 
        src="../assets/messenger-man.png" 
        alt="랜딩페이지 이미지" 
        class="landing-img"
      >
    </div>
    <div class="button-area">
      <a 
        class="login-btn"
        @click="() => activeRegisterDialog = true"
      >
        회원가입
      </a>
      <Button 
        class="login-btn"
        severity="secondary"
        @click="activeLoginDialog = true" 
        label="로그인" 
      />
    </div>

    <Dialog 
      v-model:visible="activeLoginDialog" 
      header="이메일 로그인"
      :style="{ width: '500px' }"
      dismissable-mask
      modal
    >
      <LoginUser @close="activeLoginDialog = false" />
    </Dialog>
    <Dialog 
      v-model:visible="activeRegisterDialog" 
      header="회원가입"
      :style="{ width: '500px' }"
      dismissable-mask
      modal
    >
      <RegisterUser @close="activeRegisterDialog = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginUser from './Auth/LoginUser.vue'
import RegisterUser from './Auth/RegisterUser.vue'
const activeLoginDialog = ref(false)
const activeRegisterDialog = ref(false)

</script>

<style scoped>
.landing-wrap {
  position: relative;
  height: 100vh;
  background-color: var(--background-color);
  .landing-contents {
    position: fixed;
    top: 100px;
    left: 100px;
    right: 100px;
    bottom: 100px;
    border-radius: 15px;
    background-color: var(--primary);
  }
  .landing-logo {
    position: absolute;
    top: 50%;
    left: var(--gap-l);
    transform: translateY(-50%);
    font-weight: 900;
    color: var(--secondary);
    text-transform: uppercase;
    font-size: 4.2rem;
    line-height: 60px;
  }
  .landing-img {
    position: absolute;
    bottom: -70px;
    right: var(--gap);
    /* transform: translateY(-50%); */
    width: 400px;
    height: 400px;
  }
  .button-area {
    position: absolute;
    top: var(--gap);
    right: var(--gap);
    font-size: 14px;
    align-items: center;
    cursor: pointer;
  }
}
</style>