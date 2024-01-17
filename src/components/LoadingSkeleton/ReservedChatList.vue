<template>
  <ul class="reserved-chat-list">
    <li
      class="reserved-chat-item"
      v-for="idx in 1"
      :key="idx"
    >
      <Skeleton 
        width="100%" 
        height="105px"
        borderRadius="15px"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">

</script>

<style scoped>
.reserved-chat-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
  margin-top: var(--gap-s);
}
</style>