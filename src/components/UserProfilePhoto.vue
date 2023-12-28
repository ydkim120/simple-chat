<template>
  <div 
    class="user-profile-photo" 
    :style="{ width: props.width, height: props.height }"
  >
    <img
      v-if="props.src"
      :src="props.src || ''"
      :alt="'profilePhoto'"
      :style="{ width: props.width, height: props.height }"
    />
    <span 
      v-else 
      class="default-photo"
      :style="{ width: props.width, height: props.height }"
    >
      <i 
        class="pi pi-user user-icon"
        :style="{ fontSize: props.emptyIconFontSize }"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  src?: string | undefined,
  width?: string,
  height?: string,
  emptyIconFontSize?: string
}
const props = withDefaults(defineProps<Props>(), {
  src: '',
  width: '150px',
  height: '150px',
  emptyIconFontSize: '100px'
})
</script>

<style scoped>
.user-profile-photo {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  border: 1px solid var(--disable);
  cursor: pointer;
  background-color: var(--white);
  &.-center { margin: 0 auto;}
  /* > * { width: 150px; height: 150px; } */
  img { object-fit: cover; }
}
.default-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--light-gray);
  .user-icon {
    font-size: 100px;
    color: var(--white);
    z-index: 1;
  }
}
</style>