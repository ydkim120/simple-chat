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
            size="small"
            rounded
            outlined
            :label="userPhoto ? '사진 변경' : '사진 추가'"
            @click="chooseCallback()"
          />
          <Button
            v-if="userPhoto"
            @click="() => saveProfilePhoto()"
            size="small"
            label="삭제"
            rounded
            outlined
            severity="secondary"
          />
        </template>
        <template #content>
          <UserProfilePhoto 
            :src="userPhoto"
          />
        </template>
      </FileUpload>

      <Dialog 
        :visible="activePreviewPhoto" 
        header='사진 미리보기'
        :style="{ width: '300px' }"
        modal 
      >
        <UserProfilePhoto 
          :src="userPhotoPreview || ''"
          width="180px"
          height="180px"
          :style="{ margin: '0 auto' }"
        />
        <template #footer>
          <Button
            label="취소"
            severity="secondary"
            @click="activePreviewPhoto = false" 
          />
          <Button 
            label="사진 저장" 
            icon="pi pi-check" 
            @click="() => saveProfilePhoto()" 
            autofocus 
          />
        </template>
      </Dialog>
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
              />
              <Button
                @click="() => {
                  changeUserName(userName)
                }" 
                icon="pi pi-check" 
                label="저장"
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
import UserProfilePhoto from '@/components/UserProfilePhoto.vue'

const authStore = userAuthStore()

const isEditUserName = ref(false)
const activeChangePasswordDialog = ref(false) // 비밀번호 변경 팝업
const activePreviewPhoto = ref(false) // 사진 미리보기 팝업

const userInfoData = ref<userInfoType | null>(null)
const email = ref('')
const newPassword = ref('')
const newPasswordRe = ref('')
const userName = ref('')
const userPhoto = ref()
const userPhotoPreview = ref()

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
/**
 * 유저 닉네임 업데이트
 */
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

const customBase64Uploader = async (event) => {
  console.log('files:: ', event.files)
  const file = event.files[event.files.length - 1]
  const reader = new FileReader()
  let blob = await fetch(file.objectURL).then((r) => r.blob())

  reader.readAsDataURL(blob)

  reader.onloadend = function () {
    const base64data = reader.result
    userPhotoPreview.value = base64data || undefined
    activePreviewPhoto.value = true
  }
}

/**
 * 유저 프로필 사진 업데이트
 */
const saveProfilePhoto = async () => {
  try {
    const isDeleted = !userPhotoPreview.value 
    const flag = isDeleted
      ? confirm('프로필 사진을 삭제하시겠습니까?')
      : confirm('프로필 사진을 업로드 하시겠습니까?')
    if (!flag) return false

    let result
    if (!userPhoto.value) {
      const { data } = await authStore.registerUserPhoto(
        isDeleted ? '' : userPhotoPreview.value,
        email.value
      )
      result = data
    } else {
      const { data } = await authStore.updateUserPhoto(
        isDeleted ? '' : userPhotoPreview.value, 
        email.value
      )
      result = data
    }

    if (result) {
      activePreviewPhoto.value = false
      userPhoto.value = userPhotoPreview.value
      userPhotoPreview.value = ''
      await setUserInfo()
      return isDeleted ? alert('프로필 사진을 삭제했습니다.') : alert('프로필 사진을 변경했습니다.')
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

/* 사진 */
.user-info-photo {
  margin: 40px auto 0;
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