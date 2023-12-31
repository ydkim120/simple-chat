<template>
  <div class="register-user-wrap">
    <div class="register-form" v-loading="loginLoading">
      <h3>이메일로 회원가입</h3>
      <template v-if="!isPassed" >
        <div class="register-form-photo">
          <FileUpload
            name="demo[]"
            url=""
            accept="image/*"
            custom-upload
            @select="customBase64Uploader"
            @clear="userPhoto = undefined"
            class="register-form-photo-uploader"
          >
            <template #header="{ chooseCallback, clearCallback }">
              <Button
                :icon="`pi ${userPhoto ? 'pi-pencil' : 'pi-images'}`" 
                size="small"
                rounded
                outlined
                :label="userPhoto ? 'Edit' : 'Add'"
                @click="chooseCallback()"
              />
              <Button
                v-if="userPhoto"
                @click="clearCallback()" 
                icon="pi pi-times" 
                rounded
                outlined
                severity="danger"
              />
            </template>
            <template #content>
              <div class="user-photo-wrap">
                <img
                  v-if="userPhoto"
                  :src="userPhoto || ''"
                  :alt="'profilePhoto'"
                />
                <span v-else class="default-photo">
                  <i class="pi pi-user user-icon" />
                </span>
              </div>
            </template>
          </FileUpload>
        </div>
        <ul class="register-form-input-list">
          <li>
            <p class="register-form-field">
              <span class="-required">Email</span>
            </p>
            <InputText
              class="register-form-input"
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
            <Password 
              class="register-form-input"
              v-model="password" 
              placeholder="비밀번호를 입력하세요."
              @keypress.enter.native="handleRegisterUser()"
              :feedback="false"
              toggleMask
            />
          </li>
          <li>
            <p class="register-form-field">
              <span class="-required">닉네임</span>
            </p>
            <InputText
              class="register-form-input"
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
        <Button @click="handleRegisterUser" label="회원가입 승인 메일 보내기" />
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
        <InlineMessage
          class="success-send-email"
          severity="success"
        >
          회원가입 승인 링크가 이메일로 전송되었습니다.
        </InlineMessage>
        <router-link
          :to="{ name: 'login-user' }"
          class="banner-link"
        >
          로그인 하러 가기
        </router-link>
      </template>
    </div>
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
const userPhoto = ref()
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
      user_name: userName.value,
      user_photo: userPhoto.value
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

const customBase64Uploader = async (event) => {
  console.log('files:: ', event.files)
  const file = event.files[event.files.length - 1]
  const reader = new FileReader()
  let blob = await fetch(file.objectURL).then((r) => r.blob())

  reader.readAsDataURL(blob)

  reader.onloadend = function () {
    const base64data = reader.result
    userPhoto.value = base64data || undefined
  }
}

</script>

<style scoped>
.register-user-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--white);
}
.register-form {
  position: fixed;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 40px;
  box-shadow: 0 4px 20px 0 rgba(224, 224, 224, 0.7);
  width: 500px;
  transform: translate(-50%, -50%);
  background-color: var(--lightest-gray);

  .register-form-photo {
    margin: 40px auto 0;
    .user-photo-wrap {
      position: relative;
      overflow: hidden;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 1px solid var(--disable);
      cursor: pointer;
      > * { width: 150px; height: 150px; }
      img { object-fit: cover; }
    }
    /deep/ .register-form-photo-uploader {
      .p-fileupload-buttonbar {
        position: absolute;
        padding: 0;
        background-color: var(--white);
        border: none;
        gap: none;
      }
    }
    .default-photo {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      width: 150px;
      height: 150px;
      background-color: var(--light-gray);
      .user-icon {
        font-size: 100px;
        color: var(--white);
        z-index: 1;
      }
    }

  }
  .register-form-input-list {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    margin: 40px 0;
    width: 100%;
    & li {
      display: flex;
      align-items: center;
      gap: var(--gap-s);
      width: 100%;
      & .register-form-field {
        text-align: left;
        width: 100px;
      }
      & .register-form-input {
        width: 100%;
      }
    }
  }
  .banner-list { 
    display: flex;
    justify-content: center;
    margin-top: var(--gap-s);
    color: var(--text-color);
  }
  .banner-link { 
    font-weight: bold; 
    &:hover { text-decoration: underline; }
  }
  .success-send-email { margin: 40px 0; }
}
</style>