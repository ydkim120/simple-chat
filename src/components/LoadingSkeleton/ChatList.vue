<template>
  <ul class="chat-room-list">
    <li
      class="chat-room-item"
      v-for="idx in 8"
      :key="idx"
    >
      <Skeleton shape="circle" size="80px" />
      <div class="channel-content" style="flex: 1">
        <Skeleton width="75%" />
        <Skeleton width="100%" />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">

</script>

<style scoped>
.chat-room-list {
  .chat-room-item {
    display: flex;
    padding: var(--gap-s);
    gap: var(--gap-m);
    align-items: center;
    & + & { border-top: 1px solid var(--light-gray);}
  }
}

.channel-content {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  padding: var(--gap-xs) 0;
  width: calc(100% - 150px);
}
</style>