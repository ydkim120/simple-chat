<template>
  <div class="login-user-wrap">
    <div class="login-form">
      <!-- <h3>Email 로그인</h3> -->
      <div class="login-form-input-wrap">
        <InputText
          v-model="email"
          type="text"
          placeholder="이메일"
          @blur="() => { if(email) email = email.trim() }"
          @keypress.enter.native="handleLoginEmail()"
        />
        <Password
          v-model="password"
          placeholder="비밀번호"
          @keypress.enter.native="handleLoginEmail()"
          :feedback="false"
          toggleMask
        />
      </div>
      <div class="button-area center">
        <Button @click="handleLoginEmail" label="로그인" />
      </div>
      <!-- <ul class="banner-list">
        <li>
          <router-link 
            :to="{ name: 'register-user'}"
            class="banner-link"
          >
            회원가입
          </router-link>
        </li>
      </ul> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserAuthStore } from '@/store/Auth.store'
import { regExpStore } from '@/store/RegExp.store'
import api from '@/api'

const router = useRouter()

const store = useUserAuthStore()
const regExpTest = regExpStore()

const loginLoading = ref(false)
const email = ref('')
const password = ref('')

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleLoginEmail = async () => {
  try {
    if (!email.value) throw new Error('VALUE_IS_NULL: EMAIL')
    if (!regExpTest.checkEmailFormat(email.value)) throw new Error('이메일 형식이 올바르지 않습니다. 다시 입력해주세요.')
    if (!password.value) throw new Error('VALUE_IS_NULL: PASSWORD')

    loginLoading.value = true

    const { data, error } = await store.loginUserWithEmail({
      email: email.value,
      password: password.value
    })
    console.log('data:: ', data)
    if (!error) {
      // await api.presence.presenceSubscription()
      alert('Check your email for the login!')
      handleClose()
      await api.presence.setPresenceOnLogin(email.value)
      router.push({ name: 'chat-main' })

    }
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  } finally { loginLoading.value = false }
}



const handleClose = () => emit('close')

</script>

<style scoped>
.login-user-wrap {
  /* position: absolute; */
  width: 100%;
  height: 100%;
  background: var(--white);
}
.login-form {
  /* position: fixed;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 40px;
  box-shadow: 0 4px 20px 0 rgba(224, 224, 224, 0.7);
  width: 500px;
  transform: translate(-50%, -50%);
  background-color: var(--lightest-gray); */

  .login-form-input-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 40px 0;
    width: 100%;
  }

  .banner-list { 
    display: flex;
    justify-content: center;
    margin-top: var(--gap-s);
    color: var(--light-gray);
    .banner-link { 
      font-weight: bold;
      color: var(--text-color);
      &:hover { text-decoration: underline; }
    }
  }
}
</style>