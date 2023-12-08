<template>
  <ConfirmDialog id="confirmDialog" />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { alertDialogStore } from '@/store/AlertDialog.store'
import { useConfirm } from 'primevue/useconfirm'

const emit = defineEmits<{
  (e: 'confirm', result: boolean): void
  (e: 'cancel', result: boolean): void
}>()

const store = alertDialogStore()

const confirmDialog = useConfirm()


watch(() => store.isOpenConfirmDialog, (val) => {
  const dialogInfo = store?.confirmDialogInfo
    if (val && dialogInfo) {
      confirmDialog.require({
        ...dialogInfo,
        accept: () => {
          if(dialogInfo.accept) dialogInfo.accept()
          confirm()
        },
        reject: () => {
          if(dialogInfo.reject) dialogInfo.reject()
          cancel()
        }
    })
  }
})

const confirm = () => emit('confirm', true)

const cancel = () => emit('cancel', false)


</script>

<style scoped>

</style>