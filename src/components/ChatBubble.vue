<template>
  <ul class="chat-bubble-wrap" :class="{ '-me': props.isMe }" >
    <li 
      v-if="!isMe"
      class="chat-bubble-user-info" 
    >
      <UserProfilePhoto 
        width="60px"
        height="60px"
        empty-icon-font-size="35px"
        :src="props.userPhoto"
      />
    </li>
    <li>
      <b 
        v-if="!isMe"
        class="chat-bubble-user-name" 
      >
        {{ props.userName }}
      </b>
      <div 
        class="chat-bubble-content" 
        :class="{ '-me': props.isMe }" 
        v-html="content" 
      />
    </li>
    <li 
      v-if="props.createdAt"
      class="chat-bubble-time-wrap" 
    >
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
  if (!date) return ''
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
    margin-right: var(--gap-s);
  }
  .chat-bubble-user-name {
    display: block;
    margin-bottom: 5px;
  }
  .chat-bubble-content {
    display: block;
    position: relative;
    align-self: flex-start;
    padding: 15px;
    gap: var(--gap-xs);
    background-color: var(--light-gray);
    border-radius: 15px;
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      height: 20px;
    }

    &:not(.-me)::before {
      border-top-right-radius: 10px;
      border-left: 1rem solid var(--light-gray);
      left: -0.35rem;
      /* transform: translate(0, -0.1rem); */
    }
    &:not(.-me)::after {
      background-color: var(--background-color);
      border-top-right-radius: 50%;
      left: 20px;
      transform: translate(-30px, 0px);
      width: 10px;
      /* transform: scaleY(-1); */
    }

    &.-me {
      align-self: flex-end;
      background-color: var(--primary);
      &::before {
        border-top-left-radius: 10px;
        border-right: 1rem solid var(--primary);
        right: -0.35rem;
        /* transform: translate(0, -0.1rem); */
      }
      &::after {
        background-color: var(--background-color);
        border-top-left-radius: 50%;
        right: -40px;
        transform: translate(-30px, 0px);
        width: 10px;
      }
    }
  }

  .chat-bubble-time-wrap {
    position: relative;
    width: 50px;
    .chat-bubble-time {
      position: absolute;
      bottom: 0;
      color: var(--dark-gray);
    }
  }
}
</style>