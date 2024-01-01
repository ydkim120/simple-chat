<template>
  <div class="chat-room-list-wrap">
    <ul 
      class="chat-room-list" 
      v-if="channelList.length"
    >
      <li
        class="chat-room-item"
        v-for="ch in channelList"
        :key="ch.channel_id"
        @click="routeToDetail(ch.channel_id)"
      >
        <Skeleton v-if="isGetChannelList"></Skeleton>
        <template v-else>
          <UserProfilePhoto 
            width="50px"
            height="50px"
            empty-icon-font-size="35px"
          />
          <div class="channel-content">
            <b>{{ ch.usersNameTxt }}</b>
          </div>
        </template>
      </li>
    </ul>
    <div 
      v-else
      class="empty-contents"
    >
      대화 중인 상대가 없습니다.<br>사용자를 검색해 Messenger를 시작해보세요.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { chatStore as cStore } from '@/store/Chat.store'
import { userAuthStore } from '@/store/Auth.store'
import { singleChannelData, profileType } from '@/@types'
import UserProfilePhoto from '@/components/UserProfilePhoto.vue'

const router = useRouter()
const chatStore = cStore()
const authStore = userAuthStore()
const myInfo = authStore.userInfo

const channelList = ref<singleChannelData[]>([])

// 로딩
const isGetChannelList = ref(true)

const getRecentChannel = async () => {
  try {
    // const channelId = router.params.id
    const result = await chatStore.getChannelList()
    channelList.value = result.map(c => ({
      ...c,
      usersNameTxt: c.user_list.filter((user: profileType) => user.id !== myInfo.id)
        .reduce((acc, crr) => acc ? `, ${crr.user_name}` : crr.user_name, '')
    }))
    console.log('채널 리스트 >>>', result)

  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  } finally {
    isGetChannelList.value = false
  }
}

const routeToDetail = (channel_id: string) => {
  router.push({ 
    name: 'chat-detail',
    params: {
      id: channel_id
    }
  })
}

onMounted(async () => {
  // if (authStore.userInfo) userEmail.value = authStore.userInfo.email
  await getRecentChannel()

})
</script>

<style scoped>
.chat-room-list {
  /* padding: var(--gap-s); */
  .chat-room-item {
    padding: var(--gap-s) var(--gap-m);
    display: flex;
    gap: var(--gap-m);
    align-items: center;
    & + & { border-top: 1px solid var(--light-gray);}
    &:hover { 
      background-color: var(--lightest-gray);
      cursor: pointer;
    }
  }
}
.empty-contents {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #aaa;
  font-size: 18px;
  text-align: center;
  line-height: 1.5;
}
</style>