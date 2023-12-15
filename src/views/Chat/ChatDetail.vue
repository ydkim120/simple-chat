<template>
  <div class="chat-room-detail-wrap -page-wrap">
    <ul class="chat-list">
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
          />
      </li>
    </ul>

    <div class="new-chat-wrap">
      <Editor
        v-model="newMsg"
        editorStyle="height: 300px"
        class="new-chat-editor"
        ref="chatEditorRef"
        @keyup.enter="createNewChat(newMsg)"
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
        <Button type="submit" icon="pi pi-send" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { chatStore as cStore } from '@/store/Chat.store'

import ChatBubble from '@/components/ChatBubble.vue'
import { userAuthStore } from '@/store/Auth.store'

import { singleChatData } from '@/@types'

const authStore = userAuthStore()
const chatStore = cStore()


// const userInfo = ref(null)
const newMsg = ref('')
const chatList = ref<singleChatData[]>([])
const userEmail = ref('')

const chatEditorRef = ref(null)

onMounted(async () => {
  if (authStore.userInfo) userEmail.value = authStore.userInfo.email
  await getAllChats()

})

const getAllChats = async () => {
  try {
    const result = await chatStore.getAllChats(1, 10)
    chatList.value = result
    console.log('채팅 리스트 >>>', result)

  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert(errorMessage)
  }
}

const createNewChat = async (chat: string) => {
  newMsg.value = chat.trim()

  if (newMsg.value) {
    try {
      const result = await chatStore.createNewChat(newMsg.value)
      if (result) {
        if(chatEditorRef.value) {
          debugger
          chatEditorRef.value.editor.deleteText()
        }
        await getAllChats()
      }
    } catch (error) {
      const errorMessage = chatStore.getErrorMessage(error)
      if (errorMessage) alert(errorMessage)
    }
  }
}
</script>

<style scoped>
.chat-room-detail-wrap { position: relative; }
.chat-list {
  .chat-item {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    & + & { margin-top: var(--gap-xs); }
    &.-me { justify-content: flex-end; }
  }
}
.new-chat-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}
.new-chat-send-button-area {
  display: flex;
  justify-content: flex-end;
}
</style>