<template>
  <div class="user-profile-photo-wrap">
    <div 
      class="user-profile-photo" 
      :style="{ width: props.width, height: props.height }"
    >
      <Skeleton
        v-if="props.loading"
        shape="circle" 
        :size="props.width" 
      />
      <template v-else>
        <img
          v-if="props.src && isImageLoadSuccess" 
          :src="props.src || ''"
          :alt="'profilePhoto'"
          :style="{ width: props.width, height: props.height }"
          onerror="isImageLoadSuccess = false"
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
      </template>
    </div>
    <i
      v-if="useOnline"
      class="online-icon"
      :class="{'is-online': props.isOnline}"
      :style="{
        width: `calc(${props.width} / 4)`,
        height: `calc(${props.width} / 4)`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'

export interface Props {
  loading?: boolean,
  src?: string | undefined,
  width?: string,
  height?: string,
  emptyIconFontSize?: string,
  useOnline?: boolean,
  isOnline?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  src: '',
  width: '150px',
  height: '150px',
  emptyIconFontSize: '100px',
  useOnline: false, // 온라인 여부 표기
  isOnline: false, // 온라인 여부
})

const isImageLoadSuccess = ref(true)

onMounted(() => {
  if (props.useOnline) {
    api.presence.getUserStatusPresence()
  }
})
</script>

<style scoped>
.user-profile-photo-wrap {
  position: relative;
}
.user-profile-photo {
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  border: 1px solid var(--light-gray);
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
.online-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background-color: var(--disable);
  border-radius: 50%;
  border: 2px solid var(--white);
  &.is-online { background-color: var(--green);}
}
</style>