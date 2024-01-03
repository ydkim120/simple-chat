<template>
  <div class="chat-main -page-wrap">
    <ChatHeaderSearch class="chat-main-header" />
    <ChatSideNav class="chat-main-side-nav" />
    <div class="chat-main-contents">
      <div class="chat-main-contents-inner">
        <router-view :key="$route.fullPath" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ChatHeaderSearch from '@/components/ChatHeaderSearch.vue'
import ChatSideNav from '@/components/ChatSideNav.vue'
import { chatStore } from '@/store/Chat.store'

const store = chatStore()

onMounted(() => {
  init()
})
const init = async() => {
  await store.getChannelList ()
}
</script>

<style scoped>
.chat-main { position: relative; }
.chat-main-side-nav {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--side-nav-z-index);
  width: var(--side-nav-width);
}

.chat-main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--header-z-index);
}

.chat-main-contents {
  width: calc(100% - var(--side-nav-width));
  padding-top: var(--header-height);
  margin-left: var(--side-nav-width);
  height: 100vh;
  .chat-main-contents-inner {
    overflow: hidden;
    height: calc(100vh - 80px);
    background-color: var(--background-color);
    border-radius: 20px 0 0 0;
  }
}
</style>