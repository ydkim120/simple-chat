<template>
  <div class="chat-main -page-wrap">
    <!-- <ChatSideNav class="side-nav" /> -->
    <div class="chat-main-contents">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// import ChatSideNav from '@/components/ChatSideNav.vue'
// import { chatStore } from '@/store/Chat.store'

// const store = chatStore()

onMounted(() => {
  init()
})
const init = async() => {
  // await store.getAllChats ()
}
</script>

<style scoped>
/* .chat-main { background-color: var(--main-green4); } */
.side-nav {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--side-nav-z-index);
  width: var(--side-nav-width);
}

.chat-main-contents {
  width: calc(100% - var(--side-nav-width));
}
</style>