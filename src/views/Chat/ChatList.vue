<template>
  <div class="chat-room-list-wrap">
    <ul class="chat-room-list">
      <li class="chat-room-item" @click="routeToDetail">
        채팅방 목록쓰
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const routeToDetail = () => {
  router.push({ 
    name: 'chat-detail',
    params: {
      id: 'ydkim'
    }
  })
}
</script>

<style scoped>
.chat-room-list {
  & .chat-room-item {

  }
}
</style>