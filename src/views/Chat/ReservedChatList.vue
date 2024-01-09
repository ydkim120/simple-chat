<template>
  <div class="reserved-chat-list-wrap">
    <h3>예약된 메세지</h3>
    <ul class="reserved-chat-list">
      <li 
        class="reserved-chat-item"
        v-for="chat in reservedList"
        :key="chat.id"
      >
        <ol>
          <li 
            v-for="(photo, idx) in chat.userPhotoList" 
            :key="`userProfilePhoto_${idx}`"
          >
            <UserProfilePhoto 
              :src="photo"
              width="60px"
              height="60px"
              empty-icon-font-size="40px"
            />
          </li>
        </ol>
        <div class="reserved-chat-content">
          <span class="reserved-chat-content-header">
            <b class="chat-user-name">
              {{ chat.usersNameTxt }}
            </b>
            <small class="reserved-date">
              <b>{{ chat.reservedDateTime }}</b>&nbsp;에 전송됨
            </small>
          </span>
          <div class="reserved-chat-summary" v-text="chat.contentTxt" />
        </div>
        <div class="edit-button-wrap">
          <a 
            class="pi pi-pencil edit-button" 
            v-tooltip.top="'메세지 편집'" 
          />
          <a 
            class="pi pi-trash edit-button" 
            v-tooltip.top="'메세지 삭제'"
            @click="deleteReservedChat(chat.id)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { singleReservedChatData, singleChannelData, profileType } from '@/@types'
import { supabase as sb } from '@/supabase'
import dayjs from 'dayjs'
import { useUserAuthStore } from '@/store/Auth.store'
import { useChatStore } from '@/store/Chat.store'
import api from '@/api'

const authStore = useUserAuthStore()
const chatStore = useChatStore()
const myInfo = authStore.userInfo

const reservedList = ref<singleReservedChatData[]>([]) // 예약 채팅 목록
const reservedListWatcher = ref<any>(null)

const allChannels = ref([])

onMounted(async () => {
  // if (authStore.userInfo) userEmail.value = authStore.userInfo.email
  allChannels.value = await chatStore.getChannelList()
  await getReservedChatList()

  reservedListWatcher.value = sb.channel('public:reserved_chats')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reserved_chats' },
      async () => {
        await getReservedChatList()
      }
    )
  reservedListWatcher.value.subscribe()
})

onUnmounted(() => reservedListWatcher.value?.unsubscribe())

const getReservedChatList = async () => {
  try {
    // const channelId = router.params.id
    const result = await api.chat.getReservedChatsByUserId(authStore.userInfo.id, { from: 0, to: 100})

    const reservedChats = result.map(c => {
      const channelInfo = allChannels.value.find((channel: singleChannelData) => channel.channel_id === c.channel_id)
      c.reservedDateTime = convertDateTimeFormat(c.reserved_at)
      c.contentTxt = c?.content?.replace(/<[^>]*>?/g, '') || ''

      return channelInfo 
        ? {
          ...c,
          user_list: channelInfo?.user_list,
          usersNameTxt: channelInfo?.is_me 
            ? myInfo?.user_metadata?.user_name
            : channelInfo.user_list?.filter((user: profileType) => user.id !== myInfo.id)
              .reduce((acc, crr) => acc ? `, ${crr.user_name}` : crr.user_name, ''),
          userPhotoList: channelInfo.is_me
            ? [myInfo?.photo]
            : c.user_list?.filter((user: profileType) => user.id !== myInfo.id)
              .map(item => item.user_photo || '')
          }
        : { ...c }
    })
    reservedList.value = reservedChats

  } catch (error) {
    alert('예약된 메세지 목록 조회에 문제가 발생했습니다.', error)
    console.error(error)
  } finally {
  }
}

const convertDateTimeFormat = (date: string) => {
  if (!date) return ''
  const dateValue = +new Date(date)
  return dayjs(dateValue).format('YYYY-MM-DD A HH:mm')
}

/**
 * 예약 메세지 삭제
 */
const deleteReservedChat = async (id: string) => {
  const flag = confirm('예약된 메세지를 삭제하시겠습니까?')

  if (flag) {
    try {
      const result = await api.chat.deleteReservedChat(id)
      if (result) return alert('삭제했습니다.')
    } catch (error) {
      console.error(error)
      return alert('예약된 메세지 삭제에 문제가 발생했습니다.', error)
    }
  }
}

</script>

<style scoped>
.reserved-chat-list-wrap {
  padding: var(--gap-s);
}
.reserved-chat-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  margin-top: var(--gap-s);
  .reserved-chat-item {
    position: relative;
    display: flex;
    padding: var(--gap-s);
    gap: var(--gap-m);
    align-items: center;
    background: var(--lightest-gray);
    border-radius: 15px;
    /* &:hover { 
      background-color: var(--light-gray);
      cursor: pointer;
    } */
    .edit-button-wrap {
      position: absolute;
      top: var(--gap-s);
      right: var(--gap-xs);
      display: flex;
      gap: var(--gap-xs);
      .edit-button {
        color: #aaa;
        &:hover {
          color: #666;
          cursor: pointer;
        }
      }
    }
  }
  .reserved-chat-content {
    width: 100%;
    .reserved-chat-content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-right: 40px;
      .reserved-date { color: #666; }
    }
    .reserved-chat-summary {
      display: -webkit-box;
      overflow: hidden;
      text-overflow : ellipsis;
      /* white-space: nowrap; */
      word-break: break-all;
      line-height: 1.2em;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: var(--dark-gray);
      margin-top: var(--gap-s);
      max-width: calc(100vw - 500px);
      min-height: 33px;
      /* white-space: nowrap; */
    }
  }
}
</style>