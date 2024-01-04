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
          <ol>
            <li 
              v-for="(photo, idx) in ch.userPhotoList" 
              :key="`userProfilePhoto_${idx}`"
            >
              <UserProfilePhoto 
                :src="photo"
                width="80px"
                height="80px"
                empty-icon-font-size="50px"
              />
            </li>
          </ol>
          <div class="channel-content">
            <div class="channel-user-name-wrap">
              <span
                v-if="ch.is_me"
                class="is-me-tag"
              >
                나
              </span>
              <b class="channel-user-name">
                {{ ch.usersNameTxt }}
              </b>
            </div>
            <div class="channel-summary" v-text="ch.summaryTxt" />
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase as sb } from '@/supabase'
import { useChatStore as cStore } from '@/store/Chat.store'
import { useUserAuthStore } from '@/store/Auth.store'
import { singleChannelData, profileType } from '@/@types'

const router = useRouter()
const chatStore = cStore()
const authStore = useUserAuthStore()
const myInfo = authStore.userInfo

const channelList = ref<singleChannelData[]>([])

const channelListWatcher = ref<any>(null)

// 로딩
const isGetChannelList = ref(true)

const getRecentChannel = async () => {
  try {
    // const channelId = router.params.id
    const result = await chatStore.getChannelList()
    const channels = result.filter((item: singleChannelData) => item.summary)
      .map((c: singleChannelData) => {
        const isMe = c.is_me

        return {
          ...c,
          usersNameTxt: isMe
            ? myInfo?.user_metadata?.user_name
            : c.user_list.filter((user: profileType) => user.id !== myInfo.id)
                .reduce((acc, crr) => acc ? `, ${crr.user_name}` : crr.user_name, ''),
          summaryTxt: c?.summary?.replace(/<[^>]*>?/g, '') || '',
          userPhotoList: isMe
            ? [myInfo?.photo]
            : c.user_list.filter((user: profileType) => user.id !== myInfo.id)
                .map(item => item.user_photo || ''),
        }
      })
    channelList.value = channels
    console.log('채널 리스트 >>>', channels)
    console.log('myInfo >>>', myInfo)

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

  channelListWatcher.value = sb.channel('public:channels')
    .on(
      'postgres_changes',
       { event: '*', schema: 'public', table: 'channels' },
       async () => {
        await getRecentChannel()
       }
    )
  channelListWatcher.value.subscribe()
})

onUnmounted(() => channelListWatcher.value?.unsubscribe())
</script>

<style scoped>
.chat-room-list {
  /* padding: var(--gap-s); */
  .chat-room-item {
    display: flex;
    padding: var(--gap-s);
    gap: var(--gap-m);
    align-items: center;
    & + & { border-top: 1px solid var(--light-gray);}
    &:hover { 
      background-color: rgba(0, 0, 0, 0.02);
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
.channel-content {
  display: flex;
  flex-direction: column;
  padding: var(--gap-xs) 0;
  .channel-user-name-wrap {
    display: flex;
    align-items: center;
    .is-me-tag {
      display: block;
      margin-right: var(--gap-xs);
      width: 25px; 
      height: 25px; 
      border-radius: 50%; 
      background-color: var(--light-gray);
      color: #aaa;
      line-height: 25px;
      font-weight: normal;
      text-align: center;
    }
    .channel-user-name { vertical-align: middle; font-size: 16px; }
  }
  .channel-summary {
    display: -webkit-box;
    overflow: hidden;
    text-overflow : ellipsis;
    /* white-space: nowrap; */
    word-break: break-all;
    line-height: 1.2em;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    color: var(--dark-gray);
    margin-top: var(--gap-xs);
    max-width: calc(100vw - 500px);
    min-height: 33px;
    /* white-space: nowrap; */
  }
}
</style>