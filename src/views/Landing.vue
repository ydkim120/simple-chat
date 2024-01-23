<template>
  <div class="landing-wrap page-wrap">
    <div class="landing-contents">
      <div class="landing-logo-wrap">
        <h1 class="landing-logo">
          <i class="pi pi-send" style="font-size: 2rem" />
          Simple&nbsp;Talk
        </h1>
        <div class="button-area">
          <a
            v-if="!authStore.isAuth"
            class="register-btn"
            @click="() => activeRegisterDialog = true"
          >
            회원가입
          </a>
          <Button
            class="login-btn"
            severity="secondary"
            @click="() => {
              if (authStore.isAuth) router.push({ name: 'chat-list' })
              else activeLoginDialog = true
            }"
            :label="authStore.isAuth ? '대화 계속하기' : '대화 시작하기'"
            :style="{ width: '120px' }"
          />
        </div>
      </div>
      <img
        src="../assets/messenger-man.png"
        alt="랜딩페이지 이미지"
        class="landing-img"
      >
    </div>
    <Button
      v-if="authStore.isAuth"
      class="logout-btn"
      severity="secondary"
      @click="handleLogout()"
      label="로그아웃"
    />

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
import { useRouter } from 'vue-router'
import LoginUser from './Auth/LoginUser.vue'
import RegisterUser from './Auth/RegisterUser.vue'
import { useUserAuthStore } from '@/store/Auth.store'
import { useConfirm } from "primevue/useconfirm"

const router = useRouter()

const authStore = useUserAuthStore()

const activeLoginDialog = ref(false)
const activeRegisterDialog = ref(false)

const confirmDialog = useConfirm()

const confirm = (message: string, acceptFunc: Function) => {
  confirmDialog.require({
    message,
    acceptLabel: '확인',
    rejectLabel: '취소',
    rejectClass: 'p-button-secondary',
    accept: () => acceptFunc() || false,
    reject: () => false
  })
}

const handleLogout = async () => {
  confirm('로그아웃 하시겠습니까?', async () => {
    try {
      await authStore.logoutUser()
    } catch (error) {
      const errorMessage = authStore.getErrorMessage(error)
      if (errorMessage) alert(errorMessage)
    }
  })
}
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
  .landing-logo-wrap {
    position: absolute;
    top: 50%;
    left: var(--gap-l);
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--gap-xs);
    align-items: center;
    .landing-logo {
      font-weight: 900;
      color: var(--secondary);
      text-transform: uppercase;
      font-size: 3rem;
      line-height: 60px;
    }
  }
  .landing-img {
    position: absolute;
    bottom: -70px;
    right: var(--gap);
    /* transform: translateY(-50%); */
    width: 400px;
    height: 400px;
  }
  .register-btn { 
    cursor: pointer;
    &:hover { font-weight: bold; }
  }
  .logout-btn {
    position: absolute;
    top: var(--gap);
    right: var(--gap);
  }
}
</style>