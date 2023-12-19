<template>
  <ul class="chat-bubble-wrap" :class="{ '-me': props.isMe }" >
    <li class="chat-bubble-user-info">
      <img 
        v-if="props.userPhoto" 
        :src="props.userPhoto" 
        :alt="`photo_${userEmail}`"
      >
    </li>
    <li class="chat-bubble-content" :class="{'-me': props.isMe }" v-html="content" />
    <li class="chat-bubble-time-wrap">
      <small class="chat-bubble-time">{{ dateSimple(props.createdAt) }}</small>
    </li>
  </ul>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

export interface Props {
  useUserInfo: boolean,
  isMe: boolean,
  content?: string
  createdAt?: string
  userEmail?: string
  userName?: string
  userPhoto?: string
}
const props = withDefaults(defineProps<Props>(), {
  useUserInfo: false,
  isMe: true,
  content: '',
  createdAt: '',
  userEmail: '',
  userName: '',
  userPhoto: ''
})

const dateSimple = (date: string) => {
  const dateValue = +new Date(date)
  return dayjs(dateValue).format('A HH:mm')
}

</script>

<style scoped>
.chat-bubble-wrap {
  display: flex;
  gap: var(--gap-xs);
  &.-me {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
  .chat-bubble-user-info {

  }
  .chat-bubble-content {
    position: relative;
    align-self: flex-start;
    padding: 10px;
    gap: var(--gap-xs);
    background-color: var(--main-green4);
    border-radius: 15px;
    &::before,
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      height: 20px;
    }

    &:not(.-me)::before {
      border-bottom-right-radius: 10px;
      border-left: 1rem solid var(--main-green4);
      left: -0.35rem;
      /* transform: translate(0, -0.1rem); */
    }
    &:not(.-me)::after {
      background-color: #fff;
      border-bottom-right-radius: 50%;
      left: 20px;
      transform: translate(-30px, -2px);
      width: 10px;
    }

    &.-me {
      align-self: flex-end;
      background-color: var(--main-green1);
      color: #fff;
      &::before {
        border-bottom-left-radius: 10px;
        border-right: 1rem solid var(--main-green1);
        right: -0.35rem;
        /* transform: translate(0, -0.1rem); */
      }
      &::after {
        background-color: #fff;
        border-bottom-left-radius: 50%;
        right: -40px;
        transform: translate(-30px, -1px);
        width: 10px;
      }
    }
  }

  .chat-bubble-time-wrap {
    position: relative;
    min-width: 60px;
    .chat-bubble-time {
      position: absolute;
      bottom: 0;
    }
  }
}
</style>