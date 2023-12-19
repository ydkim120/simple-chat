<!-- 사용자 검색 -->
<template>
  <div class="chat-header-search">
    {{ selectedUser }}
    <AutoComplete
      v-model="selectedUser"
      optionLabel="user_name"
      class="search-user-input"
      placeholder="사용자 이름 또는 이메일로 검색하세요."
      :suggestions="filteredUsers"
      @complete="search"
    >
      <template #option="slotProps">
        <div class="search-user-option">
          <img
            v-if="slotProps.option.user_photo"
            :alt="slotProps.option.user_name"
            :src="slotProps.option.user_photo"
            style="width: 18px"
          />
          <span>{{ slotProps.option.user_name }}</span>
          <small>{{ slotProps.option.user_email }}</small>
        </div>
      </template>
    </AutoComplete>
         teset <img v-if="authStore.userInfo" :src="authStore.userInfo.photo" alt="">
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRouter } from 'vue-router'
import { userAuthStore } from '@/store/Auth.store'

type profileType = {
  id: string | undefined
  user_name: string
  user_email: string | undefined
  user_photo?: string | undefined
}

const router = useRouter()
const authStore = userAuthStore()

onMounted(async () => {
  const allUsersData = await authStore.getAllUsers() || []
  allUser.value = allUsersData
  console.log('userInfo >>>', authStore.userInfo.photo)
})

const allUser = ref([])
const selectedUser = ref()
const filteredUsers = ref()

const search = (event: Event) => {
  setTimeout(() => {
    if (!event?.query?.trim().length) {
      filteredUsers.value = [...allUser.value];
    } else {
      filteredUsers.value = allUser.value.filter((user: profileType) => {
        return (
          user?.user_name.toLowerCase().startsWith(event.query.toLowerCase()) 
          || user?.user_email.toLowerCase().startsWith(event.query.toLowerCase())
        )
      })
    }
  }, 250)
}

watch(selectedUser, (val) => {
  if (typeof val === 'object' && val?.id) {
    debugger
    router.push({
      name: 'chat-detail',
      params: {
        id: val?.id
      }
    })
  }
})
</script>

<style scoped>
.chat-header-search {
  display: flex;
  justify-content: space-around;
  padding: var(--gap-xs);
  background-color: var(--main-green2);
  .search-user-input { width: 800px; }
  .search-user-option {
    padding: var(--gap-s);
  }
}
</style>