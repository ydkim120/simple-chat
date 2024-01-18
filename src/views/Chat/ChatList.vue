<template>
  <div class="chat-room-list-wrap">
    <ChatListSkeleton v-if="isGetChannelList" />
    <template v-else>
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
          <ol>
            <li 
              v-for="(photo, idx) in ch.userPhotoList" 
              :key="`userProfilePhoto_${idx}`"
            >
              <UserProfilePhoto 
                :src="photo"
                use-online
                is-online
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
          <Badge
            v-if="alarmsGroupedByChannelId
              && alarmsGroupedByChannelId[ch.channel_id]
              && alarmsGroupedByChannelId[ch.channel_id].length"
            severity="warning"
            :value="alarmsGroupedByChannelId[ch.channel_id].length >= 100
              ? '99+'
              : alarmsGroupedByChannelId[ch.channel_id].length"
          />
        </li>
      </ul>
      <div 
        v-else
        class="common-empty-contents"
      >
        대화 중인 상대가 없습니다.<br>사용자를 검색해 Messenger를 시작해보세요.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase as sb } from '@/supabase'
import { groupBy } from 'lodash'
import { useChatStore as cStore } from '@/store/Chat.store'
import { useUserAuthStore } from '@/store/Auth.store'
import { singleChannelData, profileType } from '@/@types'
import ChatListSkeleton from '@/components/LoadingSkeleton/ChatList.vue'
import api from '@/api'

const router = useRouter()
const chatStore = cStore()
const authStore = useUserAuthStore()
const myInfo = authStore.userInfo

const channelList = ref<singleChannelData[]>([])
const channelListWatcher = ref<any>(null)

const alarmsGroupedByChannelId = ref<any>(null)
const alarmsWatcher = ref<any>(null)

// 로딩
const isGetChannelList = ref(false)

// 채널 목록 조회
const getRecentChannel = async () => {
  try {
    isGetChannelList.value = true
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
                .map(item => item.user_photo || '')
        }
      })
    channelList.value = channels
    chatStore.myChannelList = channels
    console.log('채널 리스트 >>>', channels)
    console.log('myInfo >>>', myInfo)

  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  } finally {
    isGetChannelList.value = false
  }
}

// 내 알람 목록 조회
const getAlarmsByTargetUserId = async() => {
  try {
    isGetChannelList.value = true
    const alarmList = await api.alarm.getAlarmsByTargetUserId(myInfo.id)

    alarmsGroupedByChannelId.value = groupBy(alarmList, 'channel_id')
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
  await getAlarmsByTargetUserId()
  await getRecentChannel()

  watchChannelList()
  watchAlarms()
})

onUnmounted(() => {
  channelListWatcher.value?.unsubscribe()
  alarmsWatcher.value?.unsubscribe()
})

const watchChannelList = () => {
  channelListWatcher.value = sb.channel('public:channels')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'channels' },
      async () => {
        await getRecentChannel()
      }
    )
  channelListWatcher.value.subscribe()
}
const watchAlarms = () => {
  alarmsWatcher.value = sb.channel('public:alarms')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'alarms' },
      async () => {
        await getAlarmsByTargetUserId()
      }
    )
  alarmsWatcher.value.subscribe()
}
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
.channel-content {
  display: flex;
  flex-direction: column;
  padding: var(--gap-xs) 0;
  width: calc(100% - 150px);
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