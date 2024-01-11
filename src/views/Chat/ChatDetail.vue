<template>
  <div class="chat-room-detail-wrap -page-wrap">
    <div class="chat-room-user-info" >
      <a
        class="pi pi-chevron-left go-back-button"
        @click="router.push({ name: 'chat-list'})"
      />
      <b v-if="channelInfo">{{ channelInfo.usersNameTxt }}</b>
    </div>
    <div
      class="old-chat-list-wrap"
      :class="{'-long': allReservedChatsCount }"
      ref="chatListWrapRef"
    >
      <div
        class="chat-list-wrap"
        ref="chatListRef"
      >
        <ul
          class="chat-list"
          v-for="(chatList, date) in chatListGroupByDate"
          :key="date"
        >
          <li
            v-if="date && `${date}` !== 'null'"
            class="chat-date"
          >
            <Button
              class="chat-date-button"
              :label="`${date}`"
              size="small"
              rounded
            />
          </li>
          <li
            class="chat-item"
            :class="{ '-me': myEmail === msg.user_email }"
            v-for="(msg, idx) in chatList"
            :key="msg.id"
          >
            <ChatBubble
              :is-me="myEmail === msg.user_email"
              :user-mail="msg.user_email"
              :user-name="msg.user_name"
              :content="msg.content"
              :created-at="msg.created_at"
              :use-user-info="myEmail !== msg.user_email"
              :user-photo="msg.user_photo"
            />
          </li>
        </ul>
      </div>
    </div>

    <small 
      v-if="allReservedChatsCount"
      class="reserved-chat-noti help-txt" 
    >
      <i class="pi pi-history" />
      지금 채널에 {{ allReservedChatsCount }}개의 예약 메세지가 있습니다.
      <router-link
        :to="{ name: 'reserved-chat-list' }"
      >
        모든 예약 메세지 보기
      </router-link>
    </small>
    <div class="new-chat-wrap">
      <Editor
        v-model="newMsg"
        editorStyle="height: 290px"
        class="new-chat-editor"
        ref="chatEditorRef"
        :modules="quillCustomModules"
        @load="setEditorInstance"
        >
        <!-- @keydown.stop="keydownHandler" -->
        <template #toolbar>
          <span class="ql-formats">
            <button v-tooltip.top="'Bold'" class="ql-bold"></button>
            <button v-tooltip.top="'Italic'" class="ql-italic"></button>
            <button v-tooltip.top="'Underline'" class="ql-underline"></button>
          </span>
        </template>
      </Editor>
      <SplitButton
        v-if="!isEditingReservedChat"
        class="new-chat-send-button-area"
        type="submit" 
        icon="pi pi-send"
        :model="sendMsgOption"
        :disabled="!newMsg"
        @click="createNewChat(newMsg)" 
      />
      <div 
        v-else 
        class="new-chat-send-button-area"
      >
        <Button
          v-tooltip.top="'예약 메세지 변경 취소'"
          icon="pi pi-times"
          severity="secondary"
          @click="() => {
            resetEditor()
            router.push({ name: 'reserved-chat-list' })
          }"
        />
        <Button
          v-tooltip.top="'예약 메세지 저장'"
          icon="pi pi-check"
          @click="updateReservedChat(newMsg)"
        />
      </div>
    </div>
    <small
      class="new-line-noti help-txt"
      v-show="newMsg.length > 1"
    >
      Shift + Enter키를 눌러 새 행을 추가합니다.
    </small>

    <SetDateTimeDialog
      v-model:visible="activeMessageTimeDialog"
      save-button-label="메세지 예약"
      :step-minute="10"
      :min-date="new Date()"
      @save="createReservedChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase as sb } from '@/supabase'
import { singleChatData, singleChannelData, profileType } from '@/@types'
import dayjs from 'dayjs'
import api from '@/api'
import { groupBy } from 'lodash'

import { useChatStore as cStore } from '@/store/Chat.store'
import { useUserAuthStore } from '@/store/Auth.store'

import ChatBubble from '@/components/ChatBubble.vue'
import SetDateTimeDialog from '@/components/Dialog/SetDateTimeDialog.vue'

const router = useRouter()
const route = useRoute()

const authStore = useUserAuthStore()
const chatStore = cStore()

// const userInfo = ref(null)
const channelInfo = ref<singleChannelData | null>(null)
const channelId = ref<string | string[]>('')
const newMsg = ref('')
const chatList = ref<singleChatData[]>([]) // 전체 채팅 목록
const chatListGroupByDate = ref<any>(null) // 날짜 별로 그루핑 한 채팅 목록
const lastChat = ref('') // 마지막 채팅
const myEmail = ref('')

const chatEditorRef = ref(null)
const chatListWrapRef = ref<HTMLElement | null>(null)
const chatListRef = ref<HTMLElement | null>(null)
const editorInstance = ref<any>(null)

const chatsWatcher = ref<any>(null)

const quillCustomKeyboardSetting = {
  keyboard: {
    bindings: {
      // shift_enter: {
      //   key: 13,
      //   shiftKey: true,
      //   handler: (range: any, ctx: any) => {
      //     console.log(range, ctx) // if you want to see the output of the binding

      //     const quill = chatEditorRef.value
      //     console.log('quill >>>', quill)
      //     if(quill) quill.insertText(range.index, '<br>')
      //   }
      // },
      only_enter: {
        key: 13,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        handler: () => {
          createNewChat(newMsg.value)
        }
      }
    }
  }
}
const quillCustomModules = ref<any>(quillCustomKeyboardSetting)

// 메세지 예약
const isEditingReservedChat = computed(() => { // 예약 메세지 변경모드 여부
  return !!history.state?.editingInfoStr
})

const allReservedChatsCount = ref(0)
const sendMsgOption = [
  {
    label: '메세지 예약하기',
    command: () => {
      activeMessageTimeDialog.value = true
    }
  }
]
const activeMessageTimeDialog = ref(false)
// const reserveDate = ref(new Date())
// const currentMinute = new Date().getMinutes()

// const getStepMinutes = (currentMinute: any, step: number) => {
//   return currentMinute % step === 0
//     ? currentMinute
//     : Math.ceil(currentMinute / step) * step
// }
// const reserveTime = ref(new Date(new Date().setMinutes(getStepMinutes(currentMinute, 10))))
// ref(dayjs(new Date()).format('HH:mm'))

watch(route.params, async (val) => {
  if (val) {
    channelId.value = route.params.id
    await getAllChats()
  }
}, { deep: true })

onMounted(async () => {
  if (authStore.userInfo) myEmail.value = authStore.userInfo.email

  // 라우트 파라미터 세팅
  if (route?.params?.id) {
    channelId.value = route.params.id
    await setChannelInfo(channelId.value)
  }
  if (history.state?.editingInfoStr) {
    const editingInfo = JSON.parse(history.state.editingInfoStr)
    newMsg.value = editingInfo.content || ''
  }

  await getAllChats()
  await setReservedChatsCount()

  chatsWatcher.value = sb.channel('public:chats')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `channel_id=eq.${channelId.value}`
      },
      async () => {
        await getAllChats()
        await setReservedChatsCount()
        await chatStore.updateChannelSummary(channelId.value, lastChat.value)
      }
    )
  chatsWatcher.value.subscribe()
})

onUnmounted(() => chatsWatcher.value?.unsubscribe())

const scrollToBottom = (element: HTMLElement | null) =>
  element?.scrollTo({ top: chatListRef?.value?.offsetHeight })

/**
 * 채팅 목록 조회
 */
const getAllChats = async () => {
  try {
    if (!channelId.value) {
      alert('channel 정보가 없습니다.')
      return router.go(-1)
    }
    const result = await chatStore.getAllChatsByChannelId(channelId.value, { from: 0, to: 200 })
    chatList.value = result
    const mappedCreatedAt = result.map((chat: singleChatData, idx: number) => ({
      ...chat,
      created_at: setMsgCreateAt(chat, idx)
    }))
    chatListGroupByDate.value = groupBy(mappedCreatedAt, 'created_date')
      
    // console.log('채팅 리스트 >>>', chatListGroupByDate.value)
    if (result?.length) lastChat.value = result[result.length - 1].content

    await nextTick()
    scrollToBottom(chatListWrapRef.value)
  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

/**
 * 새 채팅 입력
 */
const createNewChat = async (chat: string) => {
  newMsg.value = chat.trim()

  if (newMsg.value) {
    try {
      const result = await chatStore.createNewChat({
        channel_id: channelId.value,
        content: newMsg.value
      })
      if (result) resetEditor()
    } catch (error) {
      const errorMessage = chatStore.getErrorMessage(error)
      if (errorMessage) alert(errorMessage)
    }
  }
}
/**
 * 채널 정보 조회
 */
const setChannelInfo = async (channelId: string | string[]) => {
  try {
    const info = await chatStore.getChannelInfo(channelId)
    console.log('@@@ info > ', info)
    channelInfo.value = {
      ...info,
      usersNameTxt: info.is_me
        ? authStore.userInfo?.user_metadata?.user_name
        : info.user_list.filter((user: profileType) => user.id !== authStore.userInfo.id)
            .reduce((acc, crr) => acc ? `, ${crr.user_name}` : crr.user_name, '')
    }
  } catch (error) { console.error(error)}
}

// ============= 예약 메세지 관련 ==============
/**
 * 예약 메세지 보내기
 */
const createReservedChat = async (selectedDate: Date) => {
  newMsg.value = newMsg.value.trim()

  if (newMsg.value) {
    try {
      const result = await api.chat.createReservedChat({
        channel_id: channelId.value,
        content: newMsg.value,
        reserved_at_timestamp: +new Date(selectedDate).setSeconds(0, 0)
      }, authStore.userInfo)
      if (result) {
        activeMessageTimeDialog.value = false
        await setReservedChatsCount()
      }
    } catch (error) {
      const errorMessage = chatStore.getErrorMessage(error)
      if (errorMessage) return alert('메세지 예약을 실패했습니다: ', errorMessage)
    }
  }
}
/**
 * 예약 메세지 수정
*/
const updateReservedChat = async (chat: string) => {
  newMsg.value = chat.trim()

  if (newMsg.value && history.state?.editingInfoStr) {
    const editingInfo = JSON.parse(history.state.editingInfoStr)
    const { id, reserved_at } = editingInfo

    try {
      const result = await api.chat.updateReservedChat({
        id,
        content: newMsg.value,
        reserved_at_timestamp: +new Date(reserved_at)
      })
      if (result) {
        router.push({name: 'reserved-chat-list'})
      }
    } catch (error) {
      const errorMessage = chatStore.getErrorMessage(error)
      if (errorMessage) return alert('메세지 예약 변경을 실패했습니다: ', errorMessage)
    }
  }
}
/**
 * 예약 메세지 갯수 세팅
 */
const setReservedChatsCount = async () => {
  try {
   allReservedChatsCount.value = await api.chat.getReservedChatsCountByChannelId(channelId.value)

  } catch (error) {
    allReservedChatsCount.value = 0
  }
}

/**
 * 에디터 > 로드 시 인스턴스 저장
 */
const setEditorInstance = (data: any) => {
  editorInstance.value = Object.assign({}, data.instance)
}
/**
 * 에디터 > 초기화
 */
const resetEditor = () => {
  newMsg.value = ''
   if (editorInstance.value) {
    editorInstance.value.scrollingContainer.innerHTML = ''
    editorInstance.value.scrollingContainer.innerText = ''
    editorInstance.value.scrollingContainer.focus()
  }
}
/**
 * 메세지 > 생성 시간 세팅
 * 이후에 보낸 나의 메세지와 동일한 날짜/시간/분이면 한 번만 표기
 */
const setMsgCreateAt = (
  msg: singleChatData,
  msgIdx: number
) => {
  const chats = chatList.value
  if (msgIdx > chats.length - 2) return msg.created_at

  const afterChat = chats[msgIdx + 1]

  const isDiffChatUser = afterChat.user_id !== msg.user_id
  if (isDiffChatUser) return msg.created_at

  if (dayjs(msg.created_at).format('YYYY-MM-DD HH:mm:00') === dayjs(afterChat.created_at).format('YYYY-MM-DD HH:mm:00')) return ''
  else return msg.created_at
}

</script>

<style scoped>
.chat-room-detail-wrap { padding: 10px 10px 400px; }
.chat-room-user-info {
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 30px;
  line-height: 30px;
  background-color: var(--white);
  font-size: 16px;
  gap: var(--gap-s);
  .go-back-button { 
    color: #aaa;
    cursor: pointer;
    &:hover { color: #666; }
  }
}
.old-chat-list-wrap {
  overflow-y: auto;
  height: calc(100vh - 480px);
  &.-long { height: calc(100vh - 500px); }
}
.chat-list {
  .chat-date {
    position: sticky;
    top: 0;
    text-align: center;
    padding: var(--gap-xs) 0;
    margin-bottom: 40px;
    background-color: var(--white);
    z-index: 5;
    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      width: 100%;
      height: 1px;
      background-color: var(--lightest-gray);
    }
    .chat-date-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--lightest-gray);
      border-color: var(--lightest-gray);
      color: #777;
    }
  }
  .chat-item {
    display: flex;
    justify-content: flex-start;
    padding: var(--gap-xs) var(--gap-s) var(--gap-xs) var(--gap-xs);
    width: 100%;
    &:not(.-me) + &:not(.-me)::v-deep(.chat-bubble-content::before) { display: none; }
    &:not(.-me) + &:not(.-me)::v-deep(.chat-bubble-user-info) { height: 40px; visibility: hidden; }
    &:not(.-me) + &:not(.-me)::v-deep(.chat-bubble-user-name) { display: none; }
    &.-me { 
      justify-content: flex-end;
      & + &.-me::v-deep(.chat-bubble-content::before) { display: none; }
    }
  }
}

.new-chat-wrap {
  overflow: hidden;
  position: fixed;
  left: var(--side-nav-width);
  right: 0;
  bottom: 0;
  margin: 10px 10px 20px;
  border: 1px solid #aaa;
  border-radius: 15px;
  .new-chat-editor {
    display: flex;
    flex-direction: column-reverse;
    color: var(--text-color);
  }
}
.new-chat-send-button-area {
  position: absolute;
  bottom: 0px;
  right: 0px;
  height: 40px;
  width: 80px;
  button { 
    height: 40px;
    width: 40px;
  }
}

.help-txt {
  font-size: 14px;
  color: #666;
  /* 예약 메세지 알람 */
  &.reserved-chat-noti {
    padding: 5px 15px;
    display: flex;
    align-items: center;
    gap: var(--gap-xs);
    height: 30px;
  }
  /* 새 행 추가 알람 */
  &.new-line-noti {
    display: block;
    position: absolute;
    right: 10px;
    bottom: 3px;
    font-size: 12px;
  }
}
</style>