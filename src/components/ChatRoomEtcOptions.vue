<!-- 채팅방 옵션 -->
<template>
  <div class="chat-etc-options-wrap">
    <a
      class="pi pi-ellipsis-v etc-btn"
      @click="(event) => {
        panel.toggle(event)
      }"
    />
  
    <OverlayPanel ref="panel">
      <Listbox
        v-model="selectedOption"
        :options="options"
        optionLabel="label"
        class="w-full md:w-14rem"
        listStyle="max-height:250px; width: 100px;"
      >
        <template #option="slotProps">
          <div class="options-item">
            <span>{{ slotProps.option.label }}</span>
            <i class="pi pi-sign-out" />
          </div>
        </template>
      </Listbox>
    </OverlayPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from "primevue/useconfirm"
import { useUserAuthStore } from '@/store/Auth.store'
import { useChatStore } from '@/store/Chat.store'
import { singleChannelData } from '@/@types'

export interface Props {
  channelInfo: singleChannelData | null
}
const props = withDefaults(defineProps<Props>(), {
  channelInfo: null
})

const emit = defineEmits<{
  (e: 'after-leave'): void
}>()

const router = useRouter()
const authStore = useUserAuthStore()
const chatStore = useChatStore()

const panel = ref()
const selectedOption = ref()
const options = ref([
  {
    label: '대화 나가기',
    code: 'LEAVE'
  }
])

const confirmDialog = useConfirm()
const confirm = (message: string, acceptFunc: Function) => {
  confirmDialog.require({
    message,
    acceptLabel: '확인',
    rejectLabel: '취소',
    rejectClass: 'p-button-secondary',
    accept: () => acceptFunc() || false,
    reject: () => false
  })
}

watch(selectedOption, async () => {
  const val = selectedOption.value?.code
  switch (val) {
    case 'LEAVE':
      confirm('대화에서 나가시겠습니까?\n나가기를 하면 대화내용이 모두 삭제됩니다.', () => leaveChat())
      break
    default:
      return false
  }
  selectedOption.value = null
}, { deep: true })

const leaveChat = async (channelInfo = props.channelInfo) => {
  try {
    if (!channelInfo) return

    const { channel_id, user_list } = channelInfo
    const myId = authStore.userInfo.id
    const newUserList = user_list.filter(user => user.id !== myId)
    const result = await chatStore.updateChannelUserList(channel_id, newUserList)
    if (result) {
      emit('after-leave')
      router.push({
        name: 'chat-list'
      })
    }
  } catch (error) {
    const errorMessage = chatStore.getErrorMessage(error)
    if (errorMessage) alert('대화 나가기에 문제가 발생했습니다: ' + errorMessage)
  }

}

</script>

<style scoped>
.etc-btn {
  color: var(--gray);
  cursor: pointer;
  &:hover { color: #666; }
}
.options-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
</style>