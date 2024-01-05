<template>
  <div class="chat-room-detail-wrap -page-wrap">
    <div
      class="old-chat-list-wrap"
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

    <div class="new-chat-wrap">
      <Editor
        v-model="newMsg"
        editorStyle="height: 320px"
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
      <div class="new-chat-send-button-area">
        <Button 
          type="submit" 
          icon="pi pi-send" 
          @click="createNewChat(newMsg)" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase as sb } from '@/supabase'
import { singleChatData } from '@/@types'
import dayjs from 'dayjs'
import {groupBy} from 'lodash'

import { useChatStore as cStore } from '@/store/Chat.store'
import { useUserAuthStore } from '@/store/Auth.store'

import ChatBubble from '@/components/ChatBubble.vue'

const router = useRouter()
const route = useRoute()

const authStore = useUserAuthStore()
const chatStore = cStore()

// const userInfo = ref(null)
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

watch(route.params, async (val) => {
  if (val) {
    channelId.value = route.params.id
    await getAllChats()
  }
}, { deep: true })

onMounted(async () => {
  if (authStore.userInfo) myEmail.value = authStore.userInfo.email
  if (route.params) channelId.value = route.params.id
  await getAllChats()

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
    const result = await chatStore.getAllChatsByChannelId(channelId.value, { from: 0, to: 100 })
    chatList.value = result
    const mappedCreatedAt = result.map((chat: singleChatData, idx: number) => ({
      ...chat,
      created_at: setMsgCreateAt(chat, idx)
    }))
    chatListGroupByDate.value = groupBy(mappedCreatedAt, 'created_date')
      
    console.log('채팅 리스트 >>>', chatListGroupByDate.value)
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
      if (result) {
        newMsg.value = ''
        // const editorRef = chatEditorRef.value
        // console.log('editorRef::' , editorRef)
        // if(editorRef) editorRef?.deleteText()
        // const quillEditor = editorRef?.quill?.editor || null
        // if(quillEditor) {
        //   quillEditor.deleteText()
        //   // chatEditorRef.value..deleteText()
        //   // chatEditorRef.value.editor.focus()
        // }
        // await getAllChats()
        if (editorInstance.value) {
          editorInstance.value.scrollingContainer.innerHTML = ''
          editorInstance.value.scrollingContainer.innerText = ''
          editorInstance.value.scrollingContainer.focus()
        }
      }
  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
  }
}

/**
 * 에디터 > 로드 시 인스턴스 저장
 */
const setEditorInstance = (data: any) => {
  editorInstance.value = Object.assign({}, data.instance)
  console.log('에디터 !@@@', editorInstance.value)
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
.old-chat-list-wrap {
  overflow-y: auto;
  height: calc(100vh - 470px);
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
  margin: 10px;
  border: 1px solid #aaa;
  border-radius: 15px;
  .new-chat-editor { 
    display: flex;
    flex-direction: column-reverse;
   }
}
.new-chat-send-button-area {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  justify-content: flex-end;
  button { height: 40px; width: 40px; }
}
</style>