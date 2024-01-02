<template>
  <div class="chat-room-detail-wrap -page-wrap">
    <div 
      class="old-chat-list-wrap" 
      ref="chatListWrapRef"
    >
      <ul 
        class="chat-list" 
        ref="chatListRef"
      >
        <li
          class="chat-item"
          :class="{ '-me': userEmail === msg.user_email }"
          v-for="msg in chatList"
          :key="msg.id"
        >
          <ChatBubble
            :is-me="userEmail === msg.user_email"
            :user-mail="msg.user_email"
            :user-name="msg.user_name"
            :content="msg.content"
            :created-at="msg.created_at"
            :use-user-info="userEmail !== msg.user_email"
            :user-photo="msg.user_photo"
          />
        </li>
      </ul>
    </div>

    <div class="new-chat-wrap">
      <Editor
        v-model="newMsg"
        editorStyle="height: 320px"
        class="new-chat-editor"
        ref="chatEditorRef"
        @keydown.stop="keydownHandler"
      >
        <template #toolbar>
          <span class="ql-formats">
            <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
            <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
            <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase as sb } from '@/supabase'
import { singleChatData } from '@/@types'

import { chatStore as cStore } from '@/store/Chat.store'
import { userAuthStore } from '@/store/Auth.store'

import ChatBubble from '@/components/ChatBubble.vue'

const router = useRouter()
const route = useRoute()

const authStore = userAuthStore()
const chatStore = cStore()

// const userInfo = ref(null)
const channelId = ref<string | string[]>('')
const newMsg = ref('')
const chatList = ref<singleChatData[]>([])
const userEmail = ref('')

const chatEditorRef = ref(null)
const chatListWrapRef = ref<HTMLElement | null>(null)
const chatListRef = ref<HTMLElement | null>(null)

const chatsWatcher = ref<any>(null)

onMounted(async () => {
  if (authStore.userInfo) userEmail.value = authStore.userInfo.email
  if (route.params) channelId.value = route.params.id
  await getAllChats()

  chatsWatcher.value = sb.channel('public:chats')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chats' },
      async () => {
        console.log('chats changed !!!!!!')
        await getAllChats()
      }
    )
  console.log('chatsWatcher.value: ', chatsWatcher.value)
  chatsWatcher.value.subscribe()
})

onUnmounted(() => chatsWatcher.value?.unsubscribe())

const scrollToBottom = (element: HTMLElement | null) =>
  element?.scrollTo({ behavior: "smooth", top: chatListRef?.value?.offsetHeight })

const getAllChats = async () => {
  try {
    if (!channelId.value) {
      alert('channel 정보가 없습니다.')
      return router.go(-1)
    }
    const result = await chatStore.getAllChatsByChannelId(channelId.value, { from: 0, to: 100 })
    chatList.value = result
    console.log('채팅 리스트 >>>', result)

    await nextTick()
    scrollToBottom(chatListWrapRef.value)
  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

const createNewChat = async (chat: string) => {
  newMsg.value = chat.trim()

  if (newMsg.value) {
    try {
      const result = await chatStore.createNewChat({
        channel_id: channelId.value,
        content: newMsg.value
      })
      if (result) {
        const editorRef = chatEditorRef.value
        const quillEditor = editorRef?.quill?.editor || null
        if(quillEditor) {
          quillEditor.deleteText()
          // chatEditorRef.value..deleteText()
          // chatEditorRef.value.editor.focus()
        }
        await getAllChats()
      }
    } catch (error) {
      const errorMessage = chatStore.getErrorMessage(error)
      if (errorMessage) alert(errorMessage)
    }
  }
}

/**
 * 에디터 > 키보드 키 down 이벤트
 */
const keydownHandler = (e) => {
  if (e.keyCode === 13) {
    e.preventDefault()
    e.stopPropagation()
    createNewChat(newMsg.value)
  }
}
</script>

<style scoped>
.chat-room-detail-wrap { padding: 10px 10px 400px; }
.old-chat-list-wrap {
  overflow-y: auto;
  height: calc(100vh - 470px);
}
.chat-list {
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