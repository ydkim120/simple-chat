<template>
  <div class="user-info-wrap">
    <div class="user-info-photo">
      <FileUpload
        name="demo[]"
        url=""
        accept="image/*"
        custom-upload
        @select="customBase64Uploader"
        @clear="userPhoto = undefined"
        class="user-info-photo-uploader"
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
    <ul class="user-info-list">
      <li>
        <p class="user-info-field">
          이메일
        </p>
        <span>
          {{ email }}
        </span>
      </li>
      <li>
        <p class="user-info-field">
          비밀번호
        </p>
        <Button
          size="small"
          icon="pi pi-pencil" 
          label="비밀번호 재설정"
          @click="activeChangePasswordDialog = true"
        />
        <Dialog 
          :visible="activeChangePasswordDialog" 
          header='새 비밀번호 설정'
          :style="{ width: '500px' }"
          modal 
        >
          <ul class="user-info-list">
            <li class="user-info-field">
              <p class="user-info-field">
                <span class="-required">새 비밀번호</span>
              </p>
              <Password 
                class="register-form-input"
                v-model="newPassword" 
                placeholder="새 비밀번호를 입력해주세요."
                :feedback="false"
                toggleMask
              />
            </li>
            <li class="user-info-field">
              <p class="user-info-field">
                <span class="-required">새 비밀번호 확인</span>
              </p>
              <Password 
                class="register-form-input"
                v-model="newPasswordRe" 
                placeholder="새 비밀번호를 다시 입력해주세요."
                :feedback="false"
                toggleMask
              />
            </li>
          </ul>
          <template #footer>
            <Button
              label="취소"
              severity="secondary"
              @click="activeChangePasswordDialog = false" 
            />
            <Button 
              label="저장" 
              icon="pi pi-check" 
              @click="changePassword(newPassword)" 
              autofocus 
            />
          </template>
        </Dialog>
      </li>
      <li>
        <p class="user-info-field">
          <span :class="{ '-required': isEditUserName }">닉네임</span>
        </p>
        <div class="register-form-input -user-name">
          <InputText
            v-if="isEditUserName"
            v-model="userName"
            type="text"
            placeholder="닉네임을 입력하세요."
            :style="{ width: '480px' }"
            @blur="() => {
              if (userName) userName = userName.trim()
            }"
            @keypress.enter.native="() => false"
          />
          <span v-else>{{ userName }}</span>
          <div class="button-area">
            <Button
              v-if="!isEditUserName"
              @click="isEditUserName = true" 
              icon="pi pi-pencil" 
              label="수정"
              size="small"
            />
            <template v-else>
              <Button
                @click="() => {
                  userName = userInfoData 
                    ? userInfoData.user_metadata.user_name 
                    : null
                  isEditUserName = false
                }" 
                severity="secondary"
                label="취소"
                size="small"
              />
              <Button
                @click="() => {
                  changeUserName(userName)
                }" 
                icon="pi pi-check" 
                label="저장"
                size="small"
              />
            </template>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userAuthStore } from '@/store/Auth.store'
import { userInfoType } from '@/@types'

const authStore = userAuthStore()

const isEditUserName = ref(false)
const activeChangePasswordDialog = ref(false)

const userInfoData = ref<userInfoType | null>(null)
const email = ref('')
const newPassword = ref('')
const newPasswordRe = ref('')
const userName = ref('')
const userPhoto = ref()

onMounted( () => {
  setUserInfo()
})

/**
 * 유저 정보 세팅
 */
const setUserInfo = () => {
  const userInfo = JSON.parse(JSON.stringify(authStore.userInfo))
  
  if (userInfo) {
    userInfoData.value = userInfo

    const { email: userEmail, user_metadata, photo } = userInfo
    email.value = userEmail
    userPhoto.value = photo
    userName.value = user_metadata?.user_name
    console.log('userInfo >>>', userInfo)
  }
}

const changePassword = async (password: string) => {
  try {
    if(!password?.trim()) return alert('새 비밀번호를 입력하세요.')
    if(!newPasswordRe.value?.trim()) return alert('새 비밀번호 확인을 입력하세요.')
    if (password !== newPasswordRe.value) return alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.')

    const { data } = await authStore.updateUserInfo({ password })
    if (data) {
      alert('새 비밀번호로 변경되었습니다.')
      newPassword.value = ''
      newPasswordRe.value = ''
      activeChangePasswordDialog.value = false
    }
  } catch (error) {
    const errorMessage = authStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

const changeUserName = async (name: string) => {
  try {
    if (!name?.trim()) return alert('닉네임을 입력하세요.')

    const { data } = await authStore.updateUserInfo({ data: { 
      user_name: name 
    } })
    if (data) {
      isEditUserName.value = false
      return alert('닉네임을 변경했습니다.')
    }
  } catch (error) {
    const errorMessage = authStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

</script>

<style scoped>
.user-info-wrap {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
  max-width: 800px;
}
.user-info-photo {
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
.user-info-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-s);
  margin: 60px auto;
  width: 100%;
  & li {
    display: flex;
    align-items: center;
    gap: var(--gap-s);
    width: 100%;
    & .user-info-field {
      text-align: left;
      min-width: 150px;
      width: 150px;
    }
    & .register-form-input {
      width: 100%;
      &.-user-name { 
        display: flex;
        align-items: center;
        gap: var(--gap-s);
      }
    }
  }
}
</style>