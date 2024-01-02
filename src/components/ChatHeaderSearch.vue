<!-- 사용자 검색 -->
<template>
  <header class="chat-header-search">
    <div class="logo-wrap">
      <a 
        @click="() => router.push({
          name: 'chat-list'
        })"
      >
       <i class="pi pi-send" style="font-size: 1.2rem"></i>
        Simple Messenger
      </a>
    </div>
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
          <Chip 
            v-if="slotProps.option.id === authStore.userInfo.id" 
            label="나와의 채팅" 
          />
          <span class="search-user-option-name">{{ slotProps.option.user_name }}</span>
          <small class="search-user-option-email">{{ slotProps.option.user_email }}</small>
        </div>
      </template>
      <template #empty>
        <div class="search-user-option">
          해당하는 사용자가 없습니다.
        </div>
      </template>
    </AutoComplete>
         <!-- teset <img v-if="authStore.userInfo" :src="authStore.userInfo.photo" alt=""> -->
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRouter } from 'vue-router'
import { userAuthStore } from '@/store/Auth.store'
import { chatStore as chatDataStore } from '@/store/Chat.store'

type profileType = {
  id: string | undefined
  user_name: string
  user_email: string | undefined
  user_photo?: string | undefined
}

const router = useRouter()
const authStore = userAuthStore()
const chatStore = chatDataStore()

onMounted(async () => {
  const allUsersData = await authStore.getAllUsers() || []
  allUser.value = allUsersData
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
          user?.user_name?.toLowerCase().startsWith(event.query.toLowerCase()) 
          || user?.user_email.toLowerCase().startsWith(event.query.toLowerCase())
        )
      })
    }
  }, 250)
}

watch(selectedUser, async (val) => {
  if (typeof val === 'object' && val?.id) {
    await goToChannelDetail (val.id)
  }
})

const goToChannelDetail = async (partnerId: string) => {
  try {
    let channelId
    let findedChannel = await chatStore.getChannelList([partnerId])
    
    if (findedChannel?.length) channelId = findedChannel[0].channel_id
    else {
      await chatStore.createChannel([partnerId])

      findedChannel = await chatStore.getChannelList([partnerId])
      channelId = findedChannel[0].channel_id
    }
    
    router.push({
      name: 'chat-detail',
      params: {
        id: channelId
      }
    })
  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}
</script>

<style scoped>
.chat-header-search {
  display: flex;
  /* justify-content: space-around; */
  align-items: center;
  height: var(--header-height);
  background-color: var(--secondary);
  .search-user-input { width: 800px; }
}
.logo-wrap {
  padding: 0 30px;
  font-weight: 900;
  color: var(--primary);
  text-transform: uppercase;
  font-size: 1.4rem;
  width: var(--side-nav-width);
  line-height: 35px;
  > a { cursor: pointer; }
}
.search-user-option {
  display: flex;
  align-items: center;
  gap: var(--gap);
  padding: var(--gap-s);
  /* .search-user-option-email { color: var(--light-gray);} */
}
</style>