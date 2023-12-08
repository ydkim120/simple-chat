<template>
  <div class="register-form" v-loading="loginLoading">
    <h3>이메일로 회원가입</h3>
    <template v-if="!isPassed" >
      <ul class="register-form-input-list">
        <li>
          <p class="register-form-field">
            <span class="-required">Email</span>
          </p>
          <input
            v-model="email"
            type="text"
            placeholder="이메일을 입력하세요."
            @blur="() => { 
              if (email) email = email.trim() 
            }"
            @keypress.enter.native="handleRegisterUser()"
          />
        </li>
        <li>
          <p class="register-form-field">
            <span class="-required">비밀번호</span>
          </p>
          <input 
            v-model="password" 
            type="password" 
            placeholder="password를 입력하세요."
            @keypress.enter.native="handleRegisterUser()"
          />
        </li>
        <li>
          <p class="register-form-field">
            <span class="-required">닉네임</span>
          </p>
          <input
            v-model="userName"
            type="text"
            placeholder="닉네임을 입력하세요."
            @blur="() => { 
              if (userName) userName = userName.trim() 
            }"
            @keypress.enter.native="handleRegisterUser()"
          />
        </li>
      </ul>
      <button @click="handleRegisterUser">
        회원가입 승인 메일 보내기
      </button>
      <ul class="banner-list">
        <li>
          계정이 이미 있으신가요?&nbsp;
          <router-link
            :to="{ name: 'login-user' }"
            class="banner-link"
          >
            로그인
          </router-link>
        </li>
      </ul>
    </template>
    <template v-else >
      <p class="alert-send-email">
        ✔️ 회원가입 승인 링크가 이메일로 전송되었습니다.
      </p>
      <router-link
        :to="{ name: 'login-user' }"
        class="banner-link"
      >
        로그인 하러 가기
      </router-link>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userAuthStore } from '@/store/Auth.store'
import { regExpStore } from '@/store/RegExp.store'

const store = userAuthStore()
const regExpTest = regExpStore()

const loginLoading = ref(false)
const email = ref('')
const password = ref('')
const userName = ref('')
const isPassed = ref(false)

const handleRegisterUser = async () => {
  try {
    if (!email.value) throw new Error('VALUE_IS_NULL: EMAIL')
    if (!regExpTest.checkEmailFormat(email.value)) throw new Error('이메일 형식이 올바르지 않습니다. 다시 입력해주세요.')
    if (!password.value) throw new Error('VALUE_IS_NULL: PASSWORD')
    if (!userName.value) throw new Error('VALUE_IS_NULL: USER_NAME')

    const done = confirm('입력하신 이메일 정보로 회원가입 승인 절차를 계속하시겠습니까?')
    if(!done) return

    loginLoading.value = true

    const { data, error } = await store.registerUser({
      email: email.value,
      password: password.value,
      userName: userName.value
    })
    console.log('data:: ', data)
    if (!error) {
      isPassed.value = true
    }
  } catch (error) {
    const errorMessage = store.getErrorMessage(error)
    if(errorMessage) alert(errorMessage)
  } finally { loginLoading.value = false }
}

</script>

<style scoped>
.register-form {
  padding: 20px 40px;
  box-shadow: 0 4px 20px 0 rgba(224, 224, 224, 0.7);
  width: 500px;

  .register-form-input-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 40px 0;
    & li {
      display: flex;
      align-items: center;
      gap: var(--gap-s);
      & .register-form-field {
        text-align: left;
        width: 150px;
      }
    }
  }
  .banner-list { 
    display: flex;
    justify-content: center;
    margin-top: var(--gap-s);
    color: var(--light-gray);
  }
  .banner-link { 
    font-weight: bold; 
    &:hover { text-decoration: underline; }
  }
  .alert-send-email { margin: 40px 0; }
}
</style>