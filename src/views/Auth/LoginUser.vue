<template>
  <div class="login-form">
    <h3>Email 로그인</h3>
    <div class="login-form-input-wrap">
      <input 
        v-model="email" 
        type="text" 
        placeholder="email" 
        @blur="() => { if(email) email = email.trim() }"
        @keypress.enter.native="handleLoginEmail()" 
      />
      <input 
        type="password" 
        v-model="password" 
        placeholder="password"  
        @keypress.enter.native="handleLoginEmail()" 
      />
    </div>
    <button @click="handleLoginEmail">
      로그인
    </button>
    <ul class="banner-list">
      <li>
        <router-link 
          :to="{ name: 'register-user'}"
          class="banner-link"
        >
          회원가입
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userAuthStore } from '@/store/Auth.store'
import { regExpStore } from '@/store/RegExp.store'

const router = useRouter()

const store = userAuthStore()
const regExpTest = regExpStore()

const loginLoading = ref(false)
const email = ref('')
const password = ref('')

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
      alert('Check your email for the login!')
      return router.push({ name: 'chat-main' })
    }
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  } finally { loginLoading.value = false }
}

</script>

<style scoped>
.login-form {
  padding: 20px 40px;
  box-shadow: 0 4px 20px 0 rgba(224, 224, 224, 0.7);
  width: 500px;

  .login-form-input-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 40px 0;
  }

  .banner-list { 
    display: flex;
    justify-content: center;
    margin-top: var(--gap-s);
    color: var(--light-gray);
    .banner-link { 
      font-weight: bold; 
      &:hover { text-decoration: underline; }
    }
  }
}
</style>