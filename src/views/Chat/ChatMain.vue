<template>
  <div class="chat-main">
    <ChatSideNav class="side-nav" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import ChatSideNav from '@/components/ChatSideNav.vue'
</script>

<style scoped>
.chat-main { background-color: var(--main-green1); }
.side-nav {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--side-z-index);
}
</style>